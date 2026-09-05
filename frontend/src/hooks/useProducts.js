import { useState, useEffect, useCallback } from "react";
import { products } from "@/lib/api";

export function useProducts(params, deps = []) {
  const [state, setState] = useState({ items: [], total: 0, pages: 1, loading: true, error: false });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: false }));
    products.list(params)
      .then((d) => setState({ ...d, loading: false, error: false }))
      .catch(() => setState((s) => ({ ...s, loading: false, error: true })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}
