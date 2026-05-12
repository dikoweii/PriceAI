import "server-only";

import { canonicalCatalog, classifyOffer } from "./catalog";
import { freshnessFields } from "./freshness";
import { getSupabaseServerClient } from "./supabase";
import type { CollectionMethod, RawOffer, Source } from "./types";
import { slugify, stableId } from "./utils";

type AibijiaOffer = {
  platform_name?: string;
  source_store_name?: string;
  source_title?: string;
  price?: number;
  currency?: string;
  status?: string;
  url?: string;
  updated_at?: string;
  display_tags?: string[];
};

type AibijiaProduct = {
  slug?: string;
  name?: string;
  offers?: AibijiaOffer[];
};

type AibijiaPayload = {
  site?: {
    updated_at?: string;
  };
  products?: AibijiaProduct[];
};

type SourceRow = {
  id: string;
  name: string;
  base_url: string | null;
  entry_url: string;
  collection_method: CollectionMethod;
  enabled: boolean;
  notes: string | null;
  updated_at: string;
};

type ChannelResolution = {
  source: SourceRow;
  sourceName: string;
  sourceStoreName: string;
};

export async function importAibijiaProducts() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置，无法导入 Aibijia 数据。");

  const startedAt = new Date().toISOString();
  const response = await fetch("https://data.aibijia.org/products.json", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Aibijia 数据读取失败：${response.status}`);
  }

  const payload = (await response.json()) as AibijiaPayload;
  const rawOffers = dedupeOffers(flattenAibijiaPayload(payload));
  const { data: existingSourceRows, error: existingSourceError } = await supabase
    .from("sources")
    .select("*");

  if (existingSourceError) throw existingSourceError;

  const existingSources = (existingSourceRows || []).map(mapExistingSource);
  const legacySourceIds = existingSources
    .filter((source) => source.id !== "aibijia" && source.collectionMethod === "aibijia_json")
    .map((source) => source.id);
  const legacyOfferRows = await loadLegacyAibijiaOfferRows(supabase, legacySourceIds);
  const currentOfferIds = new Set(rawOffers.map((offer) => offer.id));

  const { error: productError } = await supabase.from("canonical_products").upsert(
    canonicalCatalog.map((product) => ({
      id: product.id,
      slug: product.slug,
      display_name: product.displayName,
      platform: product.platform,
      product_type: product.productType,
      spec: product.spec,
      summary: product.summary,
      aliases: product.aliases,
      is_active: true,
      updated_at: new Date().toISOString(),
    })),
  );

  if (productError) throw productError;

  const sourceRows = new Map<string, SourceRow>();
  sourceRows.set("aibijia", {
    id: "aibijia",
    name: "Aibijia 渠道发现",
    base_url: "https://aibijia.org",
    entry_url: "https://data.aibijia.org/products.json",
    collection_method: "aibijia_json",
    enabled: true,
    notes: "仅作为渠道发现与报价同步入口；导入的店铺会合并进总渠道源。",
    updated_at: new Date().toISOString(),
  });

  const offerRows = rawOffers.map((offer) => {
    const channel = resolveAibijiaChannel(offer, existingSources);
    sourceRows.set(channel.source.id, channel.source);

    return {
      id: offer.id,
      source_id: channel.source.id,
      source_name: channel.sourceName,
      source_store_name: channel.sourceStoreName,
      source_title: offer.sourceTitle,
      price: offer.price,
      currency: offer.currency,
      status: offer.status,
      url: offer.url,
      tags: offer.tags,
      stock_count: offer.stockCount,
      hidden: true,
      canonical_product_id: offer.canonicalProductId,
      category_slug: offer.categorySlug,
      captured_at: offer.capturedAt,
      source_updated_at: offer.sourceUpdatedAt,
      last_seen_at: offer.lastSeenAt || new Date().toISOString(),
      verified_at: offer.verifiedAt,
      expires_at: offer.expiresAt,
      source_priority: offer.sourcePriority,
      confidence: offer.confidence,
      source_status: offer.status,
      effective_status: offer.effectiveStatus,
      freshness_status: offer.freshnessStatus,
      updated_at: new Date().toISOString(),
    };
  });
  const migratedLegacyOfferRows = legacyOfferRows
    .filter((row) => !currentOfferIds.has(String(row.id)))
    .map((row) => {
      const offer = mapLegacyRawOffer(row);
      const channel = resolveAibijiaChannel(offer, existingSources);
      sourceRows.set(channel.source.id, channel.source);

      return {
        ...row,
        source_id: channel.source.id,
        source_name: channel.sourceName,
        source_store_name: channel.sourceStoreName,
        hidden: true,
        updated_at: new Date().toISOString(),
      };
    });

  const { error: sourceError } = await supabase
    .from("sources")
    .upsert(Array.from(sourceRows.values()));

  if (sourceError) throw sourceError;

  if (migratedLegacyOfferRows.length) {
    const { error: legacyOfferError } = await supabase.from("raw_offers").upsert(migratedLegacyOfferRows);
    if (legacyOfferError) throw legacyOfferError;
  }

  if (offerRows.length) {
    const { error: offerError } = await supabase.from("raw_offers").upsert(offerRows);
    if (offerError) throw offerError;
  }

  await deleteEmptyLegacyAibijiaSources(supabase, legacySourceIds);
  await deleteEmptyAibijiaDiscoveredSources(supabase, Array.from(sourceRows.keys()));

  const finishedAt = new Date().toISOString();
  await supabase.from("crawl_runs").insert({
    id: stableId("aibijia", startedAt),
    source_id: "aibijia",
    source_name: "Aibijia 公共报价",
    mode: "aibijia_import",
    status: "success",
    started_at: startedAt,
    finished_at: finishedAt,
    success_count: offerRows.length,
    failure_count: 0,
    message: `导入 ${offerRows.length} 条 Aibijia 渠道归档报价，默认隐藏，不参与前台比价。`,
    details: {
      product_count: payload.products?.length || 0,
      site_updated_at: payload.site?.updated_at || null,
    },
  });

  return {
    productCount: payload.products?.length || 0,
    offerCount: offerRows.length,
    sourceCount: sourceRows.size - 1,
    migratedLegacyOfferCount: migratedLegacyOfferRows.length,
    startedAt,
    finishedAt,
  };
}

export function flattenAibijiaPayload(payload: AibijiaPayload): RawOffer[] {
  const capturedAt = new Date().toISOString();
  const offers: RawOffer[] = [];

  for (const product of payload.products || []) {
    for (const offer of product.offers || []) {
      if (!offer.source_title || !offer.url) continue;

      const sourceName = offer.platform_name || "Aibijia";
      const sourceStoreName = offer.source_store_name || sourceName;
      const canonical = classifyOffer(offer.source_title, {
        tags: offer.display_tags || [],
        categorySlug: product.slug || null,
      });
      const status = normalizeAibijiaStatus(offer.status);
      const sourceUpdatedAt = offer.updated_at || payload.site?.updated_at || capturedAt;
      const trustFields = freshnessFields({
        method: "aibijia_json",
        status,
        verifiedAt: capturedAt,
      });

      offers.push({
        id: stableId("aibijia", sourceName, sourceStoreName, offer.source_title, offer.url),
        sourceId: stableId("aibijia-source", sourceName, sourceStoreName),
        sourceName: `${sourceName} / ${sourceStoreName}`,
        sourceStoreName,
        sourceTitle: offer.source_title,
        price: typeof offer.price === "number" ? offer.price : null,
        currency: offer.currency || "CNY",
        status,
        url: offer.url,
        tags: offer.display_tags || [],
        stockCount: null,
        hidden: false,
        canonicalProductId: canonical.id,
        categorySlug: product.slug || canonical.platform,
        capturedAt,
        sourceUpdatedAt,
        lastSeenAt: capturedAt,
        verifiedAt: capturedAt,
        expiresAt: trustFields.expires_at,
        sourcePriority: trustFields.source_priority,
        confidence: trustFields.confidence,
        effectiveStatus: trustFields.effective_status,
        freshnessStatus: trustFields.freshness_status,
      });
    }
  }

  return offers;
}

function normalizeAibijiaStatus(status: string | undefined): RawOffer["status"] {
  if (status === "in_stock" || status === "low_stock" || status === "out_of_stock") {
    return status;
  }

  return "unknown";
}

function dedupeOffers(offers: RawOffer[]): RawOffer[] {
  const byId = new Map<string, RawOffer>();

  for (const offer of offers) {
    byId.set(offer.id, offer);
  }

  return Array.from(byId.values());
}

function resolveAibijiaChannel(offer: RawOffer, existingSources: Source[]): ChannelResolution {
  const parsedUrl = safeUrl(offer.url);
  const hostname = normalizeHostname(parsedUrl?.hostname || "");
  const platformName = parsePlatformName(offer.sourceName);
  const sourceStoreName = cleanLabel(offer.sourceStoreName || platformName || hostname || "Aibijia 渠道");
  const channelName = formatChannelName(platformName, sourceStoreName, hostname);
  const knownSourceId = getKnownSourceId(hostname, sourceStoreName);
  const existing = findExistingSource(existingSources, {
    knownSourceId,
    hostname,
    channelName,
    sourceStoreName,
  });
  const id = existing?.id || knownSourceId || makeChannelSourceId(hostname, sourceStoreName, platformName);
  const baseUrl = existing?.baseUrl || getBaseUrl(parsedUrl);
  const entryUrl = existing?.entryUrl || getEntryUrl(parsedUrl);
  const collectionMethod = existing?.collectionMethod || inferCollectionMethod(hostname, platformName);
  const notes = mergeNotes(
    existing?.notes || null,
    `Aibijia 已发现该渠道；导入报价默认隐藏，原站采集方式为 ${collectionMethod}。`,
  );

  return {
    source: {
      id,
      name: existing?.name || channelName,
      base_url: baseUrl,
      entry_url: entryUrl,
      collection_method: collectionMethod,
      enabled: existing?.enabled ?? true,
      notes,
      updated_at: new Date().toISOString(),
    },
    sourceName: existing?.name || channelName,
    sourceStoreName,
  };
}

function mapExistingSource(row: Record<string, unknown>): Source {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    baseUrl: row.base_url ? String(row.base_url) : null,
    entryUrl: String(row.entry_url || row.base_url || ""),
    collectionMethod: String(row.collection_method || "manual") as CollectionMethod,
    enabled: Boolean(row.enabled),
    notes: row.notes ? String(row.notes) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

function findExistingSource(
  sources: Source[],
  input: {
    knownSourceId: string | null;
    hostname: string;
    channelName: string;
    sourceStoreName: string;
  },
): Source | null {
  const channelSources = sources.filter((source) => source.collectionMethod !== "aibijia_json");

  if (input.knownSourceId) {
    const byId = channelSources.find((source) => source.id === input.knownSourceId);
    if (byId) return byId;
  }

  const channelKey = normalizeLabel(input.channelName);
  const storeKey = normalizeLabel(input.sourceStoreName);

  if (!isSharedHost(input.hostname)) {
    const byHost = channelSources.find((source) => normalizeHostnameFromUrl(source.baseUrl || source.entryUrl) === input.hostname);
    return byHost || null;
  }

  const byName = channelSources.find((source) => {
    const sourceKey = normalizeLabel(source.name);
    return sourceKey === channelKey || sourceKey === storeKey;
  });
  if (byName) return byName;

  return null;
}

function getKnownSourceId(hostname: string, sourceStoreName: string): string | null {
  const storeKey = normalizeLabel(sourceStoreName);

  if (hostname === "aisou.pro" || storeKey.includes("aisou")) return "aisou-pro";
  if (hostname === "shop.auto-subscribe.com") {
    return "auto-subscribe";
  }
  if (hostname === "pay.qxvx.cn") return "qxvx-pay";
  if (hostname === "aifk.opensora.de") return "opensora-aifk";
  if (hostname === "caowo.store") return "caowo-store";
  if (hostname === "makerich.club") return "makerich-club";

  return null;
}

function makeChannelSourceId(hostname: string, sourceStoreName: string, platformName: string): string {
  const platformKey = normalizeLabel(platformName);
  if (hostname === "pay.ldxp.cn" || platformKey === "ldxp") {
    return `ldxp-${slugify(sourceStoreName) || stableId(hostname, sourceStoreName)}`;
  }

  const readable = slugify(sourceStoreName) || slugify(hostname);
  const suffix = stableId(hostname, platformName, sourceStoreName).replace(/^id-/, "").slice(0, 6);
  return readable ? `${readable}-${suffix}` : `channel-${suffix}`;
}

function inferCollectionMethod(hostname: string, platformName: string): CollectionMethod {
  if (hostname === "aifk.opensora.de" || hostname === "makerich.club") return "http";
  if (hostname === "pay.ldxp.cn" || normalizeLabel(platformName) === "ldxp") return "browser";
  return "browser";
}

function formatChannelName(platformName: string, sourceStoreName: string, hostname: string): string {
  if (!platformName || normalizeLabel(platformName) === normalizeLabel(sourceStoreName)) {
    return hostname ? `${sourceStoreName} / ${hostname}` : sourceStoreName;
  }
  if (normalizeLabel(platformName) === "ldxp") return `LDXP / ${sourceStoreName}`;
  return `${platformName} / ${sourceStoreName}`;
}

function parsePlatformName(sourceName: string | null | undefined): string {
  const value = cleanLabel(sourceName || "");
  if (!value) return "";
  return cleanLabel(value.split("/")[0] || value);
}

function cleanLabel(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s/_｜|、，,.\-—:：()（）]+/g, "");
}

function safeUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function getBaseUrl(url: URL | null): string | null {
  if (!url) return null;
  return `${url.protocol}//${url.host}`;
}

