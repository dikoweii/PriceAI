import "server-only";

import { promises as dns } from "node:dns";
import net from "node:net";

import { classifyOffer } from "./catalog";
import { freshnessFields } from "./freshness";
import { getSupabaseServerClient } from "./supabase";
import type {
  ChannelSubmission,
  CollectionMethod,
  OfferInput,
  RawOffer,
  Source,
  SubmissionStatus,
} from "./types";
import { normalizeStatus, parseTags, slugify, stableId } from "./utils";

export function getAdminPasswordFromRequest(request: Request): string | null {
  const header = request.headers.get("x-admin-password");
  if (header) return header;

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice("Bearer ".length);

  return null;
}

export async function upsertSource(input: {
  id?: string | null;
  name: string;
  entryUrl: string;
  baseUrl?: string | null;
  collectionMethod?: CollectionMethod;
  enabled?: boolean;
  notes?: string | null;
}): Promise<Source> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置，无法保存来源。");

  const source: Source = {
    id: input.id || slugify(input.name || input.entryUrl),
    name: input.name,
    baseUrl: input.baseUrl || deriveBaseUrl(input.entryUrl),
    entryUrl: input.entryUrl,
    collectionMethod: input.collectionMethod || "manual",
    enabled: input.enabled ?? true,
    notes: input.notes || null,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await supabase.from("sources").upsert({
    id: source.id,
    name: source.name,
    base_url: source.baseUrl,
    entry_url: source.entryUrl,
    collection_method: source.collectionMethod,
    enabled: source.enabled,
    notes: source.notes,
    updated_at: source.updatedAt,
  });

  if (error) throw error;
  return source;
}

export async function upsertRawOffer(input: OfferInput & { sourceId?: string | null }): Promise<RawOffer> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置，无法保存报价。");

  const sourceId = input.sourceId || slugify(input.sourceName || input.sourceUrl);
  const source = await upsertSource({
    id: sourceId,
    name: input.sourceName,
    entryUrl: input.sourceUrl,
    collectionMethod: "manual",
    notes: "由后台手动补录或采集助手自动创建。",
  });

  const now = new Date().toISOString();
  const tags = parseTags(input.tags || "");
  const status = normalizeStatus(input.status || "");
  const trustFields = freshnessFields({ method: "manual", status, verifiedAt: now });
  const canonical = classifyOffer(input.sourceTitle);
  const offer: RawOffer = {
    id: stableId(input.sourceName, input.sourceStoreName, input.sourceTitle, input.url),
    sourceId: sourceId || source.id,
    sourceName: input.sourceName,
    sourceStoreName: input.sourceStoreName || input.sourceName,
    sourceTitle: input.sourceTitle,
    price: input.price ?? null,
    currency: input.currency || "CNY",
    status,
    url: input.url,
    tags,
    stockCount: input.stockCount ?? null,
    hidden: false,
    canonicalProductId: canonical.id,
    categorySlug: canonical.platform,
    capturedAt: now,
    sourceUpdatedAt: now,
    lastSeenAt: now,
    verifiedAt: now,
    expiresAt: trustFields.expires_at,
    sourcePriority: trustFields.source_priority,
    confidence: trustFields.confidence,
    effectiveStatus: trustFields.effective_status,
    freshnessStatus: trustFields.freshness_status,
  };

  const { error } = await supabase.from("raw_offers").upsert(toRawOfferRow(offer));
  if (error) throw error;

  return offer;
}

