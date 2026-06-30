import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "管理員登入" };

export default function AdminLoginPage() {
  return <div className="admin-login-page"><div className="admin-login-industrial"></div><Suspense><AdminLoginForm /></Suspense></div>;
}
