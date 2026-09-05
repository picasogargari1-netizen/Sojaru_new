import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const CartContext = createContext(null);
const KEY = "sojaru_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(items)); }, [items]);

  const lineKey = (productId, variationId) => `${productId}:${variationId || 0}`;

  const addItem = useCallback((item, { silent } = {}) => {
    const key = lineKey(item.productId, item.variationId);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i));
      }
      return [...prev, { ...item, key, quantity: item.quantity || 1 }];
    });
    if (!silent) {
      toast.success(`${item.name} added to bag`, { description: item.variantLabel || undefined });
      setOpen(true);
    }
  }, []);

  const removeItem = useCallback((key) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const updateQty = useCallback((key, qty) => {
    if (qty <= 0) return setItems((prev) => prev.filter((i) => i.key !== key));
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity: qty } : i)));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, open, setOpen, addItem, removeItem, updateQty, clear, count, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
