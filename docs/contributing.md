# 贡献指南

这个仓库的价值不在于「厂商数量」，而在于**每条配置都可信、可渲染、可维护**。请按下面的约定提交。

## 可以提交的内容

- 新增 Provider（直连、聚合、本地运行时、会话型）；
- 修正 baseURL、鉴权方式、请求头、路径、默认参数；
- 补充字段（例如 Azure 的 deployment、Bedrock 的 region、OpenRouter 的 referer）；
- 更新 `verifiedAt`、把过期条目改成 `stale`；
- 修正文档、Demo、CLI、校验规则；
- 新增 Agent 运行时条目（CLI / 桌面 / 运行时 / 控制面板）。

## 不要提交

- **真实 API Key、JWT、账号密码、Cookie、会话 token**；
- 无法公开验证的「内部接口」地址；
- 声称某厂商「官方支持」本仓库 / 某个第三方桥接方案；
- 只改 Demo 产物、不改数据源（CI 会检查两者是否同步）；
- 与 Provider 配置无关的营销内容。

## 新增 Provider 的步骤

1. 在 `data/providers.json` 的 `providers` 数组追加一条，`id` 使用小写 kebab-case，例如 `my-provider`；
2. 填 `kind` / `category` / `authType` / `baseURL` / `docs` / `icon` / `capabilities` / `quota`；
3. 补 `auth`（`mode` + `scheme`）、`billing`、至少一个 `endpoints[]`；
4. 只写这个 Provider **特有**的字段，通用项（endpoint 选择器、默认模型、超时）由 `getFormFields()` 自动补；
5. 跑 `npm run validate`；
6. 跑 `npm run build:demo`，把 `demo/index.html` 一起提交；
7. 在 PR 描述里附上官方文档链接，说明你核对的是哪个端点 / 哪个版本。

## 字段约定

| 约定 | 说明 |
|---|---|
| `group` | `auth` / `endpoint` / `model` / `runtime` / `advanced`，不要留空 |
| `secret` | 密码类字段必须 `type: "password"` 且 `secret: true` |
| `required` | 只有「没有它就无法调用」才标必填 |
| `default` | `select` 的默认值必须存在于 `options` 中 |
| `help` | 解释「为什么需要它」，不要重复 label |
| `placeholder` | 用脱敏示例，不要放真实 Key |
| `advanced` | 组织 ID、项目 ID、自定义头、超时等放这里 |

## 端点与鉴权核对

- `baseURL` 必须是官方文档里的 Base URL（版本根，例如 `https://api.z.ai/api/coding/paas/v4`），**不要把 `/chat/completions` 或 `/v1/messages` 写进 baseURL**；
- 请求路径写 `endpoint.path`（必须以 `/` 开头），`buildRequestConfig` 会拼成 `requestURL`；
- 一个厂商有多个套餐 / 区域 / 协议时，用 `endpoints[]`，不要把一个 `baseURL` 硬改成「万能地址」；
- 每个 endpoint 必须声明 `protocol` 与 `billing`；恰好一个 `default: true`；
- 路径含资源 ID / 部署名的，用 `{placeholder}` 模板，并在 `fields` 里提供对应字段；
- 鉴权头不是 Bearer 的，写 `auth.headerName`，不要假装成 Bearer；
- `auth.mode` 与 `auth.scheme` 必须分开：`mode` 说明凭证从哪来，`scheme` 说明放哪个 header；
- Azure 这类需要 `api-version` 的，必须提供字段与默认值；
- 请求签名类（AWS SigV4）不要写成「静态 header 即可」，备注里说明必须由 SDK 计算；
- `docs` 用官方文档 / API Reference，不要用二手博客。

## 订阅型 vs 会话型

订阅型（`billing.mode: "subscription"`）**可以有 API Key**，例如 Z.ai Coding Plan、火山方舟 Coding Plan / Agent Plan。关键是：

- 用 `endpoints[]` 指向套餐专用根；
- `billing.note` 说明「与标准 API 余额是两套账」；
- `risk` 标记 `subscription`，提醒用户检查 Key 属于哪一侧。

会话型（`kind: "session"`）必须满足：

- `authType: "jwt-session"` / `"cookie"` / `"none"`；
- `auth.mode: "local-session"` / `"browser-cookie"`；
- `baseURL: null`；
- `quota.type: "session"` 或 `"subscription"`；
- 提供 `session` 对象：`refreshable`、`desktopOnly`、`note`；
- **不能有 `apiKey` 字段**；
- `notes` 里说明「额度与 API 余额是两套账」以及「JWT 不能长期保存」。

校验器会直接报错，不要试图绕过。

## 状态字段

- `verified`：按官方文档核对过，且 `verifiedAt` 是真实核对日期；
- `reference`：结构可用，但版本 / 域名可能变化，接入前需复核；
- `stale`：已知过期，等待更新。

不要为了「好看」把所有条目都标成 `verified`。

## 图标

- `icon.slug` 对应 [Lobe Icons](https://github.com/lobehub/lobe-icons) 的静态图标名；
- 仓库不打包品牌 Logo；
- 找不到对应 slug 时，Demo 会自动回退为首字母色块，不要为此提交二进制图片。

## 本地检查清单

```bash
npm run validate        # 数据 + 规则
npm run build:demo      # 更新 demo/index.html
npm run demo            # 手动检查渲染与交互
node bin/cli.mjs show <id>
```

PR 合并前应满足：

- [ ] `npm run validate` 通过（warning 需解释）；
- [ ] Demo 构建产物已同步；
- [ ] 没有提交任何密钥 / JWT；
- [ ] `verified` 条目有可信来源与日期；
- [ ] 会话型条目没有被误配成 API Key 型。
