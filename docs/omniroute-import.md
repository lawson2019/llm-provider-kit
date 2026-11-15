# OmniRoute API Key Provider 导入说明

本文件记录「从 OmniRoute 的 API Key Registry 投影到本注册表」的口径、映射规则与逐条排除理由。
结论基于 HEAD `656db95` 的初版导入 + `v0.3.1` 的审计修复（见 [`audit-omniroute-import.md`](audit-omniroute-import.md)）。

- 来源仓库：`diegosouzapw/OmniRoute` / `cheaper-inference/OmniRoute`（同一仓库）
- 来源 HEAD：`82f60e5ef66cb8f4fd92929a44c3679ef844f84a`，分支 `release/v3.8.54`
- 来源路径：`open-sse/config/providers/registry/**`（287 个 Provider 目录）+ `src/shared/constants/providers/apikey/**`
- 导入结果：**27 条人工维护 + 104 条 OmniRoute 导入 = 131 个 Provider**（8 个 Agent 不受影响）

## 状态口径：reference ≠ verified

- 104 条 OmniRoute 导入全部是 `reference`：它们只是**离线目录投影**，能渲染表单、能生成请求配置，但没有做过联网可达性验证；
- 104 条中 43 条有 `probe.modelsUrl`，61 条没有；没有 modelsUrl 不等于配置错，只表示上游没有提供可探测的模型列表；
- 20 条 `verified` 全部是历史人工条目，带 `verifiedAt`；104 条导入条目没有一条 `verifiedAt`；
- 画廊的 `unsupported` 是 `risk.variant`，表示第三方中转 / 非官方支持，不是一个“可填 Key”的通过标记；
- 配置页不要把 `reference` 当成 `verified`；接入前请按厂商官方文档复核端点、鉴权和计费。

## 筛选规则

只保留同时满足以下条件的条目：

1. 顶层 `RegistryEntry`，不是 `models` 数组里的模型对象；
2. `authType: "apikey"`（纯 API Key；OAuth / 设备码 / 浏览器会话为主路径的条目不收）；
3. 有固定 `http(s)` baseURL，且不包含 `{...}` 模板；
4. `format` 为 `openai`、`openai-responses`、`claude` 或 `gemini`；
5. `executor` 为 `default`，确保是通用协议而不是专用 executor；
6. 不与已有 27 条人工条目的厂商等价项重复。

> 双鉴权说明：源里 `cline`（OAuth-primary + Bearer Key）与 `kilocode`（device-code 为主 + 匿名降级）在初版按 `api-key` 导入，违反规则 2，且丢失了 `forceStream` / `X-KILOCODE-EDITORNAME` 等运行时契约。`v0.3.1` 已按决策**删除**这两条：它们不是「baseURL + Key」即可用的接入。

排除的类型：

- `oauth`、`browser-cookie`、`local-session`、`device-code` 为主的条目；
- 图片 / 视频 / 音频 / TTS 等媒体生成；
- 需要私有协议或专用 executor 的 Provider；
- 模板化 baseURL（例如 Databricks 的 workspace 地址）；
- 已有人工条目的厂商等价项。

## 候选漏斗（可复现）

解析方式：剥离 `//` 与 `/* */` 注释后，对 `export const X: RegistryEntry = {` 做花括号配对解析（脚本见审计报告 §9）。

| 阶段 | 规则 | 数量 |
|---|---|---|
| 顶层 `RegistryEntry` | — | 236 |
| + `authType: "apikey"` | ② | 192 |
| + 固定 `http(s)` baseURL 且无模板 | ③ | 184 |
| + `format` 允许集合 | ④ | 182 |
| + `executor: "default"` | ⑤ | **133** |
| 实际导入 | ⑥ | **104** |

- 133 条规则合格中，**103 条**已导入，**30 条**按第 6 条或类型原因排除（逐条见下）；
- `kimi-coding-apikey` 是第 104 条：它以 `...KIMI_CODING_SHARED` 展开声明 `baseUrl`，静态解析看不到 URL，因此不在 133 内，但它满足①–⑥，`v0.3.1` 补入。

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
| `alternateFormats[].authHeader` 与主条目不同 | `endpoint.auth`（接入面级鉴权覆盖，v0.3.1 新增能力） |
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

**例外：源 `baseUrl` 本身就是完整端点、上游不追加路径的条目**（`gitlawb`、`gitlawb-gmi`：OmniRoute 执行器 default 分支直接使用裸 baseUrl），注册表以 `protocol: "unknown"` + 无 `path` 表达，避免被默认路径补成 `/chat/completions`。这是 `v0.3.1` 修掉的 P0。

## 状态与可信度

- 所有导入条目 `status: "reference"`，不写 `verifiedAt`，不伪造「已验证」；
- `risk` 按事实分级：官方直连为 `low/official-api`；第三方聚合 / 中转为 `medium/unsupported`；源码自带伪装 UA/Referer 的为 `high/unsupported`；
- `notes` 保留原始 OmniRoute baseUrl 与源文件路径，修复项另行注明「修复（v0.3.1）」。

## 导入清单

### 海外（57）

