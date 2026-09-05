from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')

import os
import time
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any

import jwt
import bcrypt
import httpx
from bson import ObjectId
from fastapi import FastAPI, APIRouter, HTTPException, Request, Query, Depends
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
    return user


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
            "last_name": body.last_name, "wc_customer_id": wc_customer_id}}

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
            "wc_customer_id": user.get("wc_customer_id")}}

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

@app.on_event("shutdown")
async def shutdown():
    global http_client
    if http_client:
        await http_client.aclose()
    client.close()