function getEntryUrl(url: URL | null): string {
  if (!url) return "https://aibijia.org";
  if (url.hostname === "upgrade.xiaoheiwan.com") return `${url.protocol}//${url.host}${url.pathname}`;
  return `${url.protocol}//${url.host}`;
}

function normalizeHostnameFromUrl(value: string): string {
  return normalizeHostname(safeUrl(value)?.hostname || "");
}

function normalizeHostname(value: string): string {
  return value.toLowerCase().replace(/^www\./, "");
}

function isSharedHost(hostname: string): boolean {
  return hostname === "pay.ldxp.cn";
}

function mergeNotes(current: string | null, addition: string): string {
  if (!current) return addition;
  if (current.includes("Aibijia 已发现该渠道")) return current;
  return `${current} ${addition}`;
}

async function deleteEmptyLegacyAibijiaSources(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  legacySourceIds: string[],
) {
  if (!supabase || !legacySourceIds.length) return;

  const { data: referencedRows, error: referencedError } = await supabase
    .from("raw_offers")
    .select("source_id")
    .in("source_id", legacySourceIds);

  if (referencedError) throw referencedError;

  const referencedIds = new Set((referencedRows || []).map((row) => String(row.source_id)));
  const deletableIds = legacySourceIds.filter((id) => !referencedIds.has(id));
  if (!deletableIds.length) return;

  const { error } = await supabase.from("sources").delete().in("id", deletableIds);
  if (error) throw error;
}

