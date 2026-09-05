import { Link } from "react-router-dom";
import { ArrowRight, PawPrint, Truck, Leaf, Asterisk } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/StoreContext";
import { useProducts } from "@/hooks/useProducts";
import { ProductRow } from "@/components/ProductRow";
import { SectionHeader } from "@/components/States";
import { IMAGES, catImage } from "@/lib/assets";
import { usePageMeta } from "@/hooks/usePageMeta";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b-4 border-ink bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20 lg:px-8">
        <div>
          <div className="inline-flex animate-fade-up items-center gap-2 bg-yellow px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-ink">
            <PawPrint className="h-4 w-4" /> Lifestyle for people & pets
          </div>
          <h1 className="mt-5 animate-fade-up font-display text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter text-ink sm:text-6xl lg:text-7xl" style={{ animationDelay: "80ms" }}>
            For you<br />& your<br /><span className="mt-1 inline-block bg-ink px-2 text-yellow">best friend</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base font-medium leading-relaxed text-ink/70 sm:text-lg" style={{ animationDelay: "160ms" }}>
            Boldly designed everyday goods — for the humans who love hard and the pets who love harder. Made in India, for both of you.
          </p>
          <div className="mt-8 flex animate-fade-up flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild className="h-12 rounded-none bg-ink px-8 text-base font-bold uppercase text-cream transition-all hover:-translate-y-1 hover:bg-yellow hover:text-ink">
              <Link to="/shop/for-you" data-testid="hero-shop-for-you-btn">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-none border-2 border-ink bg-yellow px-8 text-base font-bold uppercase text-ink transition-all hover:-translate-y-1 hover:bg-ink hover:text-yellow">
              <Link to="/shop/for-your-pet" data-testid="hero-shop-for-pet-btn"><PawPrint className="mr-2 h-4 w-4" /> Shop For Your Pet</Link>
            </Button>
          </div>
          <div className="mt-9 flex animate-fade-up flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-ink/70" style={{ animationDelay: "320ms" }}>
            <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Free shipping over ₹1,499</span>
            <span className="flex items-center gap-2"><Leaf className="h-4 w-4" /> Sustainably made</span>
          </div>
        </div>
        <div className="relative">
          <div className="relative animate-fade-in overflow-hidden border-4 border-ink bg-oat" style={{ animationDelay: "200ms" }}>
            <img src={IMAGES.hero} alt="A woman relaxing with her golden retriever, both in cozy Sojaru knits" className="aspect-[5/4] w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -left-4 flex h-24 w-24 rotate-[-10deg] items-center justify-center rounded-full border-4 border-ink bg-yellow text-center shadow-[4px_4px_0_0_#111] sm:h-28 sm:w-28">
            <span className="font-display text-sm font-extrabold uppercase leading-tight text-ink sm:text-base">Matchy<br />Matchy</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MarqueeBand() {
  const items = ["For you & your best friend", "Made in India", "New Arrivals", "Free shipping over ₹1,499", "Engraved with love", "Shop the drop"];
  return (
    <div className="overflow-hidden border-y-4 border-ink bg-yellow py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="mx-5 flex items-center gap-4 font-display text-lg font-extrabold uppercase tracking-tight text-ink sm:text-xl">
            {t} <Asterisk className="h-5 w-5" strokeWidth={3} />
          </span>
        ))}
      </div>
    </div>
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
          <Link key={w.slug} to={`/shop/${w.slug}`} data-testid={`world-card-${w.slug}`} className="group relative overflow-hidden border-4 border-ink bg-oat transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#111]">
            <div className="absolute inset-0">
              <img src={w.img} alt={w.name} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            </div>
            <div className="relative flex min-h-[380px] flex-col justify-end p-7 sm:min-h-[460px]">
              <span className="w-fit bg-yellow px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.15em] text-ink">Shop the world</span>
              <h3 className="mt-3 font-display text-4xl font-extrabold uppercase text-cream sm:text-5xl">{w.name}</h3>
              <p className="mt-2 max-w-xs text-sm font-medium text-cream/85">{w.copy}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 bg-yellow px-5 py-2.5 text-sm font-bold uppercase text-ink transition-all group-hover:gap-3">
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
            <div className="overflow-hidden border-2 border-ink bg-oat transition-all group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0_0_#111]">
              <img src={c.image || catImage(c.slug)} alt={c.name} className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-2.5 text-center text-sm font-bold uppercase tracking-tight text-ink">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EditorialBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden border-4 border-ink bg-yellow px-8 py-14 text-center sm:py-20">
        <div className="relative mx-auto max-w-2xl">
          <PawPrint className="mx-auto h-9 w-9 text-ink" strokeWidth={2.5} />
          <h2 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] text-ink sm:text-5xl">Two of you.<br />One little ritual.</h2>
          <p className="mt-4 text-base font-medium leading-relaxed text-ink/80">
            From matching tees to hand-engraved tags, Sojaru is built around the bond between people and their pets. Because the best things are better shared.
          </p>
          <Button asChild className="mt-7 h-12 rounded-none bg-ink px-8 text-base font-bold uppercase text-cream transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#111]">
            <Link to="/about" data-testid="editorial-about-btn">Our Story</Link>
          </Button>
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
      <MarqueeBand />
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
