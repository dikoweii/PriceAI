import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PriceExplorer } from "@/components/PriceExplorer";
import { SubmissionFloater } from "@/components/SubmissionFloater";
import { getExplorerData } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI 订阅与模型 API 获取成本雷达",
  description:
    "PriceAI 聚合 AI 订阅渠道、官方订阅地区价和模型 API 获取入口，查看 ChatGPT、Claude、Gemini、Grok 等有货最低价、来源和更新时间。",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PriceAI | AI 订阅与模型 API 获取成本雷达",
    description: "购买 AI 订阅或接入模型 API 前，先比较价格、来源、库存和更新时间。",
    url: "https://priceai.cc",
  },
};

export default async function Home() {
  const data = await getExplorerData();

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <PriceExplorer data={data} restoreStateFromUrl />
      <SubmissionFloater />
    </>
  );
}

function buildHomeJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PriceAI",
      url: "https://priceai.cc",
      inLanguage: "zh-CN",
      description:
        "PriceAI 是 AI 订阅与模型 API 的获取成本雷达，聚合 AI 订阅渠道、官方地区价和模型 API 获取入口。",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://priceai.cc/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "PriceAI 是卖 AI 订阅的吗？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "不是。PriceAI 不卖货、不收款、不参与交易，只整理公开或审核通过的价格和来源信息。",
          },
        },
        {
          "@type": "Question",
          name: "PriceAI 的最低价怎么计算？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "外层最低价优先使用当前有货报价的最低价。缺货、下架或隐藏的报价不应作为可购买最低价展示。",
          },
        },
        {
          "@type": "Question",
          name: "PriceAI 是否支持模型 API？",
          acceptedAnswer: {
            "@type": "Answer",
            text: "支持。PriceAI 的模型 API 页面整理官方 API、公开模型路由、免费 API、Token Plan、价格和限制。",
          },
        },
      ],
    },
  ];
}
