import { NextRequest, NextResponse } from "next/server";
import { confirmLinePayPayment } from "@/lib/line-pay";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const orderNo = request.nextUrl.searchParams.get("orderNo");
  const transactionId = request.nextUrl.searchParams.get("transactionId");
  const token = request.nextUrl.searchParams.get("token");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin).replace(/\/$/, "");

  if (!orderNo || !transactionId || !token) return NextResponse.redirect(`${appUrl}/?payment=invalid`);
  const order = await prisma.order.findFirst({ where: { orderNo, publicToken: token } });
  if (!order || order.paymentMethod !== "LINE_PAY") return NextResponse.redirect(`${appUrl}/?payment=invalid`);

  const orderUrl = `${appUrl}/order/${encodeURIComponent(orderNo)}?token=${encodeURIComponent(token)}`;

  if (order.linePayTransactionId && order.linePayTransactionId !== transactionId) {
    return NextResponse.redirect(`${orderUrl}&payment=failed`);
  }
  if (order.paymentStatus === "PAID") {
    return NextResponse.redirect(`${orderUrl}&payment=success`);
  }

  try {
    await confirmLinePayPayment({ transactionId, amount: order.total });
    await prisma.order.update({
      where: { id: order.id },
      data: {
        linePayTransactionId: transactionId,
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED",
        paidAt: new Date()
      }
    });
    return NextResponse.redirect(`${orderUrl}&payment=success`);
  } catch {
    // A network timeout can be ambiguous after the customer approved payment.
    // Keep inventory reserved and let an administrator verify the transaction.
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }).catch(() => undefined);
    return NextResponse.redirect(`${orderUrl}&payment=failed`);
  }
}
