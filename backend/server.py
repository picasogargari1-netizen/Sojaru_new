from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')

import os
import time
import uuid
import logging
import requests
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any

import jwt
import bcrypt
import httpx
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Query, Depends, UploadFile, File, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
WC_STORE_URL = os.environ['WC_STORE_URL'].rstrip('/')
WC_KEY = os.environ['WC_CONSUMER_KEY']
WC_SECRET = os.environ['WC_CONSUMER_SECRET']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALG = "HS256"
WC_BASE = f"{WC_STORE_URL}/wp-json/wc/v3"
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'hello@sojaru.co.in').lower()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

# Object storage
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "sojaru"
_storage_key = None
MIME_TYPES = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
              "gif": "image/gif", "webp": "image/webp"}

def init_storage(force: bool = False):
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                        headers={"X-Storage-Key": key, "Content-Type": content_type},
                        data=data, timeout=120)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.put(f"{STORAGE_URL}/objects/{path}",
                            headers={"X-Storage-Key": key, "Content-Type": content_type},
                            data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sojaru")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Sojaru Storefront API")
api = APIRouter(prefix="/api")

http_client: Optional[httpx.AsyncClient] = None

# Simple in-memory TTL cache for public read endpoints
_cache: dict[str, tuple[float, Any]] = {}

def cache_get(key: str):
    hit = _cache.get(key)
    if hit and hit[0] > time.time():
        return hit[1]
    return None

def cache_set(key: str, value, ttl: int = 120):
    _cache[key] = (time.time() + ttl, value)


# ---------------------------------------------------------------------------
# WooCommerce client
# ---------------------------------------------------------------------------
async def wc_request(method: str, path: str, params: dict | None = None, json: dict | None = None):
    global http_client
    if http_client is None:
        http_client = httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0))
    url = f"{WC_BASE}/{path.lstrip('/')}"
    try:
        r = await http_client.request(method, url, params=params, json=json, auth=(WC_KEY, WC_SECRET))
    except httpx.RequestError as e:
        logger.error(f"WooCommerce connection error: {e}")
        raise HTTPException(status_code=502, detail="Unable to reach store. Please try again.")
    if r.is_error:
        logger.error(f"WooCommerce {method} {path} -> {r.status_code}: {r.text[:300]}")
        raise HTTPException(status_code=r.status_code if r.status_code < 500 else 502,
                            detail="Store request failed.")
    return r


# ---------------------------------------------------------------------------
# Product serialization (decouple frontend from raw Woo shape)
# ---------------------------------------------------------------------------
def serialize_product(p: dict) -> dict:
    return {
        "id": p.get("id"),
        "name": p.get("name"),
        "slug": p.get("slug"),
        "type": p.get("type"),
        "permalink": p.get("permalink"),
        "sku": p.get("sku"),
        "price": p.get("price"),
        "regular_price": p.get("regular_price"),
        "sale_price": p.get("sale_price"),
        "on_sale": p.get("on_sale"),
        "price_html": p.get("price_html"),
        "featured": p.get("featured"),
        "description": p.get("description"),
        "short_description": p.get("short_description"),
        "stock_status": p.get("stock_status"),
        "stock_quantity": p.get("stock_quantity"),
        "total_sales": p.get("total_sales"),
        "average_rating": p.get("average_rating"),
        "rating_count": p.get("rating_count"),
        "date_created": p.get("date_created"),
        "images": [{"id": i.get("id"), "src": i.get("src"), "alt": i.get("alt") or p.get("name")}
                   for i in (p.get("images") or [])],
        "categories": [{"id": c.get("id"), "name": c.get("name"), "slug": c.get("slug")}
                       for c in (p.get("categories") or [])],
        "tags": [{"id": t.get("id"), "name": t.get("name"), "slug": t.get("slug")}
                 for t in (p.get("tags") or [])],
        "attributes": [{"id": a.get("id"), "name": a.get("name"), "variation": a.get("variation"),
                        "options": a.get("options")} for a in (p.get("attributes") or [])],
        "variations": p.get("variations") or [],
        "related_ids": p.get("related_ids") or [],
    }


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")

def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode("utf-8")[:72], hashed.encode("utf-8"))

def create_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email,
               "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")
    except (jwt.InvalidTokenError, Exception):
        raise HTTPException(status_code=401, detail="Invalid session")
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["id"] = str(user.pop("_id"))
    user.pop("password_hash", None)
    user["is_admin"] = bool(user.get("is_admin"))
    return user


