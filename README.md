<p align="center">
  <img src="src/app/icon.svg" width="112" height="112" alt="PriceAI logo" />
</p>

<h1 align="center">PriceAI</h1>

<p align="center">
  <strong>AI 订阅渠道比价工具，把分散卡网报价整理成可比较的标准商品。</strong><br/>
  搜索商品，看有货最低价，对比来源，跳转原站购买。
</p>

<p align="center">
  <em>少开十个网页，少踩一个信息差。</em>
</p>

<p align="center">
  <a href="#1-为什么做-priceai">为什么做</a> ·
  <a href="#2-功能">功能</a> ·
  <a href="#3-数据与采集">数据与采集</a> ·
  <a href="#4-本地运行">本地运行</a> ·
  <a href="#5-部署与定时任务">部署</a> ·
  <a href="https://priceai.cc">在线访问</a>
</p>

---

<p align="center">
  <img src="docs/assets/priceai-screenshot.png" alt="PriceAI product screenshot" width="100%" />
</p>

## 1. 为什么做 PriceAI

买 AI 订阅时，价格经常不是一个清楚的数字。

同样是 ChatGPT Plus、Gemini Pro、Claude Pro 或 Grok，有人按官网正价买，有人通过地区价、学生资格、设备权益拿到更低价格，也有人在卡网、闲鱼、Telegram 群或代购页面里用第三方渠道价购买。价格可能差很多，但普通用户很难知道：这到底是官方正价、地区代订、资格权益、成品号、卡密，还是来源不透明的低价账号。

更麻烦的是渠道非常分散。A 渠道 ChatGPT 便宜，B 渠道 Gemini 便宜，C 渠道 Gmail 或 API 额度便宜；有些今天有货，明天缺货；有些标题看起来相似，实际不是同一种商品。每次购买前都要打开多个站点，手动比价格、库存、更新时间和购买链接。

**PriceAI 想把这件事变简单。** 它把分散在卡网和公开聚合源里的 AI 订阅报价收拢起来，按平台和标准商品重新整理，让用户能快速回答三个问题：

- 这个商品现在有没有货？
- 有货报价里的最低价是多少？
- 这个价格来自哪个渠道，多久前更新？

这不是卖货平台，也不是渠道担保。PriceAI 更像一个价格雷达：把分散信息变成可搜索、可比较、可核验的购买前参考。

**设计原则：**

- **有货最低价优先** — 列表页最低价只取有货报价，缺货不会冒充可买价格
- **保留原始来源** — 展示原始渠道名、商品标题、价格、状态、更新时间和购买链接
- **标准商品归类** — 把乱标题整理为 ChatGPT Plus、Claude Pro、Gemini Pro 等可比较对象
- **自动采集优先** — 尽量从原站同步价格和库存，不把人工补录当长期方案
- **工具感优先** — 表格、筛选、详情和跳转要快，不做装饰型营销页

## 2. 功能

```
多个渠道站 / Aibijia  ──采集/导入──▶  标准商品  ──筛选/排序──▶  有货最低价
      原始标题 / 价格 / 库存             ChatGPT / Claude / Gemini         原站购买链接
```

- **标准商品比价** — 按 ChatGPT、Claude、Gemini、Grok、邮箱、API/CDK、虚拟卡等平台整理报价
- **有货 / 缺货** — 前台只保留两个明确状态，缺货会弱化展示，不参与有货最低价
- **全部报价视图** — 可以查看某个平台或筛选条件下的全部原始报价
- **详情对比页** — 每个标准商品展示渠道、原始标题、价格、更新时间和购买入口
- **渠道提交** — 用户可提交新渠道，后续通过解析和试采集纳入来源库
- **Aibijia 导入** — 支持从 `products.json` 导入公开渠道和报价作为初始数据源
- **原站采集器** — 支持公开接口、Shop API、HTML 解析和本机浏览器半自动兜底
- **后台管理** — 管理来源、试采集、批量采集、报价隐藏、分类重建和采集日志
- **性能优化** — 首页与详情页使用轻量数据和缓存，详情报价按需加载
- **GA4 分析** — 可选接入 Google Analytics 4，用于查看访问和推广效果

当前在线版本：<https://priceai.cc>

## 3. 数据与采集

PriceAI 的数据分为三层：来源站点、原始报价、标准商品。

| 层级 | 作用 | 示例 |
|---|---|---|
| 来源站点 | 一个可采集或可导入的渠道 | `aisou.pro`、`kapay.shop`、Aibijia |
| 原始报价 | 渠道里真实出现的商品标题和价格 | `PLUS成品(保普登)pp新方法` |
| 标准商品 | 用户真正想比较的对象 | `ChatGPT Plus`、`Gemini Pro` |

采集优先级：

