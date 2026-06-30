import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return <><div className="admin-page-heading"><div><span>NEW PRODUCT</span><h1>新增商品</h1><p>填寫商品資料、上傳圖片並設定價格與庫存。</p></div></div><ProductForm /></>;
}
