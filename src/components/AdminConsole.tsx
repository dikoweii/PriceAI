"use client";

import {
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  Database,
  FileInput,
  Inbox,
  KeyRound,
  Loader2,
  Plus,
  RefreshCcw,
  Store,
  TerminalSquare,
  X,
} from "lucide-react";
import Link from "next/link";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  AdminSummary,
  ChannelSubmission,
  CollectionMethod,
  CrawlRun,
  OfferStatus,
  Source,
} from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

type Message = {
  type: "success" | "error" | "info";
  text: string;
};

type ProbeOffer = {
  sourceStoreName?: string | null;
  sourceTitle: string;
  price: number | null;
  currency: string;
  status: OfferStatus;
  url: string;
  tags?: string[];
  stockCount?: number | null;
};

type ProbeResult = {
  sourceId?: string;
  sourceName?: string;
  sourceUrl?: string;
  baseUrl?: string;
  kind: string | null;
  status: "success" | "empty" | "failed" | "unsupported";
  offerCount: number;
  offers: ProbeOffer[];
  ms?: number;
  message?: string;
  finishedAt?: string;
};

type AdminTab = "review" | "collect" | "sources" | "manual" | "logs";

const statusOptions: Array<[OfferStatus, string]> = [
  ["in_stock", "有货"],
  ["out_of_stock", "缺货"],
];

