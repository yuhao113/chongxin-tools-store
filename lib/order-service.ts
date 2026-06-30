import { prisma } from "@/lib/prisma";

export async function releaseInventory(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order || order.inventoryReleased) return order;

    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    }

    return tx.order.update({
      where: { id: order.id },
      data: { inventoryReleased: true }
    });
  });
}
