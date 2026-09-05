import { Link } from "react-router-dom";
import { ArrowRight, PawPrint, Truck, Leaf, HeartHandshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductRow } from "@/components/ProductRow";
import { SectionHeader } from "@/components/States";
import { IMAGES, catImage } from "@/lib/assets";
import { usePageMeta } from "@/hooks/usePageMeta";

function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-24 lg:px-8">
        <div className="lg:col-span-6">
          <div className="eyebrow animate-fade-up text-terracotta">Lifestyle · People & Pets</div>
          <h1 className="mt-4 animate-fade-up font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl" style={{ animationDelay: "80ms" }}>
            For you and <br className="hidden sm:block" />
            your <span className="italic text-terracotta">best friend.</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground sm:text-lg" style={{ animationDelay: "160ms" }}>
            Thoughtfully designed everyday goods — for the humans who love hard and the pets who love harder. Welcome to Sojaru.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild className="h-12 rounded-full bg-ink px-7 text-base font-semibold text-cream transition-all hover:-translate-y-0.5 hover:bg-terracotta">
              <Link to="/shop/for-you" data-testid="hero-shop-for-you-btn">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full border-ink px-7 text-base font-semibold text-ink transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-cream">
              <Link to="/shop/for-your-pet" data-testid="hero-shop-for-pet-btn"><PawPrint className="mr-2 h-4 w-4" /> Shop For Your Pet</Link>
            </Button>
          </div>
          <div className="mt-10 flex animate-fade-up flex-wrap gap-x-8 gap-y-3 text-sm text-ink/70" style={{ animationDelay: "320ms" }}>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-matcha" /> Free shipping over $75</span>
            <span className="flex items-center gap-2"><Leaf className="h-4 w-4 text-matcha" /> Sustainably made</span>
          </div>
        </div>
        <div className="relative lg:col-span-6">
          <div className="relative animate-fade-in overflow-hidden rounded-[1.8rem] bg-oat" style={{ animationDelay: "200ms" }}>
            <img src={IMAGES.hero} alt="A woman relaxing with her golden retriever, both in cozy Sojaru knits" className="aspect-[5/4] w-full object-cover" />
          </div>
          <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border bg-cream/95 px-5 py-4 shadow-lg backdrop-blur sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10"><HeartHandshake className="h-5 w-5 text-terracotta" /></div>
              <div>
                <p className="font-display text-lg font-semibold leading-none text-ink">Matchy-matchy</p>
                <p className="mt-1 text-xs text-muted-foreground">Twin with your pup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShoppingWorlds() {
  const worlds = [
    { slug: "for-you", name: "For You", tint: "bg-youTint", img: IMAGES.worldForYou, copy: "Clothing, drinkware, caps & everyday carry — made to move with your day." },
    { slug: "for-your-pet", name: "For Your Pet", tint: "bg-petTint", img: IMAGES.worldForPet, copy: "Engraved tags & unisex dog shirts, crafted for your most loyal companion." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {worlds.map((w) => (
          <Link key={w.slug} to={`/shop/${w.slug}`} data-testid={`world-card-${w.slug}`} className={`group relative overflow-hidden rounded-[1.6rem] ${w.tint}`}>
            <div className="absolute inset-0">
              <img src={w.img} alt={w.name} className="h-full w-full object-cover opacity-90 transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            </div>
            <div className="relative flex min-h-[380px] flex-col justify-end p-7 sm:min-h-[440px]">
              <span className="eyebrow text-cream/80">Shop the world</span>
              <h3 className="mt-2 font-display text-3xl font-semibold text-cream sm:text-4xl">{w.name}</h3>
              <p className="mt-2 max-w-xs text-sm text-cream/85">{w.copy}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-cream px-5 py-2.5 text-sm font-semibold text-ink transition-all group-hover:gap-3">
                Explore <ArrowRight className="h-4 w-4" />
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
      <SectionHeader eyebrow="Browse the shelves" title="Shop by category" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {all.map((c, i) => (
          <Link key={c.id} to={`/category/${c.slug}`} data-testid={`category-tile-${c.slug}`} className="group animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}>
            <div className="overflow-hidden rounded-2xl bg-oat">
              <img src={c.image || catImage(c.slug)} alt={c.name} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-2.5 text-center text-sm font-semibold text-ink transition-colors group-hover:text-terracotta">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EditorialBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[1.6rem] bg-ink px-8 py-14 text-center sm:py-20">
        <div className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative mx-auto max-w-2xl">
          <PawPrint className="mx-auto h-8 w-8 text-amber" />
          <h2 className="mt-5 font-display text-3xl font-semibold text-cream sm:text-4xl">Two of you. One little ritual.</h2>
          <p className="mt-4 text-base leading-relaxed text-cream/75">
            From matching tees to hand-engraved tags, Sojaru is built around the bond between people and their pets. Because the best things are better shared.
          </p>
          <Button asChild className="mt-7 rounded-full bg-cream px-7 text-ink hover:bg-terracotta hover:text-cream">
            <Link to="/about" data-testid="editorial-about-btn">Our Story</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta({ title: "Sojaru — Lifestyle goods for you & your best friend", description: "Sojaru is a modern lifestyle brand offering thoughtfully designed products for people and their pets. Shop clothing, drinkware, pet tags, dog shirts and more." });
  const featured = useProducts({ featured: true, per_page: 8 }, []);
  const newest = useProducts({ orderby: "date", order: "desc", per_page: 8 }, []);
  const bestsellers = useProducts({ orderby: "popularity", per_page: 8 }, []);
  const onsale = useProducts({ on_sale: true, per_page: 8 }, []);

  return (
    <>
      <Hero />
      <ShoppingWorlds />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Hand-picked" title="Featured" action="View all" to="/new-arrivals" />
        <ProductRow items={featured.items} loading={featured.loading} error={featured.error} onRetry={featured.reload} emptyMsg="We're curating our featured picks." />
      </section>

      <ShopByCategory />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Just landed" title="New Arrivals" action="View all" to="/new-arrivals" />
        <ProductRow items={newest.items} loading={newest.loading} error={newest.error} onRetry={newest.reload} />
      </section>

      {(onsale.loading || onsale.items.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Limited time" title="On Sale" />
          <ProductRow items={onsale.items} loading={onsale.loading} error={onsale.error} onRetry={onsale.reload} />
        </section>
      )}

      <EditorialBanner />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Crowd favourites" title="Best Sellers" />
        <ProductRow items={bestsellers.items} loading={bestsellers.loading} error={bestsellers.error} onRetry={bestsellers.reload} emptyMsg="Best sellers appear as orders roll in." />
      </section>
    </>
  );
}
