import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { products } from "@/lib/api";
import { useStore } from "@/context/StoreContext";
import { firstImage } from "@/lib/product";

export function SearchDialog({ open, onOpenChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const navigate = useNavigate();
  const { money } = useStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
    else { setQ(""); setResults([]); setTouched(false); }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) { setResults([]); setTouched(false); return; }
    setLoading(true);
    setTouched(true);
    const t = setTimeout(() => {
      products.list({ search: q.trim(), per_page: 6 })
        .then((d) => setResults(d.items))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const goResults = () => {
    if (!q.trim()) return;
    onOpenChange(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  const openProduct = (p) => { onOpenChange(false); navigate(`/product/${p.slug}`); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-2xl border-border bg-cream p-0" data-testid="search-dialog">
        <DialogTitle className="sr-only">Search Sojaru</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            data-testid="search-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goResults()}
            placeholder="Search for tees, pet tags, mugs..."
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-terracotta" />}
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!touched && (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Start typing to find something for you or your best friend.
            </p>
          )}
          {touched && !loading && results.length === 0 && (
            <div data-testid="search-empty" className="px-4 py-10 text-center">
              <p className="font-display text-xl text-ink">No matches for "{q}"</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a different word, or browse our worlds.</p>
            </div>
          )}
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => openProduct(p)}
              data-testid={`search-result-${p.id}`}
              className="flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-oat"
            >
              <img src={firstImage(p)} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.categories?.[0]?.name}</p>
              </div>
              <span className="font-mono text-sm font-semibold text-ink">
                {money(p.on_sale && p.sale_price ? p.sale_price : p.price)}
              </span>
            </button>
          ))}
          {results.length > 0 && (
            <button onClick={goResults} className="mt-1 w-full rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-cream transition-colors hover:bg-terracotta" data-testid="search-view-all">
              View all results for "{q}"
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
