---
name: llm-provider-kit
display_name: "LLM Provider 配置页生成"
description: "从公开的 LLM Provider 注册表生成可运行的模型 Key / Provider 配置界面。适用于：给 AI 应用、编程助手或模型网关添加 Provider Key 表单；按项目技术栈（React / Vue / Svelte / 原生 JS / 纯静态 HTML）生成对应表单；需要多 Provider 切换、多接入面选择与脱敏请求预览；需要按 Starter / Mainstream / Full 分层选择 Provider。表单字段、端点、鉴权头与请求预览全部由注册表数据推导，不手写死字段。触发词：Provider 配置页、模型 Key 表单、API Key 配置、Provider Registry、接入大模型、生成配置页、多 Provider 切换、请求预览。"
---

# llm-provider-kit · Provider 配置页生成

从注册表数据生成一个可运行的 Provider API Key / Base URL 配置页。表单字段由 `getFormFields()` 推导，请求配置由 `buildRequestConfig()` 生成；生成器不联网拉取页面、不写入真实 Key、不发起真实请求。

> 旧 Skill 名 `provider-registry-builder` 已废弃，仅作为兼容入口保留，指令以本文件为准。

## 1. 数据从哪来（无需 clone 仓库）

注册表是公开静态数据，任何 AI 编程助手或工具都可以直接通过 HTTP 读取，**不需要 clone 仓库**。优先用 GitHub Pages 地址，raw 地址作为回退。

| 文件 | Pages URL（优先） | raw URL（回退） |
|---|---|---|
| providers.json | `https://lawson2019.github.io/llm-provider-kit/data/providers.json` | `https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json` |
| tiers.json | `https://lawson2019.github.io/llm-provider-kit/data/tiers.json` | `https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json` |
| 本 Skill | `https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md` | `https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md` |

先下载到临时目录，再把快照路径传给生成器的 `--data`：

```bash
mkdir -p /tmp/llm-providers
curl -fsSL https://lawson2019.github.io/llm-provider-kit/data/providers.json -o /tmp/llm-providers/providers.json
curl -fsSL https://lawson2019.github.io/llm-provider-kit/data/tiers.json    -o /tmp/llm-providers/tiers.json

node skills/llm-provider-kit/scripts/scaffold.mjs \
  --data /tmp/llm-providers/providers.json \
  --tier starter --stack react --out ../my-key-page
```

**回退方案**：如果公开 URL 不可达，且当前环境能访问本仓库，直接用仓库内 `data/providers.json`（不传 `--data` 即可）。`--data` 指向的目录下若存在同名 `tiers.json` 会一并使用；否则回退到仓库内置分层。

数据条数以注册表为准：当前 **108 个 Provider / 142 个接入点**；分层为 starter 12 / mainstream 37 / full 108。不要自行编造 Provider，也不要修改 `data/providers.json` 的条目内容。

## 2. 技术栈决策表

先确认项目技术栈，再选 `--stack`。生成器只产出最小可运行实现，视觉样式可后续替换。

| 项目技术栈 | `--stack` | 产物结构 | 启动入口 | 注意事项 |
|---|---|---|---|---|
| React（Vite / CRA / Next 客户端组件） | `react` | Vite + JSX：`index.html`、`src/main.jsx`、`src/App.jsx`、`src/ProviderForm.jsx`、`src/styles.css`、`package.json`、`vite.config.js` | `npm install && npm run dev` | Next.js 把 `ProviderForm.jsx` 搬进 `components/`，文件首行加 `'use client'`；表单是纯客户端交互，不在 SSR 阶段读 `location.search` |
| Vue 3（Vite / Nuxt） | `vue` | Vite + SFC：`index.html`、`src/main.js`、`src/App.vue`、`src/ProviderForm.vue`、`src/styles.css`、`package.json`、`vite.config.js` | `npm install && npm run dev` | Nuxt 中 SFC 放 `components/`；浏览器搜索参数只在客户端读取 |
| Svelte / SvelteKit | `svelte` | Vite + Svelte 4：`index.html`、`src/main.js`、`src/App.svelte`、`src/ProviderForm.svelte`、`svelte.config.js`、`vite.config.js` | `npm install && npm run dev` | SvelteKit 中组件放 `components/`；表单状态留在客户端 |
| 原生 JS（ES Module，有打包器或静态服务器） | `vanilla` | `index.html` + `app.js` + `styles.css` + `src/data.js` + `src/registry/*.mjs` | 任意静态服务器（如 `python3 -m http.server 4173`） | 用 ES Module，**必须经 `http://` 打开**，直接 `file://` 会被模块 CORS 拦截 |
| 纯静态 HTML（无构建链、需邮件/内网分发或 `file://` 打开） | `html` | 单文件 `index.html`：注册表运行时、数据、样式、应用逻辑全部内联 | 浏览器直接打开 | 不再拆分模块；数据更新需要重新跑生成器 |
| 其他框架（Angular / Qwik / Solid / 等） | 手动移植 | 参考最接近的模板（表单逻辑与框架无关），把 `getFormFields` / `groupFormFields` / `buildRequestConfig` 移植过去 | 跟随项目既有构建链 | **不要手写死字段**；复用 `src/registry` 纯函数，字段与请求配置仍由数据推导 |

