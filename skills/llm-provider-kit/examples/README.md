# 示例：需求 → 生成结果

下面是两个最小示例，演示从一句需求到生成命令与产物的对应关系。真实字段、接入面、鉴权头与请求预览都来自注册表快照，示例里不写死任何 Provider 字段。

## 示例 1 · 中文需求（React 项目，新建项目）

**用户需求**：
> “我们是一个 React + Vite 的内部工具，想加一个模型 Provider 配置页，能选不同厂商、填 API Key，旁边显示实际请求地址和请求头。先用最常用的一批厂商就行。”

**判断**：
- 技术栈：`react`（package.json 依赖 `react` + `vite`）
- 分层：新建项目 → `starter`（12 个 Provider）
- 数据：先从公开 URL 下载快照，再用 `--data` 传给生成器

**命令**：

```bash
mkdir -p /tmp/llm-providers
curl -fsSL https://lawson2019.github.io/llm-provider-kit/data/providers.json -o /tmp/llm-providers/providers.json
curl -fsSL https://lawson2019.github.io/llm-provider-kit/data/tiers.json    -o /tmp/llm-providers/tiers.json
curl -fsSL https://lawson2019.github.io/llm-provider-kit/data/agents.json  -o /tmp/llm-providers/agents.json

node skills/llm-provider-kit/scripts/scaffold.mjs \
  --data /tmp/llm-providers/providers.json \
  --tier starter --stack react --out ../my-key-page
```

**产物**：

```text
my-key-page/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── ProviderForm.jsx
    ├── styles.css
    ├── data/{providers.json,tier.json}
    └── registry/*.mjs
```

**下一步**：`cd ../my-key-page && npm install && npm run dev`。页面可搜索 / 切换 Provider；字段由 `getFormFields()` 推导；右侧预览由 `buildRequestConfig()` 生成，Key 脱敏，必填缺失进入 `missing`。

## 示例 2 · 英文需求（无构建链，单文件分发）

**User request**:
> “We need a standalone static HTML page we can email around, no build step. It should let users pick a provider, paste their key, and see the masked request preview. Include the broader mainstream set.”

**Decisions**:
- Stack: `html`（single-file, no build chain, opens over `file://`）
- Tier: `mainstream`（37 providers）

**Command**:

```bash
node skills/llm-provider-kit/scripts/scaffold.mjs \
  --tier mainstream --stack html --out ../provider-page
```

**Output**:

```text
provider-page/
└── index.html        # runtime + data + styles + app all inlined
```

**Next step**: open `index.html` directly in a browser. No `npm install`, no dev server.

## 产物里有什么（与栈无关的推导结果）

- Provider 列表与接入面来自 `providers.json`；
- 表单字段 = Provider 特有 `fields[]` + `getFormFields()` 补齐的通用项；
- 鉴权头 / 查询参数由 `auth.scheme` 与接入面覆盖规则生成；
- 预览 `requestURL` / `headers` / `query` / `missing` / `warnings` 由 `buildRequestConfig()` 生成，密钥脱敏。

## 其他栈速查

| 需求关键词 | `--stack` |
|---|---|
| React / JSX / Next 客户端组件 | `react` |
| Vue / `.vue` / Nuxt | `vue` |
| Svelte / `.svelte` / SvelteKit | `svelte` |
| 原生 JS、ES Module、要自己接打包器 | `vanilla` |
| 单文件、无构建链、`file://` 分发 | `html` |
