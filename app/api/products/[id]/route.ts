import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { productInputSchema } from "@/lib/validators";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return NextResponse.json({ error: "找不到商品。" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });
  const { id } = await context.params;

  try {
    const raw = await request.json();
    if (raw.quickUpdate === true) {
      const data: { price?: number; stock?: number; status?: "ACTIVE" | "INACTIVE" | "DRAFT" } = {};
      if (raw.price !== undefined) data.price = Math.max(0, Math.trunc(Number(raw.price)));
      if (raw.stock !== undefined) data.stock = Math.max(0, Math.trunc(Number(raw.stock)));
      if (["ACTIVE", "INACTIVE", "DRAFT"].includes(raw.status)) data.status = raw.status;
      const product = await prisma.product.update({ where: { id }, data });
      return NextResponse.json(product);
    }

    const parsed = productInputSchema.parse(raw);
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...parsed,
        slug: slugify(parsed.slug || parsed.name),
        shortDesc: parsed.shortDesc || null,
        compareAtPrice: parsed.compareAtPrice || null,
        specs: parsed.specs,
        gallery: parsed.gallery
      }
    });
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "修改商品失敗。";
    const friendly = message.includes("Unique constraint") || message.includes("P2002")
      ? "SKU 或網址代稱已存在。"
      : message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });
  const { id } = await context.params;

  try {
    const product = await prisma.product.findUnique({ where: { id }, include: { _count: { select: { orderItems: true } } } });
    if (!product) return NextResponse.json({ error: "找不到商品。" }, { status: 404 });

    if (product._count.orderItems > 0) {
      await prisma.product.update({ where: { id }, data: { status: "INACTIVE" } });
      return NextResponse.json({ ok: true, archived: true });
    }

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ ok: true, archived: false });
  } catch {
    return NextResponse.json({ error: "刪除商品失敗。" }, { status: 400 });
  }
}
