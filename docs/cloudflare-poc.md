# Cloudflare Workers POC

本文件记录 PriceAI 通过 OpenNext 运行在 Cloudflare Workers 上的 POC、预览部署和生产切换过程。

后续迁移路线见 `docs/cloudflare-migration-plan.md`。

## 当前结论

- POC 目标是 **Cloudflare Workers + OpenNext**，不是静态 Cloudflare Pages export。当前项目有动态 API、后台、ISR / revalidate 页面和 Supabase 读取，静态导出不适合作为主迁移路径。
- `next` / `eslint-config-next` 已升级到 `16.2.9`，用于满足 `@opennextjs/cloudflare@1.19.11` 的 peer dependency。
- Cloudflare 本地预览已跑通：首页、`/api-models`、公开 API 和 `/admin` 页面都能从 Wrangler 返回。
- Cloudflare Workers Paid 测试环境已跑通：`cf.priceai.cc` 当前可访问真实 Supabase 数据，`/api/health` 返回 `ok`。
- 生产主域 `priceai.cc` 已切到 Cloudflare Workers route，最终验证版本为 `2b35131f-ccc0-493b-8eea-aa73a8711869`。
- 采集任务暂时继续运行在 GitHub Actions / 云服务器。`/api/cron/collect-prices` 在 Worker 中只验证了无密钥拒绝路径；真正执行采集会跑 Node 脚本，不应放入 Worker 请求路径。

## 本地验证

```bash
npm run check:cloudflare-env -- --build
npm run build:cloudflare
npm run preview:cloudflare
```

`preview:cloudflare` 会启动 Wrangler 本地预览。不要把 `.dev.vars` 提交到仓库；本地预览需要的密钥应放在 `.dev.vars` 或 Cloudflare secrets。

`build:cloudflare` 会把本地可用的 Cloudflare 构建环境加载到 OpenNext 构建进程里，其中 Umami 公开 vars 可从 `wrangler.jsonc` 补齐。构建后会扫描 `.open-next/cache/**/*.cache`，只要预渲染缓存里出现演示数据提示、`configured=false`、`source=static`、种子时间或种子报价总数，就会中止构建，避免把 fallback HTML 上传到 R2 incremental cache。

## 本次验证记录

验证日期：2026-06-11。

| 项目 | 结果 | 备注 |
|------|------|------|
| `npm run lint` | 通过 | 仍有 2 个既有 unused warning：`src/lib/api-models.ts`、`src/lib/official-prices.ts` |
| `npm run build` | 通过 | Next.js 16.2.9，生成 130 个静态页面 |
| `npm run build:cloudflare` | 通过 | exit code 0，生成 `.open-next/worker.js`；构建阶段有一组 MDX / Unified 依赖 `Failed to copy` 日志，需要在真实部署后继续观察 |
| `npm run preview:cloudflare -- --port 8788` | 通过 | 本地 R2 incremental cache 填充 207 条，Wrangler 端口 `8788` |

本地 Worker smoke test：

| 路径 | 状态 | 响应体积 | 说明 |
|------|------|----------|------|
| `/` | 200 | 86KB | 首页 HTML 正常 |
| `/api-models` | 200 | 231KB | API 模型页 HTML 正常 |
| `/api/explorer` | 200 | 6.8KB | 本地无 Supabase secrets，返回演示/降级数据 |
| `/api/offers?limit=5` | 200 | 3.4KB | 本地无 Supabase secrets，返回演示/降级数据 |
| `/admin` | 200 | 12KB | 后台页面可渲染 |
| `/guides/are-ai-subscription-card-shops-reliable` | 200 | 87KB | MDX guide 静态页正常 |
| `/guides/chatgpt-subscription-options` | 200 | 92KB | MDX guide 静态页正常 |
| `/api/health` | 503 | 246B | 预期结果：本地预览未配置 Supabase secrets |
| `/api/cron/collect-prices` | 500 | 79B | 预期结果：未配置 `CRON_SECRET` 时拒绝执行 |

线上资源基线轻量复测：

| 线上接口 | 状态 | 响应体积 | 缓存头 |
|----------|------|----------|--------|
| `https://priceai.cc/api/explorer` | 200 | 47.9KB | `cache-control: max-age=120` |
| `https://priceai.cc/api/offers?limit=80` | 200 | 74.3KB | `cache-control: max-age=120` |
| `https://priceai.cc/api/products/chatgpt-plus/offers?limit=80` | 200 | 64.0KB | `cache-control: max-age=120` |

这些体积适合放在 Cloudflare 边缘缓存后服务。主要成本风险仍是 Supabase 回源和被绕过应用层缓存的直接分页抓取，相关背景见 `docs/engineering-audit-2026-06-07.md`。