async def get_admin_user(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


DEFAULT_MARQUEE = [
    "Free shipping over ₹1,499",
    "Curated for you & your best friend",
    "New season, new arrivals",
    "Handmade pet tags, engraved with love",
    "Made in India, with love",
]

async def get_settings_doc() -> dict:
    doc = await db.settings.find_one({"_id": "site"})
    if not doc:
        doc = {"_id": "site", "hero_images": [], "marquee_texts": DEFAULT_MARQUEE,
               "festive": {"title": "Festive Collection", "category_id": 33, "enabled": True}}
        await db.settings.insert_one(doc)
    return doc

def public_settings(doc: dict) -> dict:
    return {
        "hero_images": [{"id": h["id"], "url": f"/api/media/{h['storage_path']}", "alt": h.get("alt", "Sojaru")}
                        for h in doc.get("hero_images", [])],
        "marquee_texts": doc.get("marquee_texts", DEFAULT_MARQUEE),
        "festive": doc.get("festive", {"title": "Festive Collection", "category_id": 33, "enabled": True}),
    }


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str = ""
    last_name: str = ""

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    billing: Optional[dict] = None
    shipping: Optional[dict] = None

class OrderLineItem(BaseModel):
    product_id: int
    quantity: int = 1
    variation_id: Optional[int] = None

class OrderIn(BaseModel):
    line_items: List[OrderLineItem]
    billing: dict
    shipping: Optional[dict] = None
    customer_note: Optional[str] = ""
    coupon_lines: List[dict] = []
    shipping_lines: List[dict] = []
    payment_method: str = "cod"
    payment_method_title: str = "Cash on Delivery"


# ---------------------------------------------------------------------------
# Store / catalog endpoints
# ---------------------------------------------------------------------------
@api.get("/")
async def root():
    return {"brand": "Sojaru", "status": "ok"}

@api.get("/store/config")
async def store_config():
    cached = cache_get("store_config")
    if cached:
        return cached
    try:
        r = await wc_request("GET", "data/currencies/current")
        cur = r.json()
        import html
        data = {"currency_code": cur.get("code", "USD"),
                "currency_symbol": html.unescape(cur.get("symbol", "$"))}
    except Exception:
        data = {"currency_code": "USD", "currency_symbol": "$"}
    cache_set("store_config", data, 3600)
    return data

@api.get("/categories")
async def get_categories():
    cached = cache_get("categories")
    if cached:
        return cached
    r = await wc_request("GET", "products/categories",
                         params={"per_page": 100, "orderby": "name", "hide_empty": False})
    cats = [{"id": c["id"], "name": c["name"], "slug": c["slug"], "parent": c["parent"],
             "count": c.get("count", 0), "description": c.get("description", ""),
             "image": (c.get("image") or {}).get("src") if c.get("image") else None}
            for c in r.json() if c["slug"] != "uncategorized"]
    cache_set("categories", cats, 300)
    return cats

@api.get("/products")
async def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=100),
    category: Optional[str] = None,
    on_sale: Optional[bool] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    tag: Optional[int] = None,
    orderby: str = Query("date", pattern="^(date|popularity|price|rating|title|menu_order)$"),
    order: str = Query("desc", pattern="^(asc|desc)$"),
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    stock_status: Optional[str] = None,
    attribute: Optional[str] = None,
    attribute_term: Optional[str] = None,
):
    params: dict[str, Any] = {"page": page, "per_page": per_page, "orderby": orderby,
                              "order": order, "status": "publish"}
    for k, v in {"category": category, "on_sale": on_sale, "featured": featured,
                 "search": search, "tag": tag, "min_price": min_price, "max_price": max_price,
                 "stock_status": stock_status,
                 "attribute": attribute, "attribute_term": attribute_term}.items():
        if v is not None:
            params[k] = v
    ck = "products:" + str(sorted(params.items()))
    cached = cache_get(ck)
    if cached:
        return cached
    r = await wc_request("GET", "products", params=params)
    result = {
        "items": [serialize_product(p) for p in r.json()],
        "total": int(r.headers.get("x-wp-total", 0)),
        "pages": int(r.headers.get("x-wp-totalpages", 1)),
        "page": page,
    }
    cache_set(ck, result, 90)
    return result

@api.get("/products/slug/{slug}")
async def get_product_by_slug(slug: str):
    r = await wc_request("GET", "products", params={"slug": slug, "status": "publish"})
    items = r.json()
    if not items:
        raise HTTPException(status_code=404, detail="Product not found")
    return serialize_product(items[0])

@api.get("/products/{product_id}")
async def get_product(product_id: int):
    r = await wc_request("GET", f"products/{product_id}")
    return serialize_product(r.json())

