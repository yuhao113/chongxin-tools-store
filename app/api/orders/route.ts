import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { calculateShipping, createOrderNo } from "@/lib/format";
import { requestLinePayPayment } from "@/lib/line-pay";
import { releaseInventory } from "@/lib/order-service";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null;

  try {
    const input = createOrderSchema.parse(await request.json());
    const mergedItems = Array.from(
      input.items.reduce((map, item) => map.set(item.productId, (map.get(item.productId) || 0) + item.quantity), new Map<string, number>())
    ).map(([productId, quantity]) => ({ productId, quantity }));

    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: mergedItems.map((item) => item.productId) }, status: "ACTIVE" }
      });
      if (products.length !== mergedItems.length) throw new Error("部分商品已下架或不存在，請重新整理購物車。");

      const lines = mergedItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        if (product.stock < item.quantity) throw new Error(`${product.name} 庫存不足，目前僅剩 ${product.stock} 件。`);
        return { product, quantity: item.quantity, subtotal: product.price * item.quantity };
      });
      const subtotal = lines.reduce((sum, line) => sum + line.subtotal, 0);
      const shippingFee = calculateShipping(subtotal);
      const total = subtotal + shippingFee;

      for (const line of lines) {
        const result = await tx.product.updateMany({
          where: { id: line.product.id, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } }
        });
        if (result.count !== 1) throw new Error(`${line.product.name} 剛被其他顧客買走，請重新確認庫存。`);
      }

      return tx.order.create({
        data: {
          orderNo: createOrderNo(),
          customerName: input.customerName,
          phone: input.phone,
          email: input.email || null,
          postalCode: input.postalCode || null,
          address: input.address,
          note: input.note || null,
          paymentMethod: input.paymentMethod,
          paymentStatus: input.paymentMethod === "BANK_TRANSFER" ? "PENDING_REVIEW" : "UNPAID",
          subtotal,
          shippingFee,
          total,
          items: {
            create: lines.map((line) => ({
              productId: line.product.id,
              sku: line.product.sku,
              name: line.product.name,
              imageUrl: line.product.imageUrl,
              price: line.product.price,
              quantity: line.quantity,
              subtotal: line.subtotal
            }))
          }
        },
        include: { items: true }
      });
    });

    createdOrderId = order.id;

    if (order.paymentMethod === "LINE_PAY") {
      const appUrl = (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
      const payment = await requestLinePayPayment({
        orderNo: order.orderNo,
        amount: order.total,
        products: order.items.map((item: { sku: string; name: string; imageUrl: string; quantity: number; price: number }) => ({
          id: item.sku,
          name: item.name.slice(0, 100),
          imageUrl: item.imageUrl.startsWith("http") ? item.imageUrl : `${appUrl}${item.imageUrl}`,
          quantity: item.quantity,
          price: item.price
        })),
        confirmUrl: `${appUrl}/api/payments/line-pay/confirm?orderNo=${encodeURIComponent(order.orderNo)}&token=${encodeURIComponent(order.publicToken)}`,
        cancelUrl: `${appUrl}/api/payments/line-pay/cancel?orderNo=${encodeURIComponent(order.orderNo)}&token=${encodeURIComponent(order.publicToken)}`
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { linePayTransactionId: String(payment.transactionId) }
      });

      return NextResponse.json({ orderNo: order.orderNo, publicToken: order.publicToken, paymentUrl: payment.paymentUrl.web }, { status: 201 });
    }

    return NextResponse.json({ orderNo: order.orderNo, publicToken: order.publicToken }, { status: 201 });
  } catch (error) {
    if (createdOrderId) {
      await prisma.order.update({ where: { id: createdOrderId }, data: { paymentStatus: "FAILED", orderStatus: "CANCELLED", fulfillmentStatus: "CANCELLED" } }).catch(() => undefined);
      await releaseInventory(createdOrderId).catch(() => undefined);
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "建立訂單失敗。" }, { status: 400 });
  }
}
