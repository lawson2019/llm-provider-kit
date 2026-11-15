# 速查表：字段 / 枚举 / 协议 / 鉴权

生成配置页时查阅。枚举以仓库 `src/schema.mjs` 为权威；本表是渲染侧摘要。

## 1. 表单字段 `fields[]`

```js
{
  key: 'apiKey',            // 唯一标识，提交值用它做 key
  label: 'API Key',         // 展示名
  type: 'password',         // 见下表
  group: 'auth',            // auth | endpoint | model | runtime | advanced
  secret: true,             // 敏感字段：密码类型 + 预览脱敏
  required: true,
  options: [],              // 仅 type=select
  placeholder: 'sk-...',
  help: '说明文字',
  default: 60,
  validate: { min: 5, max: 600 },
  advanced: false,
}
```

### 1.1 字段类型 `type`

| type | 控件 | 备注 |
|---|---|---|
| `text` | 单行文本 | |
| `password` | 密码框 + 显隐切换 | 必须 `secret: true` |
| `url` | URL 框 | 可编辑 Base URL |
| `number` | 数字框 | `validate.min` / `validate.max` |
| `select` | 下拉 | options 见下 |
| `boolean` | 复选框 | |
| `textarea` | 多行文本 | |
| `json` | 多行文本（JSON） | |

### 1.2 分组 `group`（渲染顺序）

| group | 含义 |
|---|---|
| `auth` | 鉴权凭证 |
| `endpoint` | 接入面 / Base URL |
| `model` | 默认模型 |
| `runtime` | 运行时 / 会话 |
| `advanced` | 高级项（默认折叠） |

### 1.3 `select.options`

```js
[{ label: '展示名', value: 'endpoint-id', description: '可选副说明' }]
```

`value` 对应 `endpoint.id`（兼容旧 `endpoint.value`）。

### 1.4 通用补齐字段（`getFormFields()` 自动加，不要手写）

| key | type | group | 说明 |
|---|---|---|---|
| `endpoint` | select | endpoint | 多接入面时出现，必填 |
| `baseURL` | url | endpoint | 可编辑 / 模板端点 |
| `model` | text | model | 默认模型，可空 |
| `timeout` | number | advanced | 默认 60 秒，5–600 |

## 2. Provider 分类枚举

### 2.1 `kind` 部署形态

| 值 | 含义 |
|---|---|
| `api` | 厂商直连 API |
| `gateway` | 聚合网关 / 中转 |
| `local` | 本地运行时（Ollama、vLLM、LM Studio），无云端鉴权 |
| `session` | 会话型：依赖已登录桌面端 / CLI，不能只用静态 Key |

### 2.2 `category` 归类

`global` 海外 · `china` 国内 · `aggregator` 聚合 / 中转 · `local` 本地 · `agent` Agent / 桌面会话。

### 2.3 计费 `billing.mode` / 额度 `quota.type`

| billing.mode | 含义 |
|---|---|
| `payg` | 按量计费 / API Key 余额 |
| `subscription` | 订阅制（Coding Plan、Agent Plan、桌面会员） |
| `free` | 免费 / 本地自托管 |
| `mixed` | 混合（免费额度 + 付费额度） |
| `unknown` | 未确认 |

`quota.type`：`api-key` / `subscription` / `session` / `free` / `mixed`。

## 3. 鉴权

### 3.1 `auth.mode` 凭证从哪来

| 值 | 含义 | 界面提示 |
|---|---|---|
| `api-key` | 静态 API Key / Token | 写入本地配置或密钥库 |
| `oauth` | OAuth 授权（浏览器跳转 / 回调） | 先完成登录，不要存 access token |
| `device-code` | 设备码 / CLI 轮询 | 同上 |
| `browser-cookie` | 浏览器 Cookie / 网页会话 | 只存本地凭据库，不进仓库 / 日志 |
| `local-session` | 本机客户端 / CLI 登录态 | 不导出静态凭证 |
| `none` | 无鉴权 | 本地运行时 |

