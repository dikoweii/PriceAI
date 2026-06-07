import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, CreditCard, ExternalLink, Gift, HelpCircle, Layers3, ShieldAlert, Tags } from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";

export const revalidate = 86400;

const pageUrl = "https://priceai.cc/guides/why-ai-subscription-prices-differ";

export const metadata: Metadata = {
  title: "为什么 AI 订阅价格差这么多",
  description:
    "解释 AI 订阅的官网正价、官方地区价/资格价/活动价、代订/代充服务价和第三方渠道价，帮助中文用户理解低价来源与风险边界。",
  alternates: {
    canonical: "/guides/why-ai-subscription-prices-differ",
  },
  openGraph: {
    title: "为什么 AI 订阅价格差这么多 | PriceAI",
    description: "先理解官网正价、官方地区价、代充服务价和第三方渠道价，再回到 PriceAI 查看当前有货报价。",
    url: pageUrl,
  },
};

export default function WhyAiSubscriptionPricesDifferGuide() {
  return (
    <>
      <JsonLd data={buildGuideJsonLd()} />
      <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
        <div className="sticky top-0 z-40 bg-[#f9f9f9]/95 shadow-[0_10px_24px_rgba(45,52,53,0.035)] backdrop-blur-xl">
          <SiteHeader />
        </div>

        <article className="mx-auto max-w-[1080px] px-5 pb-14 pt-8 sm:px-8 lg:pt-12">
          <section className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_310px] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f3ec] px-3 py-1.5 text-xs font-semibold text-[#2f7a4b] ring-1 ring-[#45bf78]/15">
                <Layers3 size={15} />
                价格分层指南
              </div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-normal text-[#202829] sm:text-5xl">
                为什么 AI 订阅价格差这么多？
              </h1>
              <p className="mt-5 max-w-[72ch] text-base leading-8 text-[#5a6061]">
                同样是 ChatGPT Plus、Gemini Pro 或 Claude Pro，你可能会看到官网正价、地区价、学生权益价、代充价、成品号价、卡密价和一些特别低的渠道价。它们不一定是同一种东西，先看懂来源，再决定要不要购买。
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:-translate-y-0.5 hover:bg-[#202829]"
                >
                  回到比价工具
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/official-prices"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:-translate-y-0.5 hover:bg-[#d3dcdd]"
                >
                  查看官方地区价
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Quick answer</p>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                AI 订阅价格通常不是单一市场。你看到的低价可能来自官方地区差异、资格权益、代订服务、账号库存、卡密/CDK、试用权益，或来源不透明的特殊渠道。
              </p>
            </aside>
          </section>

          <section className="mt-10 rounded-lg bg-[#202829] p-6 text-[#f8f8f8] md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.72fr_1fr] md:items-start">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f8f8]/10 text-[#45bf78]">
                  <ShieldAlert size={19} />
                </div>
                <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-normal">
                  先说结论：便宜背后通常是路径不同。
                </h2>
              </div>
              <p className="text-sm leading-7 text-[#d7dddd]">
                官网正价、官方地区价、代订服务价和第三方渠道价会混在同一个市场里。价格低不一定是骗局，但通常意味着交付方式、限制条件、售后规则和风险边界不同。PriceAI 不卖货、不担保，只把价格、来源、库存和更新时间放到一起。
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">小白先记住这三层价格</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {priceLayers.map((item) => (
                <LayerCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="mt-12 overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
            <div className="border-b border-[#edf0f1] px-5 py-4 sm:px-6">
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">更准确地看，可以拆成四类来源</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                三层价格适合入门理解；真正做比价和判断时，还要看它到底是官方基准、官方差异、代订服务，还是第三方权益。
              </p>
            </div>
            <div className="divide-y divide-[#edf0f1]">
              {sourceModels.map((item) => (
                <SourceRow key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="mt-12">
            <div className="grid gap-5 lg:grid-cols-[0.68fr_1fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Reasons</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-normal text-[#202829]">
                  价格差异通常来自这些原因。
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                  很多时候，不是同一个商品突然变便宜了，而是支付方式、地区、资格、交付方式或渠道库存发生了变化。
                </p>
              </div>
              <div className="grid gap-3">
                {reasons.map((item) => (
                  <ReasonCard key={item.title} title={item.title} text={item.text} />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-lg bg-white p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15 md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.68fr_1fr] md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">PriceAI</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-normal text-[#202829]">
                  PriceAI 能帮你做什么？
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                  它不能替你判断某个卖家一定可靠，但可以让你在购买前少依赖单一渠道说法。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {priceAiHelps.map((text) => (
                  <div key={text} className="flex gap-2 rounded-lg bg-[#f2f4f4] px-4 py-3 text-sm leading-6 text-[#5a6061]">
                    <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#2f7a4b]" />
                    <span>{text}</span>
                  </div>
                ))}
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
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">理解价格来源后，再看当前有货价。</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">外层最低价只取有货报价；如果准备看第三方渠道，也可以先了解卡网的风险边界。</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/guides/are-ai-subscription-card-shops-reliable"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:bg-[#d3dcdd]"
              >
                卡网渠道靠谱吗
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/?stock=available"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
              >
                查看有货报价
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function LayerCard({
  title,
  text,
  points,
  icon,
}: {
  title: string;
  text: string;
  points: string[];
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-[0_18px_45px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f3ec] text-[#2f7a4b]">{icon}</div>
      <h3 className="mt-4 font-semibold text-[#202829]">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-[#5a6061]">{text}</p>
      <ul className="mt-4 space-y-2 text-sm text-[#5a6061]">
        {points.map((point) => (
          <li key={point} className="flex gap-2">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#2f7a4b]" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceRow({
  title,
  text,
  examples,
  icon,
}: {
  title: string;
  text: string;
  examples: string[];
  icon: ReactNode;
}) {
  return (
    <div className="grid gap-4 px-5 py-5 sm:grid-cols-[52px_1fr] sm:px-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f4] text-[#2f7a4b]">{icon}</span>
      <div>
        <h3 className="font-semibold text-[#202829]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#5a6061]">{text}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <span key={example} className="rounded-full bg-[#f2f4f4] px-3 py-1 text-xs font-semibold text-[#5a6061]">
              {example}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReasonCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg bg-white px-5 py-4 shadow-[0_16px_40px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15">
      <h3 className="font-semibold text-[#202829]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#5a6061]">{text}</p>
    </div>
  );
}

const priceLayers = [
  {
    title: "官网正价",
    text: "用户自己从官网或官方 App 内订阅时看到的标准价格。路径最清楚，但国内用户常常会遇到支付和地区门槛。",
    points: ["规则和权益最清楚", "通常适合长期使用", "可能需要外币卡或地区账号"],
    icon: <CreditCard size={17} />,
  },
  {
    title: "官方地区 / 资格 / 活动价",
    text: "来自官方地区定价、学生资格、教育权益、设备赠送、新账号试用或限时活动。它可能是官方体系内的低价，但通常有条件。",
    points: ["不等于所有人都能开通", "可能有身份或地区限制", "活动和资格可能失效"],
    icon: <Gift size={17} />,
  },
  {
    title: "第三方渠道价",
    text: "卡网、代充、成品号、卡密、CDK、团队邀请、试用号和特殊低价都可能混在这里。价格可能更低，但交付方式差异很大。",
    points: ["要看原始商品名", "要确认售后和有效期", "不要只看最低价"],
    icon: <Tags size={17} />,
  },
];

const sourceModels = [
  {
    title: "官方基准价",
    text: "用来理解一个 AI 订阅的标准价格区间，例如官网或官方 App 内展示的价格。它是参照物，不一定是每个中文用户最容易购买的路径。",
    examples: ["官网价", "官方 App 内价格", "公开价格页"],
    icon: <CreditCard size={18} />,
  },
  {
    title: "官方差异价",
    text: "仍然可能来自官方规则，但因为地区、资格、设备、活动或支付渠道不同而产生差异。它解释了为什么市场里会出现低于常见官网价的来源。",
    examples: ["地区价", "学生权益", "设备权益", "新账号试用"],
    icon: <Layers3 size={18} />,
  },
  {
    title: "代订 / 代充服务价",
    text: "卖家帮用户完成官方订阅、地区价订阅、App Store 内购、礼品卡充值或外币卡支付。用户支付的是订阅成本、服务成本和渠道利润的组合。",
    examples: ["官网代订", "地区价代充", "Apple ID 内购", "礼品卡代充"],
    icon: <HelpCircle size={18} />,
  },
  {
    title: "第三方权益 / 账号 / 特殊渠道价",
    text: "交付的可能是账号、团队邀请、卡密、兑换码、试用权益、教育权益或来源不透明的低价资源。PriceAI 只解释它们存在，不提供获取或利用方法。",
    examples: ["成品号", "卡密 / CDK", "Team 邀请", "特殊低价"],
    icon: <ShieldAlert size={18} />,
  },
];

const reasons = [
  {
    title: "支付门槛",
    text: "官网订阅可能需要外币卡、海外支付账号、对应地区 Apple ID / Google Play 或礼品卡，所以卖家会把支付能力包装成代订服务。",
  },
  {
    title: "地区定价",
    text: "部分产品在不同国家或地区有不同公开价格，但地区价还会受到税费、汇率、账号地区和支付方式影响。",
  },
  {
    title: "资格和活动",
    text: "学生、教育、设备赠送、新账号试用、限时促销都可能带来低价，但通常有身份、时效或账号条件限制。",
  },
  {
    title: "交付方式",
    text: "同样写着 Plus，可能是直充、代充、成品号、团队邀请、卡密或短期试用号。价格不同，经常是因为商品本身就不是同一种交付。",
  },
  {
    title: "库存和渠道成本",
    text: "批量账号、批量权益、代理渠道或库存清理会造成低价，但也可能伴随售后弱、时效短、下架快等问题。",
  },
  {
    title: "来源不透明资源",
    text: "有些特殊低价可能依赖临时规则、试用权益、资格漏洞或短期库存。PriceAI 不把它们当作稳定购买路径。",
  },
];

const priceAiHelps = [
  "展示当前有货最低价，缺货报价不参与外层最低价。",
  "保留原始商品名，避免把不同交付方式完全抹平。",
  "展示来源渠道和跳转链接，方便回到原站核验。",
  "展示更新时间，减少旧价格误导。",
  "通过指南解释官网价、地区价、代充、成品号和卡密的区别。",
  "提供反馈入口，用来处理错价、下架、疑似欺诈和分类错误。",
];

const faqs: Array<[string, string]> = [
  [
    "为什么 AI 订阅价格差这么多？",
    "因为用户看到的可能不是同一种价格。官网正价、官方地区价、资格价、代充服务价、成品号、卡密、试用权益、教育权益、设备权益和第三方渠道价都会混在一起。价格低不一定是骗局，但通常意味着交付方式、限制条件、售后规则和风险不同。",
  ],
  [
    "官方地区价算不算官方价格？",
    "如果价格来自官方定价体系或官方 App 内价格，它可以理解为官方价格的一部分。但地区价通常有账号地区、支付方式、税费、汇率和平台规则限制，不代表所有人都能直接稳定开通。",
  ],
  [
    "代充为什么有时比官网便宜？",
    "代充可能基于地区价、礼品卡、外币卡、当地支付方式、批量渠道或卖家的支付环境。用户支付的不是单纯订阅本身，也包含卖家的操作成本、失败处理、售后和利润。",
  ],
  [
    "成品号为什么便宜？",
    "成品号交付的是一个账号或账号权益，而不是一定给你的原账号开通官方订阅。它可能来自库存号、试用权益、团队权益、资格权益或其他来源，所以价格、账号归属、稳定性和售后都要单独判断。",
  ],
  [
    "所谓 bug 号或特殊低价能不能买？",
    "PriceAI 不把 bug 号或来源不透明的特殊低价当成稳定购买路径，也不提供获取方法。如果用户看到这类极低价，应重点确认时效、账号归属、售后、退款条件和失败处理。",
  ],
  [
    "为什么不能只看最低价？",
    "因为最低价可能对应的是不同交付方式：直充、成品号、卡密、团队邀请、共享号、试用权益的风险和适用场景都不同。最低价只说明它便宜，不说明它最适合你。",
  ],
];

function buildGuideJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "为什么 AI 订阅价格差这么多？",
      inLanguage: "zh-CN",
      url: pageUrl,
      description: "解释 AI 订阅的官网正价、官方地区价、代订服务价和第三方渠道价。",
      author: {
        "@type": "Organization",
        name: "PriceAI",
      },
      publisher: {
        "@type": "Organization",
        name: "PriceAI",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "PriceAI", item: "https://priceai.cc" },
        { "@type": "ListItem", position: 2, name: "指南", item: "https://priceai.cc/guides/why-ai-subscription-prices-differ" },
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