export function AdminConsole({ data }: { data: AdminSummary }) {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ChannelSubmission[]>(data.pendingSubmissions || []);
  const [probeResults, setProbeResults] = useState<Record<string, ProbeResult>>({});
  const [activeTab, setActiveTab] = useState<AdminTab>("review");

  const reviewSubmissions = useMemo(
    () => submissions.filter((submission) => !isCollectorTodo(submission)),
    [submissions],
  );
  const collectorTodoSubmissions = useMemo(
    () => submissions.filter(isCollectorTodo),
    [submissions],
  );
  const sourceById = useMemo(
    () => new Map(data.sources.map((source) => [source.id, source])),
    [data.sources],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.sessionStorage.getItem("ai-price-hub-admin");
      if (stored) {
        setPassword(stored);
        setAuthed(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const summary = useMemo(
    () => [
      ["渠道源", data.sources.length.toString(), <Store key="store" size={17} />],
      ["标准商品", data.products.length.toString(), <Database key="db" size={17} />],
      ["报价", data.rawOffers.length.toString(), <FileInput key="file" size={17} />],
      ["待审核", reviewSubmissions.length.toString(), <Inbox key="inbox" size={17} />],
      ["采集待办", collectorTodoSubmissions.length.toString(), <TerminalSquare key="terminal" size={17} />],
    ],
    [collectorTodoSubmissions.length, data, reviewSubmissions.length],
  );
  const offerCountBySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const offer of data.rawOffers) {
      if (!offer.sourceId) continue;
      map.set(offer.sourceId, (map.get(offer.sourceId) || 0) + 1);
    }
    return map;
  }, [data.rawOffers]);
  const sourceGroups = useMemo(() => groupSources(data.sources), [data.sources]);
  const failedRunCount = useMemo(
    () => data.crawlRuns.filter((run) => run.status === "failed").length,
    [data.crawlRuns],
  );
  const adminTabs = useMemo(
    () => [
      { id: "review" as const, label: "审核", count: reviewSubmissions.length + collectorTodoSubmissions.length },
      { id: "collect" as const, label: "采集", count: failedRunCount },
      { id: "sources" as const, label: "渠道", count: data.sources.length },
      { id: "manual" as const, label: "维护", count: null },
      { id: "logs" as const, label: "日志", count: data.crawlRuns.length },
    ],
    [
      collectorTodoSubmissions.length,
      data.crawlRuns.length,
      data.sources.length,
      failedRunCount,
      reviewSubmissions.length,
    ],
  );

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("login");
    setMessage(null);

    const result = await request("/api/admin/login", password, { password });
    setLoadingAction(null);

    if (result.ok) {
      window.sessionStorage.setItem("ai-price-hub-admin", password);
      setAuthed(true);
      setMessage({ type: "success", text: "后台已解锁。" });
      void refreshSubmissions(password);
    } else {
      setMessage({ type: "error", text: result.message || "登录失败。" });
    }
  }

  async function importAibijia() {
    setLoadingAction("import-aibijia");
    setMessage({ type: "info", text: "正在导入 Aibijia 公开报价..." });
    const result = await request("/api/admin/import-aibijia", password, {});
    setLoadingAction(null);

    if (result.ok) {
      setMessage({
        type: "success",
        text: `导入完成：${result.result?.offerCount || 0} 条报价，合并到 ${result.result?.sourceCount || 0} 个渠道源，并迁移 ${result.result?.migratedLegacyOfferCount || 0} 条旧报价。刷新页面即可看到最新数据。`,
      });
    } else {
      setMessage({ type: "error", text: result.message || "导入失败。" });
    }
  }

  async function collectPrices() {
    setLoadingAction("collect-prices");
    setMessage({ type: "info", text: "正在采集所有卡网最新价格，请稍候..." });
    try {
      const response = await fetch("/api/cron/collect-prices", {
        method: "POST",
        headers: { "x-admin-password": password },
      });
      const json = await response.json().catch(() => ({ ok: false, message: response.statusText }));
      if (response.ok && json.ok) {
        const summaries: Array<{ source?: string; status?: string; offers?: number }> =
          Array.isArray(json.summary) ? json.summary : [];
        const success = summaries.filter((item) => item.status === "success").length;
        const failed = summaries.length - success;
        const totalOffers = summaries.reduce((sum, item) => sum + (item.offers || 0), 0);
        setMessage({
          type: failed ? "info" : "success",
          text: `采集完成：${success}/${summaries.length} 个来源成功，共 ${totalOffers} 条报价。${failed ? `失败 ${failed} 个，可在「最近采集记录」查看原因。` : ""}`,
        });
      } else {
        setMessage({ type: "error", text: json.message || "采集失败。" });
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "网络错误。" });
    } finally {
      setLoadingAction(null);
    }
  }

  async function submitSource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("source");
    const form = new FormData(event.currentTarget);
    const result = await request("/api/admin/sources", password, {
      name: String(form.get("name") || ""),
      entryUrl: String(form.get("entryUrl") || ""),
      baseUrl: String(form.get("baseUrl") || "") || null,
      collectionMethod: String(form.get("collectionMethod") || "manual") as CollectionMethod,
      enabled: true,
      notes: String(form.get("notes") || "") || null,
    });
    setLoadingAction(null);

    setMessage(result.ok ? { type: "success", text: "来源已保存，刷新页面后可查看。" } : { type: "error", text: result.message || "保存失败。" });
  }

  async function submitOffer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("manual-offer");
    const form = new FormData(event.currentTarget);
    const tags = String(form.get("tags") || "")
      .split(/[,，\n|｜]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const priceValue = String(form.get("price") || "");

    const result = await request("/api/admin/manual-offer", password, {
      sourceName: String(form.get("sourceName") || ""),
      sourceUrl: String(form.get("sourceUrl") || ""),
      sourceStoreName: String(form.get("sourceStoreName") || ""),
      sourceTitle: String(form.get("sourceTitle") || ""),
      price: priceValue ? Number(priceValue) : null,
      currency: "CNY",
      status: String(form.get("status") || "unknown") as OfferStatus,
      url: String(form.get("url") || ""),
      tags,
      stockCount: null,
    });
    setLoadingAction(null);

    setMessage(result.ok ? { type: "success", text: "手动报价已保存，刷新页面后可查看。" } : { type: "error", text: result.message || "保存失败。" });
  }

  async function refreshSubmissions(currentPassword: string) {
    try {
      const response = await fetch("/api/admin/submissions?status=pending", {
        headers: { "x-admin-password": currentPassword },
      });
      const json = await response.json().catch(() => ({ ok: false }));
      if (response.ok && json.ok) {
        setSubmissions(json.submissions || []);
      }
    } catch {
      /* ignore */
    }
  }

  async function approveSubmission(
    submission: ChannelSubmission,
    overrides: { name?: string; collectionMethod?: CollectionMethod },
  ) {
    setLoadingAction(`approve-${submission.id}`);
    const result = await request("/api/admin/submissions/approve", password, {
      id: submission.id,
      name: overrides.name?.trim() || null,
      collectionMethod: overrides.collectionMethod || "manual",
    });
    setLoadingAction(null);

    if (result.ok) {
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
      setProbeResults((prev) => omitKey(prev, submission.id));
      const imported = Number(result.importedOfferCount || 0);
      const merged = Boolean(result.matchedExistingSource);
      setMessage({
        type: "success",
        text: merged
          ? `已合并到已有源：${result.source?.name || submission.url}${imported ? `，入库 ${imported} 条报价。` : "。"}`
          : `已通过并入库：${result.source?.name || submission.url}，入库 ${imported} 条报价。`,
      });
    } else {
      if (isAlreadyHandled(result.message)) {
        setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
        setProbeResults((prev) => omitKey(prev, submission.id));
      }
      setMessage({ type: "error", text: result.message || "通过失败。" });
    }
  }

  async function probeSubmission(submission: ChannelSubmission) {
    setLoadingAction(`probe-${submission.id}`);
    setMessage({ type: "info", text: "正在试采集该渠道，不会写入正式报价..." });
    const result = await request("/api/admin/submissions/probe", password, {
      id: submission.id,
    });
    setLoadingAction(null);

    if (result.ok && result.result) {
      const probeResult = result.result as ProbeResult;
      setProbeResults((prev) => ({ ...prev, [submission.id]: probeResult }));
      if (result.submission) {
        setSubmissions((prev) => replaceSubmission(prev, result.submission as ChannelSubmission));
      }
      setMessage({
        type: probeResult.status === "success" ? "success" : "info",
        text: probeResult.message || "试采集完成。",
      });
    } else {
      setMessage({ type: "error", text: result.message || "试采集失败。" });
    }
  }

  async function todoSubmission(submission: ChannelSubmission, note: string) {
    setLoadingAction(`todo-${submission.id}`);
    const result = await request("/api/admin/submissions/todo", password, {
      id: submission.id,
      note: note || null,
    });
    setLoadingAction(null);

    if (result.ok && result.submission) {
      setSubmissions((prev) => replaceSubmission(prev, result.submission as ChannelSubmission));
      setMessage({ type: "info", text: "已加入采集器待办，后续补解析脚本后可重新试采集。" });
    } else {
      setMessage({ type: "error", text: result.message || "加入待办失败。" });
    }
  }

  async function rejectSubmission(submission: ChannelSubmission, note: string) {
    setLoadingAction(`reject-${submission.id}`);
    const result = await request("/api/admin/submissions/reject", password, {
      id: submission.id,
      reviewerNote: note || null,
    });
    setLoadingAction(null);

    if (result.ok) {
      setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
      setProbeResults((prev) => omitKey(prev, submission.id));
      setMessage({ type: "info", text: "已拒绝该提交。" });
    } else {
      if (isAlreadyHandled(result.message)) {
        setSubmissions((prev) => prev.filter((item) => item.id !== submission.id));
        setProbeResults((prev) => omitKey(prev, submission.id));
      }
      setMessage({ type: "error", text: result.message || "拒绝失败。" });
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] text-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border border-stone-200 bg-white p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-stone-500 hover:text-emerald-800">
              返回首页
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">后台管理</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              管理来源、审核提交、同步 Aibijia 公开数据，并查看自动采集与浏览器采集记录。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:w-[700px]">
            {summary.map(([label, value, icon]) => (
              <div key={String(label)} className="border border-stone-200 bg-stone-50 px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  {icon}
                  {label}
                </div>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {message ? <MessageBox message={message} /> : null}

        {!data.configured ? (
          <div className="mt-4 flex items-start gap-2 border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
            <span>
              还没有配置 Supabase。前台会使用演示数据，后台保存、导入和采集入库会返回配置提示。
            </span>
          </div>
        ) : null}

        {!authed ? (
          <section className="mt-5 max-w-xl border border-stone-200 bg-white p-5">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <KeyRound size={19} />
              后台密码
            </div>
            <p className="mt-2 text-sm text-stone-600">
              使用 `.env.local` 里的 `ADMIN_PASSWORD`。未配置时，本地默认密码为 `ai-price-hub-local`。
            </p>
            <form onSubmit={login} className="mt-4 flex gap-2">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="输入后台密码"
                className="h-11 min-w-0 flex-1 border border-stone-300 bg-stone-50 px-3 text-sm outline-none focus:border-emerald-700"
              />
              <button className="inline-flex h-11 items-center gap-2 bg-stone-900 px-4 text-sm font-medium text-white hover:bg-emerald-800">
                {loadingAction === "login" ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                解锁
              </button>
            </form>
          </section>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="overflow-x-auto border border-stone-200 bg-white p-1">
              <div className="flex min-w-max gap-1">
                {adminTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                    }`}
                  >
                    {tab.label}
                    {typeof tab.count === "number" ? (
                      <span
                        className={`px-1.5 py-0.5 text-xs ${
                          activeTab === tab.id ? "bg-white/15 text-white" : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "review" ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
                <Panel title={`待审核提交 (${reviewSubmissions.length})`} icon={<Inbox size={18} />}>
                  {reviewSubmissions.length ? (
                    <div className="divide-y divide-stone-200 border border-stone-200">
                      {reviewSubmissions.map((submission) => (
                        <SubmissionRow
                          key={submission.id}
                          submission={submission}
                          existingSource={sourceById.get(suggestedSourceIdForSubmission(submission) || "") || null}
                          loadingAction={loadingAction}
                          probeResult={probeResults[submission.id]}
                          onApprove={approveSubmission}
                          onProbe={probeSubmission}
                          onTodo={todoSubmission}
                          onReject={rejectSubmission}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-stone-200 bg-stone-50 px-4 py-6">
                      <p className="text-sm font-medium text-stone-900">暂无待审核提交</p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        用户提交的新渠道会先解析和试采集。成功后通过并入库，暂不支持的渠道进入采集器待办。
                      </p>
                    </div>
                  )}
                </Panel>

                <section className="space-y-5">
                  <Panel title="审核规则" icon={<CheckCircle2 size={18} />}>
                    <div className="space-y-4 text-sm leading-6 text-stone-600">
                      <p>
                        默认流程：解析链接，试采集，采集成功后通过并入库；如果匹配已有源，可以直接合并通过；暂不支持的渠道加入采集器待办。
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <StatTile label="待审核" value={reviewSubmissions.length.toString()} />
                        <StatTile label="采集待办" value={collectorTodoSubmissions.length.toString()} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("collect")}
                        className="inline-flex h-10 w-full items-center justify-center gap-2 border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
                      >
                        查看采集状态
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </Panel>

                  <CollectorTodoPanel
                    submissions={collectorTodoSubmissions}
                    loadingAction={loadingAction}
                    onRetry={probeSubmission}
                  />
                </section>
              </div>
            ) : null}

            {activeTab === "collect" ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
                <section className="space-y-5">
                  <Panel title="数据同步" icon={<RefreshCcw size={18} />}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-900">Aibijia 公开报价</p>
                        <p className="mt-1 text-sm text-stone-600">
                          从 `https://data.aibijia.org/products.json` 同步商品、渠道和报价。
                        </p>
                      </div>
                      <button
                        onClick={importAibijia}
                        className="inline-flex h-10 items-center justify-center gap-2 bg-emerald-800 px-4 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        {loadingAction === "import-aibijia" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                        导入 Aibijia
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-medium text-stone-900">立即采集所有卡网</p>
                        <p className="mt-1 text-sm text-stone-600">
                          手动触发跟 Vercel Cron 相同的采集流程（KAMI / DUJIAO 全量）。
                        </p>
                      </div>
                      <button
                        onClick={collectPrices}
                        disabled={loadingAction === "collect-prices"}
                        className="inline-flex h-10 items-center justify-center gap-2 bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-60"
                      >
                        {loadingAction === "collect-prices" ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
                        立即采集
                      </button>
                    </div>
                  </Panel>

                  <Panel title="自动采集与浏览器兜底" icon={<TerminalSquare size={18} />}>
                    <p className="text-sm leading-6 text-stone-600">
                      部署后由 `/api/cron/collect-prices` 定时采集真实价格和库存；接口失败、WAF 或登录页才切换到本机浏览器半自动采集。
                    </p>
                    <div className="mt-3 overflow-x-auto whitespace-nowrap border border-stone-200 bg-stone-950 px-3 py-3 font-mono text-xs leading-6 text-stone-100">
                      GET /api/cron/collect-prices
                    </div>
                    <div className="mt-2 overflow-x-auto whitespace-nowrap border border-stone-200 bg-stone-950 px-3 py-3 font-mono text-xs leading-6 text-stone-100">
                      {"npm run collect:browser -- --url https://aisou.pro/ --password <后台密码> --post"}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-stone-500">
                      本页不会显示真实后台密码。生产环境请配置 `CRON_SECRET`，由 Vercel Cron、Supabase Cron 或云服务器 cron 调用接口。
                    </p>
                  </Panel>
                </section>

                <RecentRunsPanel runs={data.crawlRuns.slice(0, 8)} />
              </div>
            ) : null}

            {activeTab === "sources" ? (
              <Panel title="总渠道源" icon={<Store size={18} />}>
                <SourceTable groups={sourceGroups} offerCountBySource={offerCountBySource} />
              </Panel>
            ) : null}

            {activeTab === "manual" ? (
              <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="新增来源" icon={<Plus size={18} />}>
                  <form onSubmit={submitSource} className="space-y-3">
                    <TextInput name="name" label="来源名称" placeholder="例如 Aisou智充" />
                    <TextInput name="entryUrl" label="入口链接" placeholder="https://example.com/" type="url" />
                    <TextInput name="baseUrl" label="主域名" placeholder="https://example.com" type="url" required={false} />
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-stone-500">采集方式</span>
                      <select name="collectionMethod" className="h-10 w-full border border-stone-300 bg-stone-50 px-3 text-sm outline-none focus:border-emerald-700">
                        <option value="browser">浏览器采集</option>
                        <option value="http">自动接口采集</option>
                        <option value="aibijia_json">Aibijia 数据</option>
                      </select>
                    </label>
                    <TextArea name="notes" label="备注" placeholder="采集限制、WAF、登录要求等" required={false} />
                    <SubmitButton loading={loadingAction === "source"} label="保存来源" />
                  </form>
                </Panel>

                <Panel title="调试补录报价" icon={<FileInput size={18} />}>
                  <p className="mb-3 text-xs leading-5 text-stone-500">
                    仅用于排查分类和展示，不作为渠道长期维护方式。
                  </p>
                  <form onSubmit={submitOffer} className="space-y-3">
                    <TextInput name="sourceName" label="来源名称" placeholder="例如 LDXP Pixelshop" />
                    <TextInput name="sourceUrl" label="来源入口" placeholder="https://pay.ldxp.cn/shop/pixelshop" type="url" />
                    <TextInput name="sourceStoreName" label="店铺名称" placeholder="可留空" required={false} />
                    <TextArea name="sourceTitle" label="原始商品名" placeholder="复制卡网里的完整商品名" />
                    <div className="grid grid-cols-2 gap-2">
                      <TextInput name="price" label="价格" placeholder="35" type="number" />
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-stone-500">状态</span>
                        <select name="status" className="h-10 w-full border border-stone-300 bg-stone-50 px-3 text-sm outline-none focus:border-emerald-700">
                          {statusOptions.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <TextInput name="url" label="购买链接" placeholder="https://example.com/item/xxx" type="url" />
                    <TextInput name="tags" label="标签" placeholder="无质保, 自动发货" required={false} />
                    <SubmitButton loading={loadingAction === "manual-offer"} label="保存报价" />
                  </form>
                </Panel>
              </div>
            ) : null}

            {activeTab === "logs" ? <RecentRunsPanel runs={data.crawlRuns} /> : null}
          </div>
        )}
      </div>
    </main>
  );
}

async function request(path: string, password: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": password,
    },
    body: JSON.stringify(body),
  });

  return response.json().catch(() => ({ ok: false, message: response.statusText }));
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-stone-200 bg-white p-4">
      <div className="mb-4 flex items-center gap-2 text-base font-semibold text-stone-900">
        {icon}
        {title}
      </div>
      {children}
    </section>
  );
}

function MessageBox({ message }: { message: Message }) {
  const className =
    message.type === "success"
      ? "border-emerald-300 bg-emerald-50 text-emerald-950"
      : message.type === "error"
        ? "border-red-300 bg-red-50 text-red-950"
        : "border-blue-300 bg-blue-50 text-blue-950";
  const Icon = message.type === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div className={`mt-4 flex items-start gap-2 border px-4 py-3 text-sm ${className}`}>
      <Icon size={17} className="mt-0.5 shrink-0" />
      <span>{message.text}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-200 bg-stone-50 px-3 py-2">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-stone-950">{value}</p>
    </div>
  );
}