`agentrouter, agnes, ai21, api-airforce, baseten, byteplus, bytez, cerebras, chutes, codestral, cohere, coze, deepinfra, featherless-ai, fireworks, friendliai, galadriel, gigachat, grokified, heroku, hetzner, huggingface, hyperbolic, inception, inference-net, kenari, lambda-ai, liquid, longcat, meta-llama, modal, monsterapi, morph, nous-research, novita, nscale, nvidia, ollama-cloud, perplexity, perplexity-agent, pioneer, plamo, predibase, publicai, reka, sambanova, sarvam, scaleway, typhoon, upstage, v0-vercel, venice, wandb, writer, x5lab, xiaomi-mimo, xiaomi-mimo-token-plan`

### 国内（15）

`agnes-cn, ant-ling, baichuan, bailian-coding-plan, iflytek, internlm, kimi-coding-apikey, minimax-cn, modelscope, qiniu, qwen-cloud, qwen-cloud-token-plan, sensenova, stepfun, yi`

### 聚合 / 网关（32）

`aimlapi, apmix, bai, bazaarlink, bluesminds, charm-hyper, chenzk, crof, dgrid, dit, factory, freeaiapikey, freemodel-dev, freetheai, gitlawb, gitlawb-gmi, kie, llamagate, llm7, nanogpt, nube, openadapter, orcarouter, runcrate, sumopod, synthetic, tabitoken, token-kiosk, tokenrouter, vercel-ai-gateway, wafer, zenmux`

> `category: aggregator` 只看「是不是厂商直连」。第三方网关即使托管在官方云上（如 `vercel-ai-gateway`）也归入聚合，但其 `risk` 可保留 `low`。

## 未导入条目逐条说明（30 条）

| 分类 | 数量 | ID | 理由 |
|---|---|---|---|
| 与人工条目厂商等价 | 19 | `alibaba`、`alibaba-cn`、`anthropic`、`baidu`、`bigmodel`、`deepseek`、`doubao`、`gemini`、`groq`、`minimax`、`mistral`、`openai`、`openrouter`、`qianfan`、`tencent`、`volcengine`、`volcengine-agent-plan`、`volcengine-coding-plan`、`zai` | 人工条目已覆盖同一厂商（含 Coding / Agent Plan 分面）；重复导入会让配置页出现两个入口 |
| 媒体生成 | 4 | `haiper`(视频)、`ideogram`(图像)、`leonardo`(图像)、`udio`(音频) | 不属于「Base URL + API Key 的聊天 / 补全」接入 |
| 私有协议 / 特殊执行器 | 4 | `databricks`(workspace 占位模板)、`dify`(原生 `/v1/chat-messages`)、`nlpcloud`(GPU 专用 executor)、`oneminai`(私有 prompt / SSE 协议) | 不能用一个固定 baseURL + Key 表达 |
| 特殊渠道语义 | 1 | `uc-direct` | 上游为未审查内容渠道，产品侧决定不收录；技术上可解析（OpenAI 兼容、default executor），属**主动排除** |
| 本期删除（曾导入） | 2 | `blackbox`、`sparkdesk` | `blackbox` 源侧 `deprecated:true` 且公开端点 404；`sparkdesk` 与 `iflytek` 同 URL / 同鉴权 / 同 path 的真重复 |

## v0.3.2 变更摘要

- 删除 5 条 session-only Provider：`zai-coding-plan-session`、`doubao-desktop`、`workbuddy`、`codebuddy-cn`、`codebuddy-intl`；
- 原因：本仓库当前只维护「API Key / 固定 baseURL」可直接接入的目录，session-only 会与画廊、统计和配置表单产生 131 / 136 两套口径；
- schema 仍保留 `kind=session`、`auth.mode=local-session / device-code` 的建模能力，但不再把这些条目混入 API Key 目录；
- 总数：27 条人工维护 + 104 条 OmniRoute 导入 = 131 个 Provider。

## v0.3.1 变更摘要

- 删除 4 条：`cline`、`kilocode`（非纯 API Key）、`blackbox`（停服）、`sparkdesk`（重复）；
- 新增 2 条：`minimax-cn`（国内站端点）、`kimi-coding-apikey`（Kimi Code，Anthropic Messages + `x-api-key`）；
- 修正 2 条 P0：`gitlawb`、`gitlawb-gmi` 改回裸 baseURL；`bailian-coding-plan`、`tabitoken`、`wafer`、`agentrouter` 补 `anthropic-version`；
- 计费修正 4 条：`sensenova`、`apmix`、`openadapter`、`factory` → `subscription`；
- `risk` 修正 32 条（聚合 / 中转不再标 `official-api`，伪装头条目升为 `high`）；
- `category` 修正 10 条；`externalIds` 修正 2 条（`tencent-hunyuan`、`dashscope`）；
- 补 5 个接入面（`agentrouter` ×2、`tabitoken`、`xiaomi-mimo`、`xiaomi-mimo-token-plan`），并新增 `endpoint.auth` 接入面级鉴权能力。

## 已知残留

- 61 / 104 条无 `probe.modelsUrl`：源本身也未提供，不是导入丢失；
- 源 `alternateFormats` 使用动态指纹头（`agentrouter` 的 Codex CLI 头、`gitlawb` 的 OpenClaude 头）无法静态内联，已在 `endpoint.note` / `notes` 说明；
- 89 / 104 条导入的 `docs` 只是源侧裸域名，不能当作官方文档深链；接入前请自行定位厂商文档；
- 全部条目为离线目录投影，未做联网可达性验证。
