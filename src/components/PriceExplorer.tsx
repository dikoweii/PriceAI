"use client";

import {
  ArrowUpDown,
  CheckCircle2,
  ChevronRight,
  Database,
  Filter,
  Layers3,
  PackageCheck,
  Search,
  Store,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { BrandIcon } from "@/components/BrandIcon";
import { collectOfferFlags, platformOptions, productTypeOptions } from "@/lib/catalog";
import type { DashboardData, ProductGroup } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

type SortMode = "available_price" | "price" | "updated" | "channels";

const productTypeLabels: Record<string, string> = {
  全部: "全部",
  会员充值: "会员充值 (Subs)",
  成品号: "成品号 (Ready)",
  "共享/镜像": "共享/镜像",
  "卡密/CDK": "卡密/CDK",
  "邮箱/账号": "邮箱/账号",
  API额度: "API额度",
  其他: "其他",
};

export function PriceExplorer({ data }: { data: DashboardData }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState("全部");
  const [productType, setProductType] = useState("全部");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState<SortMode>("available_price");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    const filtered = data.products.filter((product) => {
      const haystack = [
        product.displayName,
        product.platform,
        product.productType,
        product.spec,
        product.summary,
        ...product.aliases,
        ...product.offers.flatMap((offer) => [
          offer.sourceTitle,
          offer.sourceName,
          offer.sourceStoreName || "",
        ]),
      ]
        .join(" ")
        .toLowerCase();

      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      if (platform !== "全部" && product.platform !== platform) return false;
      if (productType !== "全部" && product.productType !== productType) return false;
      if (stock === "available" && product.inStockCount === 0) return false;
      if (stock === "out_of_stock" && product.outOfStockCount === 0) return false;

      if (min !== null || max !== null) {
        const hasPrice = product.offers.some((offer) => {
          if (offer.price === null) return false;
          if (min !== null && offer.price < min) return false;
          if (max !== null && offer.price > max) return false;
          return true;
        });

        if (!hasPrice) return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "channels") return b.offerCount - a.offerCount;
      if (sort === "updated") return (b.latestSeenAt || "").localeCompare(a.latestSeenAt || "");
      if (sort === "price") {
        return (a.lowestPrice ?? Number.MAX_SAFE_INTEGER) - (b.lowestPrice ?? Number.MAX_SAFE_INTEGER);
      }

      const stockDelta = Number(b.inStockCount > 0) - Number(a.inStockCount > 0);
      if (stockDelta !== 0) return stockDelta;

      return (a.lowestPrice ?? Number.MAX_SAFE_INTEGER) - (b.lowestPrice ?? Number.MAX_SAFE_INTEGER);
    });
  }, [data.products, maxPrice, minPrice, platform, productType, query, sort, stock]);

  const totalAvailable = data.products.reduce((sum, product) => sum + product.inStockCount, 0);
  const totalOutOfStock = data.products.reduce((sum, product) => sum + product.outOfStockCount, 0);
  const title = buildTitle(platform, productType);

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#2d3435]">
      <header className="sticky top-0 z-30 bg-[#f9f9f9]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <Link href="/" className="font-serif text-3xl font-bold tracking-normal text-[#4c4f50]">
            PriceAI
          </Link>
          <div className="hidden items-center gap-3 lg:flex">
            <Metric label="标准商品" value={data.products.length.toString()} icon={<PackageCheck size={15} />} />
            <Metric label="报价" value={data.rawOffers.length.toString()} icon={<Database size={15} />} />
            <Metric label="有货" value={totalAvailable.toString()} icon={<CheckCircle2 size={15} />} />
            <Metric label="缺货" value={totalOutOfStock.toString()} icon={<Store size={15} />} />
          </div>
        </div>
      </header>

      <section className="sticky top-[72px] z-20 bg-[#f2f4f4]/90 px-5 py-6 backdrop-blur-xl sm:px-8">
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {["全部", ...platformOptions].map((item) => (
              <TabPill
                key={item}
                active={platform === item}
                icon={platformIcon(item)}
                label={item}
                onClick={() => setPlatform(item)}
              />
            ))}
          </div>

          <div className="flex gap-7 overflow-x-auto text-sm">
            {["全部", ...productTypeOptions].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setProductType(item)}
                className={`shrink-0 border-b-2 pb-2 transition ${
                  productType === item
                    ? "border-[#5e5e5e] font-semibold text-[#2d3435]"
                    : "border-transparent text-[#5a6061] hover:text-[#2d3435]"
                }`}
              >
                {productTypeLabels[item] || item}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:py-12">
        {!data.configured ? (
          <div className="mb-8 rounded-lg bg-[#fff7e8] px-5 py-4 text-sm text-[#6a4b16] shadow-[0_18px_50px_rgba(45,52,53,0.04)]">
            当前使用内置演示数据。配置 Supabase 后，可在后台导入 Aibijia 和保存真实采集结果。
          </div>
        ) : null}

        <div className="mb-9 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold tracking-normal text-[#202829] md:text-5xl">
              {title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 font-label text-[0.72rem] font-medium uppercase tracking-[0.18em] text-[#5a6061]">
              <span>Last updated: {formatRelativeTime(data.generatedAt)}</span>
              <span className="h-1 w-1 rounded-full bg-[#adb3b4]" />
              <span>{products.length} groups</span>
              <span className="h-1 w-1 rounded-full bg-[#adb3b4]" />
              <span>主价格为最低价，缺货会明显标注</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex h-11 min-w-0 items-center gap-2 rounded-full bg-white px-4 shadow-[0_16px_45px_rgba(45,52,53,0.05)] ring-1 ring-[#adb3b4]/15 sm:w-[320px]">
              <Search size={16} className="shrink-0 text-[#5a6061]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索 ChatGPT、Gemini、邮箱"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa2a3]"
              />
            </label>
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#e4e9ea] px-5 text-sm font-semibold text-[#2d3435] transition hover:bg-[#dde4e5]"
            >
              <Filter size={17} />
              Filter
            </button>
            <label className="inline-flex h-11 items-center gap-2 rounded-full bg-[#e4e9ea] px-5 text-sm font-semibold text-[#2d3435]">
              <ArrowUpDown size={17} />
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortMode)}
                className="bg-transparent text-sm outline-none"
              >
                <option value="available_price">有货 + 低价</option>
                <option value="price">价格从低到高</option>
                <option value="updated">最近更新</option>
                <option value="channels">渠道数量</option>
              </select>
            </label>
          </div>
        </div>

        {filtersOpen ? (
          <div className="mb-8 grid gap-3 rounded-lg bg-[#f2f4f4] p-4 shadow-[0_18px_50px_rgba(45,52,53,0.04)] sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="库存"
              value={stock}
              onChange={setStock}
              options={[
                ["all", "全部报价"],
                ["available", "有货"],
                ["out_of_stock", "缺货"],
              ]}
            />
            <PriceInput label="最低价" value={minPrice} onChange={setMinPrice} />
            <PriceInput label="最高价" value={maxPrice} onChange={setMaxPrice} />
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPlatform("全部");
                setProductType("全部");
                setStock("all");
                setSort("available_price");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="h-12 self-end rounded-full bg-white px-4 text-sm font-semibold text-[#2d3435] shadow-[0_12px_35px_rgba(45,52,53,0.04)] ring-1 ring-[#adb3b4]/15 transition hover:bg-[#dde4e5]"
            >
              重置筛选
            </button>
          </div>
        ) : null}

        {products.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(45,52,53,0.05)] ring-1 ring-[#adb3b4]/15">
            <p className="font-serif text-2xl font-semibold text-[#202829]">没有符合条件的报价</p>
            <p className="mt-3 text-sm text-[#5a6061]">放宽筛选条件，或者在后台补录新的来源与商品。</p>
          </div>
        )}
      </main>

      <footer className="px-5 py-8 text-center text-xs leading-6 text-[#5a6061] sm:px-8">
        价格仅供参考，实际价格、库存和售后规则以原平台为准。本工具不构成购买建议。
      </footer>
    </div>
  );
}

