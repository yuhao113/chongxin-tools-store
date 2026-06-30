"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import type { StoreProduct } from "@/lib/types";

export function ProductCard({ product }: { product: StoreProduct }) {
  const { addItem } = useCart();

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`} className="product-image-wrap">
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="sale-badge">特價</span>
        )}
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </Link>
      <div className="product-card-body">
        <div className="product-meta"><span>{product.category}</span><small>{product.sku}</small></div>
        <Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.shortDesc}</p>
        <div className="stock-row">
          <span className={product.stock > 0 ? "in-stock" : "out-stock"}>
            {product.stock > 0 ? `現貨 ${product.stock} 件` : "暫時缺貨"}
          </span>
        </div>
        <div className="product-card-footer">
          <div className="price-block">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAtPrice && <del>{formatPrice(product.compareAtPrice)}</del>}
          </div>
          <button
            className="icon-action"
            disabled={product.stock < 1}
            onClick={() => addItem(product)}
            aria-label={`將 ${product.name} 加入購物車`}
          >
            <ShoppingCart size={21} />
          </button>
        </div>
      </div>
    </article>
  );
}
