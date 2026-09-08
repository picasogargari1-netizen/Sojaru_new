import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductRow } from "@/components/ProductRow";
import { SectionHeader } from "@/components/States";
import { IMAGES, catImage } from "@/lib/assets";
import { mediaUrl } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";

function Hero() {
  const { settings } = useStore();
  const hero = settings?.hero || {};
  const heroImages = settings?.hero_images?.length
    ? settings.hero_images.map((h) => ({ src: mediaUrl(h.url), alt: h.alt }))
    : [{ src: IMAGES.hero, alt: "A woman relaxing with her golden retriever, both in cozy Sojaru knits" }];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (heroImages.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  const primaryLabel = hero.primary_label || "Shop Now";
  const primaryLink = hero.primary_link || "/shop/for-you";
  const secondaryLabel = hero.secondary_label || "Shop For Your Pet";
  const secondaryLink = hero.secondary_link || "/shop/for-your-pet";

  return (
    <section className="relative">
      <div className="absolute inset-0 overflow-hidden bg-ink">
        {heroImages.map((img, i) => (
          <img key={i} src={img.src} alt={img.alt}
            onError={(e) => { e.target.src = IMAGES.hero; }}
            className={`absolute inset-0 h-full w-full object-cover object-[72%_center] transition-opacity duration-1000 ${i === idx ? "opacity-100" : "opacity-0"}`} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/25 to-transparent" />
      </div>
      <div className="relative mx-auto flex min-h-[580px] max-w-7xl items-end px-4 pb-16 pt-16 sm:min-h-[640px] sm:px-6 sm:pb-20 lg:min-h-[88vh] lg:px-8">
        <div className="max-w-lg animate-fade-up" style={{ animationDelay: "80ms" }}>
          <p className="eyebrow mb-4 text-cream/60">Sojaru</p>
          <h1 className="font-display text-4xl font-normal leading-[1.15] text-cream sm:text-5xl lg:text-6xl">
            {hero.subtitle || "Boldly designed everyday goods — for the humans who love hard and the pets who love harder."}
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={primaryLink}
              data-testid="hero-shop-for-you-btn"
              className="inline-flex items-center gap-2 bg-cream px-6 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:bg-ink hover:text-cream"
            >
              {primaryLabel} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to={secondaryLink}
              data-testid="hero-shop-for-pet-btn"
              className="inline-flex items-center gap-2 border border-cream/60 px-6 py-3 text-xs font-medium uppercase tracking-widest text-cream transition-all hover:border-cream hover:bg-cream/10"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
      {heroImages.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={`Go to slide ${i + 1}`} data-testid={`hero-dot-${i}`}
              className={`h-0.5 rounded-none transition-all ${i === idx ? "w-8 bg-cream" : "w-4 bg-cream/40 hover:bg-cream/70"}`} />
          ))}
        </div>
      )}
    </section>
  );
}

function FestiveSection() {
  const { settings } = useStore();
  const festive = settings?.festive;
  const catId = festive?.category_id;
  const { items, loading, error, reload } = useProducts({ category: catId || undefined, per_page: 8 }, [catId]);
  if (!festive || !festive.enabled || !catId) return null;
  if (!loading && !error && items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-softyellow p-6 sm:p-10">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2 text-ink/40">Limited edition</p>
            <h2 className="font-display text-3xl text-ink sm:text-4xl" data-testid="festive-title">{festive.title}</h2>
          </div>
          <Link to="/category/festive-collections" className="hidden shrink-0 items-center gap-1 border border-border px-4 py-2 text-xs tracking-wide uppercase text-ink/60 transition-colors hover:border-ink hover:text-ink sm:flex">
            View all
          </Link>
        </div>
        <ProductRow items={items} loading={loading} error={error} onRetry={reload} emptyMsg="Assign products to your Festive Collections category in WooCommerce." />
      </div>
    </section>
  );
}

