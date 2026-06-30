import { z } from "zod";

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "商品名稱至少 2 個字"),
  slug: z.string().trim().optional().default(""),
  sku: z.string().trim().min(2, "請輸入 SKU"),
  category: z.string().trim().min(1, "請選擇分類"),
  brand: z.string().trim().min(1).default("CHONGXIN"),
  shortDesc: z.string().trim().max(150).optional().nullable(),
  description: z.string().trim().min(10, "商品描述至少 10 個字"),
  specs: z.record(z.string(), z.string()).default({}),
  price: z.coerce.number().int().nonnegative(),
  compareAtPrice: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  stock: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().trim().min(1, "請上傳商品圖片"),
  gallery: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  status: z.enum(["ACTIVE", "INACTIVE", "DRAFT"])
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99)
});

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "請填寫收件人姓名"),
  phone: z.string().trim().regex(/^[0-9+()\-\s]{8,20}$/, "電話格式不正確"),
  email: z.union([z.string().trim().email("Email 格式不正確"), z.literal("")]).optional(),
  postalCode: z.string().trim().max(10).optional(),
  address: z.string().trim().min(6, "請填寫完整地址"),
  note: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["BANK_TRANSFER", "LINE_PAY"]),
  items: z.array(cartItemSchema).min(1, "購物車不可為空")
});

export const orderUpdateSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "PENDING_REVIEW", "PAID", "FAILED", "REFUNDED"]).optional(),
  orderStatus: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  fulfillmentStatus: z.enum(["PENDING", "PREPARING", "SHIPPED", "COMPLETED", "CANCELLED"]).optional()
});
