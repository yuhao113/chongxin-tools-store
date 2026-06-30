import { OrderTable } from "@/components/admin/OrderTable";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  const serialized = orders.map((order) => ({ ...order, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(), paidAt: order.paidAt?.toISOString() || null }));
  return <><div className="admin-page-heading"><div><span>ORDER MANAGEMENT</span><h1>訂單管理</h1><p>確認轉帳款項、更新訂單與出貨狀態。</p></div></div><OrderTable initialOrders={serialized} /></>;
}
