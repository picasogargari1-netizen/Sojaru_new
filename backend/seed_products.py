"""Seed Sojaru demo products into WooCommerce. Idempotent by product name.
These are real WooCommerce products the owner can edit/delete in wp-admin."""
import os
import sys
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')
BASE = os.environ['WC_STORE_URL'].rstrip('/') + '/wp-json/wc/v3'
AUTH = (os.environ['WC_CONSUMER_KEY'], os.environ['WC_CONSUMER_SECRET'])

IMG = "https://static.prod-images.emergentagent.com/jobs/4a763fbf-4f9d-42a8-af37-1036efe0d5ca/images/"
def img(h): return {"src": IMG + h}

TEE = img("0af8e0a18223c3f8ed1eccda260c578203f5c4b2c01240c11817ce00e176da8a.jpeg")
HOODIE = img("0369e51b07701ded4bf8190f2105be787cac8b65ae35fbd73084e90ef67477a0.jpeg")
MUG = img("a787e33ab5ef96e50e19087c13ffda74fa04ac9a28649bd7818702321e4e6a5d.jpeg")
BOTTLE = img("1031e2972efad007606c9abce95bda524d930b536d01cc0344c4b10eb1ab27f9.jpeg")
CAP = img("06320297027982211701804444ce4a6bc3aa5d5e71aa608bc0952aa35edde310.jpeg")
NOTEBOOK = img("b1c04e708e60f875ae41105e584893f3bcb6d7016a496ea66c0332ee9cf134ac.jpeg")
TOTE = img("da05d2450c7286c649de91d80e65fcba15932416309923a68fadab8b0ae8fa7a.jpeg")
GIFTBOX = img("018d0ab400737da050644ea79865701a83a7d3b5d08efc62925019082f6e7653.jpeg")
VASE = img("b5d1524ff7c55b5b7c52e8235efd2b277647ed57fdedcf083331229211e0374a.jpeg")
KEYCHAIN = img("e7f33d51b6b3fc34e01c4d41f2ac50b46a85b9b8f6ddb9ae5abe55e8d78c209d.jpeg")
BRASS = img("aa36c990094b4de96165c0633d0dbccb3479c9a80cc714646beb7655b980f2c6.jpeg")
ENAMEL = img("7717bcf3e4a496eb19b267251a674eb7d25c325ad5fd20a1ebeb7b21c9103c4a.jpeg")
DOG_TEE = img("7fa7e7732e8e323038b6f8b528c9dd6b2cc0dc7c7098007a5fe8d81a5c0aed7f.jpeg")
DOG_SHIRT = img("dad91a177120891de1372f08091ccb8d9c7ee64f22ab17f618074db2b6561c7d.jpeg")

# category ids
CLOTHING, DRINKWARE, CAPS, STATIONERY = 19, 20, 21, 22
ACCESSORIES, BAGS, GIFTING, DECORS = 23, 24, 25, 26
PET_TAGS, DOG_SHIRTS = 27, 28

SIMPLE = [
    dict(name="Handcrafted Ceramic Mug", cat=DRINKWARE, price="24", sale="19", img=MUG,
         short="A warm morning ritual for you \u2014 stoneware glazed by hand.",
         desc="Start every morning right. This hand-glazed stoneware mug holds 350ml and keeps your coffee cosy. Dishwasher and microwave safe.", featured=False),
    dict(name="Cloud Insulated Bottle", cat=DRINKWARE, price="34", img=BOTTLE, featured=True,
         short="Stays cold 24h, hot 12h. Hydration that keeps up with you.",
         desc="Double-walled stainless steel, powder-coated in soft bone. Keeps drinks cold for 24 hours and hot for 12. 600ml, leak-proof lid."),
    dict(name="Corduroy Dad Cap", cat=CAPS, price="28", img=CAP,
         short="A soft camel corduroy cap for lazy Sundays and long walks.",
         desc="Six-panel corduroy cap with an adjustable brass buckle strap. One size fits most. Made for you and every walk with your best friend."),
    dict(name="Daily Rituals Notebook Set", cat=STATIONERY, price="22", img=NOTEBOOK, new=True,
         short="Two hardcover notebooks for plans, lists and little wins.",
         desc="A set of two hardcover lined notebooks in oat and terracotta, with elastic closure and ribbon marker. 160 pages each, FSC-certified paper."),
    dict(name="Leather Brass Keychain", cat=ACCESSORIES, price="18", img=KEYCHAIN,
         short="Full-grain leather and solid brass \u2014 keys never looked this good.",
         desc="A minimalist keychain in tan full-grain leather with a solid brass ring and clasp. Ages beautifully with everyday use."),
    dict(name="Everyday Canvas Tote", cat=BAGS, price="42", img=TOTE, featured=True,
         short="The one bag for groceries, getaways and everything between.",
         desc="Heavyweight natural cotton canvas with reinforced handles and an inner pocket. Holds far more than it looks. Built for daily life."),
    dict(name="Cozy Comfort Gift Box", cat=GIFTING, price="58", img=GIFTBOX, featured=True,
         short="A ready-to-gift box of Sojaru favourites for someone you love.",
         desc="A curated gift box wrapped with a terracotta ribbon and dried bloom \u2014 the easiest way to say you care. Personalise the note at checkout."),
    dict(name="Sculptural Ceramic Vase", cat=DECORS, price="46", sale="38", img=VASE,
         short="A matcha-green sculptural vase that anchors any corner.",
         desc="Hand-finished matte ceramic vase with an organic silhouette. Perfect for dried stems or a single bloom. Each piece is subtly unique."),
    dict(name="Brass Bone Pet Tag", cat=PET_TAGS, price="16", img=BRASS, featured=True, new=True,
         short="For your best friend \u2014 solid brass, engraved with love.",
         desc="A solid brass bone-shaped ID tag, deep-engraved with your pet's name and your number. Because your best friend deserves the good stuff."),
    dict(name="Enamel Circle Pet Tag", cat=PET_TAGS, price="18", img=ENAMEL,
         short="A playful enamel tag in terracotta and cream for your pup.",
         desc="Round enamel pet ID tag with a brass edge in terracotta and cream. Lightweight, quiet on the collar, and endlessly cute."),
    dict(name="Striped Dog Shirt", cat=DOG_SHIRTS, price="28", sale="22", img=DOG_SHIRT,
         short="Matcha stripes for the most stylish pup on the block.",
         desc="A soft, breathable unisex dog shirt in matcha and cream stripes. Stretch cotton blend, easy over-the-head fit. Matches our human tees."),
]