## 线上 Workers Paid 验证记录

验证日期：2026-06-13。

Cloudflare 资源：

| 项目 | 当前值 |
|------|--------|
| Worker | `priceai-cloudflare-poc` |
| 测试域名 | `https://cf.priceai.cc` |
| Worker version | `c66d1573-1393-477f-9665-80d21d265b27` |
| R2 bucket | `priceai-cloudflare-poc-opennext-cache` |
| R2 incremental cache | 部署时填充 245 条 |
| Worker startup time | 约 28ms |
| 上传体积 | 约 18.3MiB，gzip 约 3.4MiB |

运行时配置结论：

- Cloudflare remote secrets 已配置并挂到 Worker version：Supabase、后台、Cron、GA 共 8 项。
- OpenNext/Cloudflare 运行时不能只依赖 `process.env`；应用通过 `src/lib/runtime-env.ts` 先读 `process.env`，再兜底读取 OpenNext 的 Cloudflare request context `env`。
- `build:cloudflare` 会先校验构建期 Supabase / Umami 配置，再执行 OpenNext build、验证 `.open-next/cache` 不含 seed/demo/static 标记，最后执行 `scripts/sanitize-opennext-env.mjs`，避免 `.open-next` 上传包残留本地 `.env*` 内容。
- `deploy:cloudflare` 会在部署前校验完整生产环境（Cloudflare API、Supabase、后台、Cron、GA、Umami），再次执行 `scripts/sanitize-opennext-env.mjs`，并通过 Wrangler `--keep-vars` 保留 Cloudflare Dashboard 中维护的 runtime variables；注意 runtime variables 不能修复构建阶段已经写入 R2 的预渲染缓存。
- `wrangler.jsonc` 使用 `nodejs_compat_populate_process_env`，并声明 `secrets.required`，用于让 Wrangler 在部署前检查远端 secrets。
- GitHub Actions 手动预览部署已通过：workflow run `27472035881` 完成环境检查、lint、Cloudflare build、deploy 和 smoke test。

线上 smoke test：

| 路径 | 状态 | 响应体积 | 说明 |
|------|------|----------|------|
| `/` | 200 | 290KB | 首页 HTML 正常 |
| `/api-models` | 200 | 212KB | API 模型页 HTML 正常 |
| `/guides/are-ai-subscription-card-shops-reliable` | 200 | 92KB | MDX guide 页正常 |
| `/api/health` | 200 | 209B | `ok=true`，Supabase configured/reachable |
| `/api/explorer` | 200 | 48.6KB | `configured=true`，真实数据 35 个产品 |
| `/api/offers?limit=80` | 200 | 74.8KB | 80 条报价，体积仍在预期范围 |
| `/api/products/chatgpt-plus/offers?limit=80` | 200 | 65.0KB | 80 条产品报价，体积仍在预期范围 |
| `/api/cron/collect-prices` | 401 | 52B | 无密钥拒绝，说明 `CRON_SECRET` 已配置 |
| `/api/cron/official-prices` | 401 | 67B | 无密钥拒绝 |
| `/robots.txt` | 200 | 232B | 可访问，仍指向生产 canonical |
| `/sitemap.xml` | 200 | 17.9KB | 可访问，仍指向生产 canonical |

缓存观察：

- 公开 API 响应保留 `Cache-Control: public, max-age=0, must-revalidate`。
- 同时发送 `CDN-Cache-Control: public, s-maxage=120`、`Cloudflare-CDN-Cache-Control: public, s-maxage=120`、`Vercel-CDN-Cache-Control: public, s-maxage=120, stale-while-revalidate=600`。
- Worker 响应未暴露 `cf-cache-status` / `age`，生产切换前仍需结合 Cloudflare Analytics 和 Supabase egress 观察实际缓存收益。

## 生产切换记录

切换日期：2026-06-14。

最终生产 Worker version：`2b35131f-ccc0-493b-8eea-aa73a8711869`。

生产路由：

| 域名 | 当前状态 |
|------|----------|
| `priceai.cc/*` | 已由 Cloudflare Workers route 接管 |
| `www.priceai.cc/*` | 已由 Cloudflare Workers route 接管 |
| `cf.priceai.cc` | 保留为 Cloudflare custom domain 预览 / 排障入口 |

生产 smoke test：