export async function upsertRawOffers(
  offers: OfferInput[],
  options: { collectionMethod?: CollectionMethod } = {},
): Promise<number> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置，无法保存报价。");

  const rows = [];
  const collectionMethod = options.collectionMethod || "browser";

  for (const offer of offers) {
    const source = await upsertSource({
      id: offer.sourceId,
      name: offer.sourceName,
      entryUrl: offer.sourceUrl,
      collectionMethod,
      notes: collectionMethod === "http" ? "由自动价格采集脚本维护。" : "由半自动浏览器采集助手创建。",
    });
    const canonical = classifyOffer(offer.sourceTitle);
    const now = new Date().toISOString();
    const status = normalizeStatus(offer.status || "");
    const trustFields = freshnessFields({ method: collectionMethod, status, verifiedAt: now });

    rows.push(
      toRawOfferRow({
        id: stableId(offer.sourceName, offer.sourceStoreName, offer.sourceTitle, offer.url),
        sourceId: source.id,
        sourceName: offer.sourceName,
        sourceStoreName: offer.sourceStoreName || offer.sourceName,
        sourceTitle: offer.sourceTitle,
        price: offer.price ?? null,
        currency: offer.currency || "CNY",
        status,
        url: offer.url,
        tags: parseTags(offer.tags || ""),
        stockCount: offer.stockCount ?? null,
        hidden: false,
        canonicalProductId: canonical.id,
        categorySlug: canonical.platform,
        capturedAt: now,
        sourceUpdatedAt: now,
        lastSeenAt: now,
        verifiedAt: now,
        expiresAt: trustFields.expires_at,
        sourcePriority: trustFields.source_priority,
        confidence: trustFields.confidence,
        effectiveStatus: trustFields.effective_status,
        freshnessStatus: trustFields.freshness_status,
      }),
    );
  }

  if (!rows.length) return 0;

  const { error } = await supabase.from("raw_offers").upsert(rows);
  if (error) throw error;

  return rows.length;
}

export function toRawOfferRow(offer: RawOffer) {
  return {
    id: offer.id,
    source_id: offer.sourceId,
    source_name: offer.sourceName,
    source_store_name: offer.sourceStoreName,
    source_title: offer.sourceTitle,
    price: offer.price,
    currency: offer.currency,
    status: offer.status,
    url: offer.url,
    tags: offer.tags,
    stock_count: offer.stockCount,
    hidden: offer.hidden ?? false,
    canonical_product_id: offer.canonicalProductId,
    category_slug: offer.categorySlug,
    captured_at: offer.capturedAt,
    source_updated_at: offer.sourceUpdatedAt,
    last_seen_at: offer.lastSeenAt || offer.capturedAt,
    verified_at: offer.verifiedAt,
    expires_at: offer.expiresAt,
    source_priority: offer.sourcePriority,
    confidence: offer.confidence,
    source_status: offer.status,
    effective_status: offer.effectiveStatus,
    freshness_status: offer.freshnessStatus,
    last_failed_at: offer.lastFailedAt,
    failure_reason: offer.failureReason,
    updated_at: new Date().toISOString(),
  };
}

function deriveBaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

function mapSubmissionRow(row: Record<string, unknown>): ChannelSubmission {
  return {
    id: String(row.id),
    url: String(row.url || ""),
    name: row.name ? String(row.name) : null,
    contact: row.contact ? String(row.contact) : null,
    notes: row.notes ? String(row.notes) : null,
    parsedTitle: row.parsed_title ? String(row.parsed_title) : null,
    parsedMeta:
      row.parsed_meta && typeof row.parsed_meta === "object"
        ? (row.parsed_meta as Record<string, unknown>)
        : {},
    status: String(row.status || "pending") as SubmissionStatus,
    reviewerNote: row.reviewer_note ? String(row.reviewer_note) : null,
    approvedSourceId: row.approved_source_id ? String(row.approved_source_id) : null,
    submitterIp: row.submitter_ip ? String(row.submitter_ip) : null,
    createdAt: String(row.created_at || new Date().toISOString()),
    reviewedAt: row.reviewed_at ? String(row.reviewed_at) : null,
  };
}

function isPrivateAddress(address: string): boolean {
  if (!address) return true;
  const lower = address.toLowerCase();
  if (lower === "localhost") return true;

  const v4 = net.isIPv4(address);
  const v6 = net.isIPv6(address);
  if (!v4 && !v6) return false;

  if (v4) {
    const [a, b] = address.split(".").map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }

  // IPv6: block loopback, link-local, ULA, mapped private v4
  if (lower === "::1" || lower === "::") return true;
  if (lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("::ffff:")) return isPrivateAddress(address.split(":").pop() || "");
  return false;
}

