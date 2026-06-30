"use client";

import Link from "next/link";
import { Edit3, Eye, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function ProductTable({ initialProducts }: { initialProducts: StoreProduct[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const router = useRouter();

  function change(id: string, field: "price" | "stock" | "status", value: string | number) {
    setProducts((current) => current.map((p) => p.id === id ? { ...p, [field]: value } : p));
  }

  async function save(product: StoreProduct) {
    setSavingId(product.id);
    setMessage("");
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quickUpdate: true, price: Number(product.price), stock: Number(product.stock), status: product.status })
    });
    const data = await response.json() as StoreProduct & { error?: string };
    setSavingId(null);
    if (!response.ok) return setMessage(data.error || "更新失敗");
    setProducts((current) => current.map((p) => p.id === product.id ? { ...p, ...data } : p));
    setMessage(`已更新「${product.name}」`);
    router.refresh();
  }

  async function remove(product: StoreProduct) {
    if (!window.confirm(`確定要刪除／下架「${product.name}」嗎？`)) return;
    setSavingId(product.id);
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const data = await response.json() as { error?: string; archived?: boolean };
    setSavingId(null);
    if (!response.ok) return setMessage(data.error || "處理失敗");
    if (data.archived) {
      setProducts((current) => current.map((p) => p.id === product.id ? { ...p, status: "INACTIVE" } : p));
      setMessage("商品已有訂單紀錄，因此改為下架而非永久刪除。");
    } else {
      setProducts((current) => current.filter((p) => p.id !== product.id));
      setMessage("商品已刪除。");
    }
    router.refresh();
  }

  return (
    <div className="admin-table-card">
      {message && <div className="admin-message">{message}</div>}
      <div className="table-scroll"><table className="admin-table product-admin-table"><thead><tr><th>商品</th><th>分類／SKU</th><th>售價（可直接改）</th><th>庫存</th><th>前台狀態</th><th>操作</th></tr></thead><tbody>
        {products.map((product) => <tr key={product.id}>
          <td><div className="table-product"><img src={product.imageUrl} alt="" /><div><strong>{product.name}</strong><small>{formatPrice(product.price)}</small></div></div></td>
          <td><strong>{product.category}</strong><small>{product.sku}</small></td>
          <td><div className="inline-money"><span>NT$</span><input type="number" min="0" value={product.price} onChange={(e) => change(product.id, "price", Number(e.target.value))} /></div></td>
          <td><input className="small-number-input" type="number" min="0" value={product.stock} onChange={(e) => change(product.id, "stock", Number(e.target.value))} /></td>
          <td><select value={product.status} onChange={(e) => change(product.id, "status", e.target.value)}><option value="ACTIVE">上架</option><option value="INACTIVE">下架</option><option value="DRAFT">草稿</option></select></td>
          <td><div className="table-actions"><button onClick={() => save(product)} title="儲存快速修改">{savingId === product.id ? <LoaderCircle className="spin" size={18} /> : <Save size={18} />}</button><Link href={`/admin/products/${product.id}/edit`} title="完整編輯"><Edit3 size={18} /></Link><Link href={`/products/${product.slug}`} target="_blank" title="查看前台"><Eye size={18} /></Link><button className="danger" onClick={() => remove(product)} title="刪除或下架"><Trash2 size={18} /></button></div></td>
        </tr>)}
      </tbody></table></div>
    </div>
  );
}
