"use client";

import { ImagePlus, LoaderCircle, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { StoreProduct } from "@/lib/types";

type SpecRow = { key: string; value: string };

export function ProductForm({ product }: { product?: StoreProduct }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [specs, setSpecs] = useState<SpecRow[]>(
    product && Object.keys(product.specs).length > 0
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [
          { key: "電壓", value: "" },
          { key: "最大扭力", value: "" },
        ]
  );

  async function upload(file?: File) {
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error || "圖片上傳失敗");
        return;
      }

      setImageUrl(data.url);
    } catch (err) {
      console.error(err);
      setError("圖片上傳失敗");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const form = new FormData(event.currentTarget);

      const specObject = specs.reduce<Record<string, string>>((acc, row) => {
        if (row.key.trim() && row.value.trim()) {
          acc[row.key.trim()] = row.value.trim();
        }
        return acc;
      }, {});

      const body = {
        name: form.get("name"),
        slug: form.get("slug"),
        sku: form.get("sku"),
        category: form.get("category"),
        brand: form.get("brand"),
        shortDesc: form.get("shortDesc"),
        description: form.get("description"),
        specs: specObject,
        price: Number(form.get("price")),
        compareAtPrice: form.get("compareAtPrice")
          ? Number(form.get("compareAtPrice"))
          : null,
        stock: Number(form.get("stock")),
        imageUrl,
        gallery: [],
        isFeatured: form.get("isFeatured") === "on",
        status: form.get("status"),
      };

      const response = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "儲存失敗");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={submit}>
      <section className="admin-form-card">
        <div className="admin-form-card-title">
          <span>基本資料</span>
          <p>前台會直接顯示以下商品資訊。</p>
        </div>

        <div className="form-grid two-cols">
          <label className="full-col">
            商品名稱
            <input
              name="name"
              required
              defaultValue={product?.name}
              placeholder="例如：20V 無刷衝擊電鑽組"
            />
          </label>

          <label>
            商品 SKU
            <input
              name="sku"
              required
              defaultValue={product?.sku}
              placeholder="CX-DRILL-001"
            />
          </label>

          <label>
            商品分類
            <input
              name="category"
              list="category-list"
              required
              defaultValue={product?.category}
              placeholder="電鑽"
            />
            <datalist id="category-list">
              <option value="電鑽" />
              <option value="砂輪機" />
              <option value="電動扳手" />
              <option value="電池與充電器" />
              <option value="切割工具" />
              <option value="配件" />
            </datalist>
          </label>

          <label>
            品牌
            <input
              name="brand"
              required
              defaultValue={product?.brand || "CHONGXIN"}
            />
          </label>

          <label>
            網址代稱（可留空自動產生）
            <input
              name="slug"
              defaultValue={product?.slug}
              placeholder="20v-brushless-drill"
            />
          </label>

          <label className="full-col">
            商品短說明
            <input
              name="shortDesc"
              maxLength={150}
              defaultValue={product?.shortDesc || ""}
              placeholder="列表頁顯示的一句特色"
            />
          </label>

          <label className="full-col">
            詳細商品描述
            <textarea
              name="description"
              required
              minLength={10}
              rows={7}
              defaultValue={product?.description}
            />
          </label>
        </div>
      </section>

      <div className="admin-form-columns">
        <section className="admin-form-card">
          <div className="admin-form-card-title">
            <span>價格與庫存</span>
            <p>金額使用新台幣整數。</p>
          </div>

          <div className="form-grid">
            <label>
              售價（NT$）
              <input
                name="price"
                type="number"
                min="0"
                required
                defaultValue={product?.price || 0}
              />
            </label>

            <label>
              原價／建議售價（選填）
              <input
                name="compareAtPrice"
                type="number"
                min="0"
                defaultValue={product?.compareAtPrice || ""}
              />
            </label>

            <label>
              庫存量
              <input
                name="stock"
                type="number"
                min="0"
                required
                defaultValue={product?.stock || 0}
              />
            </label>

            <label>
              商品狀態
              <select name="status" defaultValue={product?.status || "ACTIVE"}>
                <option value="ACTIVE">上架</option>
                <option value="INACTIVE">下架</option>
                <option value="DRAFT">草稿</option>
              </select>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured}
              />
              設為首頁推薦商品
            </label>
          </div>
        </section>

        <section className="admin-form-card">
          <div className="admin-form-card-title">
            <span>商品主圖</span>
            <p>建議使用正方形或 4:3 圖片，最大 5MB。</p>
          </div>

          <label className="image-uploader">
            {imageUrl ? (
              <img src={imageUrl} alt="商品預覽" />
            ) : (
              <div>
                <ImagePlus size={42} />
                <strong>點擊上傳商品圖片</strong>
                <small>JPG、PNG、WEBP、GIF</small>
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => upload(e.target.files?.[0])}
            />

            {uploading && (
              <span className="upload-overlay">
                <LoaderCircle className="spin" />
                上傳中
              </span>
            )}
          </label>

          <input type="hidden" value={imageUrl} readOnly />
        </section>
      </div>

      <section className="admin-form-card">
        <div className="admin-form-card-title with-action">
          <div>
            <span>規格參數</span>
            <p>商品詳情頁會以清楚的表格呈現。</p>
          </div>

          <button
            type="button"
            className="button button-outline small"
            onClick={() => setSpecs([...specs, { key: "", value: "" }])}
          >
            <Plus size={17} />
            新增規格
          </button>
        </div>

        <div className="spec-editor">
          {specs.map((row, index) => (
            <div key={index}>
              <input
                value={row.key}
                onChange={(e) =>
                  setSpecs(
                    specs.map((r, i) =>
                      i === index ? { ...r, key: e.target.value } : r
                    )
                  )
                }
                placeholder="規格名稱"
              />

              <input
                value={row.value}
                onChange={(e) =>
                  setSpecs(
                    specs.map((r, i) =>
                      i === index ? { ...r, value: e.target.value } : r
                    )
                  )
                }
                placeholder="規格內容"
              />

              <button
                type="button"
                onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="form-error">{error}</div>}

      <div className="admin-form-actions">
        <button
          type="button"
          className="button button-ghost"
          onClick={() => router.back()}
        >
          取消
        </button>

        <button
          type="submit"
          className="button button-primary"
          disabled={saving || uploading}
        >
          {saving ? (
            <>
              <LoaderCircle className="spin" size={20} />
              儲存中
            </>
          ) : (
            <>
              <Save size={20} />
              儲存商品
            </>
          )}
        </button>
      </div>
    </form>
  );
}