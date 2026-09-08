import { Link } from "react-router-dom";
import { PackageOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] w-full bg-oat" />
          <div className="mt-3 h-2.5 w-1/3 rounded bg-oat" />
          <div className="mt-2 h-2.5 w-3/4 rounded bg-oat" />
          <div className="mt-2 h-2.5 w-1/4 rounded bg-oat" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, testid = "empty-state", action }) {
  return (
    <div data-testid={testid} className="flex flex-col items-center justify-center bg-oat/40 px-6 py-20 text-center">
      <PackageOpen className="h-9 w-9 text-ink/30" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, testid = "error-state" }) {
  return (
    <div data-testid={testid} className="flex flex-col items-center justify-center bg-oat/40 px-6 py-20 text-center">
      <AlertTriangle className="h-9 w-9 text-terracotta" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-2xl text-ink">Something went sideways</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t load this right now. Give it another try.
      </p>
      {onRetry && (
        <Button data-testid="retry-button" onClick={onRetry} variant="outline" className="mt-5 border-ink text-ink hover:bg-ink hover:text-cream">
          <RefreshCw className="mr-2 h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export function SectionHeader({ eyebrow, title, action, to }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-2 text-ink/40">{eyebrow}</p>
        )}
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          {title}
        </h2>
      </div>
      {action && to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1 border border-border px-4 py-2 text-xs tracking-wide uppercase text-ink/60 transition-colors hover:border-ink hover:text-ink sm:flex">
          {action}
        </Link>
      )}
    </div>
  );
}