# variable products: (base info, attribute name, options, variations)
VARIABLE = [
    dict(name="Everyday Organic Cotton Tee", cat=CLOTHING, img=TEE, featured=True, new=True,
         short="Buttery organic cotton in a relaxed everyday fit \u2014 for you.",
         desc="Our signature tee in GOTS-certified organic cotton with a relaxed, unisex fit. Pre-washed for softness that lasts. Pair it with the Matchy Dog Tee for you and your best friend.",
         attrs=[("Size", ["S", "M", "L", "XL"]), ("Color", ["Sand", "Matcha"])],
         reg="32", sale="26"),
    dict(name="Cloud Fleece Hoodie", cat=CLOTHING, img=HOODIE, featured=True,
         short="A matcha fleece hoodie so soft you'll live in it.",
         desc="Heavyweight brushed-back fleece hoodie in matcha green. Relaxed fit, double-lined hood, kangaroo pocket. Cosy season, sorted.",
         attrs=[("Size", ["S", "M", "L", "XL"])], reg="68"),
    dict(name="Matchy Dog Tee", cat=DOG_SHIRTS, img=DOG_TEE, featured=True, new=True,
         short="Twin with your pup \u2014 the matching tee to our Everyday Tee.",
         desc="A soft organic cotton dog tee with a terracotta pocket detail, made to match our Everyday Organic Cotton Tee. For you and your best friend, officially matching.",
         attrs=[("Size", ["XS", "S", "M", "L"])], reg="26"),
]


def existing_names():
    names = set()
    page = 1
    while True:
        r = requests.get(f"{BASE}/products", auth=AUTH,
                         params={"per_page": 100, "page": page, "status": "any"})
        data = r.json()
        if not isinstance(data, list) or not data:
            break
        for p in data:
            names.add(p["name"])
        if len(data) < 100:
            break
        page += 1
    return names


def main():
    have = existing_names()
    created = 0
    for p in SIMPLE:
        if p["name"] in have:
            print("skip", p["name"]); continue
        payload = {
            "name": p["name"], "type": "simple", "status": "publish",
            "regular_price": p["price"], "description": p["desc"],
            "short_description": p["short"], "categories": [{"id": p["cat"]}],
            "images": [p["img"]], "featured": p.get("featured", False),
            "manage_stock": True, "stock_quantity": 50,
        }
        if p.get("sale"):
            payload["sale_price"] = p["sale"]
        r = requests.post(f"{BASE}/products", auth=AUTH, json=payload)
        if r.status_code in (200, 201):
            created += 1; print("created", p["name"], r.json()["id"])
        else:
            print("ERR", p["name"], r.status_code, r.text[:200])

    for p in VARIABLE:
        if p["name"] in have:
            print("skip", p["name"]); continue
        attributes = []
        for i, (aname, opts) in enumerate(p["attrs"]):
            attributes.append({"name": aname, "position": i, "visible": True,
                               "variation": True, "options": opts})
        payload = {
            "name": p["name"], "type": "variable", "status": "publish",
            "description": p["desc"], "short_description": p["short"],
            "categories": [{"id": p["cat"]}], "images": [p["img"]],
            "featured": p.get("featured", False), "attributes": attributes,
        }
        r = requests.post(f"{BASE}/products", auth=AUTH, json=payload)
        if r.status_code not in (200, 201):
            print("ERR", p["name"], r.status_code, r.text[:200]); continue
        pid = r.json()["id"]
        created += 1; print("created variable", p["name"], pid)
        # build variation combinations
        import itertools
        opt_lists = [opts for (_, opts) in p["attrs"]]
        names = [aname for (aname, _) in p["attrs"]]
        for combo in itertools.product(*opt_lists):
            v_attrs = [{"name": names[i], "option": combo[i]} for i in range(len(combo))]
            vpayload = {"regular_price": p["reg"], "attributes": v_attrs,
                        "manage_stock": True, "stock_quantity": 20}
            if p.get("sale"):
                vpayload["sale_price"] = p["sale"]
            rv = requests.post(f"{BASE}/products/{pid}/variations", auth=AUTH, json=vpayload)
            if rv.status_code not in (200, 201):
                print("  var ERR", combo, rv.status_code, rv.text[:150])
        print("  variations added for", p["name"])

    print(f"\nDONE. Created {created} products.")


if __name__ == "__main__":
    main()
