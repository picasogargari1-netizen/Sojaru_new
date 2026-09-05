import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook, PawPrint, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/context/StoreContext";

export function Footer() {
  const { forYou, forPet, childrenOf } = useStore();
  const [email, setEmail] = useState("");
  const forYouSubs = forYou ? childrenOf(forYou.id) : [];
  const forPetSubs = forPet ? childrenOf(forPet.id) : [];

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to the pack!", { description: "You're on the list for Sojaru news & drops." });
    setEmail("");
  };

  const Col = ({ title, links }) => (
    <div>
      <h4 className="eyebrow mb-4 text-ink/50">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.to + l.label}>
            <Link to={l.to} className="text-sm text-ink/80 transition-colors hover:text-terracotta">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-24 border-t border-border bg-oat/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="font-display text-3xl font-semibold tracking-tight text-ink">Sojaru<span className="text-terracotta">.</span></span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Lifestyle goods designed for you and your best friend. Thoughtfully made, joyfully worn — by both of you.
            </p>
            <form onSubmit={subscribe} className="mt-6 max-w-sm">
              <label className="text-sm font-semibold text-ink">Join the pack</label>
              <div className="mt-2 flex items-center overflow-hidden rounded-full border border-border bg-cream">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Your email"
                  data-testid="newsletter-input"
                  className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button type="submit" data-testid="newsletter-submit" aria-label="Subscribe" className="m-1 flex h-9 w-11 items-center justify-center rounded-full bg-ink text-cream transition-colors hover:bg-terracotta">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-terracotta hover:text-terracotta">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            <Col title="Shop" links={[
              { to: "/shop/for-you", label: "For You" },
              { to: "/shop/for-your-pet", label: "For Your Pet" },
              { to: "/new-arrivals", label: "New Arrivals" },
              { to: "/category/gifting", label: "Gifting" },
            ]} />
            <Col title="For You" links={forYouSubs.map((c) => ({ to: `/category/${c.slug}`, label: c.name }))} />
            <Col title="For Your Pet" links={forPetSubs.map((c) => ({ to: `/category/${c.slug}`, label: c.name }))} />
            <Col title="Information" links={[
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact" },
              { to: "/faq", label: "FAQ" },
              { to: "/shipping-returns", label: "Shipping & Returns" },
              { to: "/privacy", label: "Privacy Policy" },
              { to: "/terms", label: "Terms & Conditions" },
            ]} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Sojaru. Made for you & your best friend.</p>
          <p className="flex items-center gap-2"><PawPrint className="h-4 w-4 text-terracotta" /> Powered by a headless WooCommerce store.</p>
        </div>
      </div>
    </footer>
  );
}
