export type ApiProviderType = "official" | "router" | "free" | "subscription";

export type ApiCurrency = "CNY" | "USD";

export type ApiBillingMode = "按量计费" | "免费/测试" | "订阅套餐" | "动态路由";

export type ApiPriceValue =
  | {
      kind: "numeric";
      usdPerMTokens?: number;
      cnyPerMTokens?: number;
      label?: string;
    }
  | {
      kind: "text";
      text: string;
    };

export type ApiModel = {
  id: string;
  displayName: string;
  family: string;
  modelId: string;
  description: string;
  contextWindow?: string;
  sourceUrl: string;
  sourceLabel: string;
  capabilities: string[];
  suitableTools: string[];
  updatedAt: string;
};

export type ApiProvider = {
  id: string;
  name: string;
  type: ApiProviderType;
  billingMode: ApiBillingMode;
  url: string;
  pricingUrl?: string;
  logoUrl?: string;
  description: string;
  limitSummary: string;
  limitations: string;
  sourceLabel: string;
  updatedAt: string;
};

export type ApiPlan = {
  id: string;
  providerId: string;
  name: string;
  providerName: string;
  type: ApiProviderType;
  priceLabel: string;
  priceUsdMonthly?: number;
  priceCnyMonthly?: number;
  url: string;
  quotaSummary: string;
  resetSummary: string;
  limitSummary: string;
  limitations: string;
  modelIds: string[];
  coverageLabel?: string;
  compatibility: string[];
  suitableTools: string[];
  sourceLabel: string;
  updatedAt: string;
};

export type ApiModelOffer = {
  id: string;
  modelId: string;
  providerId: string;
  billingMode: ApiBillingMode;
  routeModelId?: string;
  inputPrice: ApiPriceValue;
  outputPrice: ApiPriceValue;
  cacheReadPrice?: ApiPriceValue;
  cacheWritePrice?: ApiPriceValue;
  freeOrPlan: string;
  limitSummary: string;
  limitations: string;
  compatibility: string[];
  suitableTools: string[];
  sourceLabel: string;
  pricingUrl?: string;
  updatedAt: string;
  notes?: string;
};

export type ApiModelScope = "all" | string;

export type ApiModelFamilyOption = {
  id: string;
  label: string;
};

export type ApiModelSummary = {
  id: string;
  model: ApiModel;
  family: string;
  displayName: string;
  offerCount: number;
  providerCount: number;
  officialCount: number;
  freeCount: number;
  routerCount: number;
  subscriptionCount: number;
  planCount: number;
  providerNames: string[];
  compatibility: string[];
  suitableTools: string[];
  primaryOffer: ApiModelOfferWithRelations | null;
  latestUpdatedAt: string;
};

export type ApiProviderSummary = {
  id: string;
  provider: ApiProvider;
  offerCount: number;
  modelCount: number;
  planCount: number;
  families: string[];
  modelNames: string[];
  compatibility: string[];
  suitableTools: string[];
  primaryPlan: ApiPlan | null;
  latestUpdatedAt: string;
};

export type ApiModelOfferWithRelations = ApiModelOffer & {
  model: ApiModel;
  provider: ApiProvider;
};

export type ApiModelFxSummary = {
  baseCurrency: string;
  quoteCurrency: string;
  date: string;
  usdToCny: number;
  source: string;
};

export type ApiModelDataset = {
  source: "static" | "supabase";
  generatedAt: string;
  fxSummary: ApiModelFxSummary;
  models: ApiModel[];
  providers: ApiProvider[];
  plans: ApiPlan[];
  offers: ApiModelOffer[];
};

export const apiModelUpdatedAt = "2026-06-05";

export const apiModelFxSummary: ApiModelFxSummary = {
  baseCurrency: "USD",
  quoteCurrency: "CNY",
  date: "2026-06-04",
  usdToCny: 6.7739,
  source: "Frankfurter",
};

export const apiProviderTypeLabels: Record<ApiProviderType, string> = {
  official: "官方 API",
  router: "模型路由",
  free: "免费/测试",
  subscription: "订阅套餐",
};

export const apiProviderTypeDescriptions: Record<ApiProviderType, string> = {
  official: "厂商官方或云厂商公开 API，适合做价格基准。",
  router: "公开模型路由平台，重点看模型覆盖、价格变化和限流口径。",
  free: "免费或测试用途入口，必须同时关注限流、排队和可用性。",
  subscription: "按月订阅的 API 套餐，需要看额度、短周期限制和使用边界。",
};

export const apiProviderCandidates = [
  {
    id: "volcengine-ark-coding-plan",
    name: "火山方舟 Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://www.volcengine.com/activity/codingplan",
    pricingUrl: "https://www.volcengine.com/activity/codingplan",
    logoUrl: null,
    status: "collector_todo",
    priority: "high",
    evidenceStatus: "needs_pricing_parse",
    sourceLabel: "火山引擎方舟 Coding Plan 官方活动页",
    reason: "官方活动页已公开展示方舟 Coding Plan，覆盖 DeepSeek、GLM、MiniMax、Kimi、Doubao 等模型和 Claude Code、Cursor、Cline、OpenCode 等工具，但价格/库存区域依赖动态页面，需要进一步解析。",
    nextStep: "补活动页半结构化解析：提取套餐档位、价格、模型覆盖、工具兼容和限额口径；前台先展示官方入口和待解析报价，后续由采集器补齐结构化字段。",
    notes: "官方入口已确认，已进入前台候选展示；当前问题是价格和限制字段还没有稳定结构化。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "tencent-hunyuan-coding-plan",
    name: "腾讯云 TokenHub Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://cloud.tencent.com/product/tokenhub",
    pricingUrl: "https://cloud.tencent.com/document/product/1823/130092",
    logoUrl: null,
    status: "collector_todo",
    priority: "high",
    evidenceStatus: "verified_url",
    sourceLabel: "腾讯云 TokenHub 官方文档",
    reason: "腾讯云官方 TokenHub 产品页和 Coding Plan 概述文档已公开说明这是面向 AI Coding 场景的订阅套餐，并列出支持模型、适配工具和套餐入口。",
    nextStep: "补腾讯云官方文档解析器：提取 Lite/Pro 档位、月费、5 小时/周/月请求限额、支持模型和购买页；前台先展示已核验官方文档口径。",
    notes: "官方来源已确认，已进入前台展示；不使用第三方整理站价格作为报价依据。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "jdcloud-joyai",
    name: "京东云 JoyAI 候选",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.jdcloud.com/cn/products/joyai",
    pricingUrl: null,
    logoUrl: null,
    status: "needs_review",
    priority: "medium",
    evidenceStatus: "needs_official_source",
    sourceLabel: "京东云公开入口",
    reason: "可能覆盖国产模型 API 或企业级模型服务，但公开入口跳转和产品边界需要二次核验。",
    nextStep: "确认是否有面向开发者的模型 API、公开价格页和可调用模型列表。",
    notes: "已进入前台候选展示；不确认价格表前只展示官方入口和待解析口径。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "unicom-yuanjing",
    name: "联通元景大模型候选",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.chinaunicom.cn/",
    pricingUrl: null,
    logoUrl: null,
    status: "needs_review",
    priority: "medium",
    evidenceStatus: "needs_official_source",
    sourceLabel: "联通公开入口",
    reason: "社区和云厂商生态中可能存在元景大模型 API 或套餐入口，但当前还缺少稳定官方价格页。",
    nextStep: "找到联通云/元景官方开发者文档或价格页后，再补采集器。",
    notes: "已进入前台候选展示；等待补充稳定官方文档和价格页。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ctyun-xirang",
    name: "天翼云息壤大模型候选",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.ctyun.cn/",
    pricingUrl: null,
    logoUrl: null,
    status: "needs_review",
    priority: "medium",
    evidenceStatus: "needs_official_source",
    sourceLabel: "天翼云公开入口",
    reason: "可能存在电信云大模型 API 或企业套餐，但当前入口和价格口径需要人工确认。",
    nextStep: "确认公开文档、模型列表、价格表和是否支持 OpenAI-compatible 调用。",
    notes: "已进入前台候选展示；等待补充稳定官方文档和价格页。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "huaweicloud-modelarts-maas",
    name: "华为云 ModelArts / MaaS 候选",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.huaweicloud.com/product/modelarts.html",
    pricingUrl: null,
    logoUrl: null,
    status: "needs_review",
    priority: "medium",
    evidenceStatus: "needs_pricing_parse",
    sourceLabel: "华为云 ModelArts 官网",
    reason: "华为云有公开 AI 开发平台入口，但是否适合 PriceAI 的模型 API 价格对比需要核验。",
    nextStep: "补华为云 MaaS/ModelArts 价格页和模型列表来源，确认计费维度。",
    notes: "已进入前台候选展示；偏企业云服务，后续需要继续简化计费口径。",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "baidu-qianfan",
    name: "百度智能云千帆候选",
    type: "official",
    billingMode: "按量计费",
    url: "https://cloud.baidu.com/product-s/qianfan_home",
    pricingUrl: null,
    logoUrl: null,
    status: "needs_review",
    priority: "medium",
    evidenceStatus: "needs_pricing_parse",
    sourceLabel: "百度智能云千帆官网",
    reason: "千帆是公开大模型平台，适合进入官方 API 候选，但价格表和模型映射需要单独解析。",
    nextStep: "确认千帆模型价格页、模型 ID、输入/输出/缓存计费规则。",
    notes: "已进入前台候选展示；等待解析模型价格页、模型 ID 和缓存计费规则。",
    updatedAt: apiModelUpdatedAt,
  },
] as const;

