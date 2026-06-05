#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const configDir = path.join(repoRoot, "config", "official-prices");
const defaultOutPath = path.join(repoRoot, "data", "official-prices", "latest.json");
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) PriceAI/1.0";

const DEFAULT_TIMEOUT_MS = 25000;
const FETCH_DELAY_MS = 250;

if (isCli()) {
  const args = normalizeOptions(parseArgs(process.argv.slice(2)));

  try {
    const result = await collectOfficialPrices(args);
    printSummary(result);

    if (args.dryRun) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      const outPath = path.resolve(repoRoot, args.out || defaultOutPath);
      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
      console.log(`Snapshot written to ${path.relative(repoRoot, outPath)}`);
    }
  } catch (error) {
    console.error(errorMessage(error));
    process.exit(1);
  }
}

export async function collectOfficialPrices(options = {}) {
  options = normalizeOptions(options);

  if (options.post || options.db) {
    throw new Error("--post/--db will be enabled after official_subscription_* migrations are added.");
  }

  const configs = await loadConfig();
  const apps = selectApps(configs.apps, options);
  const regions = selectRegions(configs.regions, options);
  const rules = configs.rules.filter((rule) => apps.some((app) => app.slug === rule.appSlug));

  if (!apps.length) throw new Error("No enabled apps matched. Use --all or --app chatgpt.");
  if (!regions.length) throw new Error("No enabled regions matched. Use --regions US,TR,PH.");

  const fx = await fetchFxSnapshot(regions);
  const fetchedAt = new Date().toISOString();
  const rows = [];
  const unmatchedItems = [];
  const failures = [];
  const runItems = [];

  for (const app of apps) {
    const appRules = rules.filter((rule) => rule.appSlug === app.slug);

    for (const region of regions) {
      const sourceUrl = buildAppStoreUrl(app, region);
      const startedAt = Date.now();

      try {
        const html = await fetchText(sourceUrl, { timeoutMs: Number(options.timeoutMs || options.timeout || DEFAULT_TIMEOUT_MS) });
        const rawItems = extractInAppPurchasePairs(html, sourceUrl);

        if (!rawItems.length) {
          const failure = buildFailure({
            app,
            region,
            sourceUrl,
            status: "parse_failed",
            failureReason: "No App Store in-app purchase text-pair items were found.",
            fetchedAt,
          });
          failures.push(failure);
          runItems.push(runItem(app, region, "parse_failed", 0, rawItems.length, Date.now() - startedAt, failure.failureReason));
          await delay(FETCH_DELAY_MS);
          continue;
        }

        const matchedItemIndexes = new Set();

        for (const rule of appRules) {
          const candidates = rawItems
            .map((item, index) => ({ item, index, score: scoreCandidate(item, rule, region, fx) }))
            .filter((candidate) => candidate.score.matched);

          const chosen = chooseCandidate(candidates);
          if (!chosen) {
            rows.push(
              buildMissingRow({
                app,
                rule,
                region,
                sourceUrl,
                fetchedAt,
                failureReason: "No in-app purchase candidate matched this plan rule.",
              }),
            );
            continue;
          }

          if (chosen.status === "needs_review") {
            rows.push(
              buildReviewRow({
                app,
                rule,
                region,
                sourceUrl,
                fetchedAt,
                candidates: chosen.candidates.map((candidate) => candidate.item),
              }),
            );
            for (const candidate of chosen.candidates) matchedItemIndexes.add(candidate.index);
            continue;
          }

          const rawItem = chosen.candidate.item;
          matchedItemIndexes.add(chosen.candidate.index);
          rows.push(
            buildAvailableRow({
              app,
              rule,
              region,
              rawItem,
              sourceUrl,
              fetchedAt,
              fx,
            }),
          );
        }

        rawItems.forEach((item, index) => {
          if (matchedItemIndexes.has(index)) return;
          unmatchedItems.push({
            appSlug: app.slug,
            countryCode: region.countryCode,
            countryLabel: region.countryLabel,
            sourceUrl,
            rawTitle: item.title,
            priceText: item.priceText,
            priceValue: parsePriceValue(item.priceText),
            rawSnippetHash: hashSnippet(`${item.title} ${item.priceText}`),
            reason: "No plan rule consumed this in-app purchase item.",
          });
        });

        runItems.push(runItem(app, region, "success", appRules.length, rawItems.length, Date.now() - startedAt));
      } catch (error) {
        const failureReason = errorMessage(error);
        const failure = buildFailure({
          app,
          region,
          sourceUrl,
          status: "parse_failed",
          failureReason,
          fetchedAt,
        });
        failures.push(failure);
        runItems.push(runItem(app, region, "failed", 0, 0, Date.now() - startedAt, failureReason));
      }

      await delay(FETCH_DELAY_MS);
    }
  }

  return {
    generatedAt: fetchedAt,
    dryRun: Boolean(options.dryRun),
    source: {
      kind: "apple_app_store_public_html",
      evidenceSource: "app_store_html",
      fxSource: fx.source,
      fxSourceUrl: fx.sourceUrl,
    },
    scope: {
      apps: apps.map((app) => app.slug),
      regions: regions.map((region) => region.countryCode),
      plans: rules.length,
    },
    fx,
    rows,
    unmatchedItems,
    failures,
    run: {
      status: failures.length ? (rows.some((row) => row.status === "available") ? "partial_success" : "failed") : "success",
      appCount: apps.length,
      regionCount: regions.length,
      rowCount: rows.length,
      availableCount: rows.filter((row) => row.status === "available").length,
      missingCount: rows.filter((row) => row.status === "missing").length,
      needsReviewCount: rows.filter((row) => row.status === "needs_review").length,
      unmatchedCount: unmatchedItems.length,
      failureCount: failures.length,
      items: runItems,
    },
  };
}

