import Link from "next/link";
import { Banknote, MapPin, Phone, ShieldCheck } from "lucide-react";

export function SiteFooter({ storePhone, storeAddress }: { storePhone: string; storeAddress: string }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src="/chongxin-logo.png" alt="崇信電動工具" />
          <div>
            <h3>崇信電動工具</h3>
            <p>提供專業、耐用、規格清楚的電動工具選購體驗。</p>
          </div>
        </div>
        <div>
          <h4>聯絡資訊</h4>
          <p><Phone size={16} /> {storePhone}</p>
          <p><MapPin size={16} /> {storeAddress}</p>
        </div>
        <div>
          <h4>購物保障</h4>
          <p><ShieldCheck size={16} /> 商品與庫存由後台即時管理</p>
          <p><Banknote size={16} /> 支援轉帳與 LINE Pay</p>
        </div>
        <div>
          <h4>快速連結</h4>
          <Link href="/#products">商品列表</Link>
          <Link href="/cart">購物車</Link>
          <Link href="/admin">管理後台</Link>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} 崇信電動工具 CHONGXIN. All rights reserved.</div>
    </footer>
  );
}
