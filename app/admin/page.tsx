import { Boxes, CircleDollarSign, ClipboardList, PackageCheck, TriangleAlert } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [productCount, activeCount, lowStockCount, orderCount, pendingOrders, paidRevenue] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { stock: { lte: 5 }, status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({ where: { OR: [{ paymentStatus: "PENDING_REVIEW" }, { fulfillmentStatus: "PENDING" }] } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true } })
  ]);

  const recentOrders = await prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { items: true } });

  return (
    <>
      <div className="admin-page-heading"><div><span>OVERVIEW</span><h1>營運總覽</h1><p>快速掌握商品、庫存、付款與訂單處理狀況。</p></div></div>
      <section className="metric-grid">
        <article><div className="metric-icon blue"><Boxes /></div><span>全部商品</span><strong>{productCount}</strong><small>{activeCount} 項正在前台上架</small></article>
        <article><div className="metric-icon orange"><TriangleAlert /></div><span>低庫存商品</span><strong>{lowStockCount}</strong><small>庫存 5 件以下</small></article>
        <article><div className="metric-icon gray"><ClipboardList /></div><span>累計訂單</span><strong>{orderCount}</strong><small>{pendingOrders} 筆需要處理</small></article>
        <article><div className="metric-icon green"><CircleDollarSign /></div><span>已付款營收</span><strong>{formatPrice(paidRevenue._sum.total || 0)}</strong><small>不含未付款與退款訂單</small></article>
      </section>

      <section className="admin-dashboard-card">
        <div className="admin-dashboard-card-title"><div><span>RECENT ORDERS</span><h2>最近訂單</h2></div><a href="/admin/orders">查看全部訂單 →</a></div>
        {recentOrders.length === 0 ? <div className="dashboard-empty"><PackageCheck size={42} /><p>目前尚無訂單。</p></div> : <div className="recent-order-list">{recentOrders.map((order) => <article key={order.id}><div><strong>{order.orderNo}</strong><small>{order.customerName}・{order.items.length} 種商品</small></div><span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus === "PAID" ? "已付款" : order.paymentStatus === "PENDING_REVIEW" ? "待審核" : "未付款"}</span><b>{formatPrice(order.total)}</b></article>)}</div>}
      </section>
    </>
  );
}