### 用户没说技术栈时怎么判断

1. 读项目 `package.json`：`dependencies` / `devDependencies` 里有 `react` → `react`；`vue` → `vue`；`svelte` → `svelte`；都没有再看目录结构。
2. 看目录结构：`*.vue` → `vue`；`*.svelte` → `svelte`；`*.jsx` / `*.tsx` → `react`；根目录只有 `index.html` → `vanilla`。
3. 仍无法判断：默认 `react`；若用户明确说“不要构建链 / 要单文件 / 直接发 HTML”，用 `html`；若只要一个无框架静态页，用 `vanilla`。

## 3. 字段映射规则

### 3.1 `fields[]` → 控件

每条字段：`{ key, label, type, group?, secret?, required?, options?, placeholder?, help?, default?, validate?, advanced? }`。

| `type` | 控件 | 备注 |
|---|---|---|
| `text` | 单行文本框 | |
| `password` | 密码框 + 显示/隐藏切换 | 必须同时标 `secret: true` |
| `url` | URL 输入框 | 用于可编辑 Base URL |
| `number` | 数字框 | `validate.min` / `validate.max` 映射为 `min` / `max` |
| `select` | 下拉框 | 见 3.3 options 结构 |
| `boolean` | 复选框 | |
| `textarea` / `json` | 多行文本框 | |

- `group` 取值 `auth` / `endpoint` / `model` / `runtime` / `advanced`；按该顺序分组渲染，`advanced` 组默认折叠。
- `required: true` → 标记必填，校验时空值进入 `missing` 列表。
- `secret: true` → 标记“密钥”，输入框用密码类型；**脱敏规则见第 4 节**，敏感字段不得写入 DOM 文本、`title`、复制内容或日志。
- `help` 渲染为字段下方说明；`placeholder` 渲染为占位提示。

### 3.2 通用字段由 `getFormFields()` 补齐

数据里只写 Provider 特有字段；接入面选择器、默认模型、超时等通用项由 `getFormFields(provider)` 自动补齐并按分组排序，UI 不要重复手写：

- **接入方式选择器**：存在多个接入面时补 `endpoint`（`select`，`group: endpoint`，必填）。
- **Base URL**：本地/模板类、可编辑端点补 `baseURL`（`url`，`group: endpoint`）。
- **默认模型**：非会话型补 `model`（`text`，`group: model`，可空）。
- **请求超时**：补 `timeout`（`number`，`group: advanced`，默认 60 秒，范围 5–600）。

### 3.3 `select` 的 options 结构

```js
options: [
  { label: '展示名', value: '选项值', description: '可选，副说明（如接入面地址）' },
]
```

`value` 对应接入面 `endpoint.id`（兼容旧数据的 `endpoint.value`）；`description` 可在选项下方展示请求地址或“本地会话，无公开端点”。

## 4. 端点 / 鉴权 / 请求预览规则

### 4.1 选择接入面

`resolveEndpoint(provider, values)`：按 `values.endpoint`（或 `endpointId`）匹配 `endpoints[].id`（兼容 `value`）；未选或匹配不到时回退到 `default: true` 的接入面，再回退第一个。

### 4.2 鉴权 scheme → 具体请求头