@api.get("/products/{product_id}/variations")
async def get_variations(product_id: int):
    ck = f"variations:{product_id}"
    cached = cache_get(ck)
    if cached:
        return cached
    r = await wc_request("GET", f"products/{product_id}/variations", params={"per_page": 100})
    data = [{
        "id": v["id"], "sku": v.get("sku"), "price": v.get("price"),
        "regular_price": v.get("regular_price"), "sale_price": v.get("sale_price"),
        "on_sale": v.get("on_sale"), "stock_status": v.get("stock_status"),
        "stock_quantity": v.get("stock_quantity"),
        "image": (v.get("image") or {}).get("src"),
        "attributes": v.get("attributes", []),
    } for v in r.json()]
    cache_set(ck, data, 90)
    return data

@api.get("/related/{product_id}")
async def get_related(product_id: int):
    r = await wc_request("GET", f"products/{product_id}")
    ids = (r.json().get("related_ids") or [])[:8]
    if not ids:
        cats = [c["id"] for c in r.json().get("categories", [])]
        if cats:
            rr = await wc_request("GET", "products",
                                  params={"category": cats[0], "per_page": 8, "exclude": product_id})
            return [serialize_product(p) for p in rr.json()]
        return []
    rr = await wc_request("GET", "products", params={"include": ",".join(map(str, ids)), "per_page": 8})
    return [serialize_product(p) for p in rr.json()]

@api.get("/coupons/validate")
async def validate_coupon(code: str):
    r = await wc_request("GET", "coupons", params={"code": code, "per_page": 1})
    items = r.json()
    if not items:
        raise HTTPException(status_code=404, detail="Invalid coupon code")
    c = items[0]
    return {"code": c["code"], "discount_type": c["discount_type"], "amount": c["amount"],
            "description": c.get("description", "")}


# ---------------------------------------------------------------------------
# Orders
# ---------------------------------------------------------------------------
@api.post("/orders")
async def create_order(body: OrderIn, request: Request):
    user = None
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            user = await get_current_user(request)
        except HTTPException:
            user = None
    payload = {
        "payment_method": body.payment_method,
        "payment_method_title": body.payment_method_title,
        "set_paid": False,
        "billing": body.billing,
        "shipping": body.shipping or body.billing,
        "line_items": [li.model_dump(exclude_none=True) for li in body.line_items],
        "coupon_lines": body.coupon_lines,
        "shipping_lines": body.shipping_lines,
        "customer_note": body.customer_note or "",
    }
    if user and user.get("wc_customer_id"):
        payload["customer_id"] = user["wc_customer_id"]
    r = await wc_request("POST", "orders", json=payload)
    o = r.json()
    pay_url = f"{WC_STORE_URL}/checkout/order-pay/{o['id']}/?pay_for_order=true&key={o.get('order_key','')}"
    return {"id": o["id"], "status": o["status"], "total": o["total"],
            "currency": o.get("currency"), "order_key": o.get("order_key"),
            "payment_url": pay_url, "line_items": o.get("line_items", [])}

@api.get("/orders/{order_id}")
async def get_order(order_id: int, request: Request):
    r = await wc_request("GET", f"orders/{order_id}")
    o = r.json()
    return o


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="An account with this email already exists")
    # Create WooCommerce customer (source of truth for customer records)
    wc_customer_id = None
    try:
        r = await wc_request("POST", "customers", json={
            "email": email, "first_name": body.first_name, "last_name": body.last_name,
        })
        wc_customer_id = r.json().get("id")
    except HTTPException as e:
        logger.warning(f"WC customer create failed for {email}: {e.detail}")
    doc = {"email": email, "password_hash": hash_password(body.password),
           "first_name": body.first_name, "last_name": body.last_name,
           "wc_customer_id": wc_customer_id, "created_at": datetime.now(timezone.utc).isoformat()}
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    token = create_token(uid, email)
    return {"token": token, "user": {"id": uid, "email": email, "first_name": body.first_name,
            "last_name": body.last_name, "wc_customer_id": wc_customer_id, "is_admin": False}}

@api.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    token = create_token(uid, email)
    return {"token": token, "user": {"id": uid, "email": email,
            "first_name": user.get("first_name", ""), "last_name": user.get("last_name", ""),
            "wc_customer_id": user.get("wc_customer_id"), "is_admin": bool(user.get("is_admin"))}}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user

