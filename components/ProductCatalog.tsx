"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { StoreProduct } from "@/lib/types";

export function ProductCatalog({ products }: { products: StoreProduct[] }) {
  const categories = useMemo(() => ["全部", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const [category, setCategory] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchCategory = category === "全部" || product.category === category;
      const matchKeyword = !query || `${product.name} ${product.sku} ${product.category} ${product.shortDesc ?? ""}`.toLowerCase().includes(query);
      return matchCategory && matchKeyword;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "stock") return b.stock - a.stock;
      return Number(b.isFeatured) - Number(a.isFeatured);
    });
  }, [products, category, keyword, sort]);

  return (
    <section className="catalog-section" id="products">
      <div className="section-heading">
        <div><span className="eyebrow">PRODUCTS</span><h2>專業工具，快速找到</h2></div>
        <p>使用分類、關鍵字與價格排序，快速挑選適合的電動工具。</p>
      </div>

      <div className="catalog-toolbar">
        <div className="search-box"><Search size={20} /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜尋商品名稱、型號或分類" /></div>
        <label className="sort-box"><SlidersHorizontal size={19} /><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">推薦排序</option><option value="price-asc">價格：低到高</option><option value="price-desc">價格：高到低</option><option value="stock">庫存較多優先</option></select></label>
      </div>

      <div className="category-tabs" id="categories">
        {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </div>

      <div className="catalog-result-line">共找到 <strong>{filtered.length}</strong> 項商品</div>
      {filtered.length > 0 ? (
        <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      ) : (
        <div className="empty-state"><Search size={42} /><h3>找不到符合條件的商品</h3><p>請更換分類或搜尋關鍵字。</p></div>
      )}
    </section>
  );
}
