"use client";

import Link from "next/link";
import { Menu, ShoppingCart, Wrench, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export function SiteHeader() {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>專業電動工具・安心選購・快速出貨</span>
          <Link href="/admin">管理後台</Link>
        </div>
      </div>
      <div className="container nav-shell">
        <Link href="/" className="brand" aria-label="崇信電動工具首頁">
          <img src="/chongxin-logo.png" alt="崇信電動工具 Logo" />
          <span>
            <strong>崇信電動工具</strong>
            <small>CHONGXIN POWER TOOLS</small>
          </span>
        </Link>

        <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label="開啟選單">
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        <nav className={open ? "main-nav open" : "main-nav"}>
          <Link href="/" onClick={() => setOpen(false)}>首頁</Link>
          <Link href="/#products" onClick={() => setOpen(false)}>全部商品</Link>
          <Link href="/#categories" onClick={() => setOpen(false)}>商品分類</Link>
          <Link href="/#service" onClick={() => setOpen(false)}>購物說明</Link>
        </nav>

        <Link href="/cart" className="cart-button" aria-label={`購物車，共 ${itemCount} 件`}>
          <ShoppingCart size={24} />
          <span>購物車</span>
          {itemCount > 0 && <b>{itemCount}</b>}
        </Link>
      </div>
      <div className="industrial-line"><Wrench size={16} /> 專業規格・清楚庫存・多元付款</div>
    </header>
  );
}
