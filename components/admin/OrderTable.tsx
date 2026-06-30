"use client";

import { ChevronDown, LoaderCircle, PackageSearch } from "lucide-react";
import { useState } from "react";
import { formatDateTime, formatPrice } from "@/lib/format";

type OrderRow = {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: "BANK_TRANSFER" | "LINE_PAY";
  paymentStatus: "UNPAID" | "PENDING_REVIEW" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  fulfillmentStatus: "PENDING" | "PREPARING" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  total: number;
  createdAt: string;
  items: Array<{ id: string; name: string; quantity: number; subtotal: number }>;
};

const paymentLabels = { UNPAID: "未付款", PENDING_REVIEW: "待審核", PAID: "已付款", FAILED: "付款失敗", REFUNDED: "已退款" };
const orderLabels = { PENDING: "待確認", CONFIRMED: "已確認", CANCELLED: "已取消", COMPLETED: "已完成" };
const fulfillmentLabels = { PENDING: "待處理", PREPARING: "備貨中", SHIPPED: "已出貨", COMPLETED: "已完成", CANCELLED: "已取消" };

export function OrderTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function update(id: string, field: "paymentStatus" | "orderStatus" | "fulfillmentStatus", value: string) {
    setSavingId(id);
    setMessage("");
    const response = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value })
    });
    const data = await response.json() as OrderRow & { error?: string };
    setSavingId(null);
    if (!response.ok) return setMessage(data.error || "更新失敗");
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...data, createdAt: String(data.createdAt) } : order));
    setMessage(`訂單 ${data.orderNo} 已更新。`);
  }

  if (orders.length === 0) return <div className="empty-state admin-empty"><PackageSearch size={52} /><h2>目前沒有訂單</h2><p>顧客完成結帳後，訂單會顯示在這裡。</p></div>;

  return (
    <div className="admin-table-card">
      {message && <div className="admin-message">{message}</div>}
      <div className="table-scroll"><table className="admin-table order-admin-table"><thead><tr><th>訂單／時間</th><th>顧客</th><th>金額／付款方式</th><th>付款狀態</th><th>訂單狀態</th><th>出貨狀態</th><th>明細</th></tr></thead><tbody>
        {orders.map((order) => (
          <tr key={order.id} className={openId === order.id ? "expanded" : ""}>
            <td><strong>{order.orderNo}</strong><small>{formatDateTime(order.createdAt)}</small></td>
            <td><strong>{order.customerName}</strong><small>{order.phone}</small></td>
            <td><strong>{formatPrice(order.total)}</strong><small>{order.paymentMethod === "LINE_PAY" ? "LINE Pay" : "銀行轉帳"}</small></td>
            <td><select value={order.paymentStatus} disabled={savingId === order.id} onChange={(e) => update(order.id, "paymentStatus", e.target.value)}>{Object.entries(paymentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
            <td><select value={order.orderStatus} disabled={savingId === order.id} onChange={(e) => update(order.id, "orderStatus", e.target.value)}>{Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
            <td><select value={order.fulfillmentStatus} disabled={savingId === order.id} onChange={(e) => update(order.id, "fulfillmentStatus", e.target.value)}>{Object.entries(fulfillmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td>
            <td><button className="detail-toggle" onClick={() => setOpenId(openId === order.id ? null : order.id)}>{savingId === order.id ? <LoaderCircle className="spin" size={18} /> : <ChevronDown size={19} />}</button>{openId === order.id && <div className="order-popover"><strong>商品明細</strong>{order.items.map((item) => <div key={item.id}><span>{item.name} × {item.quantity}</span><b>{formatPrice(item.subtotal)}</b></div>)}<p><b>收件地址：</b>{order.address}</p></div>}</td>
          </tr>
        ))}
      </tbody></table></div>
      <p className="admin-table-note">取消訂單或出貨狀態設為「已取消」時，系統會自動回補庫存。LINE Pay 已付款訂單如需退款，仍須至 LINE Pay 商店後台或另行串接退款 API。</p>
    </div>
  );
}
