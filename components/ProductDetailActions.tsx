"use client";

import { CheckCircle2, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/components/CartProvider";
import type { StoreProduct } from "@/lib/types";

export function ProductDetailActions({ product }: { product: StoreProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const disabled = product.stock < 1;

  function addToCart() {
    if (disabled) return;

    addItem(product, quantity);
    setAdded(true);

    window.setTimeout(() => {
      setAdded(false);
    }, 2000);
  }

  function buyNow() {
    if (disabled) return;

    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="detail-actions">
      <label>
        購買數量
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          disabled={disabled}
        >
          {Array.from(
            { length: Math.max(1, Math.min(product.stock, 20)) },
            (_, i) => i + 1
          ).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <motion.button
        type="button"
        className="button button-outline"
        disabled={disabled}
        onClick={addToCart}
        whileTap={{ scale: 0.94 }}
        animate={added ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        {added ? <CheckCircle2 size={20} /> : <ShoppingCart size={20} />}
        {added ? "已加入購物車" : "加入購物車"}
      </motion.button>

      <button
        type="button"
        className="button button-primary"
        disabled={disabled}
        onClick={buyNow}
      >
        <Zap size={20} />
        直接購買
      </button>

      <AnimatePresence>
        {added && (
          <motion.div
            className="cart-toast"
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <CheckCircle2 size={22} />
            <div>
              <strong>已加入購物車</strong>
              <p>
                {product.name} × {quantity}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}