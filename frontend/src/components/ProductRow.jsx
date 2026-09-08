import { ProductCard } from "@/components/ProductCard";
import { EmptyState, ErrorState } from "@/components/States";

export function ProductRow({ items, loading, error, onRetry, emptyMsg = "Nothing here just yet." }) {
  if (loading) {
    return (
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[52%] shrink-0 animate-pulse sm:w-[32%] lg:w-auto">
            <div className="aspect-[4/5] bg-oat" />
            <div className="mt-3 h-2.5 w-1/3 bg-oat" />
            <div className="mt-2 h-2.5 w-3/4 bg-oat" />
            <div className="mt-2 h-2.5 w-1/4 bg-oat" />
          </div>
        ))}
      </div>
    );
  }
  if (error) return <ErrorState onRetry={onRetry} />;
  if (!items?.length) return <EmptyState title="Coming soon" message={emptyMsg} />;
  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
      {items.map((p, i) => (
        <div key={p.id} className="w-[52%] shrink-0 snap-start sm:w-[32%] lg:w-auto">
          <ProductCard product={p} index={i} />
        </div>
      ))}
    </div>
  );
}
