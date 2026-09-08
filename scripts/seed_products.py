#!/usr/bin/env python3
"""Seed demo products into the new WooCommerce store (developer.sojaru.co.in)."""

import requests, json, time

WC_URL  = "https://developer.sojaru.co.in/wp-json/wc/v3"
WC_KEY  = "ck_419a6e09d46defa88017c949a5810a884a3e9573"
WC_SEC  = "cs_832d936678f29ec8c1946d7dd1165a223174460c"
AUTH    = (WC_KEY, WC_SEC)

# ── Category IDs (from live store) ──────────────────────────────────────────
CAT = {
    "featured"      : 17,
    "best_sellers"  : 16,
    "festive"       : 18,
    "for_you"       : 19,
    "for_pet"       : 28,
    "on_sale"       : 32,
    "new_arrivals"  : 31,
    "accessories"   : 20,
    "bags"          : 21,
    "caps"          : 22,
    "clothing"      : 23,
    "decors"        : 24,
    "drinkware"     : 25,
    "gifting"       : 26,
    "stationary"    : 27,
    "pet_tags"      : 29,
    "dog_tshirts"   : 30,
}

def cats(*keys):
    return [{"id": CAT[k]} for k in keys]

# ── Unsplash image helpers ───────────────────────────────────────────────────
IMGS = {
    "macrame_wall"  : "https://images.unsplash.com/photo-1619808799783-db68de98fbe0?w=800&q=80",
    "terracotta_pot": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
    "ceramic_mug"   : "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=800&q=80",
    "jute_tote"     : "https://images.unsplash.com/photo-1597484661973-ee6cd0b6482c?w=800&q=80",
    "canvas_bag"    : "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "bucket_hat"    : "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80",
    "cotton_kurta"  : "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80",
    "tie_dye"       : "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    "bracelet"      : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
    "hair_tie"      : "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    "journal"       : "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80",
    "stationery"    : "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
    "gift_box"      : "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=800&q=80",
    "candle"        : "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&q=80",
    "pet_tag"       : "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
    "dog_tshirt"    : "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80",
    "diffuser"      : "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80",
    "wall_frame"    : "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&q=80",
}

def img(key): return [{"src": IMGS[key], "alt": key.replace("_", " ").title()}]

