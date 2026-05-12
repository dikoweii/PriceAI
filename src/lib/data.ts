import "server-only";

import { listSubmissions } from "./admin";
import { buildProductGroups, canonicalCatalog } from "./catalog";
import { isSupabaseConfigured } from "./env";
import { seedRawOffers, seedSources } from "./sample-data";
import { getSupabaseServerClient } from "./supabase";
import type {
  AdminSummary,
  CanonicalProduct,
  CrawlRun,
  DashboardData,
  RawOffer,
  Source,
} from "./types";

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return buildDashboard(seedRawOffers, seedSources, canonicalCatalog, false);
  }

  try {
    const [sourcesResult, offersResult, productsResult] = await Promise.all([
      supabase.from("sources").select("*").order("name"),
      supabase
        .from("raw_offers")
        .select("*")
        .eq("hidden", false)
        .order("captured_at", { ascending: false })
        .limit(2000),
      supabase.from("canonical_products").select("*").eq("is_active", true),
    ]);

    if (sourcesResult.error || offersResult.error || productsResult.error) {
      throw sourcesResult.error || offersResult.error || productsResult.error;
    }

    const sources = (sourcesResult.data || []).map(mapSource);
    const offers = (offersResult.data || []).map(mapRawOffer);
    const products = (productsResult.data || []).map(mapCanonicalProduct);

    return buildDashboard(offers, sources, products.length ? products : canonicalCatalog, true);
  } catch (error) {
    console.warn("Falling back to seed data because Supabase read failed:", error);
    return buildDashboard(seedRawOffers, seedSources, canonicalCatalog, isSupabaseConfigured());
  }
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const dashboard = await getDashboardData();
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      ...dashboard,
      crawlRuns: [],
      pendingSubmissions: [],
    };
  }

  const [{ data, error }, pendingSubmissions] = await Promise.all([
    supabase
      .from("crawl_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30),
    listSubmissions("pending").catch(() => []),
  ]);

  if (error) {
    return {
      ...dashboard,
      crawlRuns: [],
      pendingSubmissions,
    };
  }

  return {
    ...dashboard,
    crawlRuns: (data || []).map(mapCrawlRun),
    pendingSubmissions,
  };
}

export async function getProductGroup(id: string) {
  const dashboard = await getDashboardData();
  return dashboard.products.find((product) => product.id === id || product.slug === id) || null;
}

function buildDashboard(
  offers: RawOffer[],
  sources: Source[],
  products: CanonicalProduct[],
  configured: boolean,
): DashboardData {
  return {
    generatedAt: new Date().toISOString(),
    configured,
    products: buildProductGroups(offers, products),
    sources,
    rawOffers: offers,
  };
}

export function mapSource(row: Record<string, unknown>): Source {
  return {
    id: String(row.id),
    name: String(row.name || ""),
    baseUrl: row.base_url ? String(row.base_url) : null,
    entryUrl: String(row.entry_url || row.base_url || ""),
    collectionMethod: String(row.collection_method || "manual") as Source["collectionMethod"],
    enabled: Boolean(row.enabled),
    notes: row.notes ? String(row.notes) : null,
    healthStatus: row.health_status ? String(row.health_status) as Source["healthStatus"] : null,
    lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : null,
    lastSuccessAt: row.last_success_at ? String(row.last_success_at) : null,
    consecutiveFailures:
      row.consecutive_failures === null || row.consecutive_failures === undefined
        ? null
        : Number(row.consecutive_failures),
    lastError: row.last_error ? String(row.last_error) : null,
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

export function mapRawOffer(row: Record<string, unknown>): RawOffer {
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
    sourcePriority:
      row.source_priority === null || row.source_priority === undefined
        ? null
        : Number(row.source_priority),
    confidence: row.confidence === null || row.confidence === undefined ? null : Number(row.confidence),
    effectiveStatus: row.effective_status ? String(row.effective_status) as RawOffer["effectiveStatus"] : null,
    freshnessStatus: row.freshness_status ? String(row.freshness_status) as RawOffer["freshnessStatus"] : null,
    lastFailedAt: row.last_failed_at ? String(row.last_failed_at) : null,
    failureReason: row.failure_reason ? String(row.failure_reason) : null,
  };
}

export function mapCanonicalProduct(row: Record<string, unknown>): CanonicalProduct {
  return {
    id: String(row.id),
    slug: String(row.slug || row.id),
    displayName: String(row.display_name || row.slug || row.id),
    platform: String(row.platform || "其他"),
    productType: String(row.product_type || "其他"),
    spec: String(row.spec || ""),
    summary: String(row.summary || ""),
    aliases: Array.isArray(row.aliases) ? row.aliases.map(String) : [],
    updatedAt: row.updated_at ? String(row.updated_at) : null,
  };
}

function mapCrawlRun(row: Record<string, unknown>): CrawlRun {
  return {
    id: String(row.id),
    sourceId: row.source_id ? String(row.source_id) : null,
    sourceName: row.source_name ? String(row.source_name) : null,
    mode: String(row.mode || "manual") as CrawlRun["mode"],
    status: String(row.status || "failed") as CrawlRun["status"],
    startedAt: String(row.started_at || new Date().toISOString()),
    finishedAt: row.finished_at ? String(row.finished_at) : null,
    successCount: Number(row.success_count || 0),
    failureCount: Number(row.failure_count || 0),
    message: row.message ? String(row.message) : null,
    details:
      row.details && typeof row.details === "object"
        ? (row.details as Record<string, unknown>)
        : null,
  };
}
