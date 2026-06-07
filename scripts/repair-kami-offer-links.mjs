#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";

const KAMI_HOSTS = new Set([
  "123456787kelie.top",
  "ai666.dnxb.cc",
  "ai666.id",
  "aisou.pro",
  "caowo.store",
  "dimosky.com",
  "douyiner.cn",
  "faka.redeemgpt.com",
  "feifei.shop",
  "fk.ybkjs.top",
  "gemini91.shop",
  "gmail1888.com",
  "hiemail.store",
  "lynnzee.myweb999.cfd",
  "nikoers.com",
  "shopcardai.click",
  "shop.bmoplus.com",
  "shop.gpt365.wiki",
  "shihuiai.cn",
  "talkai.cyou",
  "tehuio.com",
  "web3chirou.com",
  "yh-mo.xyz",
  "zhanghao66.com",
  "zzshu.com",
]);

const APPLY = process.argv.includes("--apply");
const PAGE_SIZE = 1000;
const UPDATE_CONCURRENCY = 12;

async function main() {
  const supabase = getSupabaseClient();
  const rows = await listCommodityOfferRows(supabase);
  const candidates = rows
    .map((row) => ({ row, nextUrl: toKamiItemUrl(row.url) }))
    .filter((item) => item.nextUrl && item.nextUrl !== item.row.url);

  const byHost = groupByHost(candidates);
  console.table(
    [...byHost.entries()]
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count),
  );

  console.log(
    JSON.stringify(
      {
        mode: APPLY ? "apply" : "dry-run",
        scanned: rows.length,
        candidates: candidates.length,
        sample: candidates.slice(0, 8).map(({ row, nextUrl }) => ({
          id: row.id,
          source: row.source_name,
          title: row.source_title,
          from: row.url,
          to: nextUrl,
        })),
      },
      null,
      2,
    ),
  );

  if (!APPLY || !candidates.length) return;

  const updatedAt = new Date().toISOString();

  const results = await mapWithConcurrency(candidates, UPDATE_CONCURRENCY, async ({ row, nextUrl }) => {
    const { count, error } = await supabase
      .from("raw_offers")
      .update({ url: nextUrl, updated_at: updatedAt }, { count: "exact" })
      .eq("id", row.id)
      .eq("url", row.url);
    if (error) throw error;

    const { count: feedbackCount, error: feedbackError } = await supabase
      .from("offer_feedback")
      .update({ offer_url: nextUrl }, { count: "exact" })
      .eq("offer_url", row.url);
    if (feedbackError) throw feedbackError;
    return {
      updatedOffers: count || 0,
      updatedFeedback: feedbackCount || 0,
    };
  });

  const updatedOffers = results.reduce((sum, result) => sum + result.updatedOffers, 0);
  const updatedFeedback = results.reduce((sum, result) => sum + result.updatedFeedback, 0);

  console.log(JSON.stringify({ updatedOffers, updatedFeedback }, null, 2));
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function listCommodityOfferRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("raw_offers")
      .select("id,source_name,source_store_name,source_title,url")
      .ilike("url", "%?commodity=%")
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function toKamiItemUrl(value) {
  try {
    const parsed = new URL(value);
    const commodityId = parsed.searchParams.get("commodity");
    if (!commodityId) return null;
    if (!KAMI_HOSTS.has(normalizeHostname(parsed.hostname))) return null;

    parsed.pathname = `/item/${encodeURIComponent(commodityId)}`;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeHostname(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^www\./, "");
}

function groupByHost(items) {
  const output = new Map();
  for (const { nextUrl } of items) {
    const host = new URL(nextUrl).host;
    output.set(host, (output.get(host) || 0) + 1);
  }
  return output;
}

async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function runNext() {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runNext()),
  );
  return results;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
