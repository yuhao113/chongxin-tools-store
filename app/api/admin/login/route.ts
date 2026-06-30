import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { username?: string; password?: string };
    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedUsername || !expectedPassword) {
      return NextResponse.json({ error: "伺服器尚未設定管理員帳密。" }, { status: 500 });
    }

    if (body.username !== expectedUsername || body.password !== expectedPassword) {
      return NextResponse.json({ error: "帳號或密碼錯誤。" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, createAdminToken(body.username), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12
    });
    return response;
  } catch {
    return NextResponse.json({ error: "登入資料格式錯誤。" }, { status: 400 });
  }
}
