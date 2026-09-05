import { Link } from "react-router-dom";
import { PackageOpen, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] w-full rounded-[1.1rem] bg-oat" />
          <div className="mt-3 h-3 w-1/3 rounded bg-oat" />
          <div className="mt-2 h-3 w-3/4 rounded bg-oat" />
          <div className="mt-2 h-3 w-1/4 rounded bg-oat" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, message, testid = "empty-state", action }) {
  return (
    <div data-testid={testid} className="flex flex-col items-center justify-center rounded-3xl bg-oat/60 px-6 py-20 text-center">
      <PackageOpen className="h-10 w-10 text-matcha" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, testid = "error-state" }) {
  return (
    <div data-testid={testid} className="flex flex-col items-center justify-center rounded-3xl bg-oat/60 px-6 py-20 text-center">
      <AlertTriangle className="h-10 w-10 text-terracotta" strokeWidth={1.5} />
      <h3 className="mt-4 font-display text-2xl text-ink">Something went sideways</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn't load this right now. Give it another try.
      </p>
      {onRetry && (
        <Button data-testid="retry-button" onClick={onRetry} className="mt-5 rounded-full">
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
          <div className="mb-3 inline-block bg-yellow px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display text-4xl font-extrabold uppercase tracking-tight text-ink sm:text-5xl">
          {title}
        </h2>
      </div>
      {action && to && (
        <Link to={to} className="hidden shrink-0 items-center gap-1 border-2 border-ink px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-yellow sm:flex">
          {action}
        </Link>
      )}
    </div>
  );
}
