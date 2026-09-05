import { createContext, useContext, useEffect, useState } from "react";
import { store } from "@/lib/api";

const StoreContext = createContext(null);

export const FOR_YOU_SLUG = "for-you";
export const FOR_PET_SLUG = "for-your-pet";

export function StoreProvider({ children }) {
  const [symbol, setSymbol] = useState("₹");
  const [code, setCode] = useState("INR");
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    store.config().then((c) => { setSymbol(c.currency_symbol || "₹"); setCode(c.currency_code || "INR"); }).catch(() => {});
    store.categories()
      .then((c) => setCategories(c))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const money = (val) => {
    const n = Number(val || 0);
    const decimals = code === "INR" || code === "JPY" ? 0 : 2;
    try {
      return new Intl.NumberFormat(code === "INR" ? "en-IN" : "en-US", {
        style: "currency", currency: code,
        minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      }).format(n);
    } catch {
      return `${symbol}${n.toLocaleString("en-IN", { maximumFractionDigits: decimals })}`;
    }
  };

  const parents = categories.filter((c) => c.parent === 0);
  const forYou = parents.find((c) => c.slug === FOR_YOU_SLUG);
  const forPet = parents.find((c) => c.slug === FOR_PET_SLUG);
  const childrenOf = (id) => categories.filter((c) => c.parent === id);
  const bySlug = (slug) => categories.find((c) => c.slug === slug);

  return (
    <StoreContext.Provider
      value={{ symbol, money, categories, loaded, forYou, forPet, childrenOf, bySlug }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