@api.put("/account/profile")
async def update_profile(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if updates:
        await db.users.update_one({"_id": ObjectId(user["id"])}, {"$set": updates})
    if user.get("wc_customer_id") and (body.billing or body.shipping or body.first_name):
        wc_payload = {}
        if body.first_name is not None:
            wc_payload["first_name"] = body.first_name
        if body.last_name is not None:
            wc_payload["last_name"] = body.last_name
        if body.billing:
            wc_payload["billing"] = body.billing
        if body.shipping:
            wc_payload["shipping"] = body.shipping
        if wc_payload:
            try:
                await wc_request("PUT", f"customers/{user['wc_customer_id']}", json=wc_payload)
            except HTTPException:
                pass
    updated = await db.users.find_one({"_id": ObjectId(user["id"])})
    updated["id"] = str(updated.pop("_id"))
    updated.pop("password_hash", None)
    return updated

@api.get("/account/orders")
async def account_orders(user: dict = Depends(get_current_user)):
    if not user.get("wc_customer_id"):
        return []
    r = await wc_request("GET", "orders",
                         params={"customer": user["wc_customer_id"], "per_page": 50, "orderby": "date"})
    orders = []
    for o in r.json():
        orders.append({
            "id": o["id"], "number": o.get("number"), "status": o["status"],
            "total": o["total"], "currency": o.get("currency"),
            "date_created": o.get("date_created"),
            "line_items": [{"name": li["name"], "quantity": li["quantity"],
                            "total": li["total"], "image": (li.get("image") or {}).get("src")}
                           for li in o.get("line_items", [])],
        })
    return orders


class SettingsUpdate(BaseModel):
    marquee_texts: Optional[List[str]] = None
    festive: Optional[dict] = None


@api.get("/settings")
async def get_settings():
    doc = await get_settings_doc()
    return public_settings(doc)


@api.get("/media/{path:path}")
async def media(path: str):
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(content=data, media_type=content_type,
                    headers={"Cache-Control": "public, max-age=86400"})


@api.put("/admin/settings")
async def admin_update_settings(body: SettingsUpdate, admin: dict = Depends(get_admin_user)):
    updates = {}
    if body.marquee_texts is not None:
        updates["marquee_texts"] = [t.strip() for t in body.marquee_texts if t and t.strip()]
    if body.festive is not None:
        f = body.festive
        updates["festive"] = {
            "title": (f.get("title") or "Festive Collection").strip(),
            "category_id": int(f["category_id"]) if f.get("category_id") else None,
            "enabled": bool(f.get("enabled", True)),
        }
    if updates:
        await db.settings.update_one({"_id": "site"}, {"$set": updates}, upsert=True)
    doc = await get_settings_doc()
    return public_settings(doc)


@api.post("/admin/hero-images")
async def admin_upload_hero(file: UploadFile = File(...), admin: dict = Depends(get_admin_user)):
    doc = await get_settings_doc()
    if len(doc.get("hero_images", [])) >= 5:
        raise HTTPException(status_code=400, detail="You can have a maximum of 5 hero images. Delete one first.")
    ext = (file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "jpg").lower()
    if ext not in MIME_TYPES:
        raise HTTPException(status_code=400, detail="Please upload a JPG, PNG, GIF or WebP image.")
    data = await file.read()
    if len(data) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large. Please keep it under 8MB.")
    path = f"{APP_NAME}/hero/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, MIME_TYPES[ext])
    except Exception as e:
        logger.error(f"Hero upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload failed. Please try again.")
    record = {"id": str(uuid.uuid4()), "storage_path": result["path"], "alt": "Sojaru"}
    await db.settings.update_one({"_id": "site"}, {"$push": {"hero_images": record}}, upsert=True)
    doc = await get_settings_doc()
    return public_settings(doc)


@api.delete("/admin/hero-images/{image_id}")
async def admin_delete_hero(image_id: str, admin: dict = Depends(get_admin_user)):
    await db.settings.update_one({"_id": "site"}, {"$pull": {"hero_images": {"id": image_id}}})
    doc = await get_settings_doc()
    return public_settings(doc)


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    # Seed admin (idempotent, re-hash if password changed)
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await db.users.insert_one({
            "email": ADMIN_EMAIL, "password_hash": hash_password(ADMIN_PASSWORD),
            "first_name": "Sojaru", "last_name": "Admin", "is_admin": True,
            "wc_customer_id": None, "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        upd = {"is_admin": True}
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            upd["password_hash"] = hash_password(ADMIN_PASSWORD)
        await db.users.update_one({"email": ADMIN_EMAIL}, {"$set": upd})
    await get_settings_doc()
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown():
    global http_client
    if http_client:
        await http_client.aclose()
    client.close()
