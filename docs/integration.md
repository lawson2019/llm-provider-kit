# 集成指南

面向要「做一个 Provider 配置页」的开发者。目标：不再为每家厂商手写一份表单。

## 1. 引入

仓库还没有发布 npm 包时，可以直接引用源码，或先打包成本地 tgz：

```bash
npm pack                       # 生成 llm-provider-kit-0.5.0.tgz
npm install ./llm-provider-kit-0.5.0.tgz
```

```js
// 浏览器 / 打包器：纯函数，不读文件
import {
  getFormFields,
  groupFormFields,
  buildRequestConfig,
  getQuotaWarning,
} from 'llm-provider-kit';

// Node：读数据 + 校验
import { loadRegistry, validateAll } from 'llm-provider-kit/node';
```

如果只想拿数据：

```js
import providersData from 'llm-provider-kit/data/providers.json' with { type: 'json' };
```

## 2. 渲染表单的标准流程

```js
const fields = getFormFields(provider);   // 1. 补齐 endpoint / model / timeout，按分组排序
const groups = groupFormFields(fields);   // 2. { auth: [...], endpoint: [...], ... }
```

如果 Provider 有多个接入面，`getFormFields()` 会自动补一个 `endpoint` select；也可以显式调用：

```js
import { resolveEndpoint } from 'llm-provider-kit';
const endpoint = resolveEndpoint(provider, values);
```

每个字段已经包含 UI 需要的信息：

| 属性 | 用途 |
|---|---|
| `type` | `text` / `password` / `url` / `select` / `number` / `boolean` / `json` / `textarea` |
| `required` | 是否必填，提交前校验 |
| `secret` | 是否密钥，决定脱敏、存储方式、是否允许写日志 |
| `group` | 分组：鉴权 / 端点 / 模型 / 运行时 / 高级 |
| `advanced` | 是否默认收进「高级项」 |
| `default` | 初始值（`select` 的默认值一定在 `options` 里） |
| `options` | `select` 的候选项，可带 `description` |
| `help` / `placeholder` | 帮助文案与占位 |
| `validate` | `min` / `max` / `pattern`，用于即时校验 |

不要自己猜字段顺序：`getFormFields()` 已按 `auth → endpoint → model → runtime → advanced` 排好。

参考实现：

- React：[`examples/react/ProviderForm.jsx`](../examples/react/ProviderForm.jsx)
- Demo（原生 JS，单文件）：[`demo/template.html`](../demo/template.html)

## 3. 必填校验

```js
const missing = fields
  .filter((f) => f.required)
  .filter((f) => {
    const value = values[f.key] ?? f.default;
    return !String(value ?? '').trim();
  })
  .map((f) => f.key);

if (missing.length) showErrors(missing);
```

`buildRequestConfig()` 也会返回 `missing`，可以拿来做二次兜底，但不要只依赖它——UI 应该在提交前就标红。

## 4. 生成请求配置

```js
const config = buildRequestConfig(provider, values);
// {
//   baseURL, endpoint, protocol, path, requestURL,
//   headers, query, missing, warnings, quota, billing, authMode, runtime
// }
```

它会处理这些差异：

| `auth.mode` / `auth.scheme` | 生成结果 |
|---|---|
| `api-key` / `bearer` | `Authorization: Bearer <key>` |
| `api-key` / `api-key-header` | `provider.auth.headerName`（默认 `x-api-key`） |
| `api-key` / `query-param` | `?key=` / `provider.auth.queryName` |
| `api-key` / `azure-api-key` | `api-key` 头 + `api-version` 查询参数 |
| `api-key` / `aws-sigv4` | 只给提示，必须由 SDK 计算签名 |
| `oauth` / `device-code` | 只给登录提示；需要先完成 OAuth 流程，不生成静态 token |
| `browser-cookie` | `Cookie` 头；只应存在本地凭据库 |
| `local-session` / `jwt-session` | 只给提示，禁止保存静态 JWT |
| `none` | 不生成鉴权头 |

