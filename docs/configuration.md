# 配置说明

本文档整理 PriceAI 本地开发和部署前需要准备的配置。

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

常用变量：

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目地址，前台读取数据需要 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名 key，前台只读访问需要 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服务端导入、采集、写入数据库需要 |
| `ADMIN_PASSWORD` | 后台登录和本地管理接口密码 |
| `CRON_SECRET` | 线上定时采集接口鉴权 |
| `CRON_PUBLIC_BASE_URL` | 线上站点地址，例如 `https://priceai.cc` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 可选，Google Analytics 4 Measurement ID |

不要把 `.env.local`、service role key 或后台密码提交到仓库。

## Supabase 初始化

1. 在 Supabase SQL Editor 执行 `supabase/schema.sql`。
2. 可选执行 `supabase/seed.sql` 写入演示数据。
3. 在 `.env.local` 填入 Supabase URL、anon key 和 service role key。
4. 启动本地项目。

```bash
npm install
npm run dev
```

## 初始数据

可以先执行 `supabase/seed.sql` 写入演示来源，再在后台维护自己的渠道来源。
配置好来源后，通过采集任务写入真实报价：

```bash
npm run collect:prices -- --all --post
```

采集完成后，可以在后台查看来源、报价、标准商品和采集日志。