async function loadConfig() {
  const [apps, regions, rules] = await Promise.all([
    readJson(path.join(configDir, "apps.json")),
    readJson(path.join(configDir, "regions.json")),
    readJson(path.join(configDir, "plan-match-rules.json")),
  ]);

  return {
    apps: apps.filter((item) => item.enabled !== false).sort((a, b) => numericSort(a.sortOrder, b.sortOrder)),
    regions: regions.filter((item) => item.enabled !== false).sort((a, b) => numericSort(a.priority, b.priority)),
    rules: rules.sort((a, b) => numericSort(a.sortOrder, b.sortOrder)),
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function selectApps(apps, options) {
  if (options.all || !options.app) return apps;
  const wanted = splitList(options.app).map((item) => item.toLowerCase());
  return apps.filter((app) => wanted.includes(app.slug.toLowerCase()));
}

function selectRegions(regions, options) {
  if (!options.regions) return regions;
  const wanted = new Set(splitList(options.regions).map((item) => item.toUpperCase()));
  return regions.filter((region) => wanted.has(region.countryCode.toUpperCase()) || wanted.has(region.storefrontCode.toUpperCase()));
}

async function fetchFxSnapshot(regions) {
  const currencies = Array.from(new Set(["CNY", ...regions.map((region) => region.currencyCode).filter((code) => code !== "USD")]));
  const sourceUrl = `https://api.frankfurter.dev/v1/latest?base=USD&symbols=${encodeURIComponent(currencies.join(","))}`;
  const data = JSON.parse(await fetchText(sourceUrl));
  const rates = { USD: 1, ...data.rates };

  return {
    baseCurrency: data.base || "USD",
    date: data.date,
    source: "Frankfurter",
    sourceUrl,
    rates,
  };
}

async function fetchText(url, { timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "user-agent": userAgent,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

export function extractInAppPurchasePairs(html, sourceUrl = "") {
  const output = [];
  const seen = new Set();
  const pairPattern = /<div class="text-pair[^"]*"[^>]*>\s*<span>([\s\S]*?)<\/span>\s*<span>([\s\S]*?)<\/span>\s*<\/div>/g;

  for (const match of html.matchAll(pairPattern)) {
    const title = decodeHtmlText(match[1]);
    const priceText = normalizePriceText(decodeHtmlText(match[2]));
    if (!title || !looksLikePrice(priceText)) continue;

    const key = `${title}\u0000${priceText}`;
    if (seen.has(key)) continue;
    seen.add(key);

    output.push({
      title,
      priceText,
      sourceUrl,
      rawSnippetHash: hashSnippet(match[0]),
    });
  }

  return output;
}

function scoreCandidate(rawItem, rule, region, fx) {
  const normalizedTitle = normalizeText(rawItem.title);
  const include = (rule.include || []).map(normalizeText).filter(Boolean);
  const exclude = (rule.exclude || []).map(normalizeText).filter(Boolean);
  const includesMatched = include.every((term) => normalizedTitle.includes(term));
  const excludesMatched = exclude.some((term) => normalizedTitle.includes(term));

  if (!includesMatched || excludesMatched) {
    return { matched: false, reason: "include/exclude" };
  }

  const priceValue = parsePriceValue(rawItem.priceText);
  const usdValue = priceValue == null ? null : convertCurrency(priceValue, region.currencyCode, "USD", fx);
  const priceBand = rule.preferPriceBandUsd;
  const inBand =
    !Array.isArray(priceBand) ||
    priceBand.length !== 2 ||
    usdValue == null ||
    (usdValue >= Number(priceBand[0]) && usdValue <= Number(priceBand[1]));
  const score = include.length * 10 + (inBand ? 4 : -4) + (normalizedTitle === normalizeText(rule.label) ? 3 : 0);

  return {
    matched: true,
    score,
    inBand,
    usdValue,
    reason: inBand ? "matched" : "matched_outside_price_band",
  };
}

function chooseCandidate(candidates) {
  if (!candidates.length) return null;

  const inBand = candidates.filter((candidate) => candidate.score.inBand);
  const pool = inBand.length ? inBand : candidates;
  const sorted = pool.toSorted((a, b) => b.score.score - a.score.score);
  const best = sorted[0];
  const ambiguous = sorted.filter((candidate) => candidate.score.score === best.score.score && candidate.score.inBand === best.score.inBand);

  if (ambiguous.length > 1) {
    return { status: "needs_review", candidates: ambiguous };
  }

  return { status: "available", candidate: best };
}

function buildAvailableRow({ app, rule, region, rawItem, sourceUrl, fetchedAt, fx }) {
  const priceValue = parsePriceValue(rawItem.priceText);
  const fxRateToCny = rateToCny(region.currencyCode, fx);

  return {
    appSlug: app.slug,
    planSlug: rule.planSlug,
    countryCode: region.countryCode,
    countryLabel: region.countryLabel,
    currencyCode: region.currencyCode,
    priceText: rawItem.priceText,
    priceValue,
    cnyPrice: priceValue == null ? null : roundCurrency(priceValue * fxRateToCny),
    fxRateToCny,
    fxDate: fx.date,
    sourceUrl,
    evidenceSource: "app_store_html",
    rawTitle: rawItem.title,
    rawSnippetHash: rawItem.rawSnippetHash,
    fetchedAt,
    status: "available",
    failureReason: null,
  };
}

function buildMissingRow({ app, rule, region, sourceUrl, fetchedAt, failureReason }) {
  return {
    appSlug: app.slug,
    planSlug: rule.planSlug,
    countryCode: region.countryCode,
    countryLabel: region.countryLabel,
    currencyCode: region.currencyCode,
    priceText: null,
    priceValue: null,
    cnyPrice: null,
    fxRateToCny: null,
    fxDate: null,
    sourceUrl,
    evidenceSource: "app_store_html",
    rawTitle: null,
    rawSnippetHash: null,
    fetchedAt,
    status: "missing",
    failureReason,
  };
}

function buildReviewRow({ app, rule, region, sourceUrl, fetchedAt, candidates }) {
  return {
    appSlug: app.slug,
    planSlug: rule.planSlug,
    countryCode: region.countryCode,
    countryLabel: region.countryLabel,
    currencyCode: region.currencyCode,
    priceText: null,
    priceValue: null,
    cnyPrice: null,
    fxRateToCny: null,
    fxDate: null,
    sourceUrl,
    evidenceSource: "app_store_html",
    rawTitle: candidates.map((candidate) => candidate.title).join(" | "),
    rawSnippetHash: hashSnippet(candidates.map((candidate) => `${candidate.title} ${candidate.priceText}`).join("\n")),
    fetchedAt,
    status: "needs_review",
    failureReason: `Multiple candidates matched: ${candidates.map((candidate) => `${candidate.title} ${candidate.priceText}`).join("; ")}`,
  };
}

function buildFailure({ app, region, sourceUrl, status, failureReason, fetchedAt }) {
  return {
    appSlug: app.slug,
    countryCode: region.countryCode,
    countryLabel: region.countryLabel,
    sourceUrl,
    evidenceSource: "app_store_html",
    fetchedAt,
    status,
    failureReason,
  };
}

function runItem(app, region, status, matchedCount, rawItemCount, ms, failureReason = null) {
  return {
    appSlug: app.slug,
    countryCode: region.countryCode,
    status,
    matchedCount,
    rawItemCount,
    ms,
    failureReason,
  };
}

function buildAppStoreUrl(app, region) {
  return `https://apps.apple.com/${region.storefrontCode}/app/${app.appStoreSlug}/id${app.appStoreId}`;
}

function rateToCny(currencyCode, fx) {
  if (currencyCode === "CNY") return 1;
  const cnyPerUsd = fx.rates.CNY;
  const currencyPerUsd = fx.rates[currencyCode];
  if (!currencyPerUsd) throw new Error(`Missing FX rate for ${currencyCode}.`);
  return cnyPerUsd / currencyPerUsd;
}

function convertCurrency(value, fromCurrency, toCurrency, fx) {
  if (fromCurrency === toCurrency) return value;
  if (toCurrency === "USD") {
    if (fromCurrency === "USD") return value;
    const fromPerUsd = fx.rates[fromCurrency];
    if (!fromPerUsd) return null;
    return value / fromPerUsd;
  }
  if (fromCurrency === "USD") {
    const toPerUsd = fx.rates[toCurrency];
    if (!toPerUsd) return null;
    return value * toPerUsd;
  }
  const usd = convertCurrency(value, fromCurrency, "USD", fx);
  return usd == null ? null : convertCurrency(usd, "USD", toCurrency, fx);
}

function parsePriceValue(text) {
  if (!text) return null;
  const normalized = text
    .replace(/\u00a0/g, " ")
    .replace(/[^\d,.\s]/g, "")
    .trim()
    .replace(/\s+/g, "");
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");
  let decimalSeparator = null;

  if (lastComma > -1 && lastDot > -1) {
    decimalSeparator = lastComma > lastDot ? "," : ".";
  } else if (lastComma > -1) {
    decimalSeparator = normalized.length - lastComma - 1 <= 2 ? "," : null;
  } else if (lastDot > -1) {
    decimalSeparator = normalized.length - lastDot - 1 <= 2 ? "." : null;
  }

  let numberText = normalized;
  if (decimalSeparator) {
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    numberText = numberText.replaceAll(thousandsSeparator, "");
    if (decimalSeparator === ",") numberText = numberText.replace(",", ".");
  } else {
    numberText = numberText.replace(/[,.]/g, "");
  }

  const value = Number(numberText);
  return Number.isFinite(value) ? value : null;
}

function normalizePriceText(text) {
  return text.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function looksLikePrice(text) {
  return /(?:[$€£¥₺₱₩₹]|HK\$|S\$|CA\$|A\$|NT\$|USD|TRY|PHP|JPY|SGD|HKD)\s*\d|\d[\d,.]*\s*(?:USD|TRY|PHP|JPY|SGD|HKD)/i.test(text);
}

function decodeHtmlText(value) {
  return value
    .replace(/<!-- HTML_TAG_START -->|<!-- HTML_TAG_END -->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&[a-zA-Z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[()（）\-_·,，.。/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hashSnippet(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numericSort(a, b) {
  return Number(a || 0) - Number(b || 0);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(values) {
  const result = {};

  for (let index = 0; index < values.length; index += 1) {
    const item = values[index];
    if (!item.startsWith("--")) continue;

    const rawKey = item.slice(2);
    const [key, inlineValue] = rawKey.split("=", 2);
    const next = values[index + 1];

    if (inlineValue !== undefined) {
      result[key] = inlineValue;
    } else if (!next || next.startsWith("--")) {
      result[key] = true;
    } else {
      result[key] = next;
      index += 1;
    }
  }

  return result;
}

function normalizeOptions(options) {
  return {
    ...options,
    all: truthyOption(options.all),
    dryRun: truthyOption(options.dryRun ?? options["dry-run"]),
    post: truthyOption(options.post),
    db: truthyOption(options.db),
    timeoutMs: options.timeoutMs ?? options["timeout-ms"] ?? options.timeout,
  };
}

function truthyOption(value) {
  return value === true || value === "true" || value === "1" || value === "";
}

function printSummary(result) {
  console.log(
    [
      `Official price collection ${result.run.status}.`,
      `apps=${result.scope.apps.length}`,
      `regions=${result.scope.regions.length}`,
      `rows=${result.run.rowCount}`,
      `available=${result.run.availableCount}`,
      `missing=${result.run.missingCount}`,
      `needs_review=${result.run.needsReviewCount}`,
      `unmatched=${result.run.unmatchedCount}`,
      `failures=${result.run.failureCount}`,
    ].join(" "),
  );
}

function isCli() {
  return process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
}

function errorMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}
