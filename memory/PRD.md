# Sojaru — Headless WooCommerce Storefront (PRD)

## Original Problem
Build "Sojaru", a custom headless storefront on top of a live WordPress + WooCommerce backend (store: sojaru.co.in). WooCommerce is the source of truth for products, categories, variations, inventory, orders, customers, coupons. Frontend is fully custom (React), never default WooCommerce theme. Two worlds: "For You" (people) and "For Your Pet" (pets). Brand messaging: "for you and your best friend." Reference (inspiration only, not copy): franklywearing.com.

## Architecture
- Frontend: React (CRA + craco), Tailwind, shadcn/ui, react-router. Design system: Fraunces (display) + Plus Jakarta Sans (body), warm cream/ink/terracotta/matcha palette.
- Backend: FastAPI proxy to WooCommerce REST API v3 (httpx, basic auth). Consumer key/secret stored server-side in backend/.env only — never exposed to frontend.
- Auth: Custom JWT (bcrypt) users in MongoDB, mapped to WooCommerce customer_id (created on register) for order history.
- MongoDB: users collection only (WooCommerce is source of truth for commerce data).

## Core Requirements (static)
- Dynamic products/categories from WooCommerce; adding a product in wp-admin auto-appears on site.
- Mega-menu nav (For You / For Your Pet), search, cart drawer, checkout, customer account, SEO, mobile-first.
- Never expose WC secrets client-side.

## Implemented (2026-06)
- Backend proxy endpoints: /store/config, /categories, /products (filters: category, on_sale, featured, search, price, stock, sort, pagination), /products/{id}, /products/slug/{slug}, /products/{id}/variations, /related, /coupons/validate, /orders (create + get), auth (register/login/me), /account/orders, /account/profile. In-memory TTL cache for public reads.
- Seeded 14 demo products across all subcategories (incl. 3 variable products with Size/Color) with AI-generated brand imagery.
- Storefront: Home (hero, two worlds, shop-by-category, featured/new/sale/best-seller rows, editorial banner), World pages, Category pages (filters/sort/load-more), Product detail (gallery, variations, qty, add/buy, accordions, related, JSON-LD), Search (dialog + results page), Cart drawer (free-ship progress, coupon at checkout), Checkout (order creation -> WooCommerce hosted payment link), Account (orders/profile/addresses), Login/Register, About/Contact/FAQ/Shipping/Privacy/Terms, 404.
- SEO meta/OG/canonical per page, product structured data.

## Payment note
Checkout creates a pending WooCommerce order via REST, then hands off to the store's WooCommerce hosted "order-pay" URL for actual payment (uses whatever gateways the owner configured). No card data touches this app.

## Backlog / Future (P1/P2)
- WooCommerce Store API cart/checkout for fully inline payment.
- Webhook-based cache invalidation on product update.
- Wishlist persistence, product reviews submission, gift-message field passthrough.
- Global attribute taxonomies for server-side size/color filtering (currently client-side).
