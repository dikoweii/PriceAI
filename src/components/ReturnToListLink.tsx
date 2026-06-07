"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import { hasRecentListReturnIntent, sanitizeListReturnHref } from "@/lib/list-return";

export function ReturnToListLink({
  allowedKeys,
  basePath,
  intentKey,
  label,
}: {
  allowedKeys: readonly string[];
  basePath: string;
  intentKey: string;
  label: string;
}) {
  const [returnHref, setReturnHref] = useState(basePath);
  const [canUseHistoryReturn, setCanUseHistoryReturn] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      const back = new URLSearchParams(window.location.search).get("back") || undefined;
      setReturnHref(sanitizeListReturnHref(basePath, back, allowedKeys));
      setCanUseHistoryReturn(Boolean(back) && window.history.length > 1 && hasRecentListReturnIntent(intentKey));
    });
  }, [allowedKeys, basePath, intentKey]);

  function returnToList(event: MouseEvent<HTMLAnchorElement>) {
    if (!canUseHistoryReturn) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;

    event.preventDefault();
    try {
      window.sessionStorage.removeItem(intentKey);
    } catch {
      // Storage cleanup is best-effort; the href fallback still works.
    }
    window.history.back();
  }

  return (
    <Link
      href={returnHref}
      onClick={returnToList}
      className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-2 text-sm font-semibold text-[#5a6061] hover:bg-[#edf0f1] hover:text-[#2d3435] sm:px-3"
    >
      <ArrowLeft size={17} />
      {label}
    </Link>
  );
}
