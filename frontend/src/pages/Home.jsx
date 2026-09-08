import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductRow } from "@/components/ProductRow";
import { IMAGES, catImage } from "@/lib/assets";
import { mediaUrl } from "@/lib/api";
import { usePageMeta } from "@/hooks/usePageMeta";

// ─── 1. HERO ──────────────────────────────────────────────────────────────────
function Hero() {
  const { settings } = useStore();
  const heroImages = settings?.hero_images?.length
    ? settings.hero_images.map((h) => ({ src: mediaUrl(h.url), alt: h.alt }))
    : [{ src: IMAGES.hero, alt: "Sojaru lifestyle" }];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
    if (heroImages.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(t);
  }, [heroImages.length]);

  return (
    <section className="relative overflow-hidden h-[54vw] min-h-[260px] max-h-[680px]" data-testid="hero-section">
      <div className="relative h-full w-full">
        {heroImages.map((img, i) => (
          <img
            key={i}
            src={img.src}
            alt={img.alt}
            onError={(e) => { e.target.src = IMAGES.hero; }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>
      {heroImages.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Slide ${i + 1}`}
              data-testid={`hero-dot-${i}`}
              className={`h-0.5 transition-all ${
                i === idx ? "w-8 bg-ink" : "w-3 bg-ink/30 hover:bg-ink/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── 2. WELCOME MESSAGE ───────────────────────────────────────────────────────
function WelcomeMessage() {
  return (
    <section className="bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-display text-3xl italic text-ink sm:text-4xl lg:text-5xl">
          hello! welcome home&nbsp;:)
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-ink/55">
          we&apos;re a bohemian lifestyle brand for people who like their homes a little
          imperfect, a little expressive, and full of heart.
        </p>
        <p className="mt-5 font-display text-xl italic text-ink/60">
          come in. stay a while.
        </p>
      </div>
    </section>
  );
}

// ─── 3. FESTIVE COLLECTION (admin-configured) ─────────────────────────────────
function FestiveSection() {
  const { settings } = useStore();
  const festive = settings?.festive;
  const catId = festive?.category_id;
  const { items, loading, error, reload } = useProducts({ category: catId || undefined, per_page: 8 }, [catId]);
  if (!festive || !festive.enabled || !catId) return null;
  if (!loading && !error && items.length === 0) return null;
  return (
    <section className="bg-softyellow py-14 sm:py-18">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2
            className="font-display text-2xl italic text-ink sm:text-3xl"
            data-testid="festive-title"
          >
            {festive.title}
          </h2>
          <Link
            to="/category/festive-collections"
            className="shrink-0 text-sm text-ink/50 hover:text-ink"
          >
            view all &rarr;
          </Link>
        </div>
        <ProductRow
          items={items}
          loading={loading}
          error={error}
          onRetry={reload}
          emptyMsg="Assign products to your Festive Collections category in WooCommerce."
        />
      </div>
    </section>
  );
}

// ─── 4. CATEGORY ROW (sub-categories, hyppy-style) ────────────────────────────
function CategoryRow() {
  const { forYou, forPet, childrenOf, loaded } = useStore();
  const forYouSubs = forYou ? childrenOf(forYou.id) : [];
  const forPetSubs = forPet ? childrenOf(forPet.id) : [];
  const all = [...forYouSubs, ...forPetSubs];

  if (!loaded || all.length === 0) return null;
  return (
    <section className="bg-cream py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
        >
          {all.map((c, i) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              data-testid={`category-tile-${c.slug}`}
              className="group animate-fade-up shrink-0 w-28 sm:w-auto"
              style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
            >
              <div className="overflow-hidden bg-oat">
                <img
                  src={c.image || catImage(c.slug)}
                  alt={c.name}
                  className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              </div>
              <p className="mt-2 text-center text-[0.72rem] tracking-wide text-ink/60 group-hover:text-ink">
                {c.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── GENERIC PRODUCT SECTION (hyppy italic heading style) ─────────────────────
function ProductSection({ slug, title, to, bg = "bg-cream" }) {
  const { bySlug, loaded } = useStore();
  const cat = bySlug(slug);
  const { items, loading, error, reload } = useProducts(
    { category: cat?.id, per_page: 8 },
    [cat?.id]
  );
  return (
    <section className={`${bg} py-12 sm:py-16`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl italic text-ink sm:text-3xl">
            {title}
          </h2>
          <Link to={to} className="shrink-0 text-sm text-ink/50 hover:text-ink">
            view all &rarr;
          </Link>
        </div>
        <ProductRow
          items={items}
          loading={loading || !loaded || !cat}
          error={error}
          onRetry={reload}
          emptyMsg="Assign products to this collection in WooCommerce and they&apos;ll show up here."
        />
      </div>
    </section>
  );
}

// ─── 7. SHEER JOY SECTION (on-sale, warm background) ─────────────────────────
function SheerJoySection() {
  const { bySlug, loaded } = useStore();
  const cat = bySlug("on-sale");
  const { items, loading, error, reload } = useProducts(
    { category: cat?.id, per_page: 8 },
    [cat?.id]
  );
  if (!loading && !error && items.length === 0) return null;
  return (
    <section className="bg-cream">
      {/* Warm decorative banner */}
      <div className="relative overflow-hidden bg-terracotta/10 px-6 py-12 text-center sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b07248' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <h2 className="font-display text-4xl italic text-terracotta sm:text-5xl lg:text-6xl">
          Sheer Joy ✨
        </h2>
        <p className="mt-3 text-sm italic text-ink/45">our sale picks — good things, better prices.</p>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <ProductRow
          items={items}
          loading={loading || !loaded || !cat}
          error={error}
          onRetry={reload}
          emptyMsg="Add products to your on-sale collection in WooCommerce."
        />
      </div>
    </section>
  );
}

// ─── 8. OUR STORY ─────────────────────────────────────────────────────────────
function OurStory() {
  return (
    <section className="bg-softyellow py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">
          {/* Illustration */}
          <div className="flex w-full shrink-0 items-center justify-center md:w-72 lg:w-80">
            <img
              src="https://freepngimg.com/download/svg/cartoon/10664-brother-and-sister-in-spring.svg"
              alt="Brother and sister — the hearts behind Sojaru"
              className="h-64 w-64 object-contain sm:h-72 sm:w-72"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <p className="eyebrow mb-3 text-ink/40">our story</p>
            <h2 className="font-display text-3xl italic text-ink sm:text-4xl">
              a dream, a bond, a beginning.
            </h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/60">
              <p>
                Sojaru was born from a simple, stubborn belief — that one brother had in
                his sister&apos;s extraordinary talent. She had always created beautiful things,
                quietly, for the love of it. He saw a world that needed to see them too.
              </p>
              <p>
                So together, they took the leap. Sojaru is their shared dream: a space
                that feels like home — imperfect, expressive, and full of heart. Every
                piece is made with the care of someone who grew up believing that beautiful
                things deserve to be shared.
              </p>
              <p className="font-display italic text-ink/70">
                made with love. built with belief.
              </p>
            </div>
            <Link
              to="/about"
              data-testid="editorial-about-btn"
              className="mt-8 inline-flex items-center gap-2 border border-ink px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-ink transition-all hover:bg-ink hover:text-cream"
            >
              Read our story <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function Home() {
  usePageMeta({
    title: "Sojaru — Bohemian Lifestyle Brand",
    description:
      "A bohemian lifestyle brand for people who like their homes a little imperfect, a little expressive, and full of heart. Shop clothing, accessories, pet goods and more.",
  });

  return (
    <>
      <Hero />
      <WelcomeMessage />
      <FestiveSection />
      <CategoryRow />
      <ProductSection
        slug="featured-collection"
        title="your favorites are back.."
        to="/category/featured-collection"
      />
      <ProductSection
        slug="best-sellers"
        title="Our Best Sellers"
        to="/category/best-sellers"
        bg="bg-oat/30"
      />
      <SheerJoySection />
      <OurStory />
    </>
  );
}
