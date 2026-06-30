import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"]
]);

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ error: "未授權。" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "未收到圖片檔案。" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "僅支援 JPG、PNG、WEBP、GIF。" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "圖片不可超過 5MB。" }, { status: 400 });

  const extension = allowedTypes.get(file.type)!;
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const relativeDir = path.join("public", "uploads", "products");
  const targetDir = path.join(process.cwd(), relativeDir);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/products/${filename}` });
}