`auth.scheme` 回答“凭证放在哪里”。**接入面级 `endpoint.auth` 覆盖 Provider 级 `auth`**（同一厂商的不同接入面可能要求不同头，例如 Anthropic 面用 `x-api-key`，OpenAI 面用 Bearer）。

| `scheme` | 生成的请求配置 | 说明 |
|---|---|---|
| `bearer` | `headers.Authorization = "Bearer <credential>"` | |
| `api-key-header` | `headers[headerName ?? 'x-api-key'] = credential` | `headerName` 取自接入面级或 Provider 级 |
| `query-param` | `query[queryName ?? 'key'] = credential` | |
| `azure-api-key` | `headers['api-key'] = credential`，`query['api-version']`（默认 `2024-10-21`，可被 `apiVersion` 字段覆盖） | |
| `cookie` | `headers.Cookie = credential` | 网页会话 |
| `aws-sigv4` | **不生成静态签名头**，给出 warning：必须由 SDK 计算 SigV4 签名 | 不要手工拼 Authorization |
| `jwt-session` | 给出 warning：会话 JWT 由已登录客户端/CLI 动态签发，不能存静态值 | |
| `none` | 不发送任何鉴权头 | 本地运行时 |

`auth.mode`（`api-key` / `oauth` / `device-code` / `browser-cookie` / `local-session` / `none`）回答“凭证从哪来”，只用于展示提示与风险，不直接决定请求头。OAuth / 设备码 / Cookie / 本地登录态条目必须在界面上提示：不要把 token 写进配置文件或 Prompt。

### 4.3 请求 URL 拼接

`requestURL = baseURL + path`：

- `baseURL` 去掉结尾斜杠；`path` 显式 `endpoint.path` 优先，否则按协议给默认路径：
  - `openai-chat` → `/chat/completions`
  - `openai-responses` → `/responses`
  - `anthropic-messages` → `/v1/messages`
  - `gemini-native` / `native` / `web-session` / `local-session` / `unknown`：无统一路径，用接入面声明的地址。
- `baseURL` 已经以该 path 结尾时不重复拼接。
- 含 `{占位符}` 的模板地址，用表单值插值；未填的占位符保留原样并在预览中提示。
- `baseURL` 指向 `localhost` / `127.0.0.1` 时给出本地端点提醒。

### 4.4 请求预览（脱敏 + missing）

- 预览由 `buildRequestConfig(provider, values)` 生成，包含 `baseURL` / `endpoint` / `protocol` / `path` / `requestURL` / `headers` / `query` / `missing` / `warnings`。
- **脱敏**：所有 `secret` 字段的实际值在预览、复制内容、DOM 文本中都要打码（长度 ≤ 8 显示 `••••`，否则保留首尾各 4 位，中间用 `…`）；预览里不得出现原始 Key。
- **missing**：必填字段为空时列入 `missing`，界面明确标出缺哪一项；不要把空凭证当成已配置。
- `warnings` 逐条展示：OAuth/登录态、本地端点、风险等级、强制流式、严格历史回放等。

## 5. 生成流程

### 5.1 命令

在仓库根目录（或从 skill 目录调用 wrapper）执行：

```bash
# 五选一：react / vue / svelte / vanilla / html
node skills/llm-provider-kit/scripts/scaffold.mjs \
  --tier starter --stack react --out ../my-key-page

# 常用参数
#   --tier starter|mainstream|full   分层，默认 starter
#   --stack react|vue|svelte|vanilla|html
#   --out  <dir>                    新目录或空目录；非空目录拒绝覆盖
#   --data <providers.json 路径>    外部注册表快照（配合公开 URL 下载使用）
#   --name <package-name>           带构建链项目的包名，默认 provider-key-page
```

### 5.2 产物目录结构

模块型栈（react / vue / svelte / vanilla）：

```text
<out>/
├── index.html                 # 入口 HTML
├── package.json               # react / vue / svelte 才有；vanilla 无构建链
├── vite.config.js             # react / vue / svelte
├── src/
│   ├── App.* / ProviderForm.* # 消费 getFormFields / buildRequestConfig
│   ├── main.* / app.js
│   ├── styles.css
│   ├── data/
│   │   ├── providers.json     # 只含当前 tier 的 Provider 快照
│   │   └── tier.json          # tier 元信息
│   └── registry/*.mjs         # 浏览器可用的注册表纯函数
└── ...
```

