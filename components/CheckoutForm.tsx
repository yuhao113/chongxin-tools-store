"use client";

import { Banknote, CreditCard, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { calculateShipping, formatPrice } from "@/lib/format";

export function CheckoutForm() {
  const { items, subtotal, hydrated, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"BANK_TRANSFER" | "LINE_PAY">("BANK_TRANSFER");
  const shipping = calculateShipping(subtotal);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.get("customerName"),
          phone: form.get("phone"),
          email: form.get("email"),
          postalCode: form.get("postalCode"),
          address: form.get("address"),
          note: form.get("note"),
          paymentMethod,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity }))
        })
      });
      const data = await response.json() as { error?: string; orderNo?: string; publicToken?: string; paymentUrl?: string };
      if (!response.ok) throw new Error(data.error || "建立訂單失敗");
      clearCart();
      if (data.paymentUrl) window.location.href = data.paymentUrl;
      else router.push(`/order/${data.orderNo}?token=${encodeURIComponent(data.publicToken || "")}&created=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "建立訂單失敗");
      setLoading(false);
    }
  }

  if (!hydrated) return <div className="page-loading">讀取訂單中…</div>;
  if (items.length === 0) return <div className="empty-state"><h1>沒有可結帳的商品</h1><p>請先加入商品至購物車。</p><Link className="button button-primary" href="/#products">返回商品列表</Link></div>;

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-main">
        <section className="checkout-card">
          <div className="checkout-step"><span>1</span><div><h1>收件資訊</h1><p>請填寫可聯絡到您的真實資料。</p></div></div>
          <div className="form-grid two-cols">
            <label>收件人姓名<input name="customerName" required minLength={2} autoComplete="name" /></label>
            <label>手機／聯絡電話<input name="phone" required autoComplete="tel" inputMode="tel" /></label>
            <label>Email（選填）<input name="email" type="email" autoComplete="email" /></label>
            <label>郵遞區號（選填）<input name="postalCode" autoComplete="postal-code" /></label>
            <label className="full-col">完整收件地址<input name="address" required minLength={6} autoComplete="street-address" /></label>
            <label className="full-col">訂單備註（選填）<textarea name="note" rows={3} placeholder="例如：平日下午配送、需要統編等" /></label>
          </div>
        </section>

        <section className="checkout-card">
          <div className="checkout-step"><span>2</span><div><h2>付款方式</h2><p>可選擇銀行轉帳或 LINE Pay。</p></div></div>
          <div className="payment-options">
            <label className={paymentMethod === "BANK_TRANSFER" ? "payment-option active" : "payment-option"}>
              <input type="radio" checked={paymentMethod === "BANK_TRANSFER"} onChange={() => setPaymentMethod("BANK_TRANSFER")} />
              <Banknote size={28} /><span><strong>網路銀行轉帳</strong><small>訂單建立後顯示匯款帳號，後台可人工確認款項。</small></span>
            </label>
            <label className={paymentMethod === "LINE_PAY" ? "payment-option active" : "payment-option"}>
              <input type="radio" checked={paymentMethod === "LINE_PAY"} onChange={() => setPaymentMethod("LINE_PAY")} />
              <CreditCard size={28} /><span><strong>LINE Pay</strong><small>將前往 LINE Pay 安全頁面完成付款。</small></span>
            </label>
          </div>
          <div className="secure-note"><LockKeyhole size={18} />付款憑證與 LINE Pay 密鑰只會在伺服器端處理。</div>
        </section>
        {error && <div className="form-error">{error}</div>}
      </div>

      <aside className="order-summary sticky-card checkout-summary">
        <h2>訂單內容</h2>
        <div className="checkout-items">{items.map((item) => <div className="checkout-mini-item" key={item.id}><img src={item.imageUrl} alt="" /><span>{item.name}<small>數量 {item.quantity}</small></span><strong>{formatPrice(item.price * item.quantity)}</strong></div>)}</div>
        <div><span>商品小計</span><strong>{formatPrice(subtotal)}</strong></div>
        <div><span>運費</span><strong>{shipping === 0 ? "免運" : formatPrice(shipping)}</strong></div>
        <div className="summary-total"><span>應付金額</span><strong>{formatPrice(subtotal + shipping)}</strong></div>
        <button className="button button-primary button-full" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={20} />建立訂單中</> : "確認送出訂單"}</button>
      </aside>
    </form>
  );
}
