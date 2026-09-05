import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, ChevronRight, PawPrint, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchDialog } from "@/components/SearchDialog";

const marqueeItems = [
  "Free shipping over ₹1,499",
  "Curated for you & your best friend",
  "New season, new arrivals",
  "Handmade pet tags, engraved with love",
  "Made in India, with love",
];

function MegaMenu({ world, subcats, onNavigate }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-full z-40 w-[min(760px,92vw)] -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
      <div className="overflow-hidden rounded-2xl border border-border bg-cream/95 p-2 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3">
          {subcats.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              onClick={onNavigate}
              data-testid={`mega-link-${c.slug}`}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-oat"
            >
              {c.name}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
        <Link
          to={`/shop/${world.slug}`}
          onClick={onNavigate}
          className="flex items-center justify-between rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta"
        >
          Shop all {world.name}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function Header() {
  const { forYou, forPet, childrenOf } = useStore();
  const { count, setOpen } = useCart();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();

  const forYouSubs = forYou ? childrenOf(forYou.id) : [];
  const forPetSubs = forPet ? childrenOf(forPet.id) : [];

  const navLink = "relative py-2 text-sm font-semibold text-ink transition-colors hover:text-terracotta";

  return (
    <>
      <div className="overflow-hidden bg-ink text-cream">
        <div className="flex whitespace-nowrap py-2 animate-marquee">
          {[...marqueeItems, ...marqueeItems, ...marqueeItems, ...marqueeItems].map((t, i) => (
            <span key={i} className="mx-6 flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.18em]">
              <PawPrint className="h-3 w-3 text-amber" /> {t}
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-cream/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button data-testid="mobile-menu-trigger" aria-label="Open menu" className="p-1">
                  <Menu className="h-6 w-6 text-ink" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-cream p-0">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex items-center justify-between border-b border-border p-5">
                  <img src="/sojaru-logo.png" alt="Sojaru" className="h-10 w-auto" />
                  <button onClick={() => setMobileOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
                </div>
                <MobileNav
                  forYou={forYou} forPet={forPet}
                  forYouSubs={forYouSubs} forPetSubs={forPetSubs}
                  close={() => setMobileOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" data-testid="logo-link" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <img src="/sojaru-logo.png" alt="Sojaru" className="h-11 w-auto sm:h-12" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link to="/" className={navLink} data-testid="nav-home">Home</Link>
            <div className="group relative">
              <Link to={forYou ? `/shop/${forYou.slug}` : "/"} className={`${navLink} flex items-center gap-1`} data-testid="nav-for-you">
                For You
              </Link>
              {forYou && <MegaMenu world={forYou} subcats={forYouSubs} onNavigate={() => {}} />}
            </div>
            <div className="group relative">
              <Link to={forPet ? `/shop/${forPet.slug}` : "/"} className={`${navLink} flex items-center gap-1`} data-testid="nav-for-pet">
                For Your Pet
              </Link>
              {forPet && <MegaMenu world={forPet} subcats={forPetSubs} onNavigate={() => {}} />}
            </div>
            <Link to="/category/new-arrivals" className={navLink} data-testid="nav-new-arrivals">New Arrivals</Link>
            <Link to="/category/gifting" className={navLink} data-testid="nav-gifting">Gifting</Link>
            <Link to="/about" className={navLink} data-testid="nav-about">About Us</Link>
            <Link to="/contact" className={navLink} data-testid="nav-contact">Contact</Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-3">
            <button data-testid="header-search-button" aria-label="Search" onClick={() => setSearchOpen(true)} className="rounded-full p-2 text-ink transition-colors hover:bg-oat">
              <Search className="h-[1.15rem] w-[1.15rem]" />
            </button>
            <Link to={user ? "/account" : "/login"} data-testid="header-account-button" aria-label="Account" className="rounded-full p-2 text-ink transition-colors hover:bg-oat">
              <User className="h-[1.15rem] w-[1.15rem]" />
            </Link>
            <button data-testid="header-cart-button" aria-label="Cart" onClick={() => setOpen(true)} className="relative rounded-full p-2 text-ink transition-colors hover:bg-oat">
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" />
              {count > 0 && (
                <span data-testid="cart-count-badge" className="absolute -right-0.5 -top-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-terracotta px-1 text-[0.62rem] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function MobileNav({ forYou, forPet, forYouSubs, forPetSubs, close }) {
  const [section, setSection] = useState(null);
  const navigate = useNavigate();
  const go = (path) => { close(); navigate(path); };
  const Group = ({ world, subs, id }) => (
    <div className="border-b border-border">
      <button
        onClick={() => setSection(section === id ? null : id)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-semibold text-ink"
        data-testid={`mobile-group-${id}`}
      >
        {world?.name}
        <ChevronRight className={`h-5 w-5 transition-transform ${section === id ? "rotate-90" : ""}`} />
      </button>
      {section === id && (
        <div className="bg-oat/50 pb-2">
          <button onClick={() => go(`/shop/${world.slug}`)} className="block w-full px-8 py-2.5 text-left text-sm font-semibold text-terracotta">
            Shop all {world.name}
          </button>
          {subs.map((c) => (
            <button key={c.id} onClick={() => go(`/category/${c.slug}`)} className="block w-full px-8 py-2.5 text-left text-sm text-ink" data-testid={`mobile-link-${c.slug}`}>
              {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  return (
    <div className="pb-10">
      <button onClick={() => go("/")} className="block w-full border-b border-border px-5 py-4 text-left text-base font-semibold">Home</button>
      {forYou && <Group world={forYou} subs={forYouSubs} id="you" />}
      {forPet && <Group world={forPet} subs={forPetSubs} id="pet" />}
      <button onClick={() => go("/category/new-arrivals")} className="block w-full border-b border-border px-5 py-4 text-left text-base font-semibold">New Arrivals</button>
      <button onClick={() => go("/category/gifting")} className="block w-full border-b border-border px-5 py-4 text-left text-base font-semibold">Gifting</button>
      <button onClick={() => go("/about")} className="block w-full border-b border-border px-5 py-4 text-left text-base font-semibold">About Us</button>
      <button onClick={() => go("/contact")} className="block w-full border-b border-border px-5 py-4 text-left text-base font-semibold">Contact</button>
    </div>
  );
}