| 路径 | 状态 | 响应体积 | 说明 |
|------|------|----------|------|
| `/` | 200 | 约 290KB | `server: cloudflare`，`x-opennext: 1`，首页 HTML 正常 |
| `/api-models` | 200 | 约 211KB | API 模型页正常 |
| `/guides/are-ai-subscription-card-shops-reliable` | 200 | 约 92KB | MDX guide 页正常 |
| `/api/health` | 200 | 209B | `ok=true`，Supabase configured/reachable |
| `/api/explorer` | 200 | 约 48KB | `Cloudflare-CDN-Cache-Control: public, s-maxage=120` |
| `/api/offers?limit=80` | 200 | 约 74KB | 80 条报价，体积仍在预期范围 |
| `/api/products/chatgpt-plus/offers?limit=80` | 200 | 约 65KB | 80 条产品报价，体积仍在预期范围 |
| `/api/cron/collect-prices` | 401 | 52B | 无密钥拒绝，说明 `CRON_SECRET` 已配置 |
| `/api/cron/official-prices` | 401 | 67B | 无密钥拒绝 |
| `/robots.txt` | 200 | 232B | 正常 |
| `/sitemap.xml` | 200 | 17.9KB | 正常 |

生产 analytics：

- `wrangler.jsonc` 已把 `NEXT_PUBLIC_UMAMI_SCRIPT_URL`、`NEXT_PUBLIC_UMAMI_WEBSITE_ID`、`NEXT_PUBLIC_UMAMI_ALLOWED_DOMAINS` 写入 Worker vars。
- 用带 Umami 公开变量的 `npm run build:cloudflare` 重新生成预渲染产物后再部署，避免首页静态 HTML 缺少统计脚本。
- 线上首页 HTML 已确认包含 `https://umami.dimthink.com/script.js`、Website ID `ded26a4f-77c4-45ed-86ef-774b0fed0ef6` 和 `data-priceai-umami`，不包含 `cloud.umami`。

生产后观察：

1. `www.priceai.cc` CNAME 已改成 Cloudflare 代理状态，`https://www.priceai.cc/` 直接返回 `server: cloudflare`、`x-opennext: 1`。
2. `npm run smoke:cloudflare -- https://www.priceai.cc` 已全部通过。
3. 生产后继续观察 24-72 小时 Worker 5xx、Supabase egress、R2 incremental cache 和 Umami 访问数据。

## 生产部署前置项

1. 购买 Workers Paid 计划（5 美元/月）。本 POC 走 Workers，不依赖 Pages 的静态托管能力。
2. 创建 R2 bucket：`priceai-cloudflare-poc-opennext-cache`，或在正式 Worker 配置中改成生产 bucket 名。
3. 在 Cloudflare 里创建测试 Worker，并先绑定测试域名，例如 `cf.priceai.cc`。不要先切 `priceai.cc`。
4. 配置 Cloudflare secrets：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `ADMIN_SESSION_VERSION`
   - `CRON_SECRET`
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`
5. 在测试域名验证：
   - 首页、产品页、平台页、guide 页和 sitemap / robots。
   - `/api/explorer`、`/api/offers`、`/api/products/[id]/offers`、`/api/health`。
   - 后台登录、报价修改、提交审核、反馈流。
   - Cloudflare cache 行为、Supabase 请求量、R2 incremental cache 是否正常增长。
6. 采集任务继续运行在 GitHub Actions / 云服务器，不迁入 Cloudflare Cron，除非后续单独拆出轻量 Worker 采集器。
7. 测试域名稳定后，再安排 `priceai.cc` / `www.priceai.cc` 的 DNS 切换窗口和回滚方案。

## 资源与成本规划

- Workers Paid 计划是合理起点：动态 Next.js Worker、R2 incremental cache、测试域名验证都需要优先走付费 Workers 能力。
- R2 只用于 OpenNext incremental cache，不存业务主数据。业务数据继续在 Supabase。
- 不迁移 D1：当前数据模型、RPC、后台和采集链路都围绕 Supabase，迁 D1 会变成数据库迁移项目，不属于本 POC。
- 不把采集放到 Worker 请求路径：采集脚本涉及较长运行时间、外部站点访问和 Node 运行时假设，继续外置更稳，也避免 Worker CPU / duration 风险。
- 公开 API 已控制在几十 KB 级别，适合 Cloudflare 缓存；迁移重点是确认 `Cache-Control`、Cloudflare cache key、R2 incremental cache 和 Supabase 回源量。
- 需要保留 Supabase egress 防护思路：公开 RPC 权限、分页爬取、匿名 key 直接访问仍是成本风险，Cloudflare 只能保护经过站点的流量。

## 当前设计边界

- 保留 Supabase 作为数据库，不在本 POC 中迁移 D1。
- 使用 OpenNext 的 R2 incremental cache，以便支持 ISR / revalidate 类页面。
- `priceai.cc` 与 `www.priceai.cc` 生产域名已由 Cloudflare Workers route 承载。
- `wrangler.jsonc` 中的 `CRON_PUBLIC_BASE_URL` 指向 `https://priceai.cc`。