async function ensurePublicHost(hostname: string): Promise<void> {
  if (!hostname) throw new Error("URL 缺少主机名。");
  if (isPrivateAddress(hostname)) throw new Error("不允许的内部 IP。");

  let records: Array<{ address: string }> = [];
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new Error("无法解析该主机名。");
  }
  if (!records.length) throw new Error("无法解析该主机名。");
  for (const record of records) {
    if (isPrivateAddress(record.address)) throw new Error("不允许的内部 IP。");
  }
}

const MAX_FETCH_BYTES = 256 * 1024;
const FETCH_TIMEOUT_MS = 5000;
const KAMI_HOSTS = new Set([
  "aisou.pro",
  "caowo.store",
  "faka.redeemgpt.com",
  "feifei.shop",
  "talkai.cyou",
  "yh-mo.xyz",
  "zzshu.com",
]);
const DUJIAO_HOSTS = new Set([
  "burstpro-ai.online",
  "card.kxandyou.com",
  "shop.aitonse.com",
  "shop.auto-subscribe.com",
  "ultra.makelove.cloud",
]);

export async function parseSubmissionMetadata(rawUrl: string): Promise<{
  url: string;
  parsedTitle: string | null;
  parsedMeta: Record<string, unknown>;
}> {
  const meta: Record<string, unknown> = {};
  let parsedTitle: string | null = null;
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("URL 格式不正确。");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("仅支持 http/https。");
  }

  meta.domain = parsed.host;
  Object.assign(meta, analyzeSubmissionUrl(parsed, null));

  try {
    await ensurePublicHost(parsed.hostname);
  } catch (error) {
    meta.parse_error = error instanceof Error ? error.message : String(error);
    throw error;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "AIPriceHubBot/1.0 (+https://ai-price-hub.vercel.app)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    meta.http_status = response.status;
    if (!response.ok) {
      meta.parse_error = `HTTP ${response.status}`;
      return { url: parsed.toString(), parsedTitle: null, parsedMeta: meta };
    }
    const reader = response.body?.getReader();
    if (!reader) {
      return { url: parsed.toString(), parsedTitle: null, parsedMeta: meta };
    }

    const decoder = new TextDecoder("utf-8", { fatal: false });
    let received = 0;
    let html = "";
    while (received < MAX_FETCH_BYTES) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
      if (received >= MAX_FETCH_BYTES) break;
    }
    try {
      await reader.cancel();
    } catch {
      /* ignore */
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      parsedTitle = titleMatch[1]
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200);
    }

    if (parsedTitle) {
      const canonical = classifyOffer(parsedTitle);
      meta.canonical_product_id = canonical.id;
      meta.platform = canonical.platform;
      meta.product_type = canonical.productType;
      Object.assign(meta, analyzeSubmissionUrl(parsed, parsedTitle));
    }
  } catch (error) {
    meta.parse_error = error instanceof Error ? error.message : String(error);
  } finally {
    clearTimeout(timer);
  }

  return { url: parsed.toString(), parsedTitle, parsedMeta: meta };
}

function analyzeSubmissionUrl(parsed: URL, parsedTitle: string | null): Record<string, unknown> {
  const host = normalizeHostname(parsed.hostname);
  const baseUrl = `${parsed.protocol}//${parsed.host}`;
  const shopToken = getShopToken(parsed.pathname);
  const collectorKind = inferCollectorKind(host);
  const collectionMethod: CollectionMethod = collectorKind === "browser" ? "browser" : "http";
  const suggestedName = inferSubmittedSourceName(host, parsedTitle, shopToken);

  return {
    normalized_url: parsed.toString(),
    base_url: baseUrl,
    shop_token: shopToken,
    suggested_source_name: suggestedName,
    suggested_source_id: inferSubmittedSourceId(host, suggestedName, shopToken),
    suggested_collection_method: collectionMethod,
    suggested_collector_kind: collectorKind,
    support_status: collectorKind === "browser" ? "needs_browser_probe" : "supported",
    support_reason:
      collectorKind === "browser"
        ? "暂未识别到公开接口，建议先用浏览器采集或手动补录。"
        : `已识别 ${collectorKind} 采集器，可通过自动采集拉取商品。`,
  };
}