function ShoppingWorlds() {
  const worlds = [
    { slug: "for-you", name: "For You", img: IMAGES.worldForYou, copy: "Clothing, drinkware, caps & everyday carry — made to move with your day." },
    { slug: "for-your-pet", name: "For Your Pet", img: IMAGES.worldForPet, copy: "Engraved tags & unisex dog shirts, crafted for your most loyal companion." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {worlds.map((w) => (
          <Link key={w.slug} to={`/shop/${w.slug}`} data-testid={`world-card-${w.slug}`} className="group relative overflow-hidden bg-oat transition-all hover:shadow-lg">
            <div className="absolute inset-0">
              <img src={w.img} alt={w.name} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/15 to-transparent" />
            </div>
            <div className="relative flex min-h-[360px] flex-col justify-end p-7 sm:min-h-[440px]">
              <p className="eyebrow mb-2 text-cream/60">Shop the world</p>
              <h3 className="font-display text-4xl text-cream sm:text-5xl">{w.name}</h3>
              <p className="mt-2 max-w-xs text-sm text-cream/75">{w.copy}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 border border-cream/50 px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-cream transition-all group-hover:border-cream group-hover:bg-cream/10">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ShopByCategory() {
  const { forYou, forPet, childrenOf } = useStore();
  const forYouSubs = forYou ? childrenOf(forYou.id) : [];
  const forPetSubs = forPet ? childrenOf(forPet.id) : [];
  const all = [...forYouSubs, ...forPetSubs];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeader eyebrow="Browse the shelves" title="Shop by Category" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {all.map((c, i) => (
          <Link key={c.id} to={`/category/${c.slug}`} data-testid={`category-tile-${c.slug}`} className="group animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
            <div className="overflow-hidden bg-oat transition-all group-hover:shadow-md">
              <img src={c.image || catImage(c.slug)} alt={c.name} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
            </div>
            <p className="mt-2.5 text-center text-xs font-medium uppercase tracking-wide text-ink/70">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EditorialBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden bg-softyellow px-8 py-14 text-center sm:py-20">
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow mb-4 text-ink/40">Our story</p>
          <h2 className="font-display text-4xl text-ink sm:text-5xl">Two of you.<br />One little ritual.</h2>
          <p className="mt-4 max-w-md mx-auto text-base leading-relaxed text-ink/60">
            From matching tees to hand-engraved tags, Sojaru is built around the bond between people and their pets. Because the best things are better shared.
          </p>
          <Link
            to="/about"
            data-testid="editorial-about-btn"
            className="mt-8 inline-flex items-center gap-2 border border-ink px-7 py-3 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:bg-ink hover:text-cream"
          >
            Our Story <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CollectionRow({ slug, eyebrow, title, to }) {
  const { bySlug, loaded } = useStore();
  const cat = bySlug(slug);
  const { items, loading, error, reload } = useProducts({ category: cat?.id, per_page: 8 }, [cat?.id]);
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} action="View all" to={to} />
      <ProductRow items={items} loading={loading || !loaded || !cat} error={error} onRetry={reload} emptyMsg="Assign products to this collection in WooCommerce and they'll show up here automatically." />
    </section>
  );
}

export default function Home() {
  usePageMeta({ title: "Sojaru — Lifestyle goods for you & your best friend", description: "Sojaru is a modern Indian lifestyle brand offering thoughtfully designed products for people and their pets. Shop clothing, drinkware, pet tags, dog shirts and more." });

  return (
    <>
      <Hero />
      <FestiveSection />
      <ShoppingWorlds />
      <CollectionRow slug="featured-collection" eyebrow="Hand-picked" title="Featured" to="/category/featured-collection" />
      <ShopByCategory />
      <CollectionRow slug="new-arrivals" eyebrow="Just landed" title="New Arrivals" to="/category/new-arrivals" />
      <CollectionRow slug="on-sale" eyebrow="Limited time" title="On Sale" to="/category/on-sale" />
      <EditorialBanner />
      <CollectionRow slug="best-sellers" eyebrow="Crowd favourites" title="Best Sellers" to="/category/best-sellers" />
    </>
  );
}
