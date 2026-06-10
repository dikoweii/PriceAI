"use client";

import { ArrowLeft } from "lucide-react";
import type { MouseEvent } from "react";
import Link from "next/link";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

const RETURN_HOME_INTENT_KEY = "priceai:return-home-intent";
const RETURN_HOME_INTENT_TTL_MS = 30 * 60 * 1000;

export function ProductDetailHeader() {
  return (
    <div className="sticky top-0 z-40 border-b border-[#dfe4e5] bg-[#f9f9f9]/95 shadow-[0_10px_24px_rgba(45,52,53,0.035)] backdrop-blur-xl">
      <SiteHeader logoCompact activeSection="channels" compactActionLabelFrom="2xl" />
    </div>
  );
}

export function ProductReturnLink() {
  const [returnHref, setReturnHref] = useState("/");
  const [canUseHistoryReturn, setCanUseHistoryReturn] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      const back = new URLSearchParams(window.location.search).get("back") || undefined;
      setReturnHref(buildReturnHref(back));
      setCanUseHistoryReturn(Boolean(back) && window.history.length > 1 && hasRecentHomeReturnIntent());
    });
  }, []);

  function returnHome(event: MouseEvent<HTMLAnchorElement>) {
    if (!canUseHistoryReturn) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    try {
      window.sessionStorage.removeItem(RETURN_HOME_INTENT_KEY);
    } catch {
      // Storage cleanup is best-effort; the href fallback still works.
    }
    window.history.back();
  }

  return (
    <Link href={returnHref} onClick={returnHome} className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2 text-sm font-semibold text-[#5a6061] hover:bg-[#edf0f1] hover:text-[#2d3435] sm:px-3">
      <ArrowLeft size={17} />
      返回首页
    </Link>
  );
}

function buildReturnHref(back: string | undefined): string {
  if (!back) return "/";

  const source = new URLSearchParams(back.replace(/^\?/, ""));
  const safe = new URLSearchParams();
  const allowedKeys = ["q", "platform", "type", "stock", "sort", "min", "max", "view", "scope"];

  allowedKeys.forEach((key) => {
    const value = source.get(key);
    if (value) safe.set(key, value);
  });

  const query = safe.toString();
  return query ? `/?${query}` : "/";
}

function hasRecentHomeReturnIntent(): boolean {
  try {
    const savedAt = Number(window.sessionStorage.getItem(RETURN_HOME_INTENT_KEY) || 0);
    return savedAt > 0 && Date.now() - savedAt <= RETURN_HOME_INTENT_TTL_MS;
  } catch {
    return false;
  }
}
