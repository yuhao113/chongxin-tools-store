import type { Product } from "@/app/generated/prisma/client";
import type { StoreProduct } from "@/lib/types";

export function serializeProduct(product: Product): StoreProduct {
  const specs = product.specs && typeof product.specs === "object" && !Array.isArray(product.specs)
    ? (product.specs as Record<string, string>)
    : {};
  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((item): item is string => typeof item === "string")
    : [];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    category: product.category,
    brand: product.brand,
    shortDesc: product.shortDesc,
    description: product.description,
    specs,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    imageUrl: product.imageUrl,
    gallery,
    isFeatured: product.isFeatured,
    status: product.status
  };
}
