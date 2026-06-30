import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";
import { productInputSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = isAdminRequest(request);
  const products = await prisma.product.findMany({
    where: admin ? undefined : { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });

  try {
    const parsed = productInputSchema.parse(await request.json());
    const slug = slugify(parsed.slug || parsed.name);
    const product = await prisma.product.create({
      data: {
        ...parsed,
        slug,
        shortDesc: parsed.shortDesc || null,
        compareAtPrice: parsed.compareAtPrice || null,
        specs: parsed.specs,
        gallery: parsed.gallery
      }
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增商品失敗。";
    const friendly = message.includes("Unique constraint") || message.includes("P2002")
      ? "SKU 或網址代稱已存在。"
      : message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }
}
