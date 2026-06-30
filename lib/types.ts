export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  brand: string;
  shortDesc: string | null;
  description: string;
  specs: Record<string, string>;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  imageUrl: string;
  gallery: string[];
  isFeatured: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
};

export type CartItem = Pick<StoreProduct, "id" | "name" | "slug" | "price" | "stock" | "imageUrl"> & {
  quantity: number;
};
