import { NextRequest, NextResponse } from "next/server";
import { releaseInventory } from "@/lib/order-service";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const orderNo = request.nextUrl.searchParams.get("orderNo");
  const token = request.nextUrl.searchParams.get("token");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");
  if (!orderNo || !token) return NextResponse.redirect(appUrl);

  const order = await prisma.order.findFirst({ where: { orderNo, publicToken: token } });
  if (order && order.paymentStatus !== "PAID") {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED", orderStatus: "CANCELLED", fulfillmentStatus: "CANCELLED" } });
    await releaseInventory(order.id);
  }
  return NextResponse.redirect(`${appUrl}/order/${encodeURIComponent(orderNo)}?token=${encodeURIComponent(token)}&payment=failed`);
}