async function deleteEmptyAibijiaDiscoveredSources(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  protectedSourceIds: string[],
) {
  if (!supabase) return;

  const { data: discoveredRows, error: discoveredError } = await supabase
    .from("sources")
    .select("id")
    .ilike("notes", "%Aibijia 已发现该渠道%");

  if (discoveredError) throw discoveredError;

  const protectedIds = new Set(protectedSourceIds);
  const candidateIds = (discoveredRows || [])
    .map((row) => String(row.id))
    .filter((id) => !protectedIds.has(id));
  if (!candidateIds.length) return;

  const { data: referencedRows, error: referencedError } = await supabase
    .from("raw_offers")
    .select("source_id")
    .in("source_id", candidateIds);

  if (referencedError) throw referencedError;

  const referencedIds = new Set((referencedRows || []).map((row) => String(row.source_id)));
  const deletableIds = candidateIds.filter((id) => !referencedIds.has(id));
  if (!deletableIds.length) return;

  const { error } = await supabase.from("sources").delete().in("id", deletableIds);
  if (error) throw error;
}

async function loadLegacyAibijiaOfferRows(
  supabase: ReturnType<typeof getSupabaseServerClient>,
  legacySourceIds: string[],
): Promise<Record<string, unknown>[]> {
  if (!supabase || !legacySourceIds.length) return [];

  const { data, error } = await supabase
    .from("raw_offers")
    .select("*")
    .in("source_id", legacySourceIds)
    .limit(10000);

  if (error) throw error;
  return data || [];
}

