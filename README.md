# llm-provider-kit

[![validate](https://github.com/lawson2019/llm-provider-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/lawson2019/llm-provider-kit/actions/workflows/validate.yml)
[![pages](https://github.com/lawson2019/llm-provider-kit/actions/workflows/pages.yml/badge.svg)](https://lawson2019.github.io/llm-provider-kit/)
[![License: MIT](https://img.shields.io/badge/license-MIT-0f766e.svg)](LICENSE)

> LLM Provider Kit —— 一份可校验、可直接渲染配置表单的 AI Provider 配置元数据注册表。
> 不只告诉你「baseURL 是什么」，还告诉你「配置页该怎么画」。

**120 个 Provider / 8 个 Agent 运行时**，零依赖，MIT。

**在线 Demo：<https://lawson2019.github.io/llm-provider-kit/>** — 搜索、筛选、动态表单、请求预览，支持 `?provider=` 深链。

> 仓库与包名已从 `agent-provider-registry` 统一为 `llm-provider-kit`（v0.3.4 起）；CLI 继续保留 `provider-registry` 作为兼容别名。

> **先看统计口径**：120 条中 **96 条**来自 OmniRoute 的离线目录投影，**0 条**做过联网可达性验证；这 96 条中 37 条有 `probe.modelsUrl`，**59 条没有**；**20 条 `verified` 全部是历史人工条目**，96 条导入全部为 `reference`。`reference ≠ verified`：前者只代表结构可渲染、字段可填充，不代表端点、鉴权、计费已经实测。

![配置页预览](docs/preview.png)

---

## 它解决什么问题

做 Agent 面板、ACP 网关、代码代理控制台的人，几乎都要重写一遍同样的东西：

- 豆包的 baseURL 是多少？方舟的模型字段为什么是 `ep-` 开头的接入点？
- Anthropic 为什么不是 `Authorization: Bearer`？Gemini 的 Key 放 header 还是 query？
- Azure OpenAI 的地址为什么要拼资源名和 deployment？
- 哪些字段必填、哪些是密钥、哪些应该收进「高级」？
- 这个 Provider 到底能不能用静态 API Key？还是必须依赖已登录的桌面会话？
- Z.ai 的 Coding Plan 到底走 API Key 还是 JWT？火山方舟的 `/api/coding/v3` 和 `/api/v3` 有什么区别？

这些信息散落在各家文档、各个项目的 `providers.yaml`、前端表单里，每加一个厂商就要再抄一遍。

这个仓库把它们收敛成一份**结构化、可校验、可直接驱动 UI** 的数据：

| 普通清单 | 本注册表 |
|---|---|
| `{ name, baseURL, icon }` | `auth` + `endpoints[]` + 端点级 headers |
| 前端自己猜字段 | `fields[]`：类型、必填、密钥、分组、占位、帮助 |
| 所有 Provider 长得一样 | `kind` 区分 API / 网关 / 本地 / **会话型** |
| 额度含义含糊 | `billing.mode` + `quota.type` 分开表达 |
| 一个厂商只能填一个地址 | `endpoints[]` 表达标准 API / Coding Plan / Anthropic 兼容 |
| 端点过期无人知 | `status` + `verifiedAt` + `probe` |
| 运行时坑没地方写 | `runtime`：强制流式、严格历史回放、请求体替换 |

## 它不做什么

- **不是网关**：不转发请求、不做模型路由、不管理密钥。
- **不保存任何密钥**：数据文件里只有字段定义，没有真实 Key / JWT。
- **不宣称官方认证**：这是社区维护的配置元数据，`reference` 条目需要按官方文档复核。
- **不覆盖全部厂商**：优先覆盖 API Key / 固定 baseURL 的直连、聚合、本地运行时，持续补充。

## 在线 Demo（GitHub Pages）

打开 **<https://lawson2019.github.io/llm-provider-kit/>** 即可使用，不需要 clone 或构建。

页面包含搜索、分类筛选、动态表单、必填校验、脱敏后的请求配置预览、接入面切换，以及 Agent 运行时清单；支持 `?provider=agentrouter`、`?agent=claude-code` 深链到指定条目。

站点由 [`.github/workflows/pages.yml`](.github/workflows/pages.yml) 在每次 push 到 `main` 时重新构建 `demo/index.html` 并发布，页面始终对应注册表的最新数据。

## 30 秒试用

```bash
# 方式一：直接打开单文件 Demo（数据已内联，无需构建）
open demo/index.html

# 方式二：本地起服务
npm run demo        # http://localhost:4173

# 方式三：校验数据
npm run validate
```

### 用 skill 一键生成配置页

仓库内置 `skills/provider-registry-builder`。给外部 Agent 或新项目接入时，按层级生成 React + Vite 页面：

```bash
node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
cd ../my-key-page && npm install && npm run dev
```

不需要 React 时生成静态页面：

```bash
node scripts/scaffold.mjs --tier starter --stack vanilla --out ../my-key-page
cd ../my-key-page && python3 -m http.server 4173
```

- `starter`：12 个最常用且全部 `verified` 的 Provider；
- `mainstream`：37 个主流直连 / 国内大厂 / 聚合 / 本地；
- `full`：120 个 API Key 可直连条目，强制显示 `reference` 提示。

生成页的字段、端点、鉴权头和请求预览全部来自注册表，不写死 Provider；生成器不联网、不写入真实 Key。页面支持 `?provider=gitlawb` 深链，并内置 Provider 搜索。分层定义见 `data/tiers.json`。

## Schema v2：把「怎么配」拆成七个维度

v1 只有 `kind / authType / baseURL / quota`，会逼着配置页把三件事混在一起：

- 部署形态：直连、聚合、本地、会话；
- 凭证获取：静态 Key、OAuth、设备码、Cookie、本地登录态；
- 计费方式：按量、订阅、免费、混合。

v2 拆成：

| 字段 | 回答的问题 | 取值 |
|---|---|---|
| `kind` | 这个 Provider 是什么形态 | `api / gateway / local / session` |
| `auth.mode` | 凭证从哪来 | `api-key / oauth / device-code / browser-cookie / local-session / none` |
| `auth.scheme` | 凭证放在哪个 header | `bearer / api-key-header / query-param / aws-sigv4 / azure-api-key / cookie / jwt-session / none` |
| `billing.mode` | 怎么计费 | `payg / subscription / free / mixed / unknown` |
| `endpoints[]` | 一个厂商的多个接入面 | 每个端点带 `protocol / baseURL / billing / headers` |
| `probe` | 配置页怎么验 Key / 列模型 | `modelsUrl / authTestUrl / method` |
| `risk` | 接之前要提示什么 | `level / variant / note` |
| `runtime` | 网关有什么硬契约 | `forceStream / strictChatHistory / bodyStringReplacements` |

旧字段 `authType / baseURL / quota` 继续保留，作为兼容投影；消费方可以逐步迁移。

## 数据结构

以 AgentRouter 为例（同一个 Provider 有三个接入面，且不同接入面的鉴权头不同）：

```jsonc
{
  "id": "agentrouter",
  "name": "AgentRouter",
  "kind": "api",
  "category": "global",
  "authType": "api-key-header",
  "baseURL": "https://agentrouter.org",
  "docs": "https://agentrouter.org",
  "status": "reference",
  "icon": { "slug": "agentrouter", "source": "favicon", "url": "https://icon.horse/icon/agentrouter.org" },
  "auth": { "mode": "api-key", "scheme": "api-key-header", "headerName": "x-api-key" },
  "billing": { "mode": "payg", "note": "标准 API Key / 按量计费" },
  "endpoints": [
    {
      "id": "default",
      "label": "Anthropic Messages",
      "protocol": "anthropic-messages",
      "baseURL": "https://agentrouter.org",
      "path": "/v1/messages",
      "billing": "payg",
      "headers": { "anthropic-version": "2023-06-01" },
      "default": true
    },
    {
      "id": "openai",
      "label": "OpenAI 兼容",
      "protocol": "openai-chat",
      "baseURL": "https://agentrouter.org",
      "path": "/v1/chat/completions",
      "billing": "payg",
      "auth": { "scheme": "bearer" }
    },
    {
      "id": "openai-responses",
      "label": "OpenAI Responses",
      "protocol": "openai-responses",
      "baseURL": "https://agentrouter.org",
      "path": "/v1/responses",
      "billing": "payg",
      "auth": { "scheme": "bearer" }
    }
  ],
  "risk": { "level": "low", "variant": "official-api", "note": "社区目录投影，接入前按官方文档复核" },
  "fields": [
    { "key": "apiKey", "label": "API Key", "type": "password", "group": "auth", "required": true, "secret": true }
  ]
}
```

字段只需要写「这个 Provider 特有的部分」，`endpoint` 选择器、`model`、`timeout` 之类通用项由 `getFormFields()` 自动补齐并按分组排序。

`baseURL` 是配置页里可编辑的 Base URL；`endpoint.path` 是相对路径。`buildRequestConfig()` 会返回 `requestURL = baseURL + path`，避免把 `/v1/messages` 这类路径硬塞进 Base URL 又在 SDK 里被重复拼接。

### 一个厂商多个接入面：Z.ai 的例子

```jsonc
{
  "id": "zai",
  "auth": { "mode": "api-key", "scheme": "bearer" },
  "billing": { "mode": "mixed" },
  "endpoints": [
    {
      "id": "payg",
      "label": "标准 API（按量）",
      "protocol": "openai-chat",
      "baseURL": "https://api.z.ai/api/paas/v4",
      "path": "/chat/completions",
      "billing": "payg",
      "default": true
    },
    {
      "id": "coding-openai",
      "label": "Coding Plan（OpenAI 兼容）",
      "protocol": "openai-chat",
      "baseURL": "https://api.z.ai/api/coding/paas/v4",
      "path": "/chat/completions",
      "billing": "subscription"
    },
    {
      "id": "coding-anthropic",
      "label": "Coding Plan（Anthropic Messages）",
      "protocol": "anthropic-messages",
      "baseURL": "https://api.z.ai/api/anthropic",
      "path": "/v1/messages",
      "billing": "subscription",
      "headers": { "anthropic-version": "2023-06-01" }
    }
  ]
}
```

`getFormFields()` 会自动生成「接入方式」选择器；`buildRequestConfig()` 会按选中的端点生成 `baseURL + protocol + headers`。

## 订阅 ≠ 会话：schema 支持，但当前数据只收 API Key 可直连

v2 仍保留 `kind=session`、`auth.mode=local-session / device-code` 等词汇，用于未来接入桌面 / CLI 会话；但当前 120 条数据只保留 API Key 可直连条目，**没有任何 session-only 条目**。

| 形态 | 含义 | 鉴权 | 当前数据 |
|---|---|---|---|
| `api` | 厂商直连 API | API Key / SigV4 / Azure Key | 有 |
| `gateway` | 聚合 / 中转 | API Key | 有 |
| `local` | 本机运行时 | 无鉴权或可选 Key | 有 |
| `session` | 依赖已登录客户端 / CLI 会话 | `jwt-session` / `cookie` | **不收录** |

关键区分：

- **订阅制可以带 API Key**。Z.ai Coding Plan、火山方舟 Coding Plan / Agent Plan 都是 API Key + 专用端点，不是「只能登录」。
- **会话型不能用静态 Key**。JWT 会过期、会刷新、与设备和会话绑定。schema 保留这种建模能力，但本仓库不把 session-only 条目混进「可填 Key」目录。
- v0.3.2 已删除 5 条 session-only 数据：`zai-coding-plan-session`、`doubao-desktop`、`workbuddy`、`codebuddy-cn`、`codebuddy-intl`。需要这些条目时，应作为独立会话接入方案维护，而不是和 API Key Provider 共用一份统计。

### Schema 能力 ≠ 当前数据覆盖

Schema 保留的建模面比当前数据使用的更宽，消费方不要把「schema 有」理解成「数据已支持」。当前 120 条的分布：

| 维度 | 当前数据 |
|---|---|
| `kind` | `api` 93 / `gateway` 24 / `local` 3 / `session` 0 |
| `auth.mode` | `api-key` 118 / `none` 2 / `oauth`、`device-code`、`browser-cookie`、`local-session` 0 |
| `auth.scheme` | `bearer` 111 / `api-key-header` 5 / `azure-api-key` 1 / `aws-sigv4` 1 / `none` 2 |
| `endpoint.protocol` | `openai-chat` 124 / `anthropic-messages` 10 / `openai-responses` 2 / `gemini-native` 1 / `native` 1 / `unknown` 2 |
| `billing.mode` | `payg` 106 / `subscription` 4 / `mixed` 7 / `free` 3 |

另外：20 条 `verified` 的 `verifiedAt` 都是 `2026-11-14`，属于一次性人工复核记录，不代表之后持续在线验证；96 条导入中有 85 条的 `docs` 只是源侧裸域名，不是官方文档深链。接入前都应按厂商官方文档复核。

## 给配置页用：三个核心函数

```js
import { getFormFields, resolveEndpoint, buildRequestConfig } from './src/index.mjs';

const fields = getFormFields(provider);                  // 已补齐、已排序、可直接渲染
const endpoint = resolveEndpoint(provider, values);      // 按 values.endpoint 解析接入面
const config = buildRequestConfig(provider, values);     // baseURL / path / requestURL / protocol / headers
```

React 里最简的用法：

```jsx
import { getFormFields, buildRequestConfig } from 'llm-provider-kit';

function ProviderForm({ provider, values, onChange }) {
  const fields = getFormFields(provider);
  return (
    <>
      {fields.map((field) => (
        <Field key={field.key} field={field} value={values[field.key]} onChange={onChange} />
      ))}
      <pre>{JSON.stringify(buildRequestConfig(provider, values), null, 2)}</pre>
    </>
  );
}
```

完整的参考实现见 [`examples/react/ProviderForm.jsx`](examples/react/ProviderForm.jsx)，集成说明见 [`docs/integration.md`](docs/integration.md)。

## CLI

```bash
llm-provider-kit list --category china
llm-provider-kit list --auth device-code
llm-provider-kit list --billing subscription
llm-provider-kit list --protocol anthropic-messages
llm-provider-kit show zai
llm-provider-kit show zai-coding-plan
llm-provider-kit fields zai-coding-plan
llm-provider-kit validate
llm-provider-kit stats
llm-provider-kit agents
llm-provider-kit export --format ts --out dist/providers.ts
```

`provider-registry` 是保留的兼容别名，命令和参数完全相同。仓库内也可以直接用：

```bash
node bin/cli.mjs list --category china
```

## 仓库结构

```text
data/
  providers.json        # 120 个 Provider（schemaVersion 2；含 96 条 OmniRoute API Key 导入）
  agents.json           # 8 个 Agent / 运行时（CLI、桌面、运行时、控制面板）
  tiers.json            # Starter 12 / Mainstream 37 / Full 120 分层视图
src/
  schema.mjs            # 词汇表 + 校验规则（零依赖）
  fields.mjs            # 表单字段推导 + 端点解析 + 请求配置生成
  registry.mjs          # 纯函数查询层（浏览器可用）
  node.mjs              # 读文件、校验、导出
bin/cli.mjs             # 命令行（bin: llm-provider-kit / provider-registry）
schemas/provider.schema.json
demo/                   # 单文件 Demo（模板 + 构建产物，GitHub Pages 发布源）
examples/react/         # 参考组件
skills/                 # provider-registry-builder 接入 skill
docs/                   # 集成、导入与贡献说明
.github/workflows/      # validate.yml（CI）+ pages.yml（GitHub Pages 部署）
```

## Agent manifest：transport 与 protocol 分开

v2 把 Agent 的运行通道和应用协议拆开：

```jsonc
{
  "id": "claude-code",
  "kind": "cli",
  "transports": ["stdio"],
  "protocols": ["mcp"],
  "runtime": {
    "binary": "claude",
    "versionArgs": ["--version"],
    "backendMode": "stdio-adapter"
  },
  "configure": {
    "paths": {
      "linux": [".claude/settings.json"],
      "darwin": [".claude/settings.json"],
      "win32": [".claude/settings.json"]
    }
  },
  "surfaces": ["catalog", "detect", "run", "configure"]
}
```

- `transports` 是 `stdio / http / ssh / desktop / none`；
- `protocols` 是 `acp / mcp / jsonl / rest / pty / native`；
- `runtime.backendMode` 区分原生 ACP 与 legacy stdio adapter；
- `configure.paths` 让面板知道该改哪个配置文件；
- `surfaces` 表示这个 Agent 能出现在哪些产品面（目录、检测、运行、配置、生成）。

## OmniRoute API Key 批量导入

除了原有的 24 条人工维护条目，注册表还从 OmniRoute 的 API Key Registry 批量导入了 96 条「固定 baseURL + API Key」Provider，当前共 120 条。

- 只导入 `authType: "apikey"`、有 http(s) baseURL、`format` 为 OpenAI / Anthropic / Gemini、`executor` 为 `default` 的条目；
- 媒体生成、OAuth、Cookie、本地会话、模板化 baseURL、以及已有人工条目的厂商等价项不重复导入；
- 所有导入条目都是 `reference`，`externalIds.omniroute` 保留原始 ID，`notes` 保留原始 baseUrl 与源文件；
- 原始 `baseUrl` 如果是完整请求地址，会拆成 `baseURL + endpoint.path`，避免配置页把 `/chat/completions` 当成 Base URL；
- 端点级鉴权：同一 Provider 的不同接入面可以有各自的 `endpoint.auth`（例如 Anthropic 兼容面用 `x-api-key`、OpenAI 兼容面用 `bearer`），缺省时继承 Provider 级 `auth`；
- 导入映射与排除规则见 [`docs/omniroute-import.md`](docs/omniroute-import.md)，独立审计与修复复验见 [`docs/audit-omniroute-import.md`](docs/audit-omniroute-import.md)。

> 这些条目是社区目录的批量投影，不代表已经逐条实测；接入前请用厂商官方文档复核端点、鉴权和计费。

## 质量约定

- `verified`：至少按官方文档核对过端点与鉴权，并记录 `verifiedAt`；
- `reference`：结构可用，但地址 / 版本可能随厂商变化，接入前需复核；
- `stale`：已知可能过期，等待维护者更新。

CI 会跑 `npm run validate`、`npm test`、`npm run test:demo`、`npm run test:scaffold`；`build-demo` workflow 在数据或模板变化后自动重建并提交 `demo/index.html`，`pages` workflow 把同一份产物发布到 GitHub Pages。

## 适合接入的场景

- 自建 Agent 面板 / Provider 配置页；
- ACP 网关、T3 Code 一类的编排器，需要统一 Provider 表单；
- 本地模型 + 云 API 混合的桌面工具；
- 需要明确区分「API 计费」「订阅额度」「会话额度」的产品；
- 需要表达多接入面、端点级鉴权、订阅型套餐的 API Key 网关。

## 图标

`icon` 有两种来源：能找到品牌图标时用 `source: "lobe-icons"` + 真实 Lobe slug；找不到时用 `source: "favicon"` + `url`（按官网域名取 favicon），仓库**不分发**任何 Logo 二进制。Demo 优先用 `icon.url`，否则用 Lobe CDN；加载失败或离线时显示品牌色首字母块，不会出现空白。详见 [`assets/icons/README.md`](assets/icons/README.md)。

## 贡献

欢迎补充厂商、修正端点、完善字段。提交前请读 [`docs/contributing.md`](docs/contributing.md)：**不要提交任何真实密钥、JWT 或账号凭证。**

## License

MIT。品牌名称与 Logo 归各自所有者。
