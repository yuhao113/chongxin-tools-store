import type { Metadata } from "next";
import { CartProvider } from "@/components/CartProvider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "崇信電動工具 CHONGXIN",
    template: "%s｜崇信電動工具"
  },
  description: "專業電鑽、砂輪機、電動扳手與電池配件，支援銀行轉帳與 LINE Pay。",
  icons: { icon: "/chongxin-logo.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <CartProvider>
          <SiteChrome storePhone={process.env.STORE_PHONE || "請設定門市電話"} storeAddress={process.env.STORE_ADDRESS || "請設定門市地址"}>{children}</SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
