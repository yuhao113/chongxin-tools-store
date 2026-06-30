"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { calculateShipping, formatPrice } from "@/lib/format";

export function CartPageClient() {
  const { items, subtotal, hydrated, updateQuantity, removeItem } = useCart();
  const shipping = calculateShipping(subtotal);

  if (!hydrated) return <div className="page-loading">讀取購物車中…</div>;
  if (items.length === 0) {
    return (
      <div className="empty-state cart-empty">
        <ShoppingBag size={58} />
        <h1>購物車目前是空的</h1>
        <p>先到商品列表挑選適合的工具。</p>
        <Link href="/#products" className="button button-primary">開始選購</Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <section className="cart-items-panel">
        <div className="panel-title"><h1>購物車</h1><span>{items.length} 種商品</span></div>
        {items.map((item) => (
          <article className="cart-item" key={item.id}>
            <Link href={`/products/${item.slug}`} className="cart-item-image"><img src={item.imageUrl} alt={item.name} /></Link>
            <div className="cart-item-main">
              <Link href={`/products/${item.slug}`}><h2>{item.name}</h2></Link>
              <p>單價 {formatPrice(item.price)}・庫存 {item.stock} 件</p>
              <div className="quantity-control">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="減少數量"><Minus size={17} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label="增加數量"><Plus size={17} /></button>
              </div>
            </div>
            <div className="cart-item-end"><strong>{formatPrice(item.price * item.quantity)}</strong><button className="text-danger" onClick={() => removeItem(item.id)}><Trash2 size={18} />刪除</button></div>
          </article>
        ))}
      </section>

      <aside className="order-summary sticky-card">
        <h2>訂單摘要</h2>
        <div><span>商品小計</span><strong>{formatPrice(subtotal)}</strong></div>
        <div><span>運費</span><strong>{shipping === 0 ? "免運" : formatPrice(shipping)}</strong></div>
        {subtotal < 3000 && <p className="shipping-tip">再消費 {formatPrice(3000 - subtotal)} 即享免運。</p>}
        <div className="summary-total"><span>合計</span><strong>{formatPrice(subtotal + shipping)}</strong></div>
        <Link href="/checkout" className="button button-primary button-full">前往結帳</Link>
        <Link href="/#products" className="button button-ghost button-full">繼續購物</Link>
      </aside>
    </div>
  );
}
