import Link from "next/link";
import { ArrowRight, Banknote, Boxes, Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";
import { ProductCatalog } from "@/components/ProductCatalog";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }]
  });
  const serialized = products.map(serializeProduct);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="hero-kicker"><Wrench size={18} /> PROFESSIONAL POWER TOOLS</span>
            <h1>真正耐用的工具，<br /><em>交給專業的人選。</em></h1>
            <p>崇信電動工具提供規格清楚、庫存透明、操作簡單的線上選購體驗，讓師傅與一般使用者都能快速找到適合的工具。</p>
            <div className="hero-actions"><Link href="#products" className="button button-primary">立即選購<ArrowRight size={20} /></Link><Link href="#service" className="button button-outline">查看購物說明</Link></div>
            <div className="hero-trust"><span><ShieldCheck size={20} />安全付款</span><span><Boxes size={20} />庫存透明</span><span><Truck size={20} />快速出貨</span></div>
          </div>
          <div className="hero-visual">
            <div className="hero-logo-disc"><img src="/chongxin-logo.png" alt="崇信電動工具" /></div>
            {/* <div className="hero-floating-card top"><strong>商用科技藍</strong><small>專業・精準・可靠</small></div>
            <div className="hero-floating-card bottom"><strong>工業級選品</strong><small>大按鈕、好操作</small></div> */}
          </div>
        </div>
      </section>

      <section className="container feature-strip" id="service">
        <article><Truck size={28} /><div><h3>快速出貨</h3><p>訂單狀態由後台即時追蹤。</p></div></article>
        <article><ShieldCheck size={28} /><div><h3>庫存透明</h3><p>商品頁即時顯示剩餘數量。</p></div></article>
        <article><Banknote size={28} /><div><h3>多元付款</h3><p>支援轉帳與 LINE Pay。</p></div></article>
        <article><Headphones size={28} /><div><h3>專業服務</h3><p>規格清楚，方便快速比較。</p></div></article>
      </section>

      <div className="container"><ProductCatalog products={serialized} /></div>

      <section className="service-banner">
        <div className="container service-banner-inner"><div><span>CHONGXIN SERVICE</span><h2>不確定該選哪一款工具？</h2><p>可透過門市電話聯絡，我們會依工作需求協助您選擇合適規格。</p></div><a href={`tel:${process.env.STORE_PHONE || ""}`} className="button button-light">聯絡崇信</a></div>
      </section>
    </>
  );
}