### 3.2 `auth.scheme` 凭证放在哪（→ 请求头 / 查询参数）

| scheme | 请求配置 | 备注 |
|---|---|---|
| `bearer` | `Authorization: Bearer <credential>` | |
| `api-key-header` | `<headerName>: <credential>`，默认 `x-api-key` | `headerName` 接入面级优先 |
| `query-param` | `?<queryName>=<credential>`，默认 `key` | |
| `azure-api-key` | `api-key: <credential>` + `api-version` 查询参数 | api-version 默认 `2024-10-21` |
| `cookie` | `Cookie: <credential>` | 网页会话 |
| `aws-sigv4` | 无静态头；warning：必须 SDK 签名 | 不要手工拼 Authorization |
| `jwt-session` | warning：会话 JWT 动态签发 | 不能存静态值 |
| `none` | 不发送鉴权头 | |

**覆盖规则**：`endpoint.auth`（scheme / mode / headerName / queryName）覆盖 Provider 级 `auth`。接入面 `headers` 与 Provider 级 `auth.extraHeaders` 合并，接入面优先；含 `{占位符}` 的头用表单值插值，未填的可选字段不发送。

## 4. 协议 `endpoint.protocol`

| 值 | 请求面 | 默认路径 |
|---|---|---|
| `openai-chat` | OpenAI Chat Completions | `/chat/completions` |
| `openai-responses` | OpenAI Responses API | `/responses` |
| `anthropic-messages` | Anthropic Messages API | `/v1/messages` |
| `gemini-native` | Gemini 原生 generateContent | 无统一路径 |
| `native` | 厂商原生协议 | 无统一路径 |
| `web-session` | 网页会话协议 | 无公开端点 |
| `local-session` | 本地客户端会话协议 | 无公开端点 |
| `unknown` | 协议未确认 | 无统一路径 |

请求 URL：`baseURL`（去尾斜杠）+ `path`；`endpoint.path` 显式优先，否则按上表默认路径；baseURL 已以 path 结尾不重复拼。

**Anthropic Messages 面**必须带 `anthropic-version` 请求头（由接入面 `headers` 声明）；OpenAI 面不应带该头。

## 5. 能力 `capabilities`

布尔开关：`streaming` · `toolCalling` · `vision` · `embeddings` · `audio` · `reasoning` · `promptCaching`。

## 6. 风险 `risk`

- `level`：`low` / `medium` / `high`
- `variant`：`official-api` / `subscription` / `oauth` / `browser-cookie` / `local-session` / `deprecated` / `unsupported`
- `note`：风险说明，界面原样展示。

## 7. 分层 `tiers.json`

| tier | 条数 | 用途 |
|---|---|---|
| `starter` | 12 | 新建项目默认一批 |
| `mainstream` | 37 | 常规项目：主流直连 + 国内大厂 + 常用聚合 |
| `full` | 108 | 全量（含长尾 / 高级） |

## 8. 核心纯函数（浏览器 / 服务端通用，不读文件）

```js
import {
  createRegistry,        // (data) => { providers, agents, getProvider, getAgent, ... }
  getFormFields,         // (provider) => 补齐并排序后的字段列表
  groupFormFields,       // (fields) => { auth: [], endpoint: [], ... }
  resolveEndpoint,       // (provider, values) => 选中的接入面
  buildRequestConfig,    // (provider, values) => { baseURL, endpoint, protocol, path, requestURL, headers, query, missing, warnings, ... }
  getRequestURL,         // (endpoint) => 拼接后的 URL 或 null
  getQuotaWarning,       // (provider) => 会话 / 订阅提示或 null
  getSecretFieldKeys,    // (provider) => 密钥字段名列表
} from './registry/index.mjs';
```

- `buildRequestConfig` 不发起请求、不持久化密钥；返回的 `missing` 是必填空值的字段 key，`warnings` 是需要展示的提示。
- 预览脱敏：`secret` 字段值长度 ≤ 8 显示 `••••`，否则保留首尾各 4 位、中间 `…`；脱敏后再写入预览 / 复制内容。
