# OmniRoute 来源与字段映射

本文件记录「从 OmniRoute 的 API Key Registry 投影到本注册表」的筛选口径、字段映射与排除理由。OmniRoute、models.dev、OpenRouter 目录、LiteLLM provider 列表等第三方来源只用于发现候选，**不作为字段最终依据**；每条条目的端点、鉴权、计费都要以厂商官方文档站 / API Reference / 官方 GitHub 仓库为准。

- 来源仓库：`diegosouzapw/OmniRoute` / `cheaper-inference/OmniRoute`（同一仓库）
- 来源路径：`open-sse/config/providers/registry/**` + `src/shared/constants/providers/apikey/**`

## 筛选规则

只保留同时满足以下条件的条目：

1. 顶层 `RegistryEntry`，不是 `models` 数组里的模型对象；
2. `authType: "apikey"`（纯 API Key；OAuth / 设备码 / 浏览器会话为主路径的条目不收）；
3. 有固定 `http(s)` baseURL，且不包含 `{...}` 模板；
4. `format` 为 `openai`、`openai-responses`、`claude` 或 `gemini`；
5. `executor` 为 `default`，确保是通用协议而不是专用 executor；
6. 不与已有人工条目的厂商等价项重复。

排除的类型：

- `oauth`、`browser-cookie`、`local-session`、`device-code` 为主的条目；
- 图片 / 视频 / 音频 / TTS 等媒体生成；
- 需要私有协议或专用 executor 的 Provider；
- 模板化 baseURL（例如 Databricks 的 workspace 地址）；
- 已有人工条目的厂商等价项。

## 字段映射

| OmniRoute | 注册表 v2 |
|---|---|
| `id` | `id`，并写入 `externalIds.omniroute` |
| `format: "openai"` | `endpoint.protocol: "openai-chat"` |
| `format: "claude"` | `endpoint.protocol: "anthropic-messages"` |
| `format: "openai-responses"` | `endpoint.protocol: "openai-responses"` |
| `format: "gemini"` | `endpoint.protocol: "gemini-native"` |
| `baseUrl` | 拆成 `baseURL` + `endpoint.path`（源声明了 `chatPath` / `urlSuffix` 时以源为准） |
| `authHeader: "bearer"` / `"Authorization"` | `auth.scheme: "bearer"` |
| `authHeader: "x-api-key"` / `"api-key"` | `auth.scheme: "api-key-header"`，`headerName` 取源值 |
| 源 `headers`（如 `Anthropic-Version`） | `endpoint.headers` |
| `alternateFormats[].authHeader` 与主条目不同 | `endpoint.auth`（接入面级鉴权覆盖） |
| `alternateFormats[]` | 追加 `endpoints[]`（`id: openai` / `openai-responses` / `anthropic`） |
| `modelsUrl` | `probe.modelsUrl` |
| catalog `name` / `website` / `icon` / `color` | `name` / `docs` / `icon.slug` / `brandColor` |

### baseURL 拆分

注册表的 `baseURL` 是配置页里的 Base URL，路径放在 `endpoint.path`：`buildRequestConfig()` 会把两者拼成 `requestURL`，配置页只展示 / 编辑 `baseURL`。

```text
https://api.mistral.ai/v1/chat/completions
  → baseURL: https://api.mistral.ai/v1        path: /chat/completions

https://api.z.ai/api/anthropic/v1/messages
  → baseURL: https://api.z.ai/api/anthropic   path: /v1/messages

https://api.xiaomimimo.com/anthropic/v1/messages
  → baseURL: https://api.xiaomimimo.com/anthropic/v1   path: /messages
```

**例外：源 `baseUrl` 本身就是完整端点、上游不追加路径的条目**（如 Gitlawb 两条：OmniRoute 执行器 default 分支直接使用裸 baseUrl），注册表以 `protocol: "unknown"` + 无 `path` 表达，避免被默认路径补成 `/chat/completions`。

## 风险分级

`risk` 按事实分级：官方直连为 `low/official-api`；第三方聚合 / 中转为 `medium/unsupported`；源码自带伪装 UA/Referer 的为 `high/unsupported`。`notes` 保留原始 OmniRoute baseUrl 与源文件路径，修复项另行注明。

## 未导入条目逐条说明

| 分类 | ID | 理由 |
|---|---|---|
| 与人工条目厂商等价 | `alibaba`、`alibaba-cn`、`anthropic`、`baidu`、`bigmodel`、`deepseek`、`doubao`、`gemini`、`groq`、`minimax`、`mistral`、`openai`、`openrouter`、`qianfan`、`tencent`、`volcengine`、`volcengine-agent-plan`、`volcengine-coding-plan`、`zai` | 人工条目已覆盖同一厂商（含 Coding / Agent Plan 分面）；重复导入会让配置页出现两个入口 |
| 媒体生成 | `haiper`(视频)、`ideogram`(图像)、`leonardo`(图像)、`udio`(音频) | 不属于「Base URL + API Key 的聊天 / 补全」接入 |
| 私有协议 / 特殊执行器 | `databricks`(workspace 占位模板)、`dify`(原生 `/v1/chat-messages`)、`nlpcloud`(GPU 专用 executor)、`oneminai`(私有 prompt / SSE 协议) | 不能用一个固定 baseURL + Key 表达 |
| 特殊渠道语义 | `uc-direct` | 上游为未审查内容渠道，产品侧决定不收录；技术上可解析（OpenAI 兼容、default executor），属主动排除 |
| 曾导入后删除 | `blackbox`、`sparkdesk` | `blackbox` 源侧 `deprecated:true` 且公开端点 404；`sparkdesk` 与 `iflytek` 同 URL / 同鉴权 / 同 path 的真重复 |

## 已知残留

- 部分条目没有 `probe.modelsUrl`：源本身也未提供，不是导入丢失；
- 源 `alternateFormats` 使用动态指纹头（`agentrouter` 的 Codex CLI 头、`gitlawb` 的 OpenClaude 头）无法静态内联，已在 `endpoint.note` / `notes` 说明；
- 部分导入条目的 `docs` 只是源侧裸域名，不能当作官方文档深链；接入前请自行定位厂商文档。
