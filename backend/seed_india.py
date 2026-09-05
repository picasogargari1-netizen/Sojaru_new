"""India-ize the Sojaru store: set INR currency, reprice demo products to INR,
and create group categories (New Arrivals, Featured, On Sale, Best Sellers) + assign products."""
import os, requests
from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / '.env')
BASE = os.environ['WC_STORE_URL'].rstrip('/') + '/wp-json/wc/v3'
AUTH = (os.environ['WC_CONSUMER_KEY'], os.environ['WC_CONSUMER_SECRET'])

def put(path, payload):
    return requests.put(f"{BASE}/{path}", auth=AUTH, json=payload)
def post(path, payload):
    return requests.post(f"{BASE}/{path}", auth=AUTH, json=payload)
def get(path, params=None):
    return requests.get(f"{BASE}/{path}", auth=AUTH, params=params or {})

# 1) Currency -> INR
for key, val in [("woocommerce_currency", "INR"), ("woocommerce_currency_pos", "left"),
                 ("woocommerce_price_thousand_sep", ","), ("woocommerce_price_decimal_sep", "."),
                 ("woocommerce_price_num_decimals", "0"),
                 ("woocommerce_default_country", "IN")]:
    r = put(f"settings/general/{key}", {"value": val})
    print("currency setting", key, r.status_code)

# 2) Reprice (id -> (regular, sale|None)) in INR
PRICES = {
    16: ("799", "599"),   # Ceramic Mug
    18: ("1499", None),   # Insulated Bottle
    20: ("1099", None),   # Corduroy Cap
    22: ("899", None),    # Notebook Set
    24: ("699", None),    # Keychain
    26: ("1699", None),   # Canvas Tote
    28: ("2499", None),   # Gift Box
    30: ("1899", "1499"), # Ceramic Vase
    32: ("649", None),    # Brass Bone Pet Tag
    34: ("749", None),    # Enamel Circle Pet Tag
    36: ("1199", "899"),  # Striped Dog Shirt
}
for pid, (reg, sale) in PRICES.items():
    payload = {"regular_price": reg}
    payload["sale_price"] = sale if sale else ""
    r = put(f"products/{pid}", payload)
    print("price", pid, r.status_code)

# variable products: id -> (reg, sale|None)
VARIABLE = {38: ("1299", "999"), 48: ("2999", None), 54: ("1099", None)}
for pid, (reg, sale) in VARIABLE.items():
    put(f"products/{pid}", {"regular_price": reg})
    vs = get(f"products/{pid}/variations", {"per_page": 100}).json()
    for v in vs:
        payload = {"regular_price": reg, "sale_price": sale if sale else ""}
        rv = put(f"products/{pid}/variations/{v['id']}", payload)
    print("variable priced", pid, "variations", len(vs))

# 3) Group categories
GROUPS = [
    ("New Arrivals", "new-arrivals"),
    ("Featured", "featured-collection"),
    ("On Sale", "on-sale"),
    ("Best Sellers", "best-sellers"),
]
existing = {c["slug"]: c["id"] for c in get("products/categories", {"per_page": 100}).json()}
gid = {}
for name, slug in GROUPS:
    if slug in existing:
        gid[slug] = existing[slug]; print("group exists", slug, gid[slug]); continue
    r = post("products/categories", {"name": name, "slug": slug})
    if r.status_code in (200, 201):
        gid[slug] = r.json()["id"]; print("group created", slug, gid[slug])
    else:
        print("group ERR", slug, r.status_code, r.text[:150])

# 4) Assign products to groups (append to existing categories)
ASSIGN = {
    "new-arrivals": [38, 22, 32, 54, 18],
    "featured-collection": [18, 26, 28, 32, 38, 48, 54],
    "on-sale": [16, 30, 36, 38],
    "best-sellers": [16, 26, 20, 32, 48, 36],
}
# build product_id -> set of group cat ids to add
add_map = {}
for slug, pids in ASSIGN.items():
    for pid in pids:
        add_map.setdefault(pid, set()).add(gid[slug])

for pid, group_ids in add_map.items():
    cur = get(f"products/{pid}").json()
    cats = {c["id"] for c in cur.get("categories", [])} | group_ids
    r = put(f"products/{pid}", {"categories": [{"id": c} for c in cats]})
    print("assign", pid, r.status_code, "->", sorted(cats))

print("\nDONE.")
