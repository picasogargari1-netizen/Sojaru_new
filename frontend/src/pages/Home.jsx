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
            className="font-display text-2xl italic text-ink sm:text-3xl lg:text-4xl"
            data-testid="festive-title"
          >
            {festive.title}
          </h2>
          <Link
            to="/category/festive-collections"
            className="shrink-0 text-sm italic text-ink/45 hover:text-ink underline underline-offset-4"
          >
            view all
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

// ─── 3b. WARM ITALIC MARQUEE (after hero, like hyppy.in) ──────────────────────
function WarmMarquee() {
  return (
    <div className="overflow-hidden bg-softyellow py-3 border-y border-border">
      <div className="flex whitespace-nowrap animate-marquee">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="mx-8 font-display text-sm italic text-ink/55"
          >
            welcome home ✿ come on in ✿ stay a while
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── 4. CATEGORY BENTO GRID (hyppy-style 4-col portrait grid) ─────────────────
function CategoryRow() {
  const { forYou, forPet, childrenOf, loaded, settings } = useStore();
  const forYouSubs = forYou ? childrenOf(forYou.id) : [];
  const forPetSubs = forPet ? childrenOf(forPet.id) : [];
  const all = [...forYouSubs, ...forPetSubs];
  const adminCatImages = settings?.category_images || {};

  if (!loaded || all.length === 0) return null;
  return (
    <section className="bg-cream py-8 sm:py-10" data-testid="category-bento-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          style={{ gap: "8px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        >
          {all.map((c, i) => {
            // Priority: 1) Admin-uploaded image 2) WooCommerce image 3) hardcoded fallback
            const imgSrc = adminCatImages[c.slug]
              ? `${process.env.REACT_APP_BACKEND_URL}${adminCatImages[c.slug]}`
              : (c.image || catImage(c.slug));
            return (
              <Link
                key={c.id}
                to={`/category/${c.slug}`}
                data-testid={`category-tile-${c.slug}`}
                className="group animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <div className="overflow-hidden bg-oat">
                  <img
                    src={imgSrc}
                    alt={c.name}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    onError={(e) => { e.target.src = catImage(c.slug); }}
                  />
                </div>
                <p className="mt-2 text-center font-display text-lg text-ink group-hover:text-terracotta transition-colors">
                  {c.name}
                </p>
              </Link>
            );
          })}
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
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl italic text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          <Link to={to} className="shrink-0 text-sm italic text-ink/45 hover:text-ink underline underline-offset-4">
            view all
          </Link>
        </div>
        <ProductRow
          items={items}
          loading={loading || !loaded || !cat}
          error={error}
          onRetry={reload}
          emptyMsg="Assign products to this collection in WooCommerce and they'll show up here."
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
    <section className="bg-oat/40" data-testid="sheer-joy-section">
      {/* Section heading */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl italic text-terracotta sm:text-3xl lg:text-4xl">
              Sheer Joy
            </h2>
            <p className="mt-1 text-sm italic text-ink/40">our sale picks — good things, better prices.</p>
          </div>
          <Link to="/category/on-sale" className="shrink-0 text-sm italic text-ink/45 hover:text-ink underline underline-offset-4">
            view all
          </Link>
        </div>
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
    <section className="bg-softyellow py-16 sm:py-20" data-testid="our-story-section">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:items-start md:gap-16">
          {/* Illustration */}
          <div className="w-full shrink-0 md:w-80 lg:w-96">
            <div className="overflow-hidden rounded-sm shadow-md">
              <img
                src="https://static.prod-images.emergentagent.com/jobs/a362ff3d-4e3f-413b-9c58-8f38bd2c42b7/images/b758193c3085e04e391e8689697af752fd87580876232a36cd8bb16e037b413a.jpeg"
                alt="The brother and sister behind Sojaru"
                className="w-full object-cover"
              />
            </div>
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
      <WarmMarquee />
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
