import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Clock3, ExternalLink, Info, Layers3, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { BrandIcon } from "@/components/BrandIcon";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { getExplorerData } from "@/lib/data";
import type { ExplorerProductSummary } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const revalidate = 300;

const pageUrl = "https://priceai.cc/platforms/chatgpt";
const chatgptProductIds = [
  "chatgpt-free-account",
  "chatgpt-plus",
  "chatgpt-team-business",
  "chatgpt-pro-5x",
  "chatgpt-pro-20x",
  "openai-api-cdk",
];

export const metadata: Metadata = {
  title: "ChatGPT 订阅与渠道价格",
  description:
    "查看 ChatGPT Plus、Pro、Team、普号和 API/CDK 的有货最低价、渠道数量、更新时间和获取方式说明。",
  alternates: {
    canonical: "/platforms/chatgpt",
  },
  openGraph: {
    title: "ChatGPT 订阅与渠道价格 | PriceAI",
    description: "购买 ChatGPT 订阅前，先比较 Plus、Pro、Team、普号和 API/CDK 的价格、来源和更新时间。",
    url: pageUrl,
  },
};

export default async function ChatGptPlatformPage() {
  const data = await getExplorerData();
  const products = data.products
    .filter((product) => chatgptProductIds.includes(product.id))
    .sort(compareChatGptProduct);
  const availableProducts = products.filter((product) => product.inStockCount > 0);
  const lowestProduct = availableProducts
    .filter((product) => product.lowestPrice !== null)
    .sort((a, b) => (a.lowestPrice ?? Number.POSITIVE_INFINITY) - (b.lowestPrice ?? Number.POSITIVE_INFINITY))[0] || null;
  const totalOffers = products.reduce((sum, product) => sum + product.offerCount, 0);
  const availableOffers = products.reduce((sum, product) => sum + product.inStockCount, 0);
  const latestSeenAt = latestDate(products.map((product) => product.latestSeenAt));

  return (
    <>
      <JsonLd data={buildChatGptPlatformJsonLd(products)} />
      <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
        <div className="sticky top-0 z-40 bg-[#f9f9f9]/95 shadow-[0_10px_24px_rgba(45,52,53,0.035)] backdrop-blur-xl">
          <SiteHeader />
        </div>

        <div className="mx-auto max-w-[1180px] px-5 pb-14 pt-8 sm:px-8 lg:pt-12">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.58fr)] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3ec] px-3 py-1.5 text-xs font-semibold text-[#2f7a4b] ring-1 ring-[#45bf78]/15">
                <BrandIcon platform="ChatGPT" className="h-4 w-4" />
                ChatGPT 平台价格页
              </div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-normal text-[#202829] sm:text-5xl">
                ChatGPT 订阅与渠道价格
              </h1>
              <p className="mt-5 max-w-[68ch] text-base leading-8 text-[#5a6061]">
                这里聚合 ChatGPT 普号、Plus、Pro、Team / Business 和相关 API/CDK 报价。你可以先看当前有货最低价和更新时间，再进入工具页查看全部原始渠道。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/?platform=ChatGPT&stock=available"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:-translate-y-0.5 hover:bg-[#202829]"
                >
                  查看 ChatGPT 有货报价
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/?platform=ChatGPT&scope=offers&stock=available"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:-translate-y-0.5 hover:bg-[#d3dcdd]"
                >
                  直接看全部报价
                  <Search size={16} />
                </Link>
              </div>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Live snapshot</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric label="标准商品" value={`${products.length}`} />
                <Metric label="有货报价" value={`${availableOffers}`} tone="good" />
                <Metric label="总报价" value={`${totalOffers}`} />
                <Metric label="最近更新" value={formatRelativeTime(latestSeenAt)} />
              </div>
              <div className="mt-4 rounded-lg bg-[#f2f4f4] p-4">
                <p className="text-xs font-semibold text-[#5a6061]">当前有货最低</p>
                <p className="mt-2 text-2xl font-bold text-[#202829]">
                  {lowestProduct ? formatCurrency(lowestProduct.lowestPrice, lowestProduct.lowestOffer?.currency) : "暂无有货"}
                </p>
                <p className="mt-1 text-sm text-[#5a6061]">
                  {lowestProduct ? `${lowestProduct.displayName} · ${lowestProduct.inStockCount} 条有货` : "可稍后再看或提交新渠道"}
                </p>
              </div>
              <p className="mt-4 text-xs leading-6 text-[#5a6061]">
                PriceAI 不卖货、不收款、不担保渠道。实际价格、库存、交付和售后规则以原平台为准。
              </p>
            </aside>
          </section>

          <section className="mt-10 overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
            <div className="border-b border-[#edf0f1] px-5 py-4 sm:px-6">
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">当前收录的 ChatGPT 标准商品</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                外层最低价只看有货报价。缺货或隐藏报价不会作为可购买最低价展示。
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#f2f4f4] text-xs font-semibold uppercase tracking-[0.12em] text-[#5a6061]">
                  <tr>
                    <th className="px-5 py-3">商品</th>
                    <th className="px-5 py-3">类型</th>
                    <th className="px-5 py-3">有货最低</th>
                    <th className="px-5 py-3">报价</th>
                    <th className="px-5 py-3">更新</th>
                    <th className="px-5 py-3">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#edf0f1]">
                  {products.map((product) => (
                    <tr key={product.id} className="align-top transition hover:bg-[#fbfcfc]">
                      <td className="px-5 py-4">
                        <div className="flex min-w-[220px] items-start gap-3">
                          <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2f4f4]">
                            <BrandIcon platform={product.platform} productId={product.id} className="h-5 w-5" />
                          </span>
                          <div>
                            <Link href={`/products/${product.slug}`} className="font-semibold text-[#202829] hover:underline">
                              {product.displayName}
                            </Link>
                            <p className="mt-1 max-w-[36ch] text-xs leading-5 text-[#5a6061]">{product.summary}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#5a6061]">{product.spec}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={product.inStockCount > 0 ? "font-bold text-[#2f7a4b]" : "font-semibold text-[#9b3328]"}>
                          {product.inStockCount > 0 ? formatCurrency(product.lowestPrice, product.lowestOffer?.currency) : "缺货"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#5a6061]">
                        {product.inStockCount} 有货 / {product.outOfStockCount} 缺货
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-[#5a6061]">{formatRelativeTime(product.latestSeenAt)}</td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-[#2d3435] px-4 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
                        >
                          详情
                          <ExternalLink size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12 grid gap-5 lg:grid-cols-[0.78fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Options</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-normal text-[#202829]">
                先弄清自己要买哪一种。
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                同样写着 ChatGPT，可能是普通账号、Plus 月卡、Pro 高倍率套餐、Team / Business 团队权益，或者 API/CDK 额度。先确认需求，再比价格。
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {optionCards.map((item) => (
                <InfoCard key={item.title} title={item.title} text={item.text} icon={item.icon} />
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-lg bg-[#202829] p-6 text-[#f8f8f8] md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.68fr_1fr] md:items-start">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f8f8]/10 text-[#45bf78]">
                  <ShieldAlert size={19} />
                </div>
                <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-normal">价格差异背后通常是路径差异。</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DarkCard title="官方订阅" text="通常更稳定，但国内用户可能还要处理外币卡、Apple ID、地区限制等问题。" />
                <DarkCard title="第三方渠道" text="可能更便宜，也可能有交付、售后、回收、封禁、下架等不确定性。" />
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">常见问题</h2>
            <div className="mt-6 divide-y divide-[#edf0f1] overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              {faqs.map(([question, answer]) => (
                <div key={question} className="px-5 py-5 sm:px-6">
                  <h3 className="font-semibold text-[#202829]">{question}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#5a6061]">{answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 flex flex-col gap-4 rounded-lg bg-[#f2f4f4] p-6 ring-1 ring-[#adb3b4]/15 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">第一次买 ChatGPT 订阅？</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                可以先理解价格为什么会分层，再看 ChatGPT 的具体获取方式；如果准备走第三方渠道，也先看风险边界。
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/guides/are-ai-subscription-card-shops-reliable"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#2d3435] ring-1 ring-[#adb3b4]/20 transition hover:bg-[#f5f7f7]"
              >
                卡网渠道靠谱吗
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/guides/why-ai-subscription-prices-differ"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:bg-[#d3dcdd]"
              >
                为什么价格不同
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/guides/chatgpt-subscription-options"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
              >
                查看新手指南
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function compareChatGptProduct(a: ExplorerProductSummary, b: ExplorerProductSummary): number {
  const aIndex = chatgptProductIds.indexOf(a.id);
  const bIndex = chatgptProductIds.indexOf(b.id);
  return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
}

function latestDate(values: Array<string | null | undefined>): string | null {
  const timestamps = values
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((value) => Number.isFinite(value));
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" }) {
  return (
    <div className="rounded-lg bg-[#f2f4f4] px-4 py-3">
      <p className="text-xs font-semibold text-[#5a6061]">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone === "good" ? "text-[#2f7a4b]" : "text-[#202829]"}`}>{value}</p>
    </div>
  );
}

function InfoCard({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_18px_45px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f3ec] text-[#2f7a4b]">{icon}</div>
      <h3 className="mt-4 font-semibold text-[#202829]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5a6061]">{text}</p>
    </div>
  );
}

function DarkCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-[#f8f8f8]/8 p-4 ring-1 ring-[#f8f8f8]/12">
      <h3 className="font-semibold text-[#f8f8f8]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#d7dddd]">{text}</p>
    </div>
  );
}

const optionCards = [
  {
    title: "普号",
    text: "通常是普通 OpenAI / ChatGPT 账号，不等于 Plus 或 Pro。适合只需要基础登录的人。",
    icon: <Info size={17} />,
  },
  {
    title: "Plus",
    text: "最常见的月度会员，渠道标题里可能写直充、代充、卡密、成品号或自助开通。",
    icon: <CheckCircle2 size={17} />,
  },
  {
    title: "Pro",
    text: "价格和权益更高，渠道里常见 5x、20x、100 刀、200 刀等描述，需要看清规格。",
    icon: <Layers3 size={17} />,
  },
  {
    title: "Team / Business",
    text: "团队或商业权益，可能以邀请、母号、自动拉等方式交付，和 Plus 不是同一种商品。",
    icon: <Clock3 size={17} />,
  },
];

const faqs: Array<[string, string]> = [
  [
    "ChatGPT Plus 和成品号要分开看吗？",
    "PriceAI 当前把 Plus 直充、代充、卡密、成品号等都归到 ChatGPT Plus，因为用户购买前最关心的是 Plus 权益和当前可买价格。具体交付方式仍需要看原始商品名和原平台说明。",
  ],
  [
    "为什么有些 ChatGPT 商品价格差很多？",
    "常见原因包括官方订阅、地区价、代订、成品号、团队权益、短期号、API/CDK 额度等路径不同。PriceAI 只做信息整理，不判断某个渠道一定安全。",
  ],
  [
    "外层最低价为什么只看有货报价？",
    "缺货或下架商品即使价格更低，也不能代表当前可购买价格。所以列表和平台摘要优先使用有货最低价，缺货会在详情中明确标注。",
  ],
  [
    "PriceAI 会直接卖 ChatGPT 订阅吗？",
    "不会。PriceAI 不卖货、不收款、不参与交易，只展示来源、价格、库存状态和更新时间，最终购买需要到原平台自行判断。",
  ],
];

function buildChatGptPlatformJsonLd(products: ExplorerProductSummary[]) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "ChatGPT 订阅与渠道价格",
      url: pageUrl,
      inLanguage: "zh-CN",
      description: "PriceAI 聚合 ChatGPT 普号、Plus、Pro、Team / Business 和 API/CDK 的渠道价格与更新时间。",
      hasPart: products.map((product) => ({
        "@type": "Product",
        name: product.displayName,
        url: `https://priceai.cc/products/${product.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PriceAI", item: "https://priceai.cc" },
        { "@type": "ListItem", position: 2, name: "ChatGPT", item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer,
        },
      })),
    },
  ];
}
