import Link from "next/link";
import { Plus } from "lucide-react";
import { ProductTable } from "@/components/admin/ProductTable";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { updatedAt: "desc" } });
  return (
    <>
      <div className="admin-page-heading"><div><span>PRODUCT MANAGEMENT</span><h1>商品管理</h1><p>可直接在列表修改價格、庫存與上下架狀態。</p></div><Link href="/admin/products/new" className="button button-primary"><Plus size={19} />新增商品</Link></div>
      <ProductTable initialProducts={products.map(serializeProduct)} />
    </>
  );
}