# ── Product definitions ──────────────────────────────────────────────────────
PRODUCTS = [
    # ── DECORS ──────────────────────────────────────────────────────────────
    {
        "name": "Macramé Wall Hanging — Natural Cotton",
        "type": "simple", "status": "publish",
        "regular_price": "1499",
        "categories": cats("decors", "for_you", "featured", "best_sellers"),
        "images": img("macrame_wall"),
        "description": "Hand-knotted in natural cotton rope. Each piece is unique, imperfect, and made with intention. Approx. 45cm × 80cm.",
        "short_description": "Handmade natural cotton macramé wall art.",
        "stock_status": "instock", "manage_stock": False,
    },
    {
        "name": "Terracotta Planter Pot Set (Set of 2)",
        "type": "simple", "status": "publish",
        "regular_price": "849",
        "categories": cats("decors", "for_you", "festive"),
        "images": img("terracotta_pot"),
        "description": "Set of 2 hand-thrown terracotta pots. Earthy, warm, and perfect for succulents or herbs. Drainage hole included.",
        "short_description": "Hand-thrown terracotta pots, set of 2.",
        "stock_status": "instock",
    },
    {
        "name": "Boho Woven Wall Frame",
        "type": "simple", "status": "publish",
        "regular_price": "1199",
        "categories": cats("decors", "for_you", "new_arrivals"),
        "images": img("wall_frame"),
        "description": "A woven textile wall frame that adds a cozy, artisanal touch to any room.",
        "short_description": "Woven textile wall frame, boho style.",
        "stock_status": "instock",
    },
    # ── DRINKWARE ────────────────────────────────────────────────────────────
    {
        "name": "Handpainted Ceramic Chai Mug",
        "type": "simple", "status": "publish",
        "regular_price": "449",
        "categories": cats("drinkware", "for_you", "featured", "best_sellers"),
        "images": img("ceramic_mug"),
        "description": "Sip your chai in style. Each mug is hand-thrown and painted by our artisans. Microwave & dishwasher safe. ~350ml.",
        "short_description": "Hand-thrown & painted ceramic mug, 350ml.",
        "stock_status": "instock",
    },
    {
        "name": "Soy Wax Reed Diffuser — Mogra & Vetiver",
        "type": "simple", "status": "publish",
        "regular_price": "699", "sale_price": "549",
        "categories": cats("drinkware", "for_you", "gifting", "on_sale"),
        "images": img("diffuser"),
        "description": "100% soy wax reed diffuser with notes of mogra, vetiver, and sandalwood. Lasts up to 6 weeks.",
        "short_description": "Soy wax reed diffuser, 150ml.",
        "stock_status": "instock",
    },
    # ── BAGS ────────────────────────────────────────────────────────────────
    {
        "name": "Hand-block Print Jute Tote Bag",
        "type": "simple", "status": "publish",
        "regular_price": "649",
        "categories": cats("bags", "for_you", "featured", "best_sellers"),
        "images": img("jute_tote"),
        "description": "Eco-friendly jute tote with hand-block print in indigo & terracotta. Sturdy enough for your everyday carry.",
        "short_description": "Hand-block print jute tote, eco-friendly.",
        "stock_status": "instock",
    },
    {
        "name": "Natural Canvas Sling Bag",
        "type": "simple", "status": "publish",
        "regular_price": "799",
        "categories": cats("bags", "for_you", "new_arrivals"),
        "images": img("canvas_bag"),
        "description": "Lightweight canvas sling bag with adjustable strap. Fits a notebook, water bottle, and all your essentials.",
        "short_description": "Canvas sling bag with adjustable strap.",
        "stock_status": "instock",
    },
    # ── ACCESSORIES ─────────────────────────────────────────────────────────
    {
        "name": "Seed Bead Stretch Bracelet",
        "type": "simple", "status": "publish",
        "regular_price": "299", "sale_price": "229",
        "categories": cats("accessories", "for_you", "on_sale"),
        "images": img("bracelet"),
        "description": "Handstrung seed bead bracelet in earthy tones — terracotta, mustard, and sage. One size fits most.",
        "short_description": "Handstrung seed bead bracelet, one size.",
        "stock_status": "instock",
    },
    {
        "name": "Macramé Scrunchie Hair Tie (Set of 3)",
        "type": "simple", "status": "publish",
        "regular_price": "349",
        "categories": cats("accessories", "for_you", "new_arrivals"),
        "images": img("hair_tie"),
        "description": "Soft, hand-knotted macramé scrunchies in natural cotton. Easy on your hair and on the planet. Set of 3.",
        "short_description": "Hand-knotted macramé scrunchies, set of 3.",
        "stock_status": "instock",
    },
    # ── CAPS ────────────────────────────────────────────────────────────────
    {
        "name": "Embroidered Bucket Hat — Sage Green",
        "type": "simple", "status": "publish",
        "regular_price": "549",
        "categories": cats("caps", "for_you", "featured"),
        "images": img("bucket_hat"),
        "description": "100% cotton bucket hat with floral embroidery. Packable, lightweight, UPF 30+. One size with adjustable drawstring.",
        "short_description": "Embroidered cotton bucket hat, UPF 30+.",
        "stock_status": "instock",
    },
    # ── CLOTHING ────────────────────────────────────────────────────────────
    {
        "name": "Hand-block Print Cotton Kurta",
        "type": "variable", "status": "publish",
        "regular_price": "1299",
        "categories": cats("clothing", "for_you", "featured", "best_sellers"),
        "images": img("cotton_kurta"),
        "description": "Breathable cotton kurta with hand-block print. Relaxed fit, perfect for everyday wear. Wash cold, line dry.",
        "short_description": "Hand-block printed cotton kurta.",
        "stock_status": "instock",
        "attributes": [
            {"name": "Size", "variation": True, "visible": True,
             "options": ["XS", "S", "M", "L", "XL"]},
        ],
    },
    {
        "name": "Tie-Dye Kaftan Top",
        "type": "simple", "status": "publish",
        "regular_price": "999",
        "sale_price": "799",
        "categories": cats("clothing", "for_you", "on_sale"),
        "images": img("tie_dye"),
        "description": "Flowy tie-dye kaftan in soft cotton. Each piece is one-of-a-kind. Free size (fits S–L comfortably).",
        "short_description": "Flowy tie-dye kaftan, free size.",
        "stock_status": "instock",
    },
    # ── STATIONARY ──────────────────────────────────────────────────────────
    {
        "name": "Handmade Deckle-Edge Bullet Journal",
        "type": "simple", "status": "publish",
        "regular_price": "399",
        "categories": cats("stationary", "for_you", "new_arrivals"),
        "images": img("journal"),
        "description": "Hand-stitched bullet journal with deckle-edge pages. 120gsm off-white paper, 120 pages. Lay-flat binding.",
        "short_description": "Handmade deckle-edge journal, 120 pages.",
        "stock_status": "instock",
    },
    {
        "name": "Bamboo Stationery Kit",
        "type": "simple", "status": "publish",
        "regular_price": "699", "sale_price": "549",
        "categories": cats("stationary", "for_you", "on_sale"),
        "images": img("stationery"),
        "description": "Sustainable bamboo stationery set: 2 pens, ruler, bookmark, and pencil pouch. Great for gifting.",
        "short_description": "Sustainable bamboo stationery set.",
        "stock_status": "instock",
    },
    # ── GIFTING ─────────────────────────────────────────────────────────────
    {
        "name": "Chai Ritual Gift Hamper",
        "type": "simple", "status": "publish",
        "regular_price": "1299", "sale_price": "999",
        "categories": cats("gifting", "for_you", "festive", "on_sale", "best_sellers"),
        "images": img("gift_box"),
        "description": "The perfect gift for the chai lover. Includes 1 ceramic mug, 1 tin of masala chai blend, and a macramé coaster. Beautifully gift-wrapped.",
        "short_description": "Ceramic mug + masala chai + macramé coaster.",
        "stock_status": "instock",
    },
    {
        "name": "Soy Candle Gift Set — 3 Scents",
        "type": "simple", "status": "publish",
        "regular_price": "899",
        "categories": cats("gifting", "for_you", "festive", "new_arrivals"),
        "images": img("candle"),
        "description": "Set of 3 hand-poured soy candles in glass jars: Sandalwood, Mogra, and Lemon Verbena. 30hr burn time each.",
        "short_description": "3 hand-poured soy candles, 30hr burn time.",
        "stock_status": "instock",
    },
    # ── PET TAGS ────────────────────────────────────────────────────────────
    {
        "name": "Personalised Brass Engraved Pet Tag",
        "type": "simple", "status": "publish",
        "regular_price": "249",
        "categories": cats("pet_tags", "for_pet", "featured", "best_sellers"),
        "images": img("pet_tag"),
        "description": "Hand-engraved solid brass pet tag. Add your pet's name and your phone number. Bone, heart, or round shape.",
        "short_description": "Hand-engraved solid brass pet ID tag.",
        "stock_status": "instock",
    },
    {
        "name": "Wooden Pet Tag — Laser Engraved",
        "type": "simple", "status": "publish",
        "regular_price": "299",
        "categories": cats("pet_tags", "for_pet", "new_arrivals"),
        "images": img("pet_tag"),
        "description": "Lightweight natural wood tag, laser-engraved with your pet's name. Waterproof finish. Choose from 5 shapes.",
        "short_description": "Laser-engraved natural wood pet tag.",
        "stock_status": "instock",
    },
    # ── DOG T-SHIRTS ────────────────────────────────────────────────────────
    {
        "name": "Tie-Dye Dog Tee",
        "type": "variable", "status": "publish",
        "regular_price": "449",
        "categories": cats("dog_tshirts", "for_pet", "best_sellers"),
        "images": img("dog_tshirt"),
        "description": "100% cotton tie-dye tee for dogs. Each piece is unique. Soft, stretchy, easy on/off velcro closure.",
        "short_description": "Hand tie-dyed cotton dog t-shirt.",
        "stock_status": "instock",
        "attributes": [
            {"name": "Size", "variation": True, "visible": True,
             "options": ["XS (2–4kg)", "S (4–8kg)", "M (8–12kg)", "L (12–18kg)"]},
        ],
    },
    {
        "name": "Floral Print Dog T-Shirt",
        "type": "simple", "status": "publish",
        "regular_price": "399", "sale_price": "349",
        "categories": cats("dog_tshirts", "for_pet", "on_sale"),
        "images": img("dog_tshirt"),
        "description": "Adorable floral print t-shirt for small to medium dogs. 100% breathable cotton. Machine washable.",
        "short_description": "Floral print cotton dog t-shirt.",
        "stock_status": "instock",
    },
]