function inferCollectorKind(host: string): string {
  if (KAMI_HOSTS.has(host)) return "kami";
  if (DUJIAO_HOSTS.has(host)) return "dujiao";
  if (host === "pay.qxvx.cn" || host === "pay.ldxp.cn") return "shopApi";
  if (host === "upgrade.xiaoheiwan.com") return "xiaoheiwan";
  if (host === "aifk.opensora.de") return "opensoraHtml";
  if (host === "makerich.club") return "makerichHtml";
  if (host === "bei-bei.shop") return "beibeiHtml";
  if (host.includes("burstpro")) return "dujiao";
  return "browser";
}

function inferSubmittedSourceName(host: string, parsedTitle: string | null, shopToken: string | null): string {
  if (host === "pay.ldxp.cn" && shopToken) return `LDXP / ${shopToken}`;
  if (host === "pay.qxvx.cn" && shopToken) return `QXVX / ${shopToken}`;
  if (host === "shop.auto-subscribe.com") return "Auto Subscribe";
  if (host === "aifk.opensora.de") return "AUTO FK";
  if (host === "aisou.pro") return "Aisou智充";
  if (host === "caowo.store") return "GPT专卖-cw";
  if (host === "makerich.club") return "AI创富俱乐部";
  if (parsedTitle) return parsedTitle;
  return host;
}

function inferSubmittedSourceId(host: string, sourceName: string, shopToken: string | null): string {
  if (host === "pay.ldxp.cn") return `ldxp-${slugify(shopToken || sourceName) || stableId(host, sourceName)}`;
  if (host === "pay.qxvx.cn") return `qxvx-${slugify(shopToken || sourceName) || stableId(host, sourceName)}`;
  if (host === "shop.auto-subscribe.com") return "auto-subscribe";
  if (host === "aifk.opensora.de") return "opensora-aifk";
  if (host === "aisou.pro") return "aisou-pro";
  if (host === "caowo.store") return "caowo-store";
  if (host === "makerich.club") return "makerich-club";
  return slugify(sourceName) || slugify(host) || stableId(host, sourceName);
}

