"use client";

import { LoaderCircle, LockKeyhole, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: form.get("username"), password: form.get("password") })
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) {
      setError(data.error || "登入失敗");
      setLoading(false);
      return;
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form className="admin-login-card" onSubmit={submit}>
      <img src="/chongxin-logo.png" alt="崇信電動工具" />
      <div className="admin-login-heading"><span>CHONGXIN ADMIN</span><h1>後台管理系統</h1><p>登入後即可管理商品、價格、庫存與訂單。</p></div>
      <label><span><UserRound size={18} />管理員帳號</span><input name="username" required autoComplete="username" /></label>
      <label><span><LockKeyhole size={18} />管理員密碼</span><input name="password" type="password" required autoComplete="current-password" /></label>
      {error && <div className="form-error">{error}</div>}
      <button className="button button-primary button-full" disabled={loading}>{loading ? <><LoaderCircle className="spin" size={20} />登入中</> : "登入管理系統"}</button>
      <small>帳號密碼請於伺服器的 .env 設定，不會顯示在前端程式碼。</small>
    </form>
  );
}