function CollectorTodoPanel({
  submissions,
  loadingAction,
  onRetry,
}: {
  submissions: ChannelSubmission[];
  loadingAction: string | null;
  onRetry: (submission: ChannelSubmission) => void;
}) {
  return (
    <Panel title={`采集器待办 (${submissions.length})`} icon={<TerminalSquare size={18} />}>
      {submissions.length ? (
        <div className="divide-y divide-amber-200 border border-amber-200 bg-amber-50">
          {submissions.map((submission) => {
            const meta = submission.parsedMeta || {};
            const reason = stringMeta(meta, "collector_todo_reason") || stringMeta(meta, "support_reason");
            const domain = stringMeta(meta, "domain") || safeDomain(submission.url);
            const probeLoading = loadingAction === `probe-${submission.id}`;

            return (
              <div key={submission.id} className="px-3 py-3">
                <div className="flex flex-wrap items-baseline gap-2">
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-stone-950 hover:text-amber-900"
                  >
                    {submission.name || submission.parsedTitle || domain || submission.url}
                  </a>
                  {domain ? <span className="text-xs text-stone-500">{domain}</span> : null}
                </div>
                <p className="mt-1 break-all text-xs text-stone-500">{submission.url}</p>
                <p className="mt-2 text-xs leading-5 text-amber-950">
                  {reason || "需要新增解析脚本后重新试采集。"}
                </p>
                <button
                  type="button"
                  disabled={probeLoading}
                  onClick={() => onRetry(submission)}
                  className="mt-3 inline-flex h-8 items-center gap-1.5 border border-amber-300 bg-white px-3 text-xs font-medium text-stone-800 hover:bg-amber-100 disabled:opacity-60"
                >
                  {probeLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                  重新试采集
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm leading-6 text-stone-500">
          暂无待开发采集器。试采集失败的渠道可以先放到这里，后续新增解析脚本后再重新验证。
        </p>
      )}
    </Panel>
  );
}

function SourceTable({
  groups,
  offerCountBySource,
}: {
  groups: Array<{ label: string; sources: Source[] }>;
  offerCountBySource: Map<string, number>;
}) {
  return (
    <div className="overflow-hidden border border-stone-200">
      <div className="hidden grid-cols-[1fr_80px_130px_110px] gap-3 border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500 md:grid">
        <span>来源</span>
        <span>报价</span>
        <span>采集方式</span>
        <span>状态</span>
      </div>
      <div className="divide-y divide-stone-200">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-600">
              {group.label} · {group.sources.length} 个
            </div>
            {group.sources.map((source) => (
              <div key={source.id} className="grid gap-2 px-3 py-3 md:grid-cols-[1fr_80px_130px_110px] md:items-center">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">{source.name}</p>
                  <a
                    href={source.entryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-xs text-stone-500 hover:text-emerald-800"
                  >
                    {source.entryUrl}
                  </a>
                </div>
                <span className="text-sm font-medium text-stone-700">
                  <span className="mr-1 text-xs text-stone-400 md:hidden">报价</span>
                  {offerCountBySource.get(source.id) || 0}
                </span>
                <span className="text-sm text-stone-600">{collectionMethodLabel(source.collectionMethod)}</span>
                {source.enabled ? (
                  <span className="w-fit bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-900">启用</span>
                ) : (
                  <span className="w-fit bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">停用</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentRunsPanel({ runs }: { runs: CrawlRun[] }) {
  return (
    <Panel title="最近采集记录" icon={<RefreshCcw size={18} />}>
      {runs.length ? (
        <div className="divide-y divide-stone-200 border border-stone-200">
          {runs.map((run) => (
            <div key={run.id} className="px-3 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-stone-900">{run.sourceName || run.sourceId || "未知来源"}</span>
                <span className="bg-stone-100 px-2 py-1 text-xs text-stone-600">{collectionMethodLabel(run.mode)}</span>
                <span className={crawlStatusClass(run.status)}>{crawlStatusLabel(run.status)}</span>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                成功 {run.successCount} 条，失败 {run.failureCount} 条 · {formatRelativeTime(run.finishedAt || run.startedAt)}
              </p>
              {run.message ? <p className="mt-1 break-words text-xs leading-5 text-stone-500">{run.message}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-500">暂无采集记录。</p>
      )}
    </Panel>
  );
}

function groupSources(sources: Source[]) {
  const order = ["数据入口", "LDXP 系", "Auto Subscribe 系", "HTTP 优先", "独立渠道", "自有配置"];
  const groups = new Map<string, Source[]>();

  for (const source of sources) {
    const label = classifySourceGroup(source);
    const items = groups.get(label) || [];
    items.push(source);
    groups.set(label, items);
  }

  return order
    .map((label) => ({
      label,
      sources: (groups.get(label) || []).sort((a, b) => a.name.localeCompare(b.name, "zh-CN")),
    }))
    .filter((group) => group.sources.length);
}

function SubmissionRow({
  submission,
  existingSource,
  loadingAction,
  probeResult,
  onApprove,
  onProbe,
  onTodo,
  onReject,
}: {
  submission: ChannelSubmission;
  existingSource?: Source | null;
  loadingAction: string | null;
  probeResult?: ProbeResult;
  onApprove: (
    submission: ChannelSubmission,
    overrides: { name?: string; collectionMethod?: CollectionMethod },
  ) => void;
  onProbe: (submission: ChannelSubmission) => void;
  onTodo: (submission: ChannelSubmission, note: string) => void;
  onReject: (submission: ChannelSubmission, note: string) => void;
}) {
  const meta = submission.parsedMeta || {};
  const domain = typeof meta.domain === "string" ? meta.domain : safeDomain(submission.url);
  const platform = typeof meta.platform === "string" ? meta.platform : null;
  const productType = typeof meta.product_type === "string" ? meta.product_type : null;
  const suggestedName = stringMeta(meta, "suggested_source_name");
  const suggestedSourceId = stringMeta(meta, "suggested_source_id");
  const suggestedMethod = collectionMethodMeta(meta, "suggested_collection_method");
  const suggestedCollector = stringMeta(meta, "suggested_collector_kind");
  const supportReason = stringMeta(meta, "support_reason");
  const parseError = typeof meta.parse_error === "string" ? meta.parse_error : null;
  const currentProbe = probeResult || probeResultFromMeta(meta);
  const hasSuccessfulProbe = currentProbe?.status === "success" && currentProbe.offerCount > 0;
  const canApprove = Boolean(existingSource || hasSuccessfulProbe);

  const [mode, setMode] = useState<"idle" | "approve" | "todo" | "reject">("idle");
  const [name, setName] = useState(submission.name || suggestedName || submission.parsedTitle || "");
  const [collectionMethod, setCollectionMethod] = useState<CollectionMethod>(suggestedMethod || "http");
  const [collectorNote, setCollectorNote] = useState(
    stringMeta(meta, "collector_todo_reason") || stringMeta(meta, "support_reason") || "",
  );
  const [reviewerNote, setReviewerNote] = useState("");

  const recommendedMethod: CollectionMethod = hasSuccessfulProbe ? "http" : suggestedMethod || collectionMethod || "http";
  const recommendedAction = existingSource
    ? `合并到已有源：${existingSource.name}`
    : hasSuccessfulProbe
      ? `通过并入库 ${currentProbe?.offerCount || 0} 条`
      : currentProbe
        ? "加入采集器待办"
        : "试采集";
  const approveLoading = loadingAction === `approve-${submission.id}`;
  const probeLoading = loadingAction === `probe-${submission.id}`;
  const todoLoading = loadingAction === `todo-${submission.id}`;
  const rejectLoading = loadingAction === `reject-${submission.id}`;

  return (
    <div className="px-3 py-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <a
          href={submission.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-stone-900 hover:text-emerald-800"
        >
          {submission.parsedTitle || submission.name || suggestedName || domain || submission.url}
        </a>
        {domain ? <span className="text-xs text-stone-500">{domain}</span> : null}
        <span className="text-xs text-stone-400">· {formatRelativeTime(submission.createdAt)}</span>
      </div>
      <p className="mt-1 break-all text-xs text-stone-500">{submission.url}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {platform ? <Badge>{platform}</Badge> : null}
        {productType ? <Badge>{productType}</Badge> : null}
        {suggestedMethod ? <Badge tone="info">建议: {collectionMethodLabel(suggestedMethod)}</Badge> : null}
        {suggestedCollector ? <Badge tone="info">采集器: {suggestedCollector}</Badge> : null}
        {submission.contact ? <Badge tone="info">联系: {submission.contact}</Badge> : null}
        {parseError ? <Badge tone="warn">解析失败: {parseError}</Badge> : null}
        {existingSource ? <Badge tone="info">匹配已有源: {existingSource.name}</Badge> : null}
      </div>
      <div className="mt-3 grid gap-2 border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 sm:grid-cols-2">
        <p>
          <span className="font-medium text-stone-800">建议渠道名：</span>
          {suggestedName || submission.name || domain || "未识别"}
        </p>
        <p>
          <span className="font-medium text-stone-800">建议来源 ID：</span>
          {suggestedSourceId || "自动生成"}
        </p>
        <p>
          <span className="font-medium text-stone-800">建议采集方式：</span>
          {collectionMethodLabel(suggestedMethod || "browser")}
        </p>
        <p>
          <span className="font-medium text-stone-800">初步判断：</span>
          {supportReason || "已完成基础链接解析。"}
        </p>
        {existingSource ? (
          <p>
            <span className="font-medium text-stone-800">合并目标：</span>
            {existingSource.name}
          </p>
        ) : null}
      </div>
      {submission.notes ? (
        <p className="mt-2 text-xs text-stone-600">备注：{submission.notes}</p>
      ) : null}

      {currentProbe ? <ProbePreview result={currentProbe} /> : null}

      {mode === "idle" ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={probeLoading || approveLoading || todoLoading}
            onClick={() => {
              if (canApprove) {
                onApprove(submission, { name, collectionMethod: recommendedMethod });
                return;
              }
              if (!currentProbe) {
                onProbe(submission);
                return;
              }
              setMode("todo");
            }}
            className="inline-flex h-9 items-center gap-1.5 bg-stone-900 px-3 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-60"
          >
            {probeLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : canApprove ? (
              <CheckCircle2 size={14} />
            ) : (
              <RefreshCcw size={14} />
            )}
            {recommendedAction}
          </button>
          {canApprove ? (
            <button
              type="button"
              onClick={() => setMode("approve")}
              className="inline-flex h-9 items-center gap-1.5 border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <CheckCircle2 size={14} />
              编辑后通过
            </button>
          ) : currentProbe ? (
            <button
              type="button"
              disabled={probeLoading}
              onClick={() => onProbe(submission)}
              className="inline-flex h-9 items-center gap-1.5 border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60"
            >
              {probeLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              重新试采集
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setMode("reject")}
            className="inline-flex h-9 items-center gap-1.5 border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <X size={14} />
            拒绝
          </button>
        </div>
      ) : null}

      {mode === "approve" ? (
        <div className="mt-3 space-y-2 border border-stone-200 bg-stone-50 p-3">
          <p className="text-xs leading-5 text-stone-600">
            {existingSource
              ? `该提交会合并到已有源「${existingSource.name}」。`
              : `该提交会创建渠道，并把试采集结果入库。`}
          </p>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-stone-500">渠道名称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-9 w-full border border-stone-300 bg-white px-2 text-sm outline-none focus:border-emerald-700"
              placeholder={domain || "渠道名称"}
            />
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-stone-500">采集方式</span>
            <select
              value={collectionMethod}
              onChange={(event) => setCollectionMethod(event.target.value as CollectionMethod)}
              className="h-9 w-full border border-stone-300 bg-white px-2 text-sm outline-none focus:border-emerald-700"
            >
              <option value="http">自动接口采集</option>
              <option value="browser">浏览器采集</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={approveLoading}
              onClick={() => onApprove(submission, { name, collectionMethod })}
              className="inline-flex h-8 items-center gap-1 bg-emerald-700 px-3 text-xs font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {approveLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              确认通过并入库
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-8 items-center gap-1 border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      {mode === "todo" ? (
        <div className="mt-3 space-y-2 border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs leading-5 text-amber-950">
            这个渠道暂时不进入比价库，保留为采集器待办。补解析脚本后可以重新试采集。
          </p>
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-amber-900">待办说明</span>
            <input
              value={collectorNote}
              onChange={(event) => setCollectorNote(event.target.value)}
              className="h-9 w-full border border-amber-300 bg-white px-2 text-sm outline-none focus:border-amber-700"
              placeholder="如：需要新增该域名解析脚本 / 接口未识别"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={todoLoading}
              onClick={() => onTodo(submission, collectorNote)}
              className="inline-flex h-8 items-center gap-1 bg-stone-900 px-3 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-60"
            >
              {todoLoading ? <Loader2 size={14} className="animate-spin" /> : <TerminalSquare size={14} />}
              加入采集器待办
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-8 items-center gap-1 border border-amber-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-amber-100"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}

      {mode === "reject" ? (
        <div className="mt-3 space-y-2 border border-stone-200 bg-stone-50 p-3">
          <label className="block text-xs">
            <span className="mb-1 block font-medium text-stone-500">拒绝备注（可选）</span>
            <input
              value={reviewerNote}
              onChange={(event) => setReviewerNote(event.target.value)}
              className="h-9 w-full border border-stone-300 bg-white px-2 text-sm outline-none focus:border-emerald-700"
              placeholder="如：重复 / 不相关 / 失效"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={rejectLoading}
              onClick={() => onReject(submission, reviewerNote)}
              className="inline-flex h-8 items-center gap-1 bg-stone-900 px-3 text-xs font-medium text-white hover:bg-stone-700 disabled:opacity-60"
            >
              {rejectLoading ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              确认拒绝
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className="inline-flex h-8 items-center gap-1 border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProbePreview({ result }: { result: ProbeResult }) {
  const statusClass =
    result.status === "success"
      ? "bg-emerald-50 text-emerald-800"
      : result.status === "failed"
        ? "bg-red-50 text-red-800"
        : "bg-amber-50 text-amber-900";
  const statusLabel =
    result.status === "success"
      ? "可自动采集"
      : result.status === "empty"
        ? "未采到报价"
        : result.status === "unsupported"
          ? "暂不支持"
          : "采集失败";
  const nextAction =
    result.status === "success"
      ? "建议通过并把本次试采集报价写入正式报价库。"
      : "当前不进入比价库；建议加入采集器待办，补解析脚本后重新试采集。";

  return (
    <div className="mt-3 border border-stone-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`px-2 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span>
        <span className="text-xs text-stone-500">采集器：{result.kind || "无"}</span>
        <span className="text-xs text-stone-500">报价：{result.offerCount} 条</span>
        {typeof result.ms === "number" ? <span className="text-xs text-stone-500">耗时：{result.ms}ms</span> : null}
      </div>
      {result.message ? <p className="mt-2 text-xs leading-5 text-stone-600">{result.message}</p> : null}
      <p className="mt-1 text-xs leading-5 text-stone-500">{nextAction}</p>

      {result.offers.length ? (
        <div className="mt-3 overflow-hidden border border-stone-200">
          <div className="grid grid-cols-[1fr_86px_64px] gap-2 border-b border-stone-200 bg-stone-50 px-2 py-2 text-xs font-medium text-stone-500">
            <span>商品预览</span>
            <span>价格</span>
            <span>状态</span>
          </div>
          <div className="divide-y divide-stone-200">
            {result.offers.slice(0, 8).map((offer, index) => (
              <a
                key={`${offer.url}-${offer.sourceTitle}-${index}`}
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid grid-cols-[1fr_86px_64px] gap-2 px-2 py-2 text-xs hover:bg-stone-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-stone-800">{offer.sourceTitle}</span>
                  <span className="mt-1 flex flex-wrap gap-1 text-stone-500">
                    {offer.sourceStoreName ? <span>{offer.sourceStoreName}</span> : null}
                    {typeof offer.stockCount === "number" ? <span>库存 {offer.stockCount}</span> : null}
                    {(offer.tags || []).slice(0, 2).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                </span>
                <span className="font-medium text-stone-900">{formatCurrency(offer.price, offer.currency)}</span>
                <span className={`h-fit w-fit px-2 py-1 font-medium ${offerStatusClass(offer.status)}`}>
                  {offer.status === "out_of_stock" ? "缺货" : "有货"}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "info" | "warn" }) {
  const className =
    tone === "info"
      ? "bg-blue-50 text-blue-800"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900"
        : "bg-stone-100 text-stone-700";
  return <span className={`px-2 py-0.5 text-xs ${className}`}>{children}</span>;
}

function safeDomain(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function stringMeta(meta: Record<string, unknown>, key: string): string | null {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function collectionMethodMeta(meta: Record<string, unknown>, key: string): CollectionMethod | null {
  const value = stringMeta(meta, key);
  return value === "aibijia_json" || value === "browser" || value === "http" || value === "manual"
    ? value
    : null;
}

function collectionMethodLabel(value: string): string {
  const labels: Record<string, string> = {
    aibijia_json: "Aibijia",
    browser: "浏览器",
    http: "自动",
    manual: "待开发",
    aibijia_import: "Aibijia",
  };
  return labels[value] || value;
}

function crawlStatusLabel(value: CrawlRun["status"]): string {
  return value === "success" ? "成功" : value === "partial" ? "部分成功" : "失败";
}

function crawlStatusClass(value: CrawlRun["status"]): string {
  if (value === "success") return "bg-emerald-50 px-2 py-1 text-xs text-emerald-900";
  if (value === "partial") return "bg-amber-50 px-2 py-1 text-xs text-amber-900";
  return "bg-red-50 px-2 py-1 text-xs text-red-800";
}

function offerStatusClass(status: OfferStatus): string {
  return status === "out_of_stock"
    ? "bg-red-50 text-red-800"
    : "bg-emerald-50 text-emerald-800";
}

function omitKey<T>(record: Record<string, T>, key: string): Record<string, T> {
  const next = { ...record };
  delete next[key];
  return next;
}

function isAlreadyHandled(message: unknown): boolean {
  return typeof message === "string" && (message.includes("已被处理") || message.includes("不存在"));
}

function replaceSubmission(items: ChannelSubmission[], next: ChannelSubmission): ChannelSubmission[] {
  let replaced = false;
  const updated = items.map((item) => {
    if (item.id !== next.id) return item;
    replaced = true;
    return next;
  });
  return replaced ? updated : [next, ...items];
}

function isCollectorTodo(submission: ChannelSubmission): boolean {
  return stringMeta(submission.parsedMeta || {}, "review_stage") === "collector_todo";
}

function suggestedSourceIdForSubmission(submission: ChannelSubmission): string | null {
  return stringMeta(submission.parsedMeta || {}, "suggested_source_id");
}

function probeResultFromMeta(meta: Record<string, unknown>): ProbeResult | null {
  const value = meta.probe_result;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  const status = stringMeta(record, "status");
  if (status !== "success" && status !== "empty" && status !== "failed" && status !== "unsupported") {
    return null;
  }

  return {
    sourceId: stringMeta(record, "sourceId") || undefined,
    sourceName: stringMeta(record, "sourceName") || undefined,
    sourceUrl: stringMeta(record, "sourceUrl") || undefined,
    baseUrl: stringMeta(record, "baseUrl") || undefined,
    kind: stringMeta(record, "kind"),
    status,
    offerCount: numberMeta(record, "offerCount") || 0,
    offers: Array.isArray(record.offers)
      ? record.offers.map(mapProbeOffer).filter((offer): offer is ProbeOffer => Boolean(offer))
      : [],
    ms: numberMeta(record, "ms") || undefined,
    message: stringMeta(record, "message") || undefined,
    finishedAt: stringMeta(record, "finishedAt") || undefined,
  };
}

function mapProbeOffer(value: unknown): ProbeOffer | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const sourceTitle = stringMeta(record, "sourceTitle");
  const url = stringMeta(record, "url");
  if (!sourceTitle || !url) return null;

  return {
    sourceStoreName: stringMeta(record, "sourceStoreName"),
    sourceTitle,
    price: numberMeta(record, "price"),
    currency: stringMeta(record, "currency") || "CNY",
    status: offerStatusMeta(record, "status"),
    url,
    tags: Array.isArray(record.tags) ? record.tags.map(String).filter(Boolean) : [],
    stockCount: numberMeta(record, "stockCount"),
  };
}

function numberMeta(meta: Record<string, unknown>, key: string): number | null {
  const value = meta[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function offerStatusMeta(meta: Record<string, unknown>, key: string): OfferStatus {
  const value = stringMeta(meta, key);
  return value === "out_of_stock" ? "out_of_stock" : "in_stock";
}

function classifySourceGroup(source: Source): string {
  const text = `${source.id} ${source.name} ${source.baseUrl || ""} ${source.entryUrl} ${source.notes || ""}`.toLowerCase();

  if (source.id === "aibijia" || source.collectionMethod === "aibijia_json") return "数据入口";
  if (text.includes("ldxp") || text.includes("pay.ldxp.cn")) return "LDXP 系";
  if (
    text.includes("auto-subscribe") ||
    text.includes("burstpro") ||
    text.includes("aitonse") ||
    text.includes("makelove") ||
    text.includes("kxandyou")
  ) {
    return "Auto Subscribe 系";
  }
  if (source.collectionMethod === "http") return "HTTP 优先";
  if (text.includes("aibijia 已发现")) return "独立渠道";
  return "自有配置";
}

function TextInput({
  label,
  name,
  placeholder,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
      <input
        name={name}
        required={required}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        className="h-10 w-full border border-stone-300 bg-stone-50 px-3 text-sm outline-none focus:border-emerald-700"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  required = true,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-500">{label}</span>
      <textarea
        name={name}
        required={required}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-y border border-stone-300 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-emerald-700"
      />
    </label>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button className="inline-flex h-10 w-full items-center justify-center gap-2 bg-stone-900 px-4 text-sm font-medium text-white hover:bg-emerald-800">
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
      {label}
    </button>
  );
}
