export const LIST_RETURN_INTENT_TTL_MS = 30 * 60 * 1000;
export const OFFICIAL_PRICE_RETURN_INTENT_KEY = "priceai:official:return-intent";
export const API_MODELS_RETURN_INTENT_KEY = "priceai:api-models:return-intent";

export function listDetailHref(path: string, returnQuery: string): string {
  return `${path}?back=${encodeURIComponent(returnQuery || "home")}`;
}

export function sanitizeListReturnHref(basePath: string, back: string | undefined, allowedKeys: readonly string[]): string {
  if (!back || back === "home") return basePath;

  const source = new URLSearchParams(back.replace(/^\?/, ""));
  const safe = new URLSearchParams();

  allowedKeys.forEach((key) => {
    const value = source.get(key);
    if (value) safe.set(key, value);
  });

  const query = safe.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function markListReturnIntent(intentKey: string) {
  try {
    window.sessionStorage.setItem(intentKey, String(Date.now()));
  } catch {
    // Returning still works through the href fallback if session storage is unavailable.
  }
}

export function hasRecentListReturnIntent(intentKey: string): boolean {
  try {
    const savedAt = Number(window.sessionStorage.getItem(intentKey) || 0);
    return savedAt > 0 && Date.now() - savedAt <= LIST_RETURN_INTENT_TTL_MS;
  } catch {
    return false;
  }
}
