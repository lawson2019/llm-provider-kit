---
name: provider-registry-builder
display_name: "Provider 配置页生成"
description: "从 llm-provider-kit 生成一个可运行的 Provider API Key / Base URL 配置页。适用于：给 Agent 面板、ACP 网关、代码代理或 AI 应用添加模型 Key 表单；需要 React + Vite 或静态 HTML 配置页；需要按 Starter / Mainstream / Full 分层选择 Provider；需要让表单字段、端点、鉴权和请求预览由注册表数据自动推导，而不是手写。触发词：Provider 配置页、模型 Key 表单、API Key 配置、Provider Registry、接入大模型、生成配置页。"
---

# Provider 配置页生成

从本仓库的 `data/providers.json` 生成一个 React + Vite 或原生静态（vanilla）配置页。表单字段由 `getFormFields()` 推导，请求配置由 `buildRequestConfig()` 生成；生成器不会写入真实 Key，也不会调用网络。

## 选择层级

先读 `data/tiers.json`，按项目阶段选择：

| tier | 用途 |
|---|---|
| `starter` | 默认；最常用的一批，适合新建项目 |
| `mainstream` | 常规项目；含主流直连、国内大厂、常用聚合 |
| `full` | 长尾/高级；全量条目 |

各 tier 的条数以 `data/tiers.json` 的 `count` 为准，不要自行编造 Provider 或修改 Provider 数量。需要新增 Provider 时，先改 `data/providers.json` 并跑 `npm run validate`。

## 生成

在仓库根目录执行：

```bash
node skills/provider-registry-builder/scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
```

不需要构建链时用 `--stack vanilla`，生成 `index.html + app.js + styles.css`；用任意静态服务器打开。

- `--out` 必须是新目录或空目录；非空目录会被拒绝，避免覆盖用户已有工作。
- React：`cd ../my-key-page && npm install && npm run dev`；vanilla：`cd ../my-key-page && python3 -m http.server 4173`。
- 生产构建：`npm run build`。

生成物包含：

```text
src/ProviderForm.jsx      # 消费 getFormFields / buildRequestConfig
src/registry/*.mjs        # 浏览器可用的注册表函数
src/data/providers.json   # 只含当前 tier 的 Provider 快照
src/data/tier.json        # tier 元信息
```

## 验收

1. `src/data/providers.json` 的条数等于所选 tier 的 `count`，引用的 id 都存在；
2. 页面能切换 Provider，字段来自 `fields[]` / `getFormFields()`，没有手写字段；
3. 页面按 `risk.variant` / `risk.level` 展示第三方中转、订阅边界等风险提示；
4. `buildRequestConfig()` 能显示 `requestURL`、`headers` 和 `missing`；
5. 仓库根目录跑 `npm test`、`npm run test:demo`、`npm run test:scaffold`、`node bin/cli.mjs validate`、`tsc --noEmit --strict --skipLibCheck types/index.d.ts` 均通过。

## 边界

- 不新增 Provider、不联网拉数据、不提交任何真实 Key / JWT / Cookie；
- 不把 `session` / `device-code` / `browser-cookie` 条目混进 API Key 目录；
- 生成页只负责配置 UI，不负责转发请求或保存密钥；请求预览必须脱敏，不把原始 Key 写进 DOM 文本或复制内容；
- 需要自定义视觉时只改 `src/styles.css` 和布局，不要复制一份手写字段逻辑。

## 资源

- 生成器：`skills/provider-registry-builder/scripts/scaffold.mjs`（转发到根 `scripts/scaffold.mjs`）
- 模板：`skills/provider-registry-builder/assets/react/`、`assets/vanilla/`
- 分层：`data/tiers.json`
- 数据：`data/providers.json`
