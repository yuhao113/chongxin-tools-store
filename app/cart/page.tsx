import type { Metadata } from "next";
import { CartPageClient } from "@/components/CartPageClient";

export const metadata: Metadata = { title: "購物車" };

export default function CartPage() {
  return <div className="container page-shell"><CartPageClient /></div>;
}