1. **公开结构化数据**：例如 Aibijia 的 `products.json`
2. **原站接口 / HTML 解析**：适合卡网、Shop API、独角数卡类站点
3. **本机浏览器采集**：遇到动态页面、风控或分类切换时作为半自动兜底
4. **采集器待办**：真实渠道但暂时不支持解析时，进入后续解析器扩展

无法公开读取的站点不会绕过验证码、登录墙或风控。PriceAI 的目标是持续扩展可采集来源，而不是长期手工维护价格。

## 4. 本地运行

项目使用 Next.js、TypeScript、Tailwind CSS 和 Supabase。

```bash
npm install
npm run dev
```

打开：

- 前台：`http://localhost:3000`
- 后台：`http://localhost:3000/admin`

未配置 Supabase 时，前台会使用内置演示数据。后台密码通过 `ADMIN_PASSWORD` 配置。

### 环境变量

复制 `.env.example` 为 `.env.local`，填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
CRON_SECRET=
CRON_PUBLIC_BASE_URL=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

说明：

- `SUPABASE_SERVICE_ROLE_KEY`：服务端写入、导入和采集入库使用
- `ADMIN_PASSWORD`：后台登录和本地调试接口使用
- `CRON_SECRET`：保护线上采集接口
- `CRON_PUBLIC_BASE_URL`：部署后的公网地址，例如 `https://priceai.cc`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`：可选，启用 GA4 后填写

### 初始化 Supabase

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`
2. 可选执行 `supabase/seed.sql`
3. 配置 `.env.local`
4. 启动项目并导入初始数据

```bash
npm run import:aibijia -- --password your-admin-password
```

## 5. 部署与定时任务

前端适合部署在 Vercel，数据库使用 Supabase。采集任务可以由 GitHub Actions 或云服务器定时执行，Vercel 主要负责接收入库结果和提供前台页面。

### Vercel

配置生产环境变量后部署：

```bash
vercel deploy --prod --yes
```

### GitHub Actions 采集

项目已包含 `.github/workflows/collect-prices.yml`，默认每 30 分钟运行一次。

需要配置 Actions secrets：

- `COLLECT_PRICES_URL`：例如 `https://priceai.cc/api/cron/collect-prices`
- `CRON_SECRET`：与 Vercel 环境变量保持一致
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 手动采集

查看可识别渠道：

```bash
npm run collect:prices -- --list
```

采集全部支持渠道并写入：

```bash
npm run collect:prices -- --all --post
```

采集单个来源：

```bash
npm run collect:prices -- --source aisou-pro --post
```

浏览器兜底采集：

```bash
npm run collect:browser -- --url https://aisou.pro/ --password your-admin-password --post
```

## 6. 当前来源

首批来源包括用户整理的卡网站点和 Aibijia 公开数据：

- `https://aisou.pro/`
- `https://shop.auto-subscribe.com/`
- `https://pay.qxvx.cn/`
- `https://pay.ldxp.cn/shop/jinyao`
- `https://aifk.opensora.de/`
- `https://caowo.store/`
- `https://makerich.club/`
- `https://pay.ldxp.cn/shop/pixelshop`
- `https://data.aibijia.org/products.json`

更多来源会通过后台提交、解析器扩展和定时采集逐步纳入。

## 7. 项目结构

```text
src/app/                  Next.js 页面和 API 路由
src/components/           前台比价、详情页、后台和通用组件
src/lib/                  数据读取、商品归类、采集辅助、分析事件
scripts/                  Aibijia 导入、价格采集、浏览器采集、GA4 配置
supabase/                 数据库 schema、seed 和迁移
docs/                     项目介绍、分析接入和补充文档
.github/workflows/        定时采集工作流
```

相关文档：

- [PRODUCT.md](./PRODUCT.md)：产品定位、用户和原则
- [DESIGN.md](./DESIGN.md)：视觉系统和组件规则
- [DATA_POLICY.md](./DATA_POLICY.md)：采集失败、重试、库存状态和分类规则
- [docs/project-intro.md](./docs/project-intro.md)：面向外部读者的项目介绍
- [docs/analytics.md](./docs/analytics.md)：GA4 接入和埋点规划

## 8. 边界

PriceAI 不卖货、不收款、不担保渠道售后，也不承诺任何价格长期有效。

它提供的是购买前的信息整理：来源、原始标题、库存、价格、更新时间和跳转链接。是否购买、是否接受渠道风险，仍然需要用户自己判断。

## 9. Roadmap

- 补充更多站点采集器，降低采集失败率
- 优化 ChatGPT、Claude、Gemini、Grok、邮箱、API/CDK 的分类规则
- 完善渠道提交后的解析、试采集和待办闭环
- 增加更清晰的更新时间、采集健康和来源覆盖提示
- 探索是否开源、社区共建和长期运营方式

## License

暂未开放许可证。当前仓库代码默认保留所有权利；如需复用，请先联系作者。
