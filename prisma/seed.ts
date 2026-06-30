import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

const products = [
  {
    name: "20V 無刷衝擊電鑽組",
    slug: "20v-brushless-impact-drill",
    sku: "CX-DRILL-20V-001",
    category: "電鑽",
    brand: "CHONGXIN",
    shortDesc: "高扭力無刷馬達，適合木工、鐵工與居家修繕。",
    description: "20V 無刷衝擊電鑽搭載高效率無刷馬達，提供穩定扭力與更長續航。雙速齒輪、可調扭力與 LED 工作燈，適合專業師傅與一般使用者。",
    specs: {
      電壓: "20V",
      最大扭力: "60 N·m",
      夾頭尺寸: "13 mm",
      空載轉速: "0–500 / 0–2,000 rpm",
      包裝內容: "主機、2 顆電池、充電器、工具箱"
    },
    price: 3980,
    compareAtPrice: 4580,
    stock: 18,
    imageUrl: "/demo/drill.svg",
    gallery: [],
    isFeatured: true,
    status: "ACTIVE" as const
  },
  {
    name: "4 吋無刷砂輪機",
    slug: "4-inch-brushless-angle-grinder",
    sku: "CX-GRINDER-4-001",
    category: "砂輪機",
    brand: "CHONGXIN",
    shortDesc: "輕量機身與防回彈保護，切割研磨更安心。",
    description: "專業級 4 吋無刷砂輪機，具備軟啟動、防回彈與過載保護。人體工學握把降低長時間作業疲勞，適用金屬切割、研磨與除鏽。",
    specs: {
      電壓: "20V",
      砂輪尺寸: "100 mm",
      空載轉速: "8,500 rpm",
      主軸牙規: "M10",
      安全功能: "軟啟動、防回彈、過載保護"
    },
    price: 3280,
    compareAtPrice: 3780,
    stock: 12,
    imageUrl: "/demo/grinder.svg",
    gallery: [],
    isFeatured: true,
    status: "ACTIVE" as const
  },
  {
    name: "20V 1/2 吋無刷電動扳手",
    slug: "20v-brushless-impact-wrench",
    sku: "CX-WRENCH-20V-001",
    category: "電動扳手",
    brand: "CHONGXIN",
    shortDesc: "高達 650 N·m 扭力，輪胎拆裝與機械維修皆適用。",
    description: "1/2 吋無刷衝擊扳手提供三段扭力控制與自動停止模式，有效降低螺帽過度鎖緊。適合汽修、鐵工與設備維護。",
    specs: {
      電壓: "20V",
      方頭: "1/2 吋",
      最大鎖緊扭力: "650 N·m",
      最大拆卸扭力: "850 N·m",
      模式: "三段速度＋自動停止"
    },
    price: 4680,
    compareAtPrice: 5280,
    stock: 9,
    imageUrl: "/demo/wrench.svg",
    gallery: [],
    isFeatured: true,
    status: "ACTIVE" as const
  },
  {
    name: "20V 5.0Ah 高容量鋰電池",
    slug: "20v-5ah-battery-pack",
    sku: "CX-BAT-20V-5AH",
    category: "電池與充電器",
    brand: "CHONGXIN",
    shortDesc: "電量指示與多重保護，通用崇信 20V 工具平台。",
    description: "高容量鋰電池搭載電芯溫度、過充、過放與短路保護。四段電量顯示方便掌握剩餘電力，可搭配崇信 20V 系列工具。",
    specs: {
      電壓: "20V",
      容量: "5.0Ah",
      電芯類型: "高放電鋰離子",
      電量顯示: "四段 LED",
      相容平台: "CHONGXIN 20V 系列"
    },
    price: 1880,
    compareAtPrice: null,
    stock: 30,
    imageUrl: "/demo/battery.svg",
    gallery: [],
    isFeatured: false,
    status: "ACTIVE" as const
  }
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: product,
      create: product
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