function mapLegacyRawOffer(row: Record<string, unknown>): RawOffer {
  return {
    id: String(row.id),
    sourceId: row.source_id ? String(row.source_id) : null,
    sourceName: String(row.source_name || ""),
    sourceStoreName: row.source_store_name ? String(row.source_store_name) : null,
    sourceTitle: String(row.source_title || ""),
    price: row.price === null || row.price === undefined ? null : Number(row.price),
    currency: String(row.currency || "CNY"),
    status: String(row.status || "unknown") as RawOffer["status"],
    url: String(row.url || ""),
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    stockCount: row.stock_count === null || row.stock_count === undefined ? null : Number(row.stock_count),
    hidden: Boolean(row.hidden),
    canonicalProductId: row.canonical_product_id ? String(row.canonical_product_id) : null,
    categorySlug: row.category_slug ? String(row.category_slug) : null,
    capturedAt: row.captured_at ? String(row.captured_at) : null,
    sourceUpdatedAt: row.source_updated_at ? String(row.source_updated_at) : null,
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    sourcePriority: row.source_priority === null || row.source_priority === undefined ? null : Number(row.source_priority),
    confidence: row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
    effectiveStatus: row.effective_status ? String(row.effective_status) as RawOffer["effectiveStatus"] : null,
    freshnessStatus: row.freshness_status ? String(row.freshness_status) as RawOffer["freshnessStatus"] : null,
    lastFailedAt: row.last_failed_at ? String(row.last_failed_at) : null,
    failureReason: row.failure_reason ? String(row.failure_reason) : null,
  };
}