export const apiModels: ApiModel[] = [
  {
    id: "deepseek-v4-flash",
    displayName: "DeepSeek V4 Flash",
    family: "DeepSeek",
    modelId: "deepseek-v4-flash",
    description: "DeepSeek V4 的低成本高吞吐版本，适合高频编码、总结、抽取和日常 Agent 调用。",
    contextWindow: "1M",
    sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing/",
    sourceLabel: "DeepSeek API Docs",
    capabilities: ["thinking", "tool-calls", "json", "fim"],
    suitableTools: ["Codex", "Cursor", "OpenCode", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "deepseek-v4-pro",
    displayName: "DeepSeek V4 Pro",
    family: "DeepSeek",
    modelId: "deepseek-v4-pro",
    description: "DeepSeek V4 的旗舰能力版本，适合更复杂的推理、长上下文和高失败成本任务。",
    contextWindow: "1M",
    sourceUrl: "https://api-docs.deepseek.com/quick_start/pricing/",
    sourceLabel: "DeepSeek API Docs",
    capabilities: ["thinking", "tool-calls", "json", "fim"],
    suitableTools: ["Codex", "Cursor", "OpenCode", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "qwen3-7-max",
    displayName: "Qwen3.7 Max",
    family: "Qwen",
    modelId: "qwen3.7-max",
    description: "Qwen 当前高能力模型之一，适合复杂代码与 Agent 任务，首版以公开套餐覆盖为主。",
    sourceUrl: "https://dev.opencode.ai/docs/go/",
    sourceLabel: "OpenCode Go Docs",
    capabilities: ["coding", "agent"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "qwen3-7-plus",
    displayName: "Qwen3.7 Plus",
    family: "Qwen",
    modelId: "qwen3.7-plus",
    description: "Qwen 的均衡版本，适合成本敏感的 Coding Agent 和日常中文开发任务。",
    sourceUrl: "https://dev.opencode.ai/docs/go/",
    sourceLabel: "OpenCode Go Docs",
    capabilities: ["coding", "agent"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "qwen3-6-plus",
    displayName: "Qwen3.6 Plus",
    family: "Qwen",
    modelId: "qwen3.6-plus",
    description: "Qwen Plus 系列的公开套餐模型，适合中低成本编码和中文模型调用。",
    sourceUrl: "https://dev.opencode.ai/docs/go/",
    sourceLabel: "OpenCode Go Docs",
    capabilities: ["coding", "agent"],
    suitableTools: ["OpenCode", "Codex", "Cursor"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "qwen3-5-plus",
    displayName: "Qwen3.5 Plus",
    family: "Qwen",
    modelId: "qwen3.5-plus",
    description: "Alibaba Model Studio Coding Plan 推荐模型之一，适合按月套餐场景。",
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/coding-plan",
    sourceLabel: "Alibaba Coding Plan",
    capabilities: ["vision", "coding", "agent"],
    suitableTools: ["Codex", "Claude Code", "Cursor", "OpenCode"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "qwen3-coder-plus",
    displayName: "Qwen3 Coder Plus",
    family: "Qwen",
    modelId: "qwen3-coder-plus",
    description: "Qwen Coder 系列模型，首版作为 Alibaba Coding Plan 覆盖模型展示。",
    sourceUrl: "https://www.alibabacloud.com/help/en/model-studio/coding-plan",
    sourceLabel: "Alibaba Coding Plan",
    capabilities: ["coding", "agent"],
    suitableTools: ["Qwen Code", "Codex", "Claude Code", "Cursor"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-k2-6",
    displayName: "Kimi K2.6",
    family: "Kimi",
    modelId: "kimi-k2.6",
    description: "Kimi 新一代长程代码和 Agent 模型，支持文本、图片与视频输入。",
    contextWindow: "256K",
    sourceUrl: "https://platform.kimi.com/docs/pricing/chat-k26",
    sourceLabel: "Kimi API Pricing",
    capabilities: ["vision", "thinking", "tool-calls", "json"],
    suitableTools: ["Kimi Code", "OpenCode", "Cursor", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-k2-5",
    displayName: "Kimi K2.5",
    family: "Kimi",
    modelId: "kimi-k2.5",
    description: "Kimi K2.5 多模态与 Agent 模型，仍被多个公开编码套餐收录。",
    contextWindow: "256K",
    sourceUrl: "https://platform.kimi.com/docs/pricing/chat-k25",
    sourceLabel: "Kimi API Pricing",
    capabilities: ["vision", "thinking", "tool-calls", "json"],
    suitableTools: ["Kimi Code", "OpenCode", "Cursor", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "glm-5-1",
    displayName: "GLM-5.1",
    family: "GLM",
    modelId: "glm-5.1",
    description: "GLM 5 系列高能力版本，首版以 OpenCode Go 等公开套餐覆盖为主。",
    sourceUrl: "https://dev.opencode.ai/docs/go/",
    sourceLabel: "OpenCode Go Docs",
    capabilities: ["coding", "agent"],
    suitableTools: ["OpenCode", "Codex", "Claude Code", "Cursor"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "glm-5",
    displayName: "GLM-5",
    family: "GLM",
    modelId: "glm-5",
    description: "智谱 GLM 基座模型，面向复杂系统工程与长程 Agent 任务。",
    contextWindow: "200K",
    sourceUrl: "https://docs.bigmodel.cn/cn/guide/models/text/glm-5",
    sourceLabel: "智谱开放文档",
    capabilities: ["thinking", "tool-calls", "cache", "coding"],
    suitableTools: ["OpenCode", "Codex", "Claude Code", "Cursor"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "minimax-m3",
    displayName: "MiniMax M3",
    family: "MiniMax",
    modelId: "minimax-m3",
    description: "MiniMax 最新 M 系列模型，面向 Agentic reasoning、tool use、coding 和长上下文任务。",
    contextWindow: "1M",
    sourceUrl: "https://platform.minimax.io/docs/api-reference/api-overview",
    sourceLabel: "MiniMax API Docs",
    capabilities: ["anthropic-compatible", "tool-calls", "coding", "long-context"],
    suitableTools: ["OpenCode", "Claude Code", "Cursor", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "minimax-m2-7",
    displayName: "MiniMax M2.7",
    family: "MiniMax",
    modelId: "minimax-m2.7",
    description: "MiniMax M2.7 是官方 API 与 Token Plan 的主力模型，适合低成本编码与 Agent。",
    contextWindow: "204.8K",
    sourceUrl: "https://platform.minimax.io/docs/api-reference/api-overview",
    sourceLabel: "MiniMax API Docs",
    capabilities: ["anthropic-compatible", "openai-compatible", "tool-calls", "coding"],
    suitableTools: ["OpenCode", "Claude Code", "Cursor", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "minimax-m2-5",
    displayName: "MiniMax M2.5",
    family: "MiniMax",
    modelId: "minimax-m2.5",
    description: "MiniMax M2.5 是低成本编码与复杂任务模型，仍被多个公开套餐收录。",
    contextWindow: "204.8K",
    sourceUrl: "https://platform.minimax.io/docs/api-reference/api-overview",
    sourceLabel: "MiniMax API Docs",
    capabilities: ["anthropic-compatible", "openai-compatible", "tool-calls", "coding"],
    suitableTools: ["OpenCode", "Claude Code", "Cursor", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "mimo-v2-5-pro",
    displayName: "MiMo V2.5 Pro",
    family: "MiMo",
    modelId: "mimo-v2.5-pro",
    description: "Xiaomi MiMo V2.5 系列旗舰基座模型，官方介绍为 1T 总参数、42B 激活与 1M 上下文，适合复杂 Agent、编码和长上下文任务。",
    contextWindow: "1M",
    sourceUrl: "https://mimo.mi.com/",
    sourceLabel: "Xiaomi MiMo Home",
    capabilities: ["agent", "coding", "long-context", "multimodal"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "mimo-v2-5",
    displayName: "MiMo V2.5",
    family: "MiMo",
    modelId: "mimo-v2.5",
    description: "Xiaomi MiMo V2.5 系列均衡基座模型，官方强调全模态感知、Agent 能力和 1M 上下文，适合成本与能力平衡的中文模型调用。",
    contextWindow: "1M",
    sourceUrl: "https://mimo.mi.com/",
    sourceLabel: "Xiaomi MiMo Home",
    capabilities: ["agent", "coding", "long-context", "multimodal"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "step-3-7-flash",
    displayName: "Step 3.7 Flash",
    family: "StepFun",
    modelId: "step-3.7-flash",
    description: "阶跃星辰面向真实 Agent、Coding 和多模态工作流的高效率 Flash 模型，适合作为国产模型 API 的新增候选基准。",
    sourceUrl: "https://platform.stepfun.com/docs/zh/guides/models/step-3.7-flash",
    sourceLabel: "StepFun 模型文档",
    capabilities: ["agent", "coding", "multimodal", "tool-calls"],
    suitableTools: ["Codex", "Cursor", "OpenCode", "Open WebUI"],
    updatedAt: apiModelUpdatedAt,
  },
];

export const apiProviders: ApiProvider[] = [
  {
    id: "deepseek-official",
    name: "DeepSeek 官方 API",
    type: "official",
    billingMode: "按量计费",
    url: "https://platform.deepseek.com/",
    pricingUrl: "https://api-docs.deepseek.com/quick_start/pricing/",
    logoUrl: "/brand-icons/deepseek.png",
    description: "DeepSeek 官方 OpenAI/Anthropic 兼容 API，适合作为 DeepSeek V4 的价格基准。",
    limitSummary: "未公开固定 RPM/TPM，以控制台为准。",
    limitations: "价格可能调整，旧模型名 deepseek-chat 与 deepseek-reasoner 有兼容和下线时间说明。",
    sourceLabel: "DeepSeek API Docs",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-official",
    name: "Kimi API",
    type: "official",
    billingMode: "按量计费",
    url: "https://platform.kimi.com/",
    pricingUrl: "https://platform.kimi.com/docs/pricing/chat",
    logoUrl: "/brand-icons/kimi.png",
    description: "Moonshot/Kimi 官方开放平台，适合长上下文、多模态和中文 Agent 场景。",
    limitSummary: "未公开固定 RPM/TPM，以开放平台控制台为准。",
    limitations: "首版展示官方模型页与计费说明，具体价格以 Kimi 开放平台实时表格为准。",
    sourceLabel: "Kimi API Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "minimax-official",
    name: "MiniMax API",
    type: "official",
    billingMode: "按量计费",
    url: "https://platform.minimax.io/",
    pricingUrl: "https://platform.minimax.io/docs/guides/pricing-paygo",
    logoUrl: "/brand-icons/minimax.png",
    description: "MiniMax 官方开放平台，M3/M2.7/M2.5 支持 Anthropic 与 OpenAI 兼容接口。",
    limitSummary: "未公开固定 RPM/TPM，以控制台为准。",
    limitations: "M3 当前价格含限时折扣和 512K 阈值，M2.7/M2.5 有 standard/highspeed 差异。",
    sourceLabel: "MiniMax Pricing Docs",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "zhipu-bigmodel",
    name: "智谱开放平台",
    type: "official",
    billingMode: "按量计费",
    url: "https://open.bigmodel.cn/",
    pricingUrl: "https://bigmodel.cn/pricing",
    logoUrl: "/brand-icons/glm.png",
    description: "智谱官方开放平台。首版先收录 GLM-5 模型文档，并以智谱官方定价页作为 GLM 价格标准入口。",
    limitSummary: "未公开固定 RPM/TPM，以控制台为准。",
    limitations: "定价页为前端渲染，采集器需单独解析后才能把 GLM 单价转成结构化数值报价。",
    sourceLabel: "智谱官方定价页",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "alibaba-coding-plan",
    name: "Alibaba Model Studio Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://www.alibabacloud.com/product/modelstudio",
    pricingUrl: "https://www.alibabacloud.com/help/en/model-studio/coding-plan",
    logoUrl: "/brand-icons/alibabacloud.svg",
    description: "阿里云 Model Studio 面向编码工具的月订阅套餐，覆盖 Qwen、Kimi、GLM、MiniMax 等模型。",
    limitSummary: "6,000 req/5h · 45,000 req/week · 90,000 req/month。",
    limitations: "仅用于编码工具；官方明确不适合自动化脚本、自定义后端或非交互批处理 API。",
    sourceLabel: "Alibaba Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "opencode-go",
    name: "OpenCode Go",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://opencode.ai/",
    pricingUrl: "https://dev.opencode.ai/docs/go/",
    logoUrl: "/brand-icons/opencode.png",
    description: "OpenCode 面向开放编码模型的低价订阅套餐，提供多模型 API endpoint。",
    limitSummary: "$12/5h · $30/week · $60/month 用量窗口。",
    limitations: "请求数取决于模型消耗；有 5 小时、每周、每月额度窗口，不能当作无限 API。",
    sourceLabel: "OpenCode Go Docs",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    type: "router",
    billingMode: "动态路由",
    url: "https://openrouter.ai/",
    pricingUrl: "https://openrouter.ai/pricing",
    logoUrl: "/brand-icons/openrouter.png",
    description: "公开模型路由平台，统一 API key 访问多家模型和 provider，价格随模型页变化。",
    limitSummary: "免费 50 req/day；充值后免费模型可到 1,000 req/day。",
    limitations: "免费模型有低限流；付费价格、可用 provider 和路由结果可能随时间变化。",
    sourceLabel: "OpenRouter Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "nvidia-nim",
    name: "NVIDIA NIM",
    type: "free",
    billingMode: "免费/测试",
    url: "https://build.nvidia.com/explore/discover",
    pricingUrl: "https://www.nvidia.com/en-us/ai-data-science/products/nim-microservices/",
    logoUrl: "/brand-icons/nvidia.png",
    description: "NVIDIA Hosted API 和 NIM 微服务入口，适合开发、测试、原型和自托管评估。",
    limitSummary: "未公开固定 RPM/TPM，以 API Catalog 为准。",
    limitations: "免费访问主要面向开发测试和原型，模型列表、限速和可用性会变化。",
    sourceLabel: "NVIDIA NIM",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ollama",
    name: "Ollama",
    type: "free",
    billingMode: "免费/测试",
    url: "https://ollama.com/",
    pricingUrl: "https://ollama.com/pricing",
    logoUrl: "/brand-icons/ollama.png",
    description: "Ollama 官方云端模型入口，参考 awesome-coding-plan 的免费/Pro 线索，首版展示公开 Pricing 和套餐覆盖。",
    limitSummary: "Free / Pro 额度、并发和速率限制以 Ollama Pricing 为准。",
    limitations: "适合作为开放模型测试和轻量调用入口；模型列表、免费额度和 Pro 规则可能随官方页面变化。",
    sourceLabel: "Ollama Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-code",
    name: "Kimi Code",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://www.kimi.com/membership/pricing",
    pricingUrl: "https://www.kimi.com/membership/pricing",
    logoUrl: "/brand-icons/kimi.png",
    description: "Kimi 会员里的 Kimi Code 套餐入口，适合按月获取 Kimi Code 编码额度。",
    limitSummary: "Andante / Allegretto 等套餐额度以 Kimi 官方会员页为准。",
    limitations: "这是编码会员套餐，不等同于无限通用 API；具体模型、额度窗口和高峰可用性以官方页面为准。",
    sourceLabel: "Kimi Membership Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "glm-coding-plan",
    name: "GLM Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://bigmodel.cn/glm-coding",
    pricingUrl: "https://bigmodel.cn/glm-coding",
    logoUrl: "/brand-icons/glm.png",
    description: "智谱 GLM Coding Plan 官方入口，参考 awesome-coding-plan 的 Lite / Pro 线索，展示 GLM 编码套餐。",
    limitSummary: "Lite / Pro 用量额度、短周期限制和抢购状态以智谱官方页面为准。",
    limitations: "这是面向编码场景的订阅套餐，不直接等价于按量 API 单价；结构化额度后续再由采集器补齐。",
    sourceLabel: "GLM Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "fireworks-fire-pass",
    name: "Fireworks Fire Pass",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://app.fireworks.ai/fire-pass",
    pricingUrl: "https://app.fireworks.ai/fire-pass",
    logoUrl: "/brand-icons/fireworks.png",
    description: "Fireworks AI 的 Fire Pass 套餐入口，当前优先作为 Kimi K2.6 Turbo 等模型的公开套餐线索展示。",
    limitSummary: "周付套餐、模型覆盖和速率限制以 Fireworks Fire Pass 页面为准。",
    limitations: "套餐可用模型和 no per-token charges 口径可能变化，首版不硬填不可核验的等效单价。",
    sourceLabel: "Fireworks Fire Pass",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "xiaomi-mimo",
    name: "Xiaomi MiMo API",
    type: "official",
    billingMode: "按量计费",
    url: "https://platform.xiaomimimo.com/",
    pricingUrl: "https://mimo.mi.com/",
    logoUrl: "/brand-icons/mimo.png",
    description: "小米 MiMo 官方开放平台，首版收录 MiMo V2.5 Pro 与 MiMo V2.5，并以官方 Token Plan / API 入口作为价格来源。",
    limitSummary: "未公开固定 RPM/TPM，以 MiMo 控制台和 Token Plan 规则为准。",
    limitations: "当前官方页面为动态展示，首版先保留官方来源和套餐口径，后续再解析结构化单价。",
    sourceLabel: "Xiaomi MiMo Home",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "stepfun-official",
    name: "StepFun 开放平台",
    type: "official",
    billingMode: "按量计费",
    url: "https://platform.stepfun.com/",
    pricingUrl: "https://platform.stepfun.com/docs/zh/guides/pricing/details",
    logoUrl: "/brand-icons/stepfun.png",
    description: "阶跃星辰官方开放平台，首版收录 Step 3.7 Flash，并以官方模型文档和定价限速页作为来源。",
    limitSummary: "RPM/TPM 与模型价格以阶跃星辰官方定价与限速页为准。",
    limitations: "Step 3.7 Flash 为新模型，结构化价格待采集器进一步解析，前台先展示官方来源。",
    sourceLabel: "StepFun 定价与限速",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "baidu-qianfan",
    name: "百度智能云千帆",
    type: "official",
    billingMode: "按量计费",
    url: "https://cloud.baidu.com/product-s/qianfan_home",
    pricingUrl: "https://cloud.baidu.com/doc/Qianfan/API.html",
    logoUrl: "/brand-icons/baiducloud.png",
    description: "百度千帆大模型平台，面向模型服务、Agent 开发和企业级应用，当前先作为官方 API 候选入口展示。",
    limitSummary: "价格和限速以千帆模型服务计费页、控制台和具体模型页为准。",
    limitations: "公开页面可确认平台和计费入口，但单模型输入/输出价格需要后续采集器解析。",
    sourceLabel: "百度千帆官网与文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "jdcloud-joyai",
    name: "京东云 JoyBuilder",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.jdcloud.com/cn/products/jdaip",
    pricingUrl: "https://docs.jdcloud.com/cn/jdaip/billing-overview",
    logoUrl: "/brand-icons/jdcloud.png",
    description: "京东云 JoyBuilder 模型开发平台，公开文档包含产品计费、模型服务价格及计费规则入口。",
    limitSummary: "具体模型价格、并发和部署口径以京东云 JoyBuilder 计费文档为准。",
    limitations: "当前只确认官方计费文档入口，尚未稳定解析到可对比的单模型 token 单价。",
    sourceLabel: "京东云 JoyBuilder 文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "unicom-yuanjing",
    name: "联通元景大模型",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.chinaunicom.cn/",
    pricingUrl: "https://www.chinaunicom.cn/",
    logoUrl: "/brand-icons/chinaunicom.png",
    description: "中国联通大模型相关公开入口，首版先作为官方候选渠道展示，等待补充稳定开发者文档和价格页。",
    limitSummary: "价格、模型列表和调用限制待解析，以联通官方公开页面或控制台为准。",
    limitations: "目前没有稳定可抓取的公开单模型价格，不能作为正式报价基准。",
    sourceLabel: "中国联通官网",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "huaweicloud-modelarts-maas",
    name: "华为云 ModelArts / MaaS",
    type: "official",
    billingMode: "按量计费",
    url: "https://www.huaweicloud.com/product/modelarts.html",
    pricingUrl: "https://activity.huaweicloud.com/maas-ds.html",
    logoUrl: "/brand-icons/huaweicloud.png",
    description: "华为云 ModelArts / MaaS 与 DeepSeek 专场入口，适合后续补充公开模型服务、Token 套餐和活动价。",
    limitSummary: "Token 套餐、限额和模型列表以华为云活动页、MaaS 页面和控制台为准。",
    limitations: "华为云页面存在访问挑战和动态内容，首版先展示官方入口，不硬填未校验单价。",
    sourceLabel: "华为云 ModelArts / MaaS",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "volcengine-ark-coding-plan",
    name: "火山方舟 Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://www.volcengine.com/activity/codingplan",
    pricingUrl: "https://www.volcengine.com/activity/codingplan",
    logoUrl: "/brand-icons/volcengine.png",
    description: "火山引擎方舟面向 AI Coding 的公开活动页，覆盖国产模型和多种编码工具。",
    limitSummary: "套餐价格、短周期请求窗口和模型覆盖依赖活动页动态内容，以官方页面为准。",
    limitations: "静态 HTML 无稳定价格表，已前台展示但标记为价格待解析。",
    sourceLabel: "火山方舟 Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "tencent-hunyuan-coding-plan",
    name: "腾讯云 TokenHub Coding Plan",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://cloud.tencent.com/product/tokenhub",
    pricingUrl: "https://cloud.tencent.com/document/product/1823/130092",
    logoUrl: "/brand-icons/tencentcloud.png",
    description: "腾讯云 TokenHub 面向 AI Coding 的订阅套餐，官方文档列出 Lite/Pro 价格、请求额度、支持模型和适配工具。",
    limitSummary: "Lite：1,200 req/5h、9,000 req/week、18,000 req/month；Pro：6,000 req/5h、45,000 req/week、90,000 req/month。",
    limitations: "请求次数是模型调用预估值，一次用户提问可能消耗多次请求；高峰时段可能触发限频。",
    sourceLabel: "腾讯云 TokenHub 官方文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ctyun-xirang",
    name: "天翼云息壤 Token 服务",
    type: "subscription",
    billingMode: "订阅套餐",
    url: "https://ctxirang.ctyun.cn/home",
    pricingUrl: "https://www.ctyun.cn/act/AI/zhuanxiang",
    logoUrl: "/brand-icons/ctyun.png",
    description: "天翼云息壤智算与 Token 服务公开入口，官网菜单展示模型市场、服务接入和大模型特惠专区。",
    limitSummary: "活动页标注 Token Plan 轻享包低至 9.9 元起，具体模型额度和限制以天翼云页面为准。",
    limitations: "活动价和模型列表动态变化，首版只展示公开入口和可见活动口径。",
    sourceLabel: "天翼云息壤公开页面",
    updatedAt: apiModelUpdatedAt,
  },
];

export const apiPlans: ApiPlan[] = [
  {
    id: "opencode-go-plan",
    providerId: "opencode-go",
    providerName: "OpenCode Go",
    name: "OpenCode Go",
    type: "subscription",
    priceLabel: "$5 首月，之后 $10/月",
    priceUsdMonthly: 10,
    url: "https://dev.opencode.ai/docs/go/",
    quotaSummary: "5 小时 $12、每周 $30、每月 $60 的用量窗口。",
    resetSummary: "短周期额度按 OpenCode Go 规则滚动或周期刷新。",
    limitSummary: "$12/5h · $30/week · $60/month 用量窗口。",
    limitations: "适合 OpenCode/Codex/Cursor 等编码工具。请求数取决于具体模型成本。",
    modelIds: [
      "deepseek-v4-flash",
      "deepseek-v4-pro",
      "qwen3-7-max",
      "qwen3-7-plus",
      "qwen3-6-plus",
      "kimi-k2-6",
      "kimi-k2-5",
      "glm-5-1",
      "glm-5",
      "minimax-m3",
      "minimax-m2-7",
      "minimax-m2-5",
    ],
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code"],
    sourceLabel: "OpenCode Go Docs",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "alibaba-coding-plan-pro",
    providerId: "alibaba-coding-plan",
    providerName: "Alibaba Model Studio Coding Plan",
    name: "Coding Plan Pro",
    type: "subscription",
    priceLabel: "$50/月",
    priceUsdMonthly: 50,
    url: "https://www.alibabacloud.com/help/en/model-studio/coding-plan",
    quotaSummary: "6,000 requests/5 小时、45,000 requests/周、90,000 requests/月。",
    resetSummary: "5 小时额度滑动重置；周额度每周一 UTC+8 重置；月额度按订阅日重置。",
    limitSummary: "6,000 req/5h · 45,000 req/week · 90,000 req/month。",
    limitations: "只适合编码工具，官方不允许当成自动脚本或应用后端 API 使用。",
    modelIds: ["qwen3-5-plus", "qwen3-coder-plus", "kimi-k2-5", "glm-5", "minimax-m2-5"],
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
    suitableTools: ["Codex", "Claude Code", "Cursor", "OpenCode", "Qwen Code"],
    sourceLabel: "Alibaba Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "minimax-token-plan",
    providerId: "minimax-official",
    providerName: "MiniMax API",
    name: "MiniMax Token Plan",
    type: "subscription",
    priceLabel: "$10/$20/$50 月付，另有高速版",
    priceUsdMonthly: 10,
    url: "https://platform.minimax.io/docs/guides/pricing-tokenplan",
    quotaSummary: "标准版按 M2.7 请求数计量：1,500、4,500、15,000 requests/5hrs。",
    resetSummary: "按 5 小时窗口限制请求数。",
    limitSummary: "1,500/4,500/15,000 requests/5hrs。",
    limitations: "Token Plan 主要覆盖 MiniMax 资源，不等于所有模型无限调用。",
    modelIds: ["minimax-m2-7"],
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
    suitableTools: ["OpenCode", "Claude Code", "Cursor", "Open WebUI"],
    sourceLabel: "MiniMax Token Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "openrouter-free-plan",
    providerId: "openrouter",
    providerName: "OpenRouter",
    name: "OpenRouter Free Models",
    type: "free",
    priceLabel: "免费模型 50 req/day 起",
    url: "https://openrouter.ai/pricing",
    quotaSummary: "免费用户 50 req/day；购买至少 $10 credits 后免费模型可到 1000 req/day。",
    resetSummary: "免费额度按 OpenRouter 当前限制执行。",
    limitSummary: "50 req/day；充值后免费模型 1,000 req/day。",
    limitations: "只适合测试和低频使用，热门免费模型会受 provider 限流影响。",
    modelIds: [],
    coverageLabel: "25+ free models，具体模型以 OpenRouter 模型页为准。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
    suitableTools: ["Codex", "Cursor", "OpenCode", "Open WebUI"],
    sourceLabel: "OpenRouter Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "nvidia-nim-developer",
    providerId: "nvidia-nim",
    providerName: "NVIDIA NIM",
    name: "NIM Hosted API",
    type: "free",
    priceLabel: "开发测试免费访问",
    url: "https://www.nvidia.com/en-us/ai-data-science/products/nim-microservices/",
    quotaSummary: "面向开发、测试、原型和 NIM 自托管评估。",
    resetSummary: "限速、模型列表和额度以 NVIDIA API Catalog 为准。",
    limitSummary: "未公开固定 RPM/TPM，以 API Catalog 为准。",
    limitations: "不应默认作为生产 SLA；生产或私有化需要 NVIDIA AI Enterprise 等方案。",
    modelIds: ["deepseek-v4-flash", "deepseek-v4-pro", "glm-5-1", "minimax-m2-7"],
    coverageLabel: "NIM catalog 动态模型列表，参考线索覆盖 DeepSeek、GLM、MiniMax 等开放模型。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
    suitableTools: ["Open WebUI", "自建应用", "原型验证"],
    sourceLabel: "NVIDIA NIM",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ollama-free",
    providerId: "ollama",
    providerName: "Ollama",
    name: "Ollama Free",
    type: "free",
    priceLabel: "免费，见官方 Pricing",
    url: "https://ollama.com/pricing",
    quotaSummary: "官方 Pricing 展示免费档，适合体验开放模型和轻量测试。",
    resetSummary: "免费额度和重置规则以 Ollama Pricing 为准。",
    limitSummary: "以 Ollama Pricing 当前限制为准。",
    limitations: "免费档不适合作为稳定生产 SLA；模型列表和并发限制可能变化。",
    modelIds: ["qwen3-5-plus", "minimax-m2-7"],
    coverageLabel: "参考 awesome-coding-plan 线索，覆盖 Qwen、MiniMax、GLM 等开放模型；本地标准模型先映射已收录项。",
    compatibility: ["免费/测试", "中文模型", "开放模型"],
    suitableTools: ["Open WebUI", "自建应用", "原型验证"],
    sourceLabel: "Ollama Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ollama-pro",
    providerId: "ollama",
    providerName: "Ollama",
    name: "Ollama Pro",
    type: "subscription",
    priceLabel: "$20/月，见官方 Pricing",
    priceUsdMonthly: 20,
    url: "https://ollama.com/pricing",
    quotaSummary: "Pro 档位额度、并发和模型覆盖以 Ollama 官方 Pricing 为准。",
    resetSummary: "按 Ollama 订阅周期和官方额度规则执行。",
    limitSummary: "以 Ollama Pricing 当前限制为准。",
    limitations: "适合比免费档更稳定的开放模型调用，但仍需关注官方模型列表和限流变化。",
    modelIds: ["qwen3-5-plus", "minimax-m2-7"],
    coverageLabel: "Ollama Pro 官方订阅档位。",
    compatibility: ["订阅套餐", "中文模型", "开放模型"],
    suitableTools: ["Open WebUI", "自建应用", "原型验证"],
    sourceLabel: "Ollama Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-code-andante",
    providerId: "kimi-code",
    providerName: "Kimi Code",
    name: "Kimi Code Andante",
    type: "subscription",
    priceLabel: "49 元/月",
    priceCnyMonthly: 49,
    url: "https://www.kimi.com/membership/pricing",
    quotaSummary: "Kimi Code 低价会员档，具体额度以 Kimi 官方会员页为准。",
    resetSummary: "按 Kimi 会员订阅周期和官方额度规则执行。",
    limitSummary: "Kimi Code 调用额度以官方会员页为准。",
    limitations: "低价档适合轻量体验，参考项目指出性价比和高峰可用性需要谨慎评估。",
    modelIds: ["kimi-k2-5"],
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Kimi Code", "Cursor", "OpenCode"],
    sourceLabel: "Kimi Membership Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "kimi-code-allegretto",
    providerId: "kimi-code",
    providerName: "Kimi Code",
    name: "Kimi Code Allegretto",
    type: "subscription",
    priceLabel: "199 元/月",
    priceCnyMonthly: 199,
    url: "https://www.kimi.com/membership/pricing",
    quotaSummary: "Kimi Code 高档会员，官方页面展示更高编码额度。",
    resetSummary: "按 Kimi 会员订阅周期和官方额度规则执行。",
    limitSummary: "Kimi Code 调用额度以官方会员页为准。",
    limitations: "适合团队或高频编码使用，真实可用性需持续结合用户反馈更新。",
    modelIds: ["kimi-k2-5"],
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Kimi Code", "Cursor", "OpenCode"],
    sourceLabel: "Kimi Membership Pricing",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "glm-coding-plan-lite",
    providerId: "glm-coding-plan",
    providerName: "GLM Coding Plan",
    name: "Coding Plan Lite",
    type: "subscription",
    priceLabel: "49 元/月",
    priceCnyMonthly: 49,
    url: "https://bigmodel.cn/glm-coding",
    quotaSummary: "GLM Coding Plan Lite，额度和短周期限制以智谱官方页面为准。",
    resetSummary: "按 GLM Coding Plan 官方额度窗口执行。",
    limitSummary: "Lite 档额度以官方页面为准。",
    limitations: "参考项目指出可能存在抢购、限频和算力紧张，首版仅展示官方入口与套餐口径。",
    modelIds: ["glm-5-1", "glm-5"],
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Claude Code", "Cursor", "OpenCode", "Codex"],
    sourceLabel: "GLM Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "glm-coding-plan-pro",
    providerId: "glm-coding-plan",
    providerName: "GLM Coding Plan",
    name: "Coding Plan Pro",
    type: "subscription",
    priceLabel: "149 元/月",
    priceCnyMonthly: 149,
    url: "https://bigmodel.cn/glm-coding",
    quotaSummary: "GLM Coding Plan Pro，额度和短周期限制以智谱官方页面为准。",
    resetSummary: "按 GLM Coding Plan 官方额度窗口执行。",
    limitSummary: "Pro 档额度以官方页面为准。",
    limitations: "参考项目指出可能存在抢购、限频和算力紧张，首版仅展示官方入口与套餐口径。",
    modelIds: ["glm-5-1", "glm-5"],
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Claude Code", "Cursor", "OpenCode", "Codex"],
    sourceLabel: "GLM Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "fireworks-fire-pass-kimi",
    providerId: "fireworks-fire-pass",
    providerName: "Fireworks Fire Pass",
    name: "Fire Pass",
    type: "subscription",
    priceLabel: "$7/周，见 Fire Pass 页面",
    priceUsdMonthly: 28,
    url: "https://app.fireworks.ai/fire-pass",
    quotaSummary: "Fire Pass 页面展示周付套餐，当前作为 Kimi K2.6 Turbo 等模型的套餐入口。",
    resetSummary: "按 Fireworks Fire Pass 官方规则执行。",
    limitSummary: "速率限制和模型覆盖以 Fire Pass 页面为准。",
    limitations: "套餐覆盖和 no per-token charges 口径可能变化，首版不折算等效 token 单价。",
    modelIds: ["kimi-k2-6"],
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Open WebUI", "自建应用", "Cursor", "OpenCode"],
    sourceLabel: "Fireworks Fire Pass",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "xiaomi-mimo-token-plan",
    providerId: "xiaomi-mimo",
    providerName: "Xiaomi MiMo API",
    name: "Xiaomi MiMo Token Plan",
    type: "subscription",
    priceLabel: "见官方 Token Plan",
    url: "https://mimo.mi.com/",
    quotaSummary: "官方首页标注 Token Plan 支持包月/包年订阅，覆盖 MiMo V2.5 系列。",
    resetSummary: "额度和续订规则以 MiMo 官方 Token Plan 页面为准。",
    limitSummary: "未公开固定 RPM/TPM，以 MiMo 控制台和 Token Plan 规则为准。",
    limitations: "首版不硬填不可校验价格，等待后续结构化解析。",
    modelIds: ["mimo-v2-5-pro", "mimo-v2-5"],
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "多模态"],
    suitableTools: ["OpenCode", "Codex", "Cursor", "Claude Code", "Open WebUI"],
    sourceLabel: "Xiaomi MiMo Home",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "baidu-qianfan-official-pricing",
    providerId: "baidu-qianfan",
    providerName: "百度智能云千帆",
    name: "千帆模型服务计费",
    type: "official",
    priceLabel: "价格待解析，见官方计费页",
    url: "https://cloud.baidu.com/doc/Qianfan/API.html",
    quotaSummary: "公开文档包含模型服务计费、Token 计算说明和新用户代金券说明。",
    resetSummary: "额度、赠金和限流以千帆控制台及具体模型服务页面为准。",
    limitSummary: "未公开统一 RPM/TPM，按模型和账号控制台规则执行。",
    limitations: "首版未解析单模型输入/输出价格，先以前台候选渠道展示。",
    modelIds: [],
    coverageLabel: "千帆模型服务、Agent 开发和 DeepSeek-V4 预览版 API 服务。",
    compatibility: ["官方 API", "企业云", "中文模型"],
    suitableTools: ["自建应用", "Open WebUI", "Chatbox"],
    sourceLabel: "百度千帆官网与文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "jdcloud-joybuilder-pricing",
    providerId: "jdcloud-joyai",
    providerName: "京东云 JoyBuilder",
    name: "JoyBuilder 模型服务计费",
    type: "official",
    priceLabel: "价格待解析，见官方计费文档",
    url: "https://docs.jdcloud.com/cn/jdaip/billing-overview",
    quotaSummary: "官方文档存在产品计费、模型服务价格及计费规则、模型精调 token 计费入口。",
    resetSummary: "按京东云账号、模型服务和部署方式执行。",
    limitSummary: "模型调用限制和部署限制以 JoyBuilder 文档与控制台为准。",
    limitations: "当前未提取到稳定单模型价格，先展示官方计费入口。",
    modelIds: [],
    coverageLabel: "JoyBuilder 模型开发平台、模型服务、模型精调与部署能力。",
    compatibility: ["官方 API", "企业云", "模型部署"],
    suitableTools: ["自建应用", "企业控制台"],
    sourceLabel: "京东云 JoyBuilder 文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "unicom-yuanjing-official",
    providerId: "unicom-yuanjing",
    providerName: "联通元景大模型",
    name: "联通元景候选入口",
    type: "official",
    priceLabel: "价格待解析，待补官方价格页",
    url: "https://www.chinaunicom.cn/",
    quotaSummary: "当前仅保留中国联通官方公开入口，等待后续补充元景开发者文档和价格页。",
    resetSummary: "待官方开发者入口确认。",
    limitSummary: "待解析。",
    limitations: "没有稳定公开价格页前，不作为正式模型报价。",
    modelIds: [],
    coverageLabel: "联通大模型相关候选渠道。",
    compatibility: ["官方候选", "企业云"],
    suitableTools: ["待确认"],
    sourceLabel: "中国联通官网",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "huaweicloud-maas-token-package",
    providerId: "huaweicloud-modelarts-maas",
    providerName: "华为云 ModelArts / MaaS",
    name: "MaaS Token 套餐包",
    type: "official",
    priceLabel: "见华为云 MaaS / DeepSeek 活动页",
    url: "https://activity.huaweicloud.com/maas-ds.html",
    quotaSummary: "公开活动页强调 Tokens 套餐包、AI 智能体免费体验和热门模型一键调用。",
    resetSummary: "Token 套餐包、活动周期和额度以华为云页面及控制台为准。",
    limitSummary: "未公开统一 RPM/TPM，按华为云 MaaS 控制台规则执行。",
    limitations: "页面存在访问挑战和动态内容，结构化价格待后续解析。",
    modelIds: ["deepseek-v4-flash"],
    coverageLabel: "DeepSeek 应用专场、Tokens 套餐包和 ModelArts/MaaS 模型服务。",
    compatibility: ["官方 API", "企业云", "中文模型"],
    suitableTools: ["自建应用", "企业控制台"],
    sourceLabel: "华为云 ModelArts / MaaS",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "volcengine-ark-coding-plan-official",
    providerId: "volcengine-ark-coding-plan",
    providerName: "火山方舟 Coding Plan",
    name: "方舟 Coding Plan",
    type: "subscription",
    priceLabel: "价格待解析，见官方活动页",
    url: "https://www.volcengine.com/activity/codingplan",
    quotaSummary: "官方活动页公开 Coding Plan 入口，覆盖 DeepSeek、GLM、MiniMax、Kimi 等模型和多种编码工具。",
    resetSummary: "套餐额度、刷新周期和活动规则以火山方舟页面为准。",
    limitSummary: "价格和请求窗口待解析。",
    limitations: "静态页面没有稳定价格表，当前不硬填数值。",
    modelIds: ["deepseek-v4-flash", "glm-5", "kimi-k2-5", "minimax-m2-5"],
    coverageLabel: "DeepSeek、GLM、MiniMax、Kimi、Doubao 等 Coding Plan 模型。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["Claude Code", "Cursor", "Cline", "OpenCode"],
    sourceLabel: "火山方舟 Coding Plan",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "tencent-tokenhub-lite",
    providerId: "tencent-hunyuan-coding-plan",
    providerName: "腾讯云 TokenHub Coding Plan",
    name: "Coding Plan Lite",
    type: "subscription",
    priceLabel: "40 元/月",
    priceCnyMonthly: 40,
    url: "https://cloud.tencent.com/document/product/1823/130092",
    quotaSummary: "1,200 requests/5 小时、9,000 requests/周、18,000 requests/月。",
    resetSummary: "5 小时、周、订阅月额度按腾讯云 Coding Plan 规则刷新。",
    limitSummary: "1,200 req/5h · 9,000 req/week · 18,000 req/month。",
    limitations: "请求次数为模型调用预估值，一次用户提问可能触发多次模型调用。",
    modelIds: ["glm-5", "kimi-k2-5", "minimax-m2-5"],
    coverageLabel: "Tencent HY 2.0 Instruct、GLM-5、Kimi-K2.5、MiniMax-M2.5。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["OpenClaw", "CodeBuddy", "Claude Code", "Cline", "Cursor", "OpenCode", "Codex", "Kilo CLI"],
    sourceLabel: "腾讯云 TokenHub 官方文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "tencent-tokenhub-pro",
    providerId: "tencent-hunyuan-coding-plan",
    providerName: "腾讯云 TokenHub Coding Plan",
    name: "Coding Plan Pro",
    type: "subscription",
    priceLabel: "200 元/月",
    priceCnyMonthly: 200,
    url: "https://cloud.tencent.com/document/product/1823/130092",
    quotaSummary: "6,000 requests/5 小时、45,000 requests/周、90,000 requests/月。",
    resetSummary: "5 小时、周、订阅月额度按腾讯云 Coding Plan 规则刷新。",
    limitSummary: "6,000 req/5h · 45,000 req/week · 90,000 req/month。",
    limitations: "请求次数为模型调用预估值，高峰期可能触发限频。",
    modelIds: ["glm-5", "kimi-k2-5", "minimax-m2-5"],
    coverageLabel: "Tencent HY 2.0 Instruct、GLM-5、Kimi-K2.5、MiniMax-M2.5。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["OpenClaw", "CodeBuddy", "Claude Code", "Cline", "Cursor", "OpenCode", "Codex", "Kilo CLI"],
    sourceLabel: "腾讯云 TokenHub 官方文档",
    updatedAt: apiModelUpdatedAt,
  },
  {
    id: "ctyun-xirang-token-plan",
    providerId: "ctyun-xirang",
    providerName: "天翼云息壤 Token 服务",
    name: "Token Plan 轻享包",
    type: "subscription",
    priceLabel: "9.9 元起，见活动页",
    priceCnyMonthly: 9.9,
    url: "https://www.ctyun.cn/act/AI/zhuanxiang",
    quotaSummary: "天翼云公开页面标注大模型特惠专区 Token Plan 轻享包低至 9.9 元起。",
    resetSummary: "活动周期、模型额度和续费规则以天翼云页面为准。",
    limitSummary: "Token 服务限制和服务接入规则以息壤控制台为准。",
    limitations: "活动价不是统一模型单价，需后续解析具体模型额度。",
    modelIds: ["deepseek-v4-flash", "glm-5-1"],
    coverageLabel: "官网菜单公开展示 DeepSeek-V4-Flash、GLM-5.1、Qwen3.5-122B-A10B、DeepSeek-V3.2、GLM-5 等模型入口。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    suitableTools: ["自建应用", "Open WebUI", "企业控制台"],
    sourceLabel: "天翼云息壤公开页面",
    updatedAt: apiModelUpdatedAt,
  },
];

export const apiModelOffers: ApiModelOffer[] = [
  offer("deepseek-official-flash", "deepseek-v4-flash", "deepseek-official", {
    routeModelId: "deepseek-v4-flash",
    inputPrice: usd(0.14),
    outputPrice: usd(0.28),
    cacheReadPrice: usd(0.0028),
    freeOrPlan: "官方按量计费，余额抵扣。",
    limitations: "高频低成本优先，旧 deepseek-chat/reasoner 兼容名会在 2026-07-24 后废弃。",
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
  }),
  offer("deepseek-official-pro", "deepseek-v4-pro", "deepseek-official", {
    routeModelId: "deepseek-v4-pro",
    inputPrice: usd(0.435),
    outputPrice: usd(0.87),
    cacheReadPrice: usd(0.003625),
    freeOrPlan: "官方按量计费，余额抵扣。",
    limitations: "能力更强但并发较低，适合复杂推理或高失败成本任务。",
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
  }),
  offer("kimi-official-k26", "kimi-k2-6", "kimi-official", {
    routeModelId: "kimi-k2.6",
    inputPrice: textPrice("见 Kimi K2.6 定价页"),
    outputPrice: textPrice("见 Kimi K2.6 定价页"),
    cacheReadPrice: textPrice("支持自动上下文缓存"),
    freeOrPlan: "官方按 token 计费，联网搜索另计费。",
    limitations: "页面存在动态价格表，首版保留官方来源，不硬填不可校验数值。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("kimi-official-k25", "kimi-k2-5", "kimi-official", {
    routeModelId: "kimi-k2.5",
    inputPrice: textPrice("见 Kimi K2.5 定价页"),
    outputPrice: textPrice("见 Kimi K2.5 定价页"),
    cacheReadPrice: textPrice("支持自动上下文缓存"),
    freeOrPlan: "官方按 token 计费，联网搜索另计费。",
    limitations: "适合保留 K2.5 兼容或对照使用。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("zhipu-glm5-docs", "glm-5", "zhipu-bigmodel", {
    routeModelId: "glm-5",
    inputPrice: textPrice("见智谱官方定价页"),
    outputPrice: textPrice("见智谱官方定价页"),
    cacheReadPrice: textPrice("支持上下文缓存"),
    freeOrPlan: "以智谱官方定价页为标准；当前等待采集器解析为数值报价。",
    limitations: "定价页为动态页面，未解析前不硬填输入/输出数值。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("minimax-official-m3", "minimax-m3", "minimax-official", {
    routeModelId: "MiniMax-M3",
    inputPrice: usd(0.3),
    outputPrice: usd(1.2),
    cacheReadPrice: usd(0.06),
    freeOrPlan: "官方 Pay as You Go，M3 当前存在 7 天 50% off 标注。",
    limitations: "512K 以上输入和 priority tier 有额外价格或可用性限制。",
    compatibility: ["Anthropic-compatible", "OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("minimax-official-m27", "minimax-m2-7", "minimax-official", {
    routeModelId: "MiniMax-M2.7",
    inputPrice: usd(0.3),
    outputPrice: usd(1.2),
    cacheReadPrice: usd(0.06),
    cacheWritePrice: usd(0.375),
    freeOrPlan: "官方 Pay as You Go，也可配合 Token Plan。",
    limitations: "存在 highspeed 版本，价格和速度不同。",
    compatibility: ["Anthropic-compatible", "OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("minimax-official-m25", "minimax-m2-5", "minimax-official", {
    routeModelId: "MiniMax-M2.5",
    inputPrice: usd(0.3),
    outputPrice: usd(1.2),
    cacheReadPrice: usd(0.03),
    cacheWritePrice: usd(0.375),
    freeOrPlan: "官方 Pay as You Go，Legacy Models 中仍有价格。",
    limitations: "适合低成本任务，但作为旧模型需要关注后续下线和能力差异。",
    compatibility: ["Anthropic-compatible", "OpenAI-compatible", "Coding Agent", "中文模型"],
  }),
  offer("xiaomi-mimo-v25-pro", "mimo-v2-5-pro", "xiaomi-mimo", {
    routeModelId: "mimo-v2.5-pro",
    inputPrice: textPrice("见 MiMo 官方 Token Plan / API 定价"),
    outputPrice: textPrice("见 MiMo 官方 Token Plan / API 定价"),
    cacheReadPrice: textPrice("按官方 Token Plan / API 规则"),
    freeOrPlan: "官方 API / Token Plan，包月和包年规则以 MiMo 官方页面为准。",
    limitations: "官方价格页为动态展示，首版先保留官方来源，不硬填未解析数值。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "多模态"],
    pricingUrl: "https://mimo.mi.com/",
  }),
  offer("xiaomi-mimo-v25", "mimo-v2-5", "xiaomi-mimo", {
    routeModelId: "mimo-v2.5",
    inputPrice: textPrice("见 MiMo 官方 Token Plan / API 定价"),
    outputPrice: textPrice("见 MiMo 官方 Token Plan / API 定价"),
    cacheReadPrice: textPrice("按官方 Token Plan / API 规则"),
    freeOrPlan: "官方 API / Token Plan，包月和包年规则以 MiMo 官方页面为准。",
    limitations: "官方价格页为动态展示，首版先保留官方来源，不硬填未解析数值。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "多模态"],
    pricingUrl: "https://mimo.mi.com/",
  }),
  offer("stepfun-step37-flash", "step-3-7-flash", "stepfun-official", {
    routeModelId: "step-3.7-flash",
    inputPrice: textPrice("见 StepFun 官方定价页"),
    outputPrice: textPrice("见 StepFun 官方定价页"),
    cacheReadPrice: textPrice("按官方模型支持情况"),
    freeOrPlan: "官方按量计费，API Key 和限速以 StepFun 开放平台为准。",
    limitations: "新模型价格和 RPM/TPM 需要以后续采集器解析官方定价页为准。",
    compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "多模态"],
    pricingUrl: "https://platform.stepfun.com/docs/zh/guides/pricing/details",
  }),
  ...opencodeGoOffers(),
  ...alibabaCodingPlanOffers(),
  ...openRouterOffers(),
  ...awesomeCodingPlanReferenceOffers(),
  ...candidateProviderOffers(),
  offer("nvidia-nim-deepseek-flash", "deepseek-v4-flash", "nvidia-nim", {
    routeModelId: "deepseek-ai/deepseek-v4-flash",
    inputPrice: textPrice("Hosted API 可免费试用"),
    outputPrice: textPrice("Hosted API 可免费试用"),
    cacheReadPrice: textPrice("不作为长期生产价格基准"),
    freeOrPlan: "适合开发、测试、原型和自托管评估。",
    limitations: "模型可用性、限速和地区体验以 NVIDIA API Catalog 为准。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
  }),
  offer("nvidia-nim-deepseek-pro", "deepseek-v4-pro", "nvidia-nim", {
    routeModelId: "deepseek-ai/deepseek-v4-pro",
    inputPrice: textPrice("Hosted API 可免费试用"),
    outputPrice: textPrice("Hosted API 可免费试用"),
    cacheReadPrice: textPrice("不作为长期生产价格基准"),
    freeOrPlan: "适合开发、测试、原型和自托管评估。",
    limitations: "模型可用性、限速和地区体验以 NVIDIA API Catalog 为准。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
  }),
  offer("nvidia-nim-glm51", "glm-5-1", "nvidia-nim", {
    routeModelId: "zai-org/glm-5.1",
    inputPrice: textPrice("Hosted API 可免费试用"),
    outputPrice: textPrice("Hosted API 可免费试用"),
    cacheReadPrice: textPrice("不作为长期生产价格基准"),
    freeOrPlan: "适合开发、测试、原型和自托管评估。",
    limitations: "模型可用性、限速和地区体验以 NVIDIA API Catalog 为准。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
  }),
  offer("nvidia-nim-minimax-m27", "minimax-m2-7", "nvidia-nim", {
    routeModelId: "minimaxai/minimax-m2.7",
    inputPrice: textPrice("Hosted API 可免费试用"),
    outputPrice: textPrice("Hosted API 可免费试用"),
    cacheReadPrice: textPrice("不作为长期生产价格基准"),
    freeOrPlan: "适合开发、测试、原型和自托管评估。",
    limitations: "模型可用性、限速和地区体验以 NVIDIA API Catalog 为准。",
    compatibility: ["OpenAI-compatible", "免费/测试", "中文模型"],
  }),
];

export const staticApiModelDataset: ApiModelDataset = {
  source: "static",
  generatedAt: apiModelUpdatedAt,
  fxSummary: apiModelFxSummary,
  models: apiModels,
  providers: apiProviders,
  plans: apiPlans,
  offers: apiModelOffers,
};

export function formatApiPrice(price: ApiPriceValue, currency: ApiCurrency) {
  if (price.kind === "text") return price.text;

  const value =
    currency === "CNY"
      ? price.cnyPerMTokens ?? (typeof price.usdPerMTokens === "number" ? price.usdPerMTokens * apiModelFxSummary.usdToCny : undefined)
      : price.usdPerMTokens ?? (typeof price.cnyPerMTokens === "number" ? price.cnyPerMTokens / apiModelFxSummary.usdToCny : undefined);
  if (typeof value !== "number") return price.label ?? "待确认";

  const prefix = currency === "CNY" ? "¥" : "$";
  return `${prefix}${value.toLocaleString("zh-CN", {
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2,
  })} / 1M tokens`;
}

export function formatUsdAmount(value: number, currency: ApiCurrency) {
  const amount = currency === "CNY" ? value * apiModelFxSummary.usdToCny : value;
  const prefix = currency === "CNY" ? "¥" : "$";
  return `${prefix}${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCnyAmount(value: number, currency: ApiCurrency) {
  const amount = currency === "USD" ? value / apiModelFxSummary.usdToCny : value;
  const prefix = currency === "USD" ? "$" : "¥";
  return `${prefix}${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPlanPrice(plan: ApiPlan, currency: ApiCurrency) {
  if (typeof plan.priceCnyMonthly === "number") return `${formatCnyAmount(plan.priceCnyMonthly, currency)}/月 · ${plan.priceLabel}`;
  if (typeof plan.priceUsdMonthly !== "number") return plan.priceLabel;
  return `${formatUsdAmount(plan.priceUsdMonthly, currency)}/月 · ${plan.priceLabel}`;
}

export function getApiModelFamilyOptions(dataset: ApiModelDataset = staticApiModelDataset): ApiModelFamilyOption[] {
  const seen = new Set<string>();

  return dataset.models
    .map((model) => model.family)
    .filter((family) => {
      if (seen.has(family)) return false;
      seen.add(family);
      return true;
    })
    .sort(compareFamilyLabel)
    .map((family) => ({
      id: apiModelFamilyId(family),
      label: family,
    }));
}

export function getApiModels(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.models
    .filter((model) => scope === "all" || apiModelFamilyId(model.family) === scope)
    .sort((a, b) => compareModel(a, b));
}

export function getApiModel(id: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.models.find((model) => model.id === id) ?? null;
}

export function getApiModelSummaries(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset): ApiModelSummary[] {
  return getApiModels(scope, dataset).map((model) => buildApiModelSummary(model, dataset));
}

export function getApiModelSummary(id: string, dataset: ApiModelDataset = staticApiModelDataset) {
  const model = getApiModel(id, dataset);
  if (!model) return null;
  return buildApiModelSummary(model, dataset);
}

export function getApiProviders(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset) {
  const visibleOfferProviderIds = new Set(getApiModelOffers(scope, dataset).map((offer) => offer.providerId));
  const visiblePlanProviderIds = new Set(getApiPlans(scope, dataset).map((plan) => plan.providerId));

  return dataset.providers
    .filter((provider) => visibleOfferProviderIds.has(provider.id) || visiblePlanProviderIds.has(provider.id))
    .sort((a, b) => {
      const typeDelta = providerTypeRank(a.type) - providerTypeRank(b.type);
      if (typeDelta !== 0) return typeDelta;
      return a.name.localeCompare(b.name, "zh-CN");
    });
}

export function getApiProvider(id: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.providers.find((provider) => provider.id === id) ?? null;
}

export function getApiProviderSummaries(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset): ApiProviderSummary[] {
  return getApiProviders(scope, dataset).map((provider) => buildApiProviderSummary(provider, scope, dataset));
}

export function getApiProviderSummary(id: string, dataset: ApiModelDataset = staticApiModelDataset) {
  const provider = getApiProvider(id, dataset);
  if (!provider) return null;
  return buildApiProviderSummary(provider, "all", dataset);
}

export function getApiModelOffers(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset): ApiModelOfferWithRelations[] {
  return dataset.offers
    .map((offer) => withOfferRelations(offer, dataset))
    .filter((offer): offer is ApiModelOfferWithRelations => Boolean(offer))
    .filter((offer) => scope === "all" || apiModelFamilyId(offer.model.family) === scope)
    .sort(compareOffer);
}

export function getApiModelOffersByModel(modelId: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return getApiModelOffers("all", dataset).filter((offer) => offer.modelId === modelId);
}

export function getApiModelOffersByProvider(providerId: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return getApiModelOffers("all", dataset).filter((offer) => offer.providerId === providerId);
}

export function getApiPlans(scope: ApiModelScope = "all", dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.plans
    .filter((plan) => {
      if (scope === "all") return true;
      if (plan.modelIds.length === 0) return true;
      return plan.modelIds.some((modelId) => {
        const model = getApiModel(modelId, dataset);
        return model ? apiModelFamilyId(model.family) === scope : false;
      });
    })
    .sort((a, b) => {
      const typeDelta = providerTypeRank(a.type) - providerTypeRank(b.type);
      if (typeDelta !== 0) return typeDelta;
      return a.name.localeCompare(b.name, "zh-CN");
    });
}

export function getApiPlansByModel(modelId: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.plans.filter((plan) => plan.modelIds.includes(modelId));
}

export function getApiPlansByProvider(providerId: string, dataset: ApiModelDataset = staticApiModelDataset) {
  return dataset.plans.filter((plan) => plan.providerId === providerId);
}

export function apiModelFamilyId(family: string) {
  const mapped = apiModelFamilySlugByName[family];
  if (mapped) return mapped;

  return family
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function apiProviderTypeRank(type: ApiProviderType) {
  return providerTypeRank(type);
}

function buildApiModelSummary(model: ApiModel, dataset: ApiModelDataset): ApiModelSummary {
  const offers = getApiModelOffersByModel(model.id, dataset);
  const plans = getApiPlansByModel(model.id, dataset);
  const providerNames = new Set(offers.map((offer) => offer.provider.name));
  plans.forEach((plan) => providerNames.add(plan.providerName));
  const primaryOffer = offers[0] ?? null;

  return {
    id: model.id,
    model,
    family: model.family,
    displayName: model.displayName,
    offerCount: offers.length,
    providerCount: providerNames.size,
    officialCount: offers.filter((offer) => offer.provider.type === "official").length,
    freeCount: offers.filter((offer) => offer.provider.type === "free" || offer.compatibility.includes("免费/测试")).length,
    routerCount: offers.filter((offer) => offer.provider.type === "router").length,
    subscriptionCount: offers.filter((offer) => offer.provider.type === "subscription").length + plans.filter((plan) => plan.type === "subscription").length,
    planCount: plans.length,
    providerNames: Array.from(providerNames).slice(0, 4),
    compatibility: uniqueStrings([...offers.flatMap((offer) => offer.compatibility), ...plans.flatMap((plan) => plan.compatibility)]).slice(0, 5),
    suitableTools: uniqueStrings([...model.suitableTools, ...offers.flatMap((offer) => offer.suitableTools), ...plans.flatMap((plan) => plan.suitableTools)]).slice(0, 5),
    primaryOffer,
    latestUpdatedAt: latestDate([model.updatedAt, ...offers.map((offer) => offer.updatedAt), ...plans.map((plan) => plan.updatedAt)]),
  };
}

function buildApiProviderSummary(provider: ApiProvider, scope: ApiModelScope, dataset: ApiModelDataset): ApiProviderSummary {
  const offers = getApiModelOffers(scope, dataset).filter((offer) => offer.providerId === provider.id);
  const plans = getApiPlans(scope, dataset).filter((plan) => plan.providerId === provider.id);
  const models = uniqueById([
    ...offers.map((offer) => offer.model),
    ...plans.flatMap((plan) => plan.modelIds.map((modelId) => getApiModel(modelId, dataset)).filter((model): model is ApiModel => Boolean(model))),
  ]);

  return {
    id: provider.id,
    provider,
    offerCount: offers.length,
    modelCount: models.length,
    planCount: plans.length,
    families: uniqueStrings(models.map((model) => model.family)).sort(compareFamilyLabel),
    modelNames: models.map((model) => model.displayName).slice(0, 6),
    compatibility: uniqueStrings([...offers.flatMap((offer) => offer.compatibility), ...plans.flatMap((plan) => plan.compatibility)]).slice(0, 5),
    suitableTools: uniqueStrings([...offers.flatMap((offer) => offer.suitableTools), ...plans.flatMap((plan) => plan.suitableTools)]).slice(0, 5),
    primaryPlan: plans[0] ?? null,
    latestUpdatedAt: latestDate([provider.updatedAt, ...offers.map((offer) => offer.updatedAt), ...plans.map((plan) => plan.updatedAt)]),
  };
}

function withOfferRelations(offer: ApiModelOffer, dataset: ApiModelDataset): ApiModelOfferWithRelations | null {
  const model = getApiModel(offer.modelId, dataset);
  const provider = getApiProvider(offer.providerId, dataset);
  if (!model || !provider) return null;

  return {
    ...offer,
    model,
    provider,
  };
}

function offer(
  id: string,
  modelId: string,
  providerId: string,
  values: Omit<ApiModelOffer, "id" | "modelId" | "providerId" | "billingMode" | "limitSummary" | "suitableTools" | "sourceLabel" | "pricingUrl" | "updatedAt"> & {
    limitSummary?: string;
    suitableTools?: string[];
    sourceLabel?: string;
    pricingUrl?: string;
    updatedAt?: string;
  },
): ApiModelOffer {
  const provider = apiProviders.find((item) => item.id === providerId);

  return {
    id,
    modelId,
    providerId,
    billingMode: provider?.billingMode ?? "按量计费",
    ...values,
    limitSummary: values.limitSummary ?? provider?.limitSummary ?? "未公开固定 RPM/TPM，以官方控制台为准。",
    suitableTools: values.suitableTools ?? apiModels.find((model) => model.id === modelId)?.suitableTools ?? [],
    sourceLabel: values.sourceLabel ?? provider?.sourceLabel ?? "公开来源",
    pricingUrl: values.pricingUrl ?? provider?.pricingUrl ?? provider?.url,
    updatedAt: values.updatedAt ?? apiModelUpdatedAt,
  };
}

function opencodeGoOffers(): ApiModelOffer[] {
  const shared = {
    freeOrPlan: "OpenCode Go 套餐内消耗，5 小时/每周/每月额度窗口。",
    limitations: "请求数随模型成本变化，适合编码工具，不等同无限 API。",
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
    sourceLabel: "OpenCode Go Docs",
  };

  return [
    offer("opencode-go-deepseek-flash", "deepseek-v4-flash", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/deepseek-v4-flash",
      inputPrice: usd(0.14),
      outputPrice: usd(0.28),
      cacheReadPrice: usd(0.0028),
    }),
    offer("opencode-go-deepseek-pro", "deepseek-v4-pro", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/deepseek-v4-pro",
      inputPrice: usd(1.74),
      outputPrice: usd(3.48),
      cacheReadPrice: usd(0.0145),
    }),
    offer("opencode-go-qwen37-max", "qwen3-7-max", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/qwen3.7-max",
      inputPrice: usd(2.5),
      outputPrice: usd(7.5),
      cacheReadPrice: usd(0.5),
      cacheWritePrice: usd(3.125),
    }),
    offer("opencode-go-qwen37-plus", "qwen3-7-plus", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/qwen3.7-plus",
      inputPrice: usd(0.4),
      outputPrice: usd(1.6),
      cacheReadPrice: usd(0.04),
      cacheWritePrice: usd(0.5),
    }),
    offer("opencode-go-qwen36-plus", "qwen3-6-plus", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/qwen3.6-plus",
      inputPrice: usd(0.5),
      outputPrice: usd(3),
      cacheReadPrice: usd(0.05),
      cacheWritePrice: usd(0.625),
    }),
    offer("opencode-go-kimi-k26", "kimi-k2-6", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/kimi-k2.6",
      inputPrice: usd(0.95),
      outputPrice: usd(4),
      cacheReadPrice: usd(0.16),
    }),
    offer("opencode-go-kimi-k25", "kimi-k2-5", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/kimi-k2.5",
      inputPrice: usd(0.6),
      outputPrice: usd(3),
      cacheReadPrice: usd(0.1),
    }),
    offer("opencode-go-glm51", "glm-5-1", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/glm-5.1",
      inputPrice: usd(1.4),
      outputPrice: usd(4.4),
      cacheReadPrice: usd(0.26),
    }),
    offer("opencode-go-glm5", "glm-5", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/glm-5",
      inputPrice: usd(1),
      outputPrice: usd(3.2),
      cacheReadPrice: usd(0.2),
    }),
    offer("opencode-go-minimax-m3", "minimax-m3", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/minimax-m3",
      inputPrice: usd(0.6),
      outputPrice: usd(2.4),
      cacheReadPrice: usd(0.12),
      cacheWritePrice: usd(0.75),
    }),
    offer("opencode-go-minimax-m27", "minimax-m2-7", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/minimax-m2.7",
      inputPrice: usd(0.3),
      outputPrice: usd(1.2),
      cacheReadPrice: usd(0.06),
      cacheWritePrice: usd(0.375),
    }),
    offer("opencode-go-minimax-m25", "minimax-m2-5", "opencode-go", {
      ...shared,
      routeModelId: "opencode-go/minimax-m2.5",
      inputPrice: usd(0.3),
      outputPrice: usd(1.2),
      cacheReadPrice: usd(0.06),
      cacheWritePrice: usd(0.375),
    }),
  ];
}

function alibabaCodingPlanOffers(): ApiModelOffer[] {
  const shared = {
    inputPrice: textPrice("套餐内请求额度"),
    outputPrice: textPrice("套餐内请求额度"),
    cacheReadPrice: textPrice("按 Coding Plan 规则消耗"),
    freeOrPlan: "Coding Plan Pro：$50/月，90,000 requests/月。",
    limitations: "官方限制为编码工具使用，不适合自动化脚本、自建后端或批处理。",
    compatibility: ["OpenAI-compatible", "Anthropic-compatible", "Coding Agent", "中文模型"],
    sourceLabel: "Alibaba Coding Plan",
  };

  return [
    offer("alibaba-coding-qwen35-plus", "qwen3-5-plus", "alibaba-coding-plan", {
      ...shared,
      routeModelId: "qwen3.5-plus",
    }),
    offer("alibaba-coding-qwen-coder-plus", "qwen3-coder-plus", "alibaba-coding-plan", {
      ...shared,
      routeModelId: "qwen3-coder-plus",
    }),
    offer("alibaba-coding-kimi-k25", "kimi-k2-5", "alibaba-coding-plan", {
      ...shared,
      routeModelId: "kimi-k2.5",
    }),
    offer("alibaba-coding-glm5", "glm-5", "alibaba-coding-plan", {
      ...shared,
      routeModelId: "glm-5",
    }),
    offer("alibaba-coding-minimax-m25", "minimax-m2-5", "alibaba-coding-plan", {
      ...shared,
      routeModelId: "MiniMax-M2.5",
    }),
  ];
}

function openRouterOffers(): ApiModelOffer[] {
  const shared = {
    inputPrice: textPrice("随模型页动态变化"),
    outputPrice: textPrice("随模型页动态变化"),
    cacheReadPrice: textPrice("按 provider 支持情况"),
    freeOrPlan: "可用付费 credits 或 :free 变体，按 OpenRouter 当前模型页为准。",
    limitations: "路由、价格、free 额度和 provider 可用性会变化，生产使用建议固定模型和 provider。",
    compatibility: ["OpenAI-compatible", "免费/测试", "Coding Agent", "中文模型"],
    sourceLabel: "OpenRouter Pricing",
  };

  return [
    offer("openrouter-deepseek-flash", "deepseek-v4-flash", "openrouter", {
      ...shared,
      routeModelId: "deepseek/deepseek-v4-flash",
    }),
    offer("openrouter-deepseek-pro", "deepseek-v4-pro", "openrouter", {
      ...shared,
      routeModelId: "deepseek/deepseek-v4-pro",
    }),
    offer("openrouter-kimi-k26", "kimi-k2-6", "openrouter", {
      ...shared,
      routeModelId: "moonshotai/kimi-k2.6",
    }),
    offer("openrouter-qwen37-max", "qwen3-7-max", "openrouter", {
      ...shared,
      routeModelId: "qwen/qwen3.7-max",
    }),
    offer("openrouter-minimax-m3", "minimax-m3", "openrouter", {
      ...shared,
      routeModelId: "minimax/minimax-m3",
    }),
  ];
}

function awesomeCodingPlanReferenceOffers(): ApiModelOffer[] {
  const ollamaShared = {
    inputPrice: textPrice("免费/Pro 套餐内额度"),
    outputPrice: textPrice("免费/Pro 套餐内额度"),
    cacheReadPrice: textPrice("以 Ollama Pricing 为准"),
    freeOrPlan: "Ollama Free / Pro：开放模型入口，额度和并发以官方 Pricing 为准。",
    limitations: "参考 awesome-coding-plan 作为线索；正式口径只使用 Ollama 官方 Pricing，不折算第三方估算值。",
    compatibility: ["免费/测试", "中文模型", "开放模型"],
    sourceLabel: "Ollama Pricing",
    pricingUrl: "https://ollama.com/pricing",
  };
  const kimiCodeShared = {
    inputPrice: textPrice("Kimi Code 套餐内额度"),
    outputPrice: textPrice("Kimi Code 套餐内额度"),
    cacheReadPrice: textPrice("以 Kimi 会员页为准"),
    freeOrPlan: "Kimi Code 会员套餐，Andante / Allegretto 档位以官方会员页为准。",
    limitations: "参考 awesome-coding-plan 作为线索；具体额度、模型和高峰可用性以 Kimi 官方会员页为准。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    sourceLabel: "Kimi Membership Pricing",
    pricingUrl: "https://www.kimi.com/membership/pricing",
    suitableTools: ["Kimi Code", "Cursor", "OpenCode"],
  };
  const glmCodingShared = {
    inputPrice: textPrice("GLM Coding Plan 套餐内额度"),
    outputPrice: textPrice("GLM Coding Plan 套餐内额度"),
    cacheReadPrice: textPrice("以 GLM Coding Plan 为准"),
    freeOrPlan: "GLM Coding Plan Lite / Pro：官方编码套餐入口。",
    limitations: "参考 awesome-coding-plan 作为线索；抢购、限频、短周期额度以智谱官方页面为准。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    sourceLabel: "GLM Coding Plan",
    pricingUrl: "https://bigmodel.cn/glm-coding",
    suitableTools: ["Claude Code", "Cursor", "OpenCode", "Codex"],
  };

  return [
    offer("ollama-qwen35-plus", "qwen3-5-plus", "ollama", {
      ...ollamaShared,
      routeModelId: "qwen3.5",
    }),
    offer("ollama-minimax-m27", "minimax-m2-7", "ollama", {
      ...ollamaShared,
      routeModelId: "minimax-m2.7",
    }),
    offer("kimi-code-k25", "kimi-k2-5", "kimi-code", {
      ...kimiCodeShared,
      routeModelId: "kimi-k2.5",
    }),
    offer("glm-coding-glm51", "glm-5-1", "glm-coding-plan", {
      ...glmCodingShared,
      routeModelId: "glm-5.1",
    }),
    offer("glm-coding-glm5", "glm-5", "glm-coding-plan", {
      ...glmCodingShared,
      routeModelId: "glm-5",
    }),
    offer("fireworks-fire-pass-kimi-k26", "kimi-k2-6", "fireworks-fire-pass", {
      routeModelId: "kimi-k2.6-turbo",
      inputPrice: textPrice("Fire Pass 套餐内额度"),
      outputPrice: textPrice("Fire Pass 套餐内额度"),
      cacheReadPrice: textPrice("以 Fire Pass 页面为准"),
      freeOrPlan: "Fire Pass：周付套餐，当前作为 Kimi K2.6 Turbo 等模型的公开套餐线索。",
      limitations: "参考 awesome-coding-plan 作为线索；模型覆盖、速率和 no per-token charges 口径以 Fireworks 官方页面为准。",
      compatibility: ["OpenAI-compatible", "Coding Agent", "中文模型", "订阅套餐"],
      sourceLabel: "Fireworks Fire Pass",
      pricingUrl: "https://app.fireworks.ai/fire-pass",
      suitableTools: ["Open WebUI", "自建应用", "Cursor", "OpenCode"],
    }),
  ];
}

function candidateProviderOffers(): ApiModelOffer[] {
  const tencentShared = {
    inputPrice: textPrice("套餐内请求额度"),
    outputPrice: textPrice("套餐内请求额度"),
    cacheReadPrice: textPrice("按腾讯云 Coding Plan 规则消耗"),
    freeOrPlan: "Lite 40 元/月，Pro 200 元/月。",
    limitations: "请求次数是模型调用预估值，一次用户提问可能消耗多次请求。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    sourceLabel: "腾讯云 TokenHub 官方文档",
    pricingUrl: "https://cloud.tencent.com/document/product/1823/130092",
  };
  const volcengineShared = {
    inputPrice: textPrice("价格待解析，见官方活动页"),
    outputPrice: textPrice("价格待解析，见官方活动页"),
    cacheReadPrice: textPrice("按官方活动页规则"),
    freeOrPlan: "方舟 Coding Plan 官方活动页，价格待解析。",
    limitations: "活动页为动态内容，首版不硬填未校验价格。",
    compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
    sourceLabel: "火山方舟 Coding Plan",
    pricingUrl: "https://www.volcengine.com/activity/codingplan",
  };

  return [
    offer("tencent-tokenhub-glm5", "glm-5", "tencent-hunyuan-coding-plan", {
      ...tencentShared,
      routeModelId: "GLM-5",
    }),
    offer("tencent-tokenhub-kimi-k25", "kimi-k2-5", "tencent-hunyuan-coding-plan", {
      ...tencentShared,
      routeModelId: "Kimi-K2.5",
    }),
    offer("tencent-tokenhub-minimax-m25", "minimax-m2-5", "tencent-hunyuan-coding-plan", {
      ...tencentShared,
      routeModelId: "MiniMax-M2.5",
    }),
    offer("volcengine-ark-deepseek-flash", "deepseek-v4-flash", "volcengine-ark-coding-plan", {
      ...volcengineShared,
      routeModelId: "DeepSeek",
    }),
    offer("volcengine-ark-glm5", "glm-5", "volcengine-ark-coding-plan", {
      ...volcengineShared,
      routeModelId: "GLM",
    }),
    offer("volcengine-ark-kimi-k25", "kimi-k2-5", "volcengine-ark-coding-plan", {
      ...volcengineShared,
      routeModelId: "Kimi",
    }),
    offer("volcengine-ark-minimax-m25", "minimax-m2-5", "volcengine-ark-coding-plan", {
      ...volcengineShared,
      routeModelId: "MiniMax",
    }),
    offer("huaweicloud-maas-deepseek", "deepseek-v4-flash", "huaweicloud-modelarts-maas", {
      routeModelId: "DeepSeek",
      inputPrice: textPrice("见华为云 MaaS / DeepSeek 活动页"),
      outputPrice: textPrice("见华为云 MaaS / DeepSeek 活动页"),
      cacheReadPrice: textPrice("按官方 Tokens 套餐包规则"),
      freeOrPlan: "Tokens 套餐包和活动规则以华为云官方页面为准。",
      limitations: "页面存在访问挑战和动态内容，结构化单价待解析。",
      compatibility: ["官方 API", "企业云", "中文模型"],
      sourceLabel: "华为云 ModelArts / MaaS",
      pricingUrl: "https://activity.huaweicloud.com/maas-ds.html",
    }),
    offer("ctyun-xirang-deepseek-flash", "deepseek-v4-flash", "ctyun-xirang", {
      routeModelId: "DeepSeek-V4-Flash",
      inputPrice: textPrice("Token Plan 轻享包低至 9.9 元起"),
      outputPrice: textPrice("Token Plan 轻享包低至 9.9 元起"),
      cacheReadPrice: textPrice("按天翼云 Token 服务规则"),
      freeOrPlan: "Token Plan 轻享包低至 9.9 元起，具体额度以官方活动页为准。",
      limitations: "活动价不是统一模型单价，需查看具体模型和套餐。",
      compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
      sourceLabel: "天翼云息壤公开页面",
      pricingUrl: "https://www.ctyun.cn/act/AI/zhuanxiang",
    }),
    offer("ctyun-xirang-glm51", "glm-5-1", "ctyun-xirang", {
      routeModelId: "GLM-5.1",
      inputPrice: textPrice("Token Plan 轻享包低至 9.9 元起"),
      outputPrice: textPrice("Token Plan 轻享包低至 9.9 元起"),
      cacheReadPrice: textPrice("按天翼云 Token 服务规则"),
      freeOrPlan: "Token Plan 轻享包低至 9.9 元起，具体额度以官方活动页为准。",
      limitations: "活动价不是统一模型单价，需查看具体模型和套餐。",
      compatibility: ["Coding Agent", "中文模型", "订阅套餐"],
      sourceLabel: "天翼云息壤公开页面",
      pricingUrl: "https://www.ctyun.cn/act/AI/zhuanxiang",
    }),
  ];
}

function compareOffer(a: ApiModelOfferWithRelations, b: ApiModelOfferWithRelations) {
  const modelDelta = compareModel(a.model, b.model);
  if (modelDelta !== 0) return modelDelta;

  const typeDelta = providerTypeRank(a.provider.type) - providerTypeRank(b.provider.type);
  if (typeDelta !== 0) return typeDelta;

  return a.provider.name.localeCompare(b.provider.name, "zh-CN");
}

function compareModel(a: ApiModel, b: ApiModel) {
  const familyDelta = compareFamilyLabel(a.family, b.family);
  if (familyDelta !== 0) return familyDelta;

  const aIndex = modelOrder.indexOf(a.id);
  const bIndex = modelOrder.indexOf(b.id);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  return a.displayName.localeCompare(b.displayName, "zh-CN");
}

function providerTypeRank(type: ApiProviderType) {
  return {
    official: 0,
    subscription: 1,
    router: 2,
    free: 3,
  }[type];
}

function latestDate(values: string[]) {
  return values.reduce((latest, value) => (value > latest ? value : latest), "");
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueById<T extends { id: string }>(values: T[]) {
  const seen = new Set<string>();
  return values.filter((value) => {
    if (seen.has(value.id)) return false;
    seen.add(value.id);
    return true;
  });
}

const familyOrder = ["DeepSeek", "Qwen", "Kimi", "GLM", "MiniMax", "MiMo", "StepFun"];

const modelOrder = [
  "deepseek-v4-flash",
  "deepseek-v4-pro",
  "qwen3-7-max",
  "qwen3-7-plus",
  "qwen3-6-plus",
  "qwen3-5-plus",
  "qwen3-coder-plus",
  "kimi-k2-6",
  "kimi-k2-5",
  "glm-5-1",
  "glm-5",
  "minimax-m3",
  "minimax-m2-7",
  "minimax-m2-5",
  "mimo-v2-5-pro",
  "mimo-v2-5",
  "step-3-7-flash",
];

const apiModelFamilySlugByName: Record<string, string> = {
  DeepSeek: "deepseek",
  Qwen: "qwen",
  Kimi: "kimi",
  GLM: "glm",
  MiniMax: "minimax",
  MiMo: "mimo",
  StepFun: "stepfun",
};

function compareFamilyLabel(a: string, b: string) {
  const aIndex = familyOrder.indexOf(a);
  const bIndex = familyOrder.indexOf(b);

  if (aIndex !== -1 || bIndex !== -1) {
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  }

  return a.localeCompare(b, "zh-CN");
}

function usd(usdPerMTokens: number): ApiPriceValue {
  return { kind: "numeric", usdPerMTokens };
}

function textPrice(text: string): ApiPriceValue {
  return { kind: "text", text };
}
