import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { ProductDetailActions } from "@/components/ProductDetailActions";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/product";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const product = await prisma.product.findUnique({
    where: {
      slug: decodedSlug,
    },
  });

  return product
    ? {
        title: product.name,
        description:
          product.shortDesc || product.description?.slice(0, 120) || product.name,
      }
    : {
        title: "找不到商品",
      };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const productRecord = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
    },
  });

  if (!productRecord) notFound();

  const product = serializeProduct(productRecord);

  return (
    <div className="container page-shell">
      <nav className="breadcrumbs">
        <Link href="/">首頁</Link>
        <ChevronRight size={15} />
        <Link href="/#products">商品</Link>
        <ChevronRight size={15} />
        <span>{product.name}</span>
      </nav>

      <section className="product-detail-grid">
        <div className="detail-gallery">
          <div className="detail-main-image">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} />
            ) : (
              <div className="empty-image">無商品圖片</div>
            )}
          </div>
        </div>

        <div className="detail-info">
          <div className="detail-category">
            {product.category}
            <span>{product.sku}</span>
          </div>

          <h1>{product.name}</h1>

          <p className="detail-short-desc">
            {product.shortDesc || product.description || "尚無商品簡介"}
          </p>

          <div className="detail-price">
            <strong>{formatPrice(product.price)}</strong>
            {product.compareAtPrice && (
              <del>{formatPrice(product.compareAtPrice)}</del>
            )}
            <small>含稅售價</small>
          </div>

          <div
            className={
              product.stock > 0
                ? "detail-stock in-stock-box"
                : "detail-stock out-stock-box"
            }
          >
            <PackageCheck size={22} />
            <div>
              <strong>{product.stock > 0 ? "目前有現貨" : "目前缺貨"}</strong>
              <span>
                {product.stock > 0
                  ? `庫存剩餘 ${product.stock} 件`
                  : "請稍後再查看或聯絡門市"}
              </span>
            </div>
          </div>

          <ProductDetailActions product={product} />

          <div className="detail-benefits">
            <span>
              <Truck size={20} />
              滿 NT$3,000 免運
            </span>
            <span>
              <ShieldCheck size={20} />
              安全付款流程
            </span>
            <span>
              <CheckCircle2 size={20} />
              後台即時追蹤
            </span>
          </div>
        </div>
      </section>

      <section className="detail-content-grid">
        <article className="content-card">
          <div className="content-card-heading">
            <span>DESCRIPTION</span>
            <h2>商品說明</h2>
          </div>
          <p className="long-description">
            {product.description || "尚無商品說明"}
          </p>
        </article>

        <article className="content-card">
          <div className="content-card-heading">
            <span>SPECIFICATIONS</span>
            <h2>規格參數</h2>
          </div>

          <dl className="spec-list">
            {product.specs && Object.keys(product.specs).length > 0 ? (
              Object.entries(product.specs).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))
            ) : (
              <div>
                <dt>規格</dt>
                <dd>尚未填寫</dd>
              </div>
            )}
          </dl>
        </article>
      </section>
    </div>
  );
}