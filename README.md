# AI 比价雷达

AI 订阅卡网报价聚合工具。第一版支持前台搜索筛选、标准商品对比、简单密码后台、Supabase 数据库、Aibijia 渠道导入、公开接口自动采集，以及本机浏览器半自动兜底采集。

## 产品与数据文档

- [PRODUCT.md](./PRODUCT.md)：产品定位、用户、原则和交互方向。
- [DESIGN.md](./DESIGN.md)：视觉系统、组件和界面规则。
- [DATA_POLICY.md](./DATA_POLICY.md)：采集失败、重试、库存状态和标准商品分类草案。
- [docs/analytics.md](./docs/analytics.md)：GA4 接入、脚本和后续埋点规划。

## 本地启动

```bash
npm run dev
```

打开 `http://localhost:3000` 查看前台，打开 `http://localhost:3000/admin` 查看后台。

未配置 Supabase 时，前台会使用内置演示数据；后台密码默认是 `ai-price-hub-local`。

## Supabase 配置

1. 在 Supabase SQL Editor 里执行 `supabase/schema.sql`。
2. 可选执行 `supabase/seed.sql` 初始化来源站点。
3. 复制 `.env.example` 为 `.env.local`，填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
CRON_SECRET=
CRON_PUBLIC_BASE_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

`SUPABASE_SERVICE_ROLE_KEY` 只在服务端使用，用于后台写入、导入和采集入库。
`CRON_SECRET` 用于保护定时采集接口，部署环境必须配置。
`CRON_PUBLIC_BASE_URL` 可选，部署在代理或自定义域名后可填写站点公网地址，例如 `https://example.com`。
`NEXT_PUBLIC_GA_MEASUREMENT_ID` 可选，用于启用 Google Analytics 4，形如 `G-XXXXXXXXXX`。

## Google Analytics

项目内置 GA4 接入骨架，未配置 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 时不会加载统计脚本。创建或复用 GA4 Property 可运行：

```bash
npm run setup:ga4 -- --site-url https://priceai.tider.cc --write-env
```

首次使用前需要先配置 Google Cloud CLI 和 Analytics API，详见 [docs/analytics.md](./docs/analytics.md)。

## 导入 Aibijia

启动本地服务后，在后台点击“导入 Aibijia”，或运行：

```bash
npm run import:aibijia -- --password your-admin-password
```

数据来自 `https://data.aibijia.org/products.json`，会把 Aibijia 里出现的渠道去重合并到 `sources`，报价写入 `raw_offers`，并按规则归类到标准商品。

## 自动价格采集

优先使用公开接口、shopApi 或页面 HTML 解析读取原站价格和库存；失败会自动重试并记录来源健康状态，单次失败不会立刻把旧报价改成缺货。

```bash
npm run collect:prices -- --list
npm run collect:prices -- --all --post
npm run collect:prices -- --source aisou-pro --post
```

常用参数：

- `--list`：查看已识别的渠道和采集方式。
- `--all`：采集所有已支持渠道。
- `--source`：按渠道 ID、名称、网址或采集方式过滤。
- `--post`：把采集结果写入本地后台和 Supabase。
- `--endpoint`：默认 `http://localhost:3000`。

部署后由 GitHub Actions 定时执行采集脚本，Vercel 只负责接收入库结果。这样可以避免把全量采集压进一次 Vercel 函数调用导致超时。

```bash
GET /api/cron/collect-prices
Authorization: Bearer your-cron-secret
```

GitHub 仓库需要配置两个 Actions secrets：

- `COLLECT_PRICES_URL`：生产接口地址，例如 `https://your-domain.com/api/cron/collect-prices`。
- `CRON_SECRET`：和 Vercel 环境变量 `CRON_SECRET` 保持一致。
- `NEXT_PUBLIC_SUPABASE_URL`：Supabase 项目 URL。
- `SUPABASE_SERVICE_ROLE_KEY`：Supabase service role key，仅用于 GitHub runner 读取来源并写入采集结果。

受保护接口仍支持查看当前可采集渠道，便于调试：

```bash
curl -H "Authorization: Bearer your-cron-secret" \
  "https://your-domain.com/api/cron/collect-prices?list=1"
```

云服务器也可以用系统 cron 分渠道调用同一个接口：

```bash
0 * * * * curl -fsS -X POST -H "Authorization: Bearer your-cron-secret" "https://your-domain.com/api/cron/collect-prices?source=aisou-pro"
```

本地调试可以用后台密码触发单个渠道：

```bash
curl -X POST "http://localhost:3000/api/cron/collect-prices?source=aisou-pro" \
  -H "x-admin-password: your-admin-password"
```

后台也提供“重建分类”按钮，用于按最新标准商品规则重新归类已有报价。对应接口为：

```bash
POST /api/admin/reclassify
```

## 半自动浏览器采集

当公开接口不可用时，再使用浏览器兜底。脚本会打开本机 Chrome/Edge/Brave，进入目标卡网页面。遇到 WAF、验证码、登录或分类切换时，手动处理后回到终端按回车继续。

```bash
npm run collect:browser -- --url https://aisou.pro/ --password your-admin-password --post
```

常用参数：

- `--url`：目标卡网页面。
- `--name`：来源名称，默认取域名。
- `--password`：后台密码。
- `--post`：把采集结果写入本地后台。
- `--endpoint`：默认 `http://localhost:3000`。
- `--browser`：指定浏览器路径。

无法公开读取的站点不要绕过限制。提交审核时如果试采集失败，先进入采集器待办，后续新增解析脚本后再重新试采集。

## 首批来源

- `https://aisou.pro/`
- `https://shop.auto-subscribe.com/`
- `https://pay.qxvx.cn/`
- `https://pay.ldxp.cn/shop/jinyao`
- `https://aifk.opensora.de/`
- `https://caowo.store/`
- `https://makerich.club/`
- `https://pay.ldxp.cn/shop/pixelshop`
- `https://data.aibijia.org/products.json`
