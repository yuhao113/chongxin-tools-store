import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();
  return <><div className="admin-page-heading"><div><span>EDIT PRODUCT</span><h1>修改商品</h1><p>更新商品資訊後，前台將立即使用新資料。</p></div></div><ProductForm product={serializeProduct(product)} /></>;
}