注意：

- **`buildRequestConfig` 不发起请求**，只生成配置对象；
- 端点级 `headers` 会覆盖 Provider 级 `auth.extraHeaders`；
- 它会把 `{resourceName}`、`{region}`、`{accountId}` 这类占位符按表单值替换；没填的占位符会原样保留，方便 UI 提示；
- `provider.auth.extraHeaders` 里未解析的可选字段会被跳过，不会把字面量 `{siteUrl}` 发给服务端；
- `warnings` 要展示给用户，不要静默丢弃；订阅、OAuth、强制流式、严格历史回放都会在这里出现。

## 5. 多接入面：区域、套餐、协议

`endpoints[]` 同时表达三种差异：

- 多区域：百炼的国内站 / 国际站；
- 多套餐：Z.ai 标准 API / Coding Plan OpenAI / Coding Plan Anthropic；
- 多协议：同一厂商下 Anthropic Messages 与 OpenAI Chat 并存。

```json
"endpoints": [
  {
    "id": "payg",
    "label": "标准 API（按量）",
    "value": "payg",
    "protocol": "openai-chat",
    "baseURL": "https://api.z.ai/api/paas/v4",
    "path": "/chat/completions",
    "billing": "payg",
    "default": true
  },
  {
    "id": "coding-anthropic",
    "label": "Coding Plan（Anthropic Messages）",
    "value": "coding-anthropic",
    "protocol": "anthropic-messages",
    "baseURL": "https://api.z.ai/api/anthropic",
    "path": "/v1/messages",
    "billing": "subscription",
    "headers": { "anthropic-version": "2023-06-01" }
  }
]
```

渲染时把 `endpoint` 当普通 select 处理；`buildRequestConfig` 会自动解析 `id`（也兼容旧的 `value`），并返回选中的 `protocol`、`path`、`requestURL`（`baseURL + path`）与端点级 headers。

注意：`endpoints[]` 必须恰好有一个 `default: true`；顶层 `baseURL` 应投影到默认端点，否则校验器会提示不一致。

## 6. 会话型：schema 支持，但当前数据不收录

v2 仍保留 `kind: "session"`、`auth.mode: "local-session" / "device-code"` 等词汇，用于未来接入桌面 / CLI 会话；但当前数据只保留 API Key 可直连条目，**没有 session-only 条目**。

如果未来自行追加会话型 Provider，必须按下面的规则处理：

```js
const warning = getQuotaWarning(provider);
if (warning) renderBanner(warning); // 配置页顶部展示
```

1. **不要渲染 `apiKey` 输入框**，数据里也不应该提供；
2. **不要持久化任何 JWT**，也不要把 JWT 写进 Prompt / 日志 / 仓库；
3. **不要把会话型 Provider 接到第三方网关**，它不会抵扣 API 余额；
4. 面板应显示「会话状态由客户端检测」，而不是让用户手工粘贴 token；
5. 如果需要复用额度，让已登录客户端作为执行节点，面板只做调度与审批。

订阅型（`billing.mode: "subscription"`）不一样：

- 它**可以有 API Key**，例如 `zai-coding-plan`、`volcengine-coding-plan`、`volcengine-agent-plan`；
- 关键是选对端点：Z.ai 有 Anthropic / OpenAI 两个根，火山有 `/api/coding/v3` 与 `/api/plan/v3`；
- 订阅额度与标准 API 余额互不抵扣，UI 要显示 `billing.note`，不要让用户以为「充了 API 就能用 Coding Plan」。

API Key 网关还要额外处理：

- `endpoint.auth`：同一 Provider 的不同接入面可能用不同 header（例如 `agentrouter` 的 Anthropic 面 `x-api-key`、OpenAI 面 `bearer`），缺省时继承 Provider 级 `auth`；
- `endpoint.headers`：Anthropic 兼容面通常需要 `anthropic-version`；
- `runtime.forceStream` / `strictChatHistory` / `bodyStringReplacements`：如果数据里声明了这些硬契约，必须在请求层执行。

