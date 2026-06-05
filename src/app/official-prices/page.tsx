import type { Metadata } from "next";
import { OfficialPricesExplorer } from "@/components/OfficialPricesExplorer";
import { getOfficialPricesDataset } from "@/lib/official-prices-db";

export const metadata: Metadata = {
  title: "官方订阅地区价",
  description: "查看 ChatGPT、Claude、Gemini、Grok 在 Apple App Store 公开页面中的官方订阅地区价和人民币估算价。",
  alternates: {
    canonical: "/official-prices",
  },
  openGraph: {
    title: "PriceAI 官方订阅地区价",
    description: "用 App Store 公开价格做 AI 订阅官方地区价基准。",
    url: "https://priceai.cc/official-prices",
  },
};

export default async function OfficialPricesPage() {
  const dataset = await getOfficialPricesDataset();

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <OfficialPricesExplorer dataset={dataset} />
    </div>
  );
}
