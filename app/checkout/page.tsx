import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "結帳" };

export default function CheckoutPage() {
  return <div className="container page-shell"><CheckoutForm /></div>;
}
