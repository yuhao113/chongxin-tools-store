"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Boxes, ClipboardList, ExternalLink, LayoutDashboard, LogOut, PackagePlus } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  if (pathname === "/admin/login") return <>{children}</>;

  const links = [
    { href: "/admin", label: "營運總覽", icon: LayoutDashboard },
    { href: "/admin/products", label: "商品管理", icon: Boxes },
    { href: "/admin/products/new", label: "新增商品", icon: PackagePlus },
    { href: "/admin/orders", label: "訂單管理", icon: ClipboardList }
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><img src="/chongxin-logo.png" alt="崇信" /><span><strong>崇信電動工具</strong><small>管理系統</small></span></Link>
        <nav>{links.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={20} />{label}</Link>;
        })}</nav>
        <div className="admin-sidebar-bottom"><Link href="/" target="_blank"><ExternalLink size={18} />查看前台網站</Link><button onClick={logout}><LogOut size={18} />登出管理系統</button></div>
      </aside>
      <div className="admin-content"><header className="admin-topbar"><div><span>CHONGXIN ADMIN</span><strong>電商營運管理</strong></div><Link href="/admin/products/new" className="button button-primary small">＋ 新增商品</Link></header><main className="admin-main">{children}</main></div>
    </div>
  );
}