## 7. 密钥处理

- `secret: true` 的字段：不要写日志、不要进 URL query、不要回显明文；
- 存储优先级：系统密钥库（Keychain / Credential Manager / Secret Service）> 本地加密配置 > 进程内临时值；
- **不要**存 `localStorage` 明文，也不要把密钥提交到 Git；
- 会话型 Provider 不提供密钥字段，这是有意为之。

## 8. 自定义 / 内部 Provider

在 `data/providers.json` 里追加一条，然后跑：

```bash
npm run validate
```

校验器会检查：

- `id` 是否 kebab-case、是否重复；
- `auth.mode` / `auth.scheme` 是否与 `authType` 一致；
- `auth.mode=api-key` 是否有 secret 鉴权字段；
- `auth.mode=oauth/device-code` 是否提供了 OAuth 流程 URL；
- `endpoints[]` 是否非空、ID 是否唯一、是否恰好一个 `default: true`；
- 每个 `endpoint` 的 `protocol` / `billing` 是否合法；
- `select` 的默认值是否在选项中；
- 会话型是否误加了 `apiKey`、是否缺 `session` 元信息；
- `verifiedAt`（若填写）是否为合法日期；
- `runtime.bodyStringReplacements` 是否都是两个非空字符串。

新增后重新构建 Demo，CI 会检查产物是否同步。

## 9. Vue / Svelte

逻辑完全一样，只是渲染方式不同：

```vue
<script setup>
import { computed } from 'vue';
import { getFormFields, groupFormFields } from 'llm-provider-kit';
const props = defineProps({ provider: Object });
const groups = computed(() => groupFormFields(getFormFields(props.provider)));
</script>
```

```svelte
<script>
  import { getFormFields } from 'llm-provider-kit';
  export let provider;
  $: groups = getFormFields(provider).reduce((acc, f) => {
    (acc[f.group] ??= []).push(f);
    return acc;
  }, {});
</script>
```

## 10. 接到编程助手或网关

配置页产出的是「Provider 描述 + 用户填的值」。真正注入给客户端时，通常还要转换一次：

- **环境变量**：`ANTHROPIC_BASE_URL`、`OPENAI_BASE_URL`、`OPENAI_API_KEY`；
- **CLI 参数**：部分客户端支持 `--base-url` / `--api-key`；
- **网关（Magpie / LiteLLM / OmniRoute）**：把 `baseURL` 与鉴权重定向到网关地址，密钥交给网关保管。

注意：Anthropic Messages 与 OpenAI Chat 的请求体结构不同，不能只换 baseURL。`endpoint.protocol` 要一起透传，由客户端 / 网关选择正确的适配器。

建议转换层单独实现，不要把这些环境变量名塞进注册表：**同一个 Provider 在不同客户端里的注入方式不一样**，注册表只负责「Provider 本身是什么」。

## 11. 常见坑

- **把 OpenAI 兼容当成全部**：Anthropic、Gemini、Azure、Bedrock 的鉴权与路径都不同；
- **把订阅当成会话**：订阅可以有 API Key，只是端点不同；会话才不能导出静态 Key；
- **一个厂商只配一个 baseURL**：Z.ai / 智谱 / 火山都有套餐专用根，选错端点会 401；
- **忽略端点版本**：`/v1`、`/v4`、`/api/paas/v4`、`/api/coding/v3`、`/compatible-mode/v1` 都不是随便写的；
- **把可选字段标成必填**：会导致用户无法保存，反而逼他们去改代码；
- **密钥进 query**：容易被代理日志、浏览器历史记录泄漏；
- **忽略端点级契约**：`endpoint.auth` / `endpoint.headers`（如 `anthropic-version`）与 `runtime.forceStream` 不处理，单轮能通、多轮或非流式就断。
