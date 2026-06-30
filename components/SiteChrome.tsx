"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function SiteChrome({ children, storePhone, storeAddress }: { children: React.ReactNode; storePhone: string; storeAddress: string }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <main>{children}</main>;
  return <><SiteHeader /><main className="site-main">{children}</main><SiteFooter storePhone={storePhone} storeAddress={storeAddress} /></>;
}
