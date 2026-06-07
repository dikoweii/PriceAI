import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  LifeBuoy,
  MessageCircle,
  ReceiptText,
  SearchCheck,
  ShieldAlert,
  Store,
} from "lucide-react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";

export const revalidate = 86400;

const pageUrl = "https://priceai.cc/guides/are-ai-subscription-card-shops-reliable";

export const metadata: Metadata = {
  title: "AI 订阅卡网渠道靠谱吗",
  description:
    "解释 AI 订阅卡网、发卡平台、第三方渠道和卖家的关系，整理购买前检查清单、大额交易建议、遇到问题后的处理方式，以及 PriceAI 的能力边界。",
  alternates: {
    canonical: "/guides/are-ai-subscription-card-shops-reliable",
  },
  openGraph: {
    title: "AI 订阅卡网渠道靠谱吗 | PriceAI",
    description: "卡网是信息源和交易入口，不等于 PriceAI 背书。购买前先看售后入口、商品描述、金额风险和投诉路径。",
    url: pageUrl,
  },
};

export default function AreAiSubscriptionCardShopsReliableGuide() {
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
                <ShieldAlert size={15} />
                第三方渠道指南
              </div>
              <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-normal text-[#202829] sm:text-5xl">
                AI 订阅卡网渠道靠谱吗？
              </h1>
              <p className="mt-5 max-w-[72ch] text-base leading-8 text-[#5a6061]">
                卡网本身更像信息源和交易入口，不能简单等同于可靠或不可靠。真正要判断的是背后的卖家、交付方式、售后能力、投诉路径，以及这笔交易是否符合你的风险承受能力。
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
                  href="/guides/why-ai-subscription-prices-differ"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:-translate-y-0.5 hover:bg-[#d3dcdd]"
                >
                  先理解价格分层
                  <ExternalLink size={15} />
                </Link>
              </div>
            </div>

            <aside className="rounded-lg bg-white p-5 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Quick answer</p>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                PriceAI 不卖货、不收款、不替渠道担保。它做的是把原始来源、标题、价格、库存和更新时间放到一起，让你购买前多一个核验入口。
              </p>
            </aside>
          </section>

          <section className="mt-10 rounded-lg bg-[#202829] p-6 text-[#f8f8f8] md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.7fr_1fr] md:items-start">
              <div>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8f8f8]/10 text-[#45bf78]">
                  <Store size={19} />
                </div>
                <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight tracking-normal">
                  先说结论：不要把“卡网”当成一个统一卖家。
                </h2>
              </div>
              <p className="text-sm leading-7 text-[#d7dddd]">
                一个卡网页面背后，可能是长期做 AI 订阅的个人、小团队、渠道商、代理，也可能只是短期销售某类权益的人。它和闲鱼、Telegram 群、私域链接类似，都是找到商品和卖家的线索。购买前要看的是人、商品、交付和售后，而不是只看网址形式。
              </p>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">卡网到底是什么？</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {cardShopBasics.map((item) => (
                <InfoCard key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="mt-12 overflow-hidden rounded-lg bg-white shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
            <div className="border-b border-[#edf0f1] px-5 py-4 sm:px-6">
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">购买前检查清单</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                这几项不是保证安全的充分条件，但能帮你排除很多明显不清楚的商品。
              </p>
            </div>
            <div className="divide-y divide-[#edf0f1]">
              {checklist.map((item) => (
                <ChecklistRow key={item.title} {...item} />
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-5 lg:grid-cols-[0.68fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">Risk control</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-normal text-[#202829]">
                金额越高，越不要只看低价直接下单。
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                小额商品可以理解成试错成本；大额代充、年卡、团队权益、Pro 或 API 大额额度，应该先把细节问清楚。
              </p>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f3ec] text-[#2f7a4b]">
                <MessageCircle size={18} />
              </div>
              <h3 className="mt-4 font-semibold text-[#202829]">大额交易建议</h3>
              <p className="mt-3 text-sm leading-7 text-[#5a6061]">
                建议先联系卖家沟通商品规格、交付方式、售后范围、退款条件等细节；沟通清楚后，再判断是否需要转到闲鱼或其他中介 / 担保型平台交易。
              </p>
              <p className="mt-3 text-sm leading-7 text-[#5a6061]">
                这不代表每个卖家都会接受转平台交易。小额自动发货商品或利润很低的商品，卖家可能不愿意额外沟通。你要做的是让交易金额和风险控制方式匹配。
              </p>
            </div>
          </section>

          <section className="mt-12 rounded-lg bg-white p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15 md:p-8">
            <div className="grid gap-6 md:grid-cols-[0.68fr_1fr] md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5a6061]">If it goes wrong</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight tracking-normal text-[#202829]">
                  如果遇到问题商品，先保留证据。
                </h2>
                <p className="mt-4 text-sm leading-7 text-[#5a6061]">
                  PriceAI 可以处理平台内展示和反馈线索，但无法替你追回订单，也不参与原渠道售后。
                </p>
              </div>
              <div className="grid gap-3">
                {afterSaleSteps.map((item, index) => (
                  <StepCard key={item.title} index={index + 1} title={item.title} text={item.text} />
                ))}
              </div>
            </div>
          </section>

          <section className="mt-12">
            <div className="grid gap-5 lg:grid-cols-2">
              <BoundaryCard
                title="PriceAI 能做什么"
                tone="good"
                items={[
                  "展示原始来源、商品名、价格、库存和更新时间。",
                  "外层最低价优先使用有货报价，减少缺货低价误导。",
                  "提供反馈入口，用来处理错价、下架、疑似欺诈和分类错误。",
                  "根据反馈隐藏单个报价、下架问题报价或停用问题渠道。",
                ]}
              />
              <BoundaryCard
                title="PriceAI 不能做什么"
                tone="warn"
                items={[
                  "不替任何渠道或卖家做安全背书。",
                  "不参与交易、收款、发货和原平台售后。",
                  "不承诺某个商品一定可用、一定稳定或一定能退款。",
                  "不能替用户追回损失，也不能代替原平台投诉流程。",
                ]}
              />
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
              <h2 className="font-serif text-2xl font-semibold tracking-normal text-[#202829]">理解风险边界后，再看当前有货价。</h2>
              <p className="mt-2 text-sm leading-6 text-[#5a6061]">
                价格仅供参考。购买前请回到原平台确认交付方式、售后规则、最终价格和投诉路径。
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/?stock=available"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#2d3435] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:bg-[#202829]"
              >
                查看有货报价
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/guides/chatgpt-subscription-options"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#dde4e5] px-5 text-sm font-semibold text-[#2d3435] transition hover:bg-[#d3dcdd]"
              >
                看 ChatGPT 获取方式
                <ExternalLink size={15} />
              </Link>
            </div>
          </section>
        </article>
      </main>
    </>
  );
}

function InfoCard({
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

function ChecklistRow({
  title,
  text,
  good,
  warning,
  icon,
}: {
  title: string;
  text: string;
  good: string;
  warning: string;
  icon: ReactNode;
}) {
  return (
    <div className="grid gap-4 px-5 py-5 sm:grid-cols-[52px_1fr] sm:px-6">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f2f4f4] text-[#2f7a4b]">{icon}</span>
      <div>
        <h3 className="font-semibold text-[#202829]">{title}</h3>
        <p className="mt-2 text-sm leading-7 text-[#5a6061]">{text}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-[#e8f3ec] px-4 py-3 text-sm leading-6 text-[#2f7a4b]">
            <span className="font-semibold">相对更清楚：</span>
            {good}
          </div>
          <div className="rounded-lg bg-[#fff7e8] px-4 py-3 text-sm leading-6 text-[#7a541b]">
            <span className="font-semibold">需要警惕：</span>
            {warning}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="grid gap-3 rounded-lg bg-[#f2f4f4] px-4 py-4 sm:grid-cols-[40px_1fr]">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202829] text-sm font-bold text-[#f8f8f8]">
        {index}
      </span>
      <div>
        <h3 className="font-semibold text-[#202829]">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-[#5a6061]">{text}</p>
      </div>
    </div>
  );
}

function BoundaryCard({ title, items, tone }: { title: string; items: string[]; tone: "good" | "warn" }) {
  const isGood = tone === "good";
  return (
    <div className="rounded-lg bg-white p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${isGood ? "bg-[#e8f3ec] text-[#2f7a4b]" : "bg-[#fff0ed] text-[#9b3328]"}`}>
        {isGood ? <SearchCheck size={18} /> : <AlertTriangle size={18} />}
      </div>
      <h2 className="mt-4 font-serif text-2xl font-semibold tracking-normal text-[#202829]">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm leading-6 text-[#5a6061]">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            {isGood ? (
              <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#2f7a4b]" />
            ) : (
              <ShieldAlert size={16} className="mt-1 shrink-0 text-[#9b3328]" />
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const cardShopBasics = [
  {
    title: "它是发卡 / 数字商品平台",
    text: "很多卡网负责展示商品、创建订单、自动发货、订单查询和投诉入口。",
    points: ["它承载交易流程", "不等于官方订阅平台", "也不等于 PriceAI 背书"],
    icon: <Store size={17} />,
  },
  {
    title: "背后是具体卖家或渠道",
    text: "同一个平台上可能有不同店铺、不同卖家、不同号源和不同售后能力。",
    points: ["要看店铺公告", "要看售后入口", "要看交付方式"],
    icon: <MessageCircle size={17} />,
  },
  {
    title: "它和其他信息源类似",
    text: "卡网、闲鱼、Telegram 群、私域链接、社区帖子都可能只是找到卖家的入口。",
    points: ["不要只看网址形式", "不要只看最低价", "最终回原站核验"],
    icon: <SearchCheck size={17} />,
  },
];

const checklist = [
  {
    title: "是否有售后入口",
    text: "优先看页面里有没有售后群、Telegram、微信、QQ、邮箱、店铺公告、订单查询或投诉入口。",
    good: "有公开联系方式、售后群、订单查询或平台投诉入口。",
    warning: "完全没有联系方式，或者只写自动发货但不说明售后规则。",
    icon: <LifeBuoy size={18} />,
  },
  {
    title: "商品描述是否具体",
    text: "同样写着 ChatGPT 会员，可能是直充、代充、卡密、成品号、Team 邀请或短期权益。",
    good: "明确 Plus / Pro / Team / 普号、交付方式、时效、质保和售后范围。",
    warning: "只写会员或低价，不写规格、交付方式、时效和限制条件。",
    icon: <ReceiptText size={18} />,
  },
  {
    title: "价格是否匹配风险",
    text: "价格特别低不一定是骗局，但通常意味着来源、时效、交付或售后规则需要额外确认。",
    good: "价格、权益、时效、售后和你的试错成本能匹配。",
    warning: "大额商品只因为便宜就下单，没有沟通交付和退款细节。",
    icon: <AlertTriangle size={18} />,
  },
  {
    title: "是否有投诉和举报路径",
    text: "很多发卡平台会提供订单投诉、举报、店铺封禁或延时到账机制。购买前先知道问题发生后去哪里处理。",
    good: "订单页可查询、可投诉，页面能看到平台或店铺处理路径。",
    warning: "付款后只剩一个不可核验链接，找不到订单、售后和投诉入口。",
    icon: <HelpCircle size={18} />,
  },
];

const afterSaleSteps = [
  {
    title: "保存证据",
    text: "保留订单号、支付记录、商品页面截图、购买链接、聊天记录和交付结果。",
  },
  {
    title: "回原平台投诉",
    text: "先在原卡网订单页、店铺售后或发卡平台投诉入口处理，不要只在第三方页面留言。",
  },
  {
    title: "向 PriceAI 反馈",
    text: "如果发现错价、下架、疑似欺诈、分类错误或跳转失效，可以通过商品详情页反馈，让平台侧隐藏或下架问题报价。",
  },
];

const faqs: Array<[string, string]> = [
  [
    "AI 订阅卡网渠道到底靠谱吗？",
    "不能简单说靠谱或不靠谱。卡网是信息源和交易入口，真正需要判断的是背后的卖家、商品交付方式、售后入口、投诉路径和交易金额。PriceAI 不替渠道担保，只帮助你看到更多可核验信息。",
  ],
  [
    "为什么第三方 AI 订阅会比官网便宜？",
    "常见原因包括官方地区价、资格权益、活动价、设备权益、代订服务、成品号、卡密、团队邀请、短期号或来源不透明的特殊低价。价格低不一定是骗局，但通常意味着限制条件和售后边界不同。",
  ],
  [
    "有售后群就一定安全吗？",
    "不是。有售后群或联系方式只是正向信号，说明用户至少有沟通入口。还要看群内反馈、卖家回应速度、商品描述是否清楚、订单投诉路径是否存在。",
  ],
  [
    "大额代充应该怎么降低风险？",
    "建议先联系卖家沟通商品规格、交付方式、售后范围、退款条件等细节。沟通清楚后，再判断是否需要转到闲鱼或其他中介 / 担保型平台交易。",
  ],
  [
    "如果买到问题商品怎么办？",
    "先保存订单、支付、商品页面和聊天证据，然后在原卡网订单页或发卡平台投诉入口处理。同时可以向 PriceAI 反馈对应商品或渠道，方便平台侧隐藏、下架或停用问题来源。",
  ],
  [
    "PriceAI 会判断某个渠道可信吗？",
    "PriceAI 当前不做渠道背书，不给出绝对可信结论。它更适合做购买前的信息整理：展示来源、价格、库存、更新时间、原始商品名和跳转链接，并处理用户反馈。",
  ],
];

function buildGuideJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "AI 订阅卡网渠道靠谱吗？",
      inLanguage: "zh-CN",
      url: pageUrl,
      description: "解释 AI 订阅卡网、发卡平台、第三方渠道和卖家的关系，以及购买前检查清单。",
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
        { "@type": "ListItem", position: 2, name: "指南", item: pageUrl },
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