`vanilla` 额外用 `src/data.js`（JS 模块导出 payload）代替 JSON import；`html` 栈只有一个自包含 `index.html`。

### 5.3 验收清单

1. `providers.json`（或 html 内联 `DATA`）条数等于所选 tier 的 `count`，引用的 id 都存在；
2. 页面能切换 Provider，字段来自 `fields[]` / `getFormFields()`，没有手写字段；
3. 多接入面 Provider 出现接入方式选择器，切换后请求头 / 地址随之变化；
4. 预览显示 `requestURL`、`headers`、`query`、`missing`、`warnings`，密钥已脱敏；
5. 必填项为空时 `missing` 有对应 key；
6. 本地仓库根目录跑 `npm run validate`、`npm run test:all`、`npm run build:demo` 均通过。

### 5.4 运行时简单配置（可选但推荐）

生成页可以加一个“快速运行配置”区，只放三项：**Base URL、API Key、Model ID**。

- **Base URL**：优先取 `endpoint.baseURL`，否则取 `provider.baseURL`；`baseURLTemplate` 类 Provider 由字段模板推导，不强行覆盖。
- **API Key**：与 `fields[]` 中 `secret: true` 的字段同源；不写 localStorage、不写日志、不放进 URL 参数。
- **Model ID**：与 `model` 字段同源；始终保留手动输入。
- **拉取模型列表**：仅当 Provider 有 `probe.modelsUrl` 时显示。URL 用当前接入面的 `baseURL + probe.modelsUrl` 拼；鉴权用 `endpoint.auth` 覆盖 `provider.auth` 后生成真实请求头（仅用于这次请求）。兼容 `{data:[{id}]}`、`{models:[{name}]}`、数组和 `id/name/model/slug` 字段。
- **失败回退**：CORS、401、404、空列表都必须回到手动填写 Model ID，不阻塞配置；不要在错误里回显 Key。
- **自定义模型**：允许保存 Model ID + 可选显示名；只保存模型元信息（本地存储），不保存 Key；保存后的条目并入模型选择器，并支持删除。
- **图标**：`icon.url` 或 `icon.slug` 可渲染 Provider 图标，提供“显示图标”开关；关闭后不再请求 icon 资源。

## 6. 常见坑

- **不要假设所有 Provider 都是 OpenAI 兼容**：`endpoint.protocol` 决定请求面。`anthropic-messages`、`gemini-native`、`native` 各有自己的路径与报文结构；接入前先看协议，不要把 OpenAI 的 `/chat/completions` 套到所有厂商。
- **Anthropic Messages 面要带 `anthropic-version`**：该请求头由接入面 `headers` 声明（如 `2023-06-01`），不要漏；同一 Provider 的 OpenAI 面不应带这个头。
- **本地运行时是 localhost 且 Base URL 可编辑**：`kind=local` 的 Provider 没有云端固定端点，表单应允许填写本机地址；预览要提示“本地端点，请确认只在可信网络内可达”。
- **分层怎么选**：`starter` 给新建项目（最常见的一批）；`mainstream` 给常规项目（主流直连 + 国内大厂 + 常用聚合）；`full` 给长尾 / 高级场景。条数以 `tiers.json` 的 `count` 为准。
- **会话 / 订阅型不是静态 Key**：`kind=session`、订阅边界、Cookie / OAuth 条目只做状态说明与登录引导，不要渲染成“粘贴 API Key”的表单。
- **安全边界**：生成页只负责配置 UI 与预览；除用户明确点击“拉取模型列表”外不发起网络请求。不持久化密钥，不提交任何真实 Key / JWT / Cookie；敏感值不进入 DOM 文本、复制内容、URL 参数或日志。

## 7. 参考

- 字段 / 枚举 / 协议 / 鉴权速查表：[`reference.md`](./reference.md)
- 需求 → 生成结果示例：[`examples/README.md`](./examples/README.md)
- 生成器：`scripts/scaffold.mjs`（wrapper）→ 根目录 `scripts/scaffold.mjs`
- 模板：`assets/react/`、`assets/vue/`、`assets/svelte/`、`assets/vanilla/`、`assets/html/`
- 核心纯函数：仓库 `src/fields.mjs`、`src/registry.mjs`、`src/tiers.mjs`
