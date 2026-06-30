# 專案交付說明

## 已完成範圍

- Next.js App Router 前後端整合
- PostgreSQL / Prisma 7 資料模型、初始 migration 與示範商品 seed
- 前台首頁、篩選、搜尋、排序、商品詳情、購物車、結帳與 RWD
- 銀行轉帳與 LINE Pay Request / Confirm / Cancel 流程
- 管理員登入、商品 CRUD、快速改價／庫存／上下架
- 訂單付款、訂單與出貨狀態管理，取消訂單回補庫存
- 品牌 Logo、科技藍／亮橘／工業灰視覺
- Dockerfile、PostgreSQL docker-compose 與完整 README

## 包裝前檢查

- ESLint：通過，僅保留動態商品圖片使用原生 `<img>` 的效能建議警告
- TypeScript strict type check：通過
- Next.js production build：通過

本包裝環境無法解析 `binaries.prisma.sh`，因此未把暫時的 compile-only Prisma stub 放入交付檔。使用者在一般可連網環境執行 `npm install` 時，`postinstall` 會依 `prisma/schema.prisma` 產生正式 Prisma Client。

## 正式營運前仍需提供

- PostgreSQL 正式連線資料
- 管理員帳號、密碼與 Session Secret
- 公司電話、地址、銀行及匯款帳號
- LINE Pay Sandbox／正式 Channel ID 與 Channel Secret
- 正式 HTTPS 網域
