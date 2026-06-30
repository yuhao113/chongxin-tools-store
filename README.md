# 崇信電動工具 CHONGXIN 電商網站

完整的 Next.js 全端電商專案，包含前台商品瀏覽、購物車、結帳、銀行轉帳、LINE Pay、商品管理與訂單管理。

## 技術架構

- Next.js 16 App Router + React 19 + TypeScript
- PostgreSQL + Prisma ORM 7
- Next.js Route Handlers 作為後端 API
- 原生 CSS 響應式介面，不依賴 UI 框架
- HMAC 簽章 Cookie 保護管理後台
- LINE Pay Online API v4／v3，可由環境變數切換

## 已完成功能

### 前台

- 品牌首頁與崇信 Logo 配色
- 商品分類、關鍵字搜尋、價格與庫存排序
- 商品詳情、規格表、庫存狀態
- localStorage 購物車、數量調整、刪除與即時計價
- 滿 NT$3,000 免運，未滿固定運費 NT$100
- 收件資訊與付款方式結帳
- 銀行轉帳帳號顯示
- LINE Pay Request、Confirm、Cancel 流程
- 手機、平板與桌面 RWD

### 後台

- 管理員登入與 12 小時安全工作階段
- 商品新增、修改、圖片上傳、刪除／下架
- 商品列表直接快速改價、改庫存、切換上下架
- 儀表板：商品數、低庫存、待處理訂單、已付款營收
- 訂單列表與商品明細
- 手動修改付款、訂單、出貨狀態
- 訂單取消時自動回補庫存

## 快速啟動

### 1. 安裝環境

建議使用：

- Node.js 22 LTS
- Docker Desktop，或自行安裝 PostgreSQL 16+

### 2. 設定環境變數

```bash
cp .env.example .env
```

請至少修改：

```env
DATABASE_URL="postgresql://chongxin:change_me@localhost:5432/chongxin_store?schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="請換成強密碼"
ADMIN_SESSION_SECRET="至少32字元的隨機字串"
```

### 3. 啟動 PostgreSQL

```bash
docker compose up -d
```

### 4. 安裝、建表與建立示範商品

```bash
npm install
npm run prisma:deploy
npm run db:seed
```

### 5. 啟動網站

```bash
npm run dev
```

開啟：

- 前台：`http://localhost:3000`
- 後台：`http://localhost:3000/admin`
- Prisma Studio：執行 `npm run prisma:studio`

## LINE Pay 設定

在 `.env` 填寫：

```env
NEXT_PUBLIC_APP_URL="https://你的公開網域"
LINE_PAY_API_VERSION="4"
LINE_PAY_ENV="sandbox"
LINE_PAY_CHANNEL_ID="你的 Channel ID"
LINE_PAY_CHANNEL_SECRET="你的 Channel Secret"
```

測試時使用 `sandbox`；正式上線改為：

```env
LINE_PAY_ENV="production"
```

注意事項：

1. Confirm／Cancel URL 必須能被 LINE Pay 從網際網路連線，正式環境必須使用 HTTPS。
2. 本專案預設 Online API v4，以配合台灣電子支付機構相關流程；商店帳號若仍指定 v3，可將版本改為 `3`。
3. LINE Pay 交易 ID 可能超過 JavaScript 安全整數，本專案會轉為字串保存。
4. 已付款 LINE Pay 訂單若需自動退款，仍需額外串接 Refund API；目前後台會提示改至 LINE Pay 商店後台處理。

官方參考：

- Next.js Route Handlers：https://nextjs.org/docs/app/getting-started/route-handlers
- Prisma + Next.js：https://www.prisma.io/docs/guides/frameworks/nextjs
- LINE Pay Online API：https://developers-pay.line.me/online-api-v4
- LINE Pay Sandbox：https://developers-pay.line.me/sandbox

## 圖片上傳與部署

目前商品圖片會寫入：

```text
public/uploads/products/
```

這種方式適合：

- 自架 Linux 主機
- Docker 主機並掛載永久磁碟
- 傳統 Node.js 伺服器

若部署到 Vercel 等無永久檔案系統的平台，請把 `app/api/upload/route.ts` 改接 Cloudinary、Amazon S3、Cloudflare R2 或其他物件儲存服務。

## 正式上線前檢查

- 更換管理員帳號、密碼與 Session Secret
- 填寫門市電話、地址及銀行帳號
- 使用正式 PostgreSQL 與備份策略
- 設定 HTTPS 與正式網域
- 申請並填入 LINE Pay 正式商店憑證
- 使用永久圖片儲存空間
- 加入隱私權政策、退換貨條款、發票與物流規則
- 視營運需求加入 LINE Pay Refund API 與匯款末五碼回報欄位

## 專案結構

```text
app/
  api/                    後端 API
  admin/                  管理後台
  products/[slug]/        商品詳情
  cart/                   購物車
  checkout/               結帳
  order/[orderNo]/        訂單結果
components/               前台與後台元件
lib/                      Prisma、驗證、LINE Pay、權限與工具函式
prisma/                   資料庫 Schema 與 Seed
public/                    Logo、示範圖與上傳圖片
proxy.ts                  後台路由權限保護
```

## 常用指令

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:studio
npm run db:seed
```


## Docker 建置網站映像

```bash
docker build -t chongxin-tools-store .
```

執行容器時仍須傳入正式的 `DATABASE_URL` 與其他 `.env.example` 內的環境變數；Dockerfile 內的資料庫網址只供 Prisma 在建置階段產生 Client。
