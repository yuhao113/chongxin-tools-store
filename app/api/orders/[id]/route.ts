import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { releaseInventory } from "@/lib/order-service";
import { prisma } from "@/lib/prisma";
import { orderUpdateSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });
  const { id } = await context.params;

  try {
    const data = orderUpdateSchema.parse(await request.json());
    const updateData = {
      ...data,
      paidAt: data.paymentStatus === "PAID" ? new Date() : undefined
    };
    let order = await prisma.order.update({ where: { id }, data: updateData, include: { items: true } });

    if (data.orderStatus === "CANCELLED" || data.fulfillmentStatus === "CANCELLED") {
      await releaseInventory(id);
      order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "更新訂單失敗。" }, { status: 400 });
  }
}
