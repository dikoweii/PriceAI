import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  ExternalLink,
  Layers3,
  Store,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandIcon } from "@/components/BrandIcon";
import { collectOfferFlags, getOfferPriceMeta } from "@/lib/catalog";
import { getProductGroup } from "@/lib/data";
import type { RawOffer } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductGroup(id);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <header className="sticky top-0 z-30 bg-[#f9f9f9]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a6061] hover:text-[#2d3435]">
            <ArrowLeft size={17} />
            返回首页
          </Link>
          <Link href="/" className="font-serif text-2xl font-bold tracking-normal text-[#4c4f50]">
            PriceAI
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1300px] px-5 py-8 sm:px-8 lg:py-12">
        <section className="rounded-lg bg-[#f2f4f4] p-6 shadow-[0_20px_60px_rgba(45,52,53,0.04)] lg:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{platformIcon(product.platform)} {product.platform}</Badge>
                <Badge>{product.productType}</Badge>
                <Badge>{product.spec}</Badge>
              </div>
              <h1 className="mt-5 font-serif text-4xl font-bold tracking-normal text-[#202829] md:text-5xl">
                {product.displayName}
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#5a6061]">{product.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[520px] lg:grid-cols-4">
              <Metric label="最低价" value={formatCurrency(product.lowestPrice, product.lowestOffer?.currency)} />
              <Metric label="有货" value={`${product.inStockCount}`} />
              <Metric label="缺货" value={`${product.outOfStockCount}`} />
              <Metric label="渠道" value={`${product.offerCount}`} />
            </div>
          </div>
        </section>

        {product.anomalyFlags.length ? (
          <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#fff7e8] px-5 py-4 text-sm leading-6 text-[#70511d] shadow-[0_12px_40px_rgba(45,52,53,0.035)]">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <span>提示：{product.anomalyFlags.join(" / ")}。价格、库存与售后请以原平台为准。</span>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#202829]">来源报价</h2>
            <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#5a6061]">
              {product.offers.length} offers · 只区分有货和缺货
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5a6061]">
            <Clock3 size={16} />
            最近记录 {formatRelativeTime(product.latestSeenAt)}
          </div>
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-2">
          {product.offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </section>

        <p className="mt-8 text-xs leading-6 text-[#5a6061]">
          免责声明：本站仅聚合公开页面或手动录入的报价信息，不参与交易，实际价格、库存、质保和售后规则以原平台为准。
        </p>
      </div>
    </main>
  );
}

function OfferCard({ offer }: { offer: RawOffer }) {
  const flags = collectOfferFlags(offer);
  const priceMeta = getOfferPriceMeta(offer);
  const isOutOfStock = offer.status === "out_of_stock";

  return (
    <article
      className={`relative overflow-hidden rounded-lg p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ${
        isOutOfStock ? "bg-[#f6f2f1] ring-[#e8b8b1]" : "bg-white ring-[#adb3b4]/15"
      }`}
    >
      {isOutOfStock ? <div className="absolute inset-x-0 top-0 h-1 bg-[#c75042]" /> : null}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f4f4] text-[#5e5e5e]">
            <Store size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#202829]">{offer.sourceStoreName || offer.sourceName}</p>
            <p className="mt-0.5 truncate text-[0.68rem] uppercase tracking-[0.14em] text-[#5a6061]">
              {isOutOfStock ? "缺货" : "有货"} · {formatRelativeTime(offer.verifiedAt || offer.lastSeenAt || offer.capturedAt || offer.sourceUpdatedAt)}
            </p>
          </div>
        </div>
        <StatusPill label={priceMeta.label} tone={priceMeta.tone} />
      </div>

      <h3 className={`font-serif text-2xl font-semibold leading-tight tracking-normal ${isOutOfStock ? "text-[#8f2f24]" : "text-[#202829]"}`}>
        {formatCurrency(offer.price, offer.currency)}
      </h3>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#5a6061]">{offer.sourceTitle}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <SourceStatus status={offer.status} stockCount={offer.stockCount} />
        <span className="rounded-full bg-[#f2f4f4] px-3 py-1.5 text-xs font-medium text-[#5a6061]">
          {formatRelativeTime(offer.verifiedAt || offer.lastSeenAt || offer.capturedAt || offer.sourceUpdatedAt)}
        </span>
        {flags.map((flag) => (
          <span key={flag} className="rounded-full bg-[#fff7e8] px-3 py-1.5 text-xs font-medium text-[#7a541b]">
            {flag}
          </span>
        ))}
      </div>

      <a
        href={offer.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:opacity-90 ${
          isOutOfStock
            ? "bg-[#ead8d5] text-[#8f2f24]"
            : "bg-gradient-to-br from-[#5e5e5e] to-[#525252] text-[#f8f8f8]"
        }`}
      >
        {isOutOfStock ? "查看原页面" : "前往购买"}
        <ExternalLink size={16} />
      </a>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-4 py-3 shadow-[0_12px_35px_rgba(45,52,53,0.035)] ring-1 ring-[#adb3b4]/15">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#202829]">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5a6061] ring-1 ring-[#adb3b4]/15">
      {children}
    </span>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone?: "good" | "warn" | "info" | "muted" | "danger";
}) {
  const toneClass = tone
    ? {
        good: "bg-[#e8f3ec] text-[#2f7a4b]",
        warn: "bg-[#fff7e8] text-[#7a541b]",
        info: "bg-[#eef3f8] text-[#47657a]",
        muted: "bg-[#e4e9ea] text-[#5a6061]",
        danger: "bg-[#fbe9e7] text-[#9b3328]",
      }[tone]
    : null;

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
        toneClass || "bg-[#eef3f8] text-[#47657a]"
      }`}
    >
      {label}
    </span>
  );
}

function SourceStatus({ status, stockCount }: { status: string; stockCount?: number | null }) {
  const className: Record<string, string> = {
    in_stock: "bg-[#e8f3ec] text-[#2f7a4b]",
    low_stock: "bg-[#e8f3ec] text-[#2f7a4b]",
    out_of_stock: "bg-[#f2f4f4] text-[#5a6061]",
    unknown: "bg-[#e8f3ec] text-[#2f7a4b]",
  };
  const label: Record<string, string> = {
    in_stock: "有货",
    low_stock: "有货",
    out_of_stock: "缺货",
    unknown: "有货",
  };

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-medium ${className[status] || className.unknown}`}>
      {label[status] || label.unknown}
      {typeof stockCount === "number" ? ` · ${stockCount}` : ""}
    </span>
  );
}

function platformIcon(platform: string) {
  const className = "h-[15px] w-[15px]";

  if (platform !== "其他") return <BrandIcon platform={platform} className={className} />;
  return <Layers3 className={`${className} text-[#5a6061]`} />;
}
