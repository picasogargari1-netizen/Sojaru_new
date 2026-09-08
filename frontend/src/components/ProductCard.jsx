import { Link } from "react-router-dom";
import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useCart } from "@/context/CartContext";
import { firstImage, secondImage, isNew, discountPct } from "@/lib/product";

export function ProductCard({ product, index = 0 }) {
  const { money } = useStore();
  const { addItem } = useCart();
  const [hover, setHover] = useState(false);
  const onSale = product.on_sale && Number(product.sale_price) > 0;
  const isVariable = product.type === "variable";
  const outOfStock = product.stock_status === "outofstock";
  const pct = discountPct(product);

  const quickAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      variationId: null,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: firstImage(product),
    });
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      data-testid={`product-card-${product.id}`}
      className="group block animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative overflow-hidden bg-oat">
        <div className="aspect-[4/5] w-full">
          <img
            src={hover ? secondImage(product) : firstImage(product)}
            alt={product.images?.[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
          />
        </div>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {onSale && (
            <span className="bg-terracotta px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-wider text-white">
              {pct ? `-${pct}%` : "Sale"}
            </span>
          )}
          {isNew(product) && (
            <span className="bg-ink px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-wider text-white">
              New
            </span>
          )}
          {outOfStock && (
            <span className="bg-white/80 px-2 py-0.5 text-[0.62rem] font-medium uppercase tracking-wider text-ink">
              Sold out
            </span>
          )}
        </div>

        {!outOfStock && (
          <button
            data-testid={`quick-add-${product.id}`}
            onClick={quickAdd}
            aria-label={isVariable ? "Choose options" : "Add to bag"}
            className="absolute bottom-3 right-3 flex h-10 items-center gap-1.5 bg-cream px-3.5 text-xs font-medium uppercase tracking-wide text-ink shadow-sm transition-all duration-300 ease-out hover:bg-ink hover:text-cream md:translate-y-14 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          >
            {isVariable ? <>Options <ArrowRight className="h-3.5 w-3.5" /></> : <>Add <Plus className="h-3.5 w-3.5" /></>}
          </button>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <div className="eyebrow text-muted-foreground">
          {product.categories?.[0]?.name || "Sojaru"}
        </div>
        <h3 className="mt-1 font-sans text-sm font-medium leading-snug text-ink line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-sm">
          {onSale ? (
            <>
              <span className="font-medium text-terracotta">{money(product.sale_price)}</span>
              <span className="text-muted-foreground line-through">{money(product.regular_price)}</span>
            </>
          ) : (
            <span className="font-medium text-ink">{money(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