def create_product(p):
    r = requests.post(f"{WC_URL}/products", json=p, auth=AUTH, timeout=30)
    if r.status_code in (200, 201):
        d = r.json()
        print(f"  ✓ Created [{d['id']}] {d['name']} — ₹{d['price']}")
        return d
    else:
        print(f"  ✗ FAILED {p['name']}: {r.status_code} {r.text[:120]}")
        return None

def create_variations(product_id, sizes):
    for size in sizes:
        v = {"regular_price": "999", "attributes": [{"name": "Size", "option": size}], "stock_status": "instock"}
        r = requests.post(f"{WC_URL}/products/{product_id}/variations", json=v, auth=AUTH, timeout=15)
        if r.status_code in (200, 201):
            print(f"    + variation {size}")
        time.sleep(0.3)

if __name__ == "__main__":
    print(f"\nSeeding {len(PRODUCTS)} products into developer.sojaru.co.in ...\n")
    created = 0
    for p in PRODUCTS:
        result = create_product(p)
        if result:
            created += 1
            # Create size variations for variable products
            if p.get("type") == "variable":
                attrs = p.get("attributes", [])
                for attr in attrs:
                    if attr["name"] == "Size":
                        create_variations(result["id"], attr["options"])
        time.sleep(0.5)  # Rate limit buffer

    print(f"\n✅ Done! Created {created}/{len(PRODUCTS)} products.")
