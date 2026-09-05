import { useSearchParams, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { ProductGridSkeleton, ErrorState, EmptyState } from "@/components/States";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  usePageMeta({ title: q ? `Search: ${q} — Sojaru` : "Search — Sojaru" });
  const { items, total, loading, error, reload } = useProducts({ search: q, per_page: 24 }, [q]);

  if (!q.trim()) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="eyebrow text-terracotta">Search</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">Search Sojaru</h1>
        <div className="mt-8">
          <EmptyState
            title="What are you looking for?"
            message="Use the search icon in the header to find something for you or your best friend."
            testid="search-page-prompt"
            action={
              <div className="mt-5 flex gap-3">
                <Button asChild className="rounded-full bg-ink text-cream hover:bg-terracotta"><Link to="/shop/for-you">Shop For You</Link></Button>
                <Button asChild variant="outline" className="rounded-full border-ink"><Link to="/shop/for-your-pet">Shop For Your Pet</Link></Button>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="eyebrow text-terracotta">Search</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        Results for "{q}"
      </h1>
      {!loading && !error && <p className="mt-2 text-sm text-muted-foreground">{total} {total === 1 ? "product" : "products"} found</p>}

      <div className="mt-8">
        {loading ? <ProductGridSkeleton /> : error ? <ErrorState onRetry={reload} /> : items.length === 0 ? (
          <EmptyState
            title={`No results for "${q}"`}
            message="We couldn't find a match. Try another search, or explore our two worlds."
            testid="search-page-empty"
            action={
              <div className="mt-5 flex gap-3">
                <Button asChild className="rounded-full bg-ink text-cream hover:bg-terracotta"><Link to="/shop/for-you">Shop For You</Link></Button>
                <Button asChild variant="outline" className="rounded-full border-ink"><Link to="/shop/for-your-pet">Shop For Your Pet</Link></Button>
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
