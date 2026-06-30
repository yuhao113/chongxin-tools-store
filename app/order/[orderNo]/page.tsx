import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, CheckCircle2, CircleAlert, Clock3, PackageCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { formatDateTime, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "訂單資訊" };

type Props = { params: Promise<{ orderNo: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

const paymentLabels = { UNPAID: "未付款", PENDING_REVIEW: "待審核", PAID: "已付款", FAILED: "付款失敗", REFUNDED: "已退款" } as const;
const fulfillmentLabels = { PENDING: "待處理", PREPARING: "備貨中", SHIPPED: "已出貨", COMPLETED: "已完成", CANCELLED: "已取消" } as const;

export default async function OrderPage({ params, searchParams }: Props) {
  const { orderNo } = await params;
  const query = await searchParams;
  const token = typeof query.token === "string" ? query.token : "";
  if (!token) notFound();
  const order = await prisma.order.findFirst({ where: { orderNo, publicToken: token }, include: { items: true } });
  if (!order) notFound();
  const paid = order.paymentStatus === "PAID";
  const failed = query.payment === "failed" || order.paymentStatus === "FAILED";

  return (
    <div className="container page-shell order-result-page">
      <section className={failed ? "result-hero error" : "result-hero"}>
        {failed ? <CircleAlert size={58} /> : paid ? <CheckCircle2 size={58} /> : <Clock3 size={58} />}
        <h1>{failed ? "付款尚未完成" : paid ? "付款成功，訂單已成立" : "訂單已建立"}</h1>
        <p>訂單編號：<strong>{order.orderNo}</strong></p>
      </section>

      {order.paymentMethod === "BANK_TRANSFER" && !paid && order.orderStatus !== "CANCELLED" && (
        <section className="bank-info-card">
          <div className="bank-info-title"><Banknote size={30} /><div><h2>銀行轉帳資訊</h2><p>完成匯款後，管理人員會在後台確認款項。</p></div></div>
          <dl><div><dt>銀行</dt><dd>{process.env.BANK_NAME || "請設定銀行名稱"}（代碼 {process.env.BANK_CODE || "000"}）</dd></div><div><dt>帳號</dt><dd className="account-number">{process.env.BANK_ACCOUNT || "請設定匯款帳號"}</dd></div><div><dt>戶名</dt><dd>{process.env.BANK_ACCOUNT_NAME || "崇信電動工具"}</dd></div><div><dt>匯款金額</dt><dd>{formatPrice(order.total)}</dd></div></dl>
          <p className="bank-notice">請於匯款備註填寫訂單編號末 6 碼，並保留轉帳明細。</p>
        </section>
      )}

      <div className="order-detail-layout">
        <section className="content-card">
          <div className="content-card-heading"><span>ORDER ITEMS</span><h2>商品明細</h2></div>
          <div className="order-item-list">{order.items.map((item: { id: string; imageUrl: string; name: string; sku: string; quantity: number; subtotal: number }) => <article key={item.id}><img src={item.imageUrl} alt={item.name} /><div><h3>{item.name}</h3><p>{item.sku}・數量 {item.quantity}</p></div><strong>{formatPrice(item.subtotal)}</strong></article>)}</div>
          <div className="order-money-lines"><div><span>商品小計</span><strong>{formatPrice(order.subtotal)}</strong></div><div><span>運費</span><strong>{order.shippingFee === 0 ? "免運" : formatPrice(order.shippingFee)}</strong></div><div className="total"><span>總金額</span><strong>{formatPrice(order.total)}</strong></div></div>
        </section>
        <aside className="content-card order-status-card">
          <div className="content-card-heading"><span>ORDER STATUS</span><h2>訂單狀態</h2></div>
          <dl><div><dt>付款狀態</dt><dd>{paymentLabels[order.paymentStatus as keyof typeof paymentLabels]}</dd></div><div><dt>出貨狀態</dt><dd>{fulfillmentLabels[order.fulfillmentStatus as keyof typeof fulfillmentLabels]}</dd></div><div><dt>付款方式</dt><dd>{order.paymentMethod === "LINE_PAY" ? "LINE Pay" : "銀行轉帳"}</dd></div><div><dt>建立時間</dt><dd>{formatDateTime(order.createdAt)}</dd></div><div><dt>收件人</dt><dd>{order.customerName}</dd></div><div><dt>電話</dt><dd>{order.phone}</dd></div><div><dt>地址</dt><dd>{order.postalCode} {order.address}</dd></div></dl>
          <div className="status-icon"><PackageCheck size={48} /></div>
        </aside>
      </div>
      <div className="center-actions"><Link href="/#products" className="button button-primary">繼續選購</Link></div>
    </div>
  );
}