function getShopToken(pathname: string): string | null {
  const match = pathname.match(/\/shop\/([^/?#]+)/i);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function normalizeHostname(value: string): string {
  return value.toLowerCase().replace(/^www\./, "");
}

export async function createSubmission(input: {
  url: string;
  name?: string | null;
  contact?: string | null;
  notes?: string | null;
  honeypot?: string | null;
  submitterIp?: string | null;
}): Promise<{ id: string; status: SubmissionStatus } | { ignored: true }> {
  if (input.honeypot) {
    return { ignored: true };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置，无法接受提交。");

  let normalizedUrl: string;
  try {
    const parsed = new URL(input.url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("仅支持 http/https。");
    }
    normalizedUrl = parsed.toString();
  } catch {
    throw new Error("URL 格式不正确。");
  }

  const ip = input.submitterIp || null;
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: dupRows } = await supabase
    .from("channel_submissions")
    .select("id")
    .eq("url", normalizedUrl)
    .gte("created_at", fiveMinAgo)
    .limit(1);
  if (dupRows && dupRows.length) {
    throw new Error("该链接刚刚被提交过，请稍后再试。");
  }

  if (ip) {
    const { count } = await supabase
      .from("channel_submissions")
      .select("id", { count: "exact", head: true })
      .eq("submitter_ip", ip)
      .gte("created_at", oneHourAgo);
    if ((count || 0) >= 5) {
      throw new Error("提交过于频繁，请稍后再试。");
    }
  }

  let parsedTitle: string | null = null;
  let parsedMeta: Record<string, unknown> = {};
  try {
    const parsed = await parseSubmissionMetadata(normalizedUrl);
    parsedTitle = parsed.parsedTitle;
    parsedMeta = parsed.parsedMeta;
  } catch (error) {
    parsedMeta = buildFallbackSubmissionMeta(normalizedUrl, error);
  }

  const id = stableId("submission", normalizedUrl, ip || "", Date.now().toString());
  const { error } = await supabase.from("channel_submissions").insert({
    id,
    url: normalizedUrl,
    name: input.name?.trim() || null,
    contact: input.contact?.trim() || null,
    notes: input.notes?.trim() || null,
    parsed_title: parsedTitle,
    parsed_meta: parsedMeta,
    status: "pending",
    submitter_ip: ip,
  });
  if (error) throw error;

  return { id, status: "pending" };
}

function buildFallbackSubmissionMeta(url: string, error: unknown): Record<string, unknown> {
  try {
    const parsed = new URL(url);
    return {
      domain: parsed.host,
      ...analyzeSubmissionUrl(parsed, null),
      parse_error: error instanceof Error ? error.message : String(error),
    };
  } catch {
    return { parse_error: error instanceof Error ? error.message : String(error) };
  }
}

export async function listSubmissions(status: SubmissionStatus = "pending"): Promise<ChannelSubmission[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("channel_submissions")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data || []).map(mapSubmissionRow);
}

export async function approveSubmission(
  id: string,
  overrides: { name?: string | null; collectionMethod?: CollectionMethod } = {},
): Promise<{ submission: ChannelSubmission; source: Source }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置。");

  const { data: row, error } = await supabase
    .from("channel_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!row) throw new Error("提交记录不存在。");
  if (row.status !== "pending") throw new Error("该提交已被处理。");

  const submission = mapSubmissionRow(row);
  const baseUrl = deriveBaseUrl(submission.url);
  const suggestedMethod = getSuggestedCollectionMethod(submission.parsedMeta);
  const suggestedId = getSuggestedSourceId(submission.parsedMeta);
  const fallbackName =
    overrides.name?.trim() ||
    submission.name ||
    getSuggestedSourceName(submission.parsedMeta) ||
    submission.parsedTitle ||
    (baseUrl ? new URL(baseUrl).host : submission.url);

  const source = await upsertSource({
    id: suggestedId,
    name: fallbackName,
    entryUrl: submission.url,
    baseUrl,
    collectionMethod: overrides.collectionMethod || suggestedMethod || "browser",
    enabled: true,
    notes: submission.notes ? `用户提交：${submission.notes}` : "由用户提交渠道入口审核通过。",
  });

  const reviewedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("channel_submissions")
    .update({
      status: "approved",
      approved_source_id: source.id,
      reviewed_at: reviewedAt,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (updateError) throw updateError;

  return {
    submission: updated ? mapSubmissionRow(updated) : { ...submission, status: "approved", approvedSourceId: source.id, reviewedAt },
    source,
  };
}

export async function rejectSubmission(id: string, note?: string | null): Promise<ChannelSubmission> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase 尚未配置。");

  const { data, error } = await supabase
    .from("channel_submissions")
    .update({
      status: "rejected",
      reviewer_note: note?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("提交记录不存在或已被处理。");

  return mapSubmissionRow(data);
}

function getSuggestedSourceName(meta: Record<string, unknown>): string | null {
  return typeof meta.suggested_source_name === "string" && meta.suggested_source_name.trim()
    ? meta.suggested_source_name.trim()
    : null;
}

function getSuggestedSourceId(meta: Record<string, unknown>): string | null {
  return typeof meta.suggested_source_id === "string" && meta.suggested_source_id.trim()
    ? meta.suggested_source_id.trim()
    : null;
}

function getSuggestedCollectionMethod(meta: Record<string, unknown>): CollectionMethod | null {
  const value = typeof meta.suggested_collection_method === "string" ? meta.suggested_collection_method : "";
  return value === "aibijia_json" || value === "browser" || value === "http" || value === "manual"
    ? value
    : null;
}
