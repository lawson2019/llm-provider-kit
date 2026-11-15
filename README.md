# llm-provider-kit

[![validate](https://github.com/lawson2019/llm-provider-kit/actions/workflows/validate.yml/badge.svg)](https://github.com/lawson2019/llm-provider-kit/actions/workflows/validate.yml)
[![pages](https://github.com/lawson2019/llm-provider-kit/actions/workflows/pages.yml/badge.svg)](https://lawson2019.github.io/llm-provider-kit/)
[![License: MIT](https://img.shields.io/badge/license-MIT-0f766e.svg)](LICENSE)

> 一份可校验、可直接渲染配置表单的 AI Provider 配置元数据注册表：不只给出 baseURL，还说明配置页该怎么画（鉴权、接入面、计费、表单字段、请求预览）。

当前 **108 个 Provider / 7 个 Agent 运行时**，零依赖，MIT。

**在线 Demo：<https://lawson2019.github.io/llm-provider-kit/>** — 搜索、分类筛选、动态表单、脱敏请求预览，支持 `?provider=` / `?agent=` 深链。

## Quick Start

```bash
npm run validate     # 校验 data/*.json 与规则
npm run build:demo   # 重建单文件 demo/index.html
npm run demo         # 本地预览 http://localhost:4173
npm run test:all     # smoke + Demo 配置一致性 + 生成器回归
```

CLI（`provider-registry` 为兼容别名）：`node bin/cli.mjs list --category china`、`node bin/cli.mjs show zai`、`node bin/cli.mjs validate`。

## 数据文件

| 文件 | 内容 |
|---|---|
| `data/providers.json` | Provider 条目（`schemaVersion: 2`） |
| `data/agents.json` | Agent / 运行时清单（transport 与 protocol 分开建模） |
| `data/tiers.json` | Starter / Mainstream / Full 分层视图 |
| `data/icon-embeds.json` | 构建期内嵌的图标 data URI 缓存 |

### Provider 核心字段

| 字段 | 说明 | 取值 / 结构 |
|---|---|---|
| `id` | 唯一标识，小写 kebab-case | 如 `volcengine-ark` |
| `name` | 展示名 | 字符串 |
| `aliases` | 可选别名，可用于深链解析 | 字符串数组 |
| `kind` | 部署形态 | `api` / `gateway` / `local` / `session` |
| `category` | 归类 | `global` / `china` / `aggregator` / `local` / `agent` |
| `baseURL` | 厂商根地址；会话型为 `null` | http(s) URL、模板字符串或 `null` |
| `docs` | 官方文档 / API Reference 链接 | http(s) URL |
| `auth` | 凭证获取方式与携带方式 | `{ mode, scheme, headerName?, queryName?, oauth? }` |
| `billing` | 计费方式 | `{ mode, note? }`；`payg` / `subscription` / `free` / `mixed` / `unknown` |
| `quota` | 额度类型（兼容投影） | `{ type, note? }`；`api-key` / `subscription` / `session` / `free` / `mixed` |
| `endpoints[]` | 同一厂商的多个接入面（套餐 / 区域 / 协议） | `{ id, label, protocol, baseURL, path?, billing, default?, headers?, auth? }` |
| `fields[]` | 该 Provider 特有的表单字段 | `{ key, label, type, group?, secret?, required?, options?, help? }` |
| `capabilities` | 能力开关 | `streaming` / `toolCalling` / `vision` / `embeddings` / `audio` / `reasoning` / `promptCaching` |
| `notes` | 接入备注、额度边界、运行时坑 | 字符串数组 |
| `verifiedAt` | 审计日期，仅作记录；不参与分类、筛选或徽标 | `YYYY-MM-DD`，可选 |

`auth.mode` 回答「凭证从哪来」（`api-key` / `oauth` / `device-code` / `browser-cookie` / `local-session` / `none`）；`auth.scheme` 回答「凭证放在哪个 header」（`bearer` / `api-key-header` / `query-param` / `aws-sigv4` / `azure-api-key` / `cookie` / `jwt-session` / `none`）。`endpoint.protocol`：`openai-chat` / `openai-responses` / `anthropic-messages` / `gemini-native` / `native` / `web-session` / `local-session` / `unknown`。

通用项（接入面选择器、默认模型、超时）由 `getFormFields()` 自动补齐并按分组排序，数据里只写 Provider 特有字段。

## 核心函数

```js
import { getFormFields, resolveEndpoint, buildRequestConfig } from 'llm-provider-kit';

const fields = getFormFields(provider);                 // 已补齐、已排序，可直接渲染
const endpoint = resolveEndpoint(provider, values);    // 按 values.endpoint 解析接入面
const config = buildRequestConfig(provider, values);   // baseURL / path / requestURL / protocol / headers
```

参考实现：[`examples/react/ProviderForm.jsx`](examples/react/ProviderForm.jsx)；集成说明见 [`docs/integration.md`](docs/integration.md)。

## 校验与发布

- `npm run validate`：校验 id 唯一性、鉴权一致性、接入面、字段、计费与风险规则；
- `npm run test:all`：`smoke`（语义回归）+ `test:demo`（Demo 与核心库配置一致性、脱敏）+ `test:scaffold`（分层生成器回归）；
- `npm run build:demo`：把数据与表单推导结果注入 [`demo/template.html`](demo/template.html)，产出单文件 `demo/index.html`；图标全部内嵌为 data URI，运行时无外部图源。

CI：[`validate.yml`](.github/workflows/validate.yml) 在 PR 上跑校验与测试；[`build-demo.yml`](.github/workflows/build-demo.yml) 在数据或模板变化后重建产物；[`pages.yml`](.github/workflows/pages.yml) 把同一份 `demo/index.html` 发布到 GitHub Pages。

## 配置页生成器

内置 `skills/provider-registry-builder`，按分层生成 React + Vite 或静态页面：`node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page`（`--stack vanilla` 为无构建链静态页）。生成页的字段、端点、鉴权头与请求预览全部来自注册表；生成器不联网、不写入真实 Key。

## 贡献

欢迎补充厂商、修正端点、完善字段。提交前请读 [`docs/contributing.md`](docs/contributing.md)：每条条目需附官方文档依据（文档站 / API Reference / 官方 GitHub 仓库），**不要提交任何真实密钥、JWT 或账号凭证**。

## License

MIT。品牌名称与 Logo 归各自所有者。