function ProductCard({ product }: { product: ProductGroup }) {
  const previewOffer = product.lowestOffer || product.offers[0];
  const flags = previewOffer ? collectOfferFlags(previewOffer).slice(0, 2) : [];

  return (
    <article className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-lg bg-white p-6 shadow-[0_20px_55px_rgba(45,52,53,0.045)] ring-1 ring-[#adb3b4]/15 transition hover:-translate-y-0.5 hover:shadow-[0_24px_65px_rgba(45,52,53,0.07)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f2f4f4] text-[#5e5e5e]">
            {platformIcon(product.platform)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#202829]">{previewOffer?.sourceStoreName || previewOffer?.sourceName || product.platform}</p>
            <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.14em] text-[#5a6061]">{product.platform}</p>
          </div>
        </div>
        <StatusPill
          label={product.lowestPriceLabel}
          tone={product.lowestPriceTone}
        />
      </div>

      <Link href={`/products/${product.slug}`} className="block">
        <h2 className="font-serif text-2xl font-semibold leading-tight tracking-normal text-[#202829] transition group-hover:text-[#5e5e5e]">
          {product.displayName}
        </h2>
      </Link>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#5a6061]">{product.summary}</p>

      <div className={`mt-7 rounded-lg px-4 py-3 ${pricePanelClass(product.lowestPriceTone)}`}>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]">{product.lowestPriceLabel}</p>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-4xl font-bold tracking-normal">
            {formatCurrency(product.lowestPrice, previewOffer?.currency)}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <CountBadge tone="good">有货 {product.inStockCount}</CountBadge>
        <CountBadge tone="danger">缺货 {product.outOfStockCount}</CountBadge>
        <CountBadge tone="muted">渠道 {product.offerCount}</CountBadge>
      </div>

      {previewOffer ? (
        <div className="mt-5 min-h-[42px] text-xs leading-5 text-[#5a6061]">
          <p className="line-clamp-2">{previewOffer.sourceTitle}</p>
          {flags.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {flags.map((flag) => (
                <span key={flag} className="rounded-full bg-[#fff7e8] px-2 py-1 font-medium text-[#7a541b]">
                  {flag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto pt-6">
        <Link
          href={`/products/${product.slug}`}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#5e5e5e] to-[#525252] px-5 text-sm font-semibold text-[#f8f8f8] transition hover:opacity-90"
        >
          查看对比
          <ChevronRight size={17} />
        </Link>
      </div>
    </article>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="rounded-lg bg-[#f2f4f4] px-4 py-2.5">
      <div className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-bold text-[#202829]">{value}</p>
    </div>
  );
}

function TabPill({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm transition ${
        active
          ? "bg-[#dde4e5] font-semibold text-[#2d3435]"
          : "bg-transparent text-[#5a6061] hover:bg-[#ebeeef] hover:text-[#2d3435]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | [string, string]>;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-full bg-white px-4 text-sm outline-none ring-1 ring-[#adb3b4]/15 focus:ring-[#5e5e5e]/40"
      >
        {options.map((option) => {
          const [optionValue, optionLabel] = Array.isArray(option) ? option : [option, option];
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function PriceInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[#5a6061]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
        type="number"
        min="0"
        placeholder="¥"
        className="h-12 w-full rounded-full bg-white px-4 text-sm outline-none ring-1 ring-[#adb3b4]/15 focus:ring-[#5e5e5e]/40"
      />
    </label>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone?: ProductGroup["lowestPriceTone"];
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

function CountBadge({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "good" | "warn" | "info" | "muted" | "danger";
}) {
  const className = {
    good: "bg-[#e8f3ec] text-[#2f7a4b]",
    warn: "bg-[#fff7e8] text-[#7a541b]",
    info: "bg-[#eef3f8] text-[#47657a]",
    muted: "bg-[#f2f4f4] text-[#5a6061]",
    danger: "bg-[#fbe9e7] text-[#9b3328]",
  }[tone];

  return <span className={`rounded-full px-2.5 py-1 font-medium ${className}`}>{children}</span>;
}

function pricePanelClass(tone: ProductGroup["lowestPriceTone"]): string {
  return {
    good: "bg-[#e8f3ec] text-[#244f36]",
    warn: "bg-[#fff7e8] text-[#70511d]",
    info: "bg-[#eef3f8] text-[#34566d]",
    muted: "bg-[#f2f4f4] text-[#5a6061]",
    danger: "bg-[#fbe9e7] text-[#8f2f24] ring-1 ring-[#e9b7b0]",
  }[tone];
}

function buildTitle(platform: string, productType: string): string {
  const platformName = platform === "全部" ? "全平台" : platform;
  const typeName = productType === "全部" ? "标准商品" : productType;
  return `${platformName} ${typeName}报价`;
}

function platformIcon(platform: string): ReactNode {
  const className = "h-[18px] w-[18px]";

  if (platform !== "全部" && platform !== "其他") return <BrandIcon platform={platform} className={className} />;
  if (platform === "其他") return <Layers3 className={`${className} text-[#5a6061]`} />;
  return <Layers3 className={`${className} text-[#5a6061]`} />;
}
