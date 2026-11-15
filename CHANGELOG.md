# Changelog

## 0.4.0

### Changed

- 同品牌的多连接方式合并为一条 Provider，连接方式统一放进 `endpoints[]`：Z.ai Coding Plan、火山方舟 Coding / Agent Plan、Kimi Code、MiniMax 国内站、Qwen Cloud Token Plan、小米 MiMo Token Plan、Agnes 中国站、Gitlawb GMI 上游、Perplexity Agent 共 11 条并入 10 条主条目（Alibaba Token Plan 的 Anthropic 面归入阿里云百炼）。旧 ID 保留为 `aliases`，深链仍可解析。
- Provider 总数 131 → 120（24 条人工 + 96 条导入）；`starter` 12 / `mainstream` 37 / `full` 120，README、package、Demo、tiers、测试与 URL 金标准同步。
- 合并条目按接入面拆分计费：火山方舟、Moonshot Kimi、Qwen Cloud、Xiaomi MiMo 等标记为 `billing.mode: "mixed"`；端点级鉴权保留 `x-api-key` / `bearer` 差异。

### Added

- 每个 Provider 都有可用图标：72 个使用真实 Lobe Icons slug；48 个 Lobe 未覆盖的网关使用 `icon.source: "favicon"` + 官网 favicon URL（`icon.horse`），仓库不分发 Logo 文件。
- Demo 的 `logoNode` 支持 `icon.url`，并改为「先显示品牌色首字母块、图片加载成功再覆盖」；离线或 404 时不再出现空白方块。

### Fixed

- 修正大量导入条目把 Material Symbols 名（`auto-awesome`、`hub`、`cloud`、`router` 等）写进 `icon.slug`、导致 Lobe CDN 404 的问题。
- Demo 图标改为构建时内嵌（`data/icon-embeds.json`），去掉 unpkg / icon.horse 运行时依赖；120 个图标全部即时显示，失败仍保留首字母回退。
- 图标改用 Lobe 彩色版 SVG，没有彩色版的单色图标按品牌色着色，修复整页品牌图标显示为黑白的问题。
- 移除 `doubao-desktop` Agent：豆包桌面端没有公开 API / ACP / runtime，不是 Agent 运行时；Agent 数量 8 → 7。同步校正 CodeBuddy Code、ZCode、Herdr、T3 Code 的官方文档地址。
- Schema / 校验器支持 `icon.source: "favicon"`，并强制 favicon 来源必须带 `icon.url`。

## 0.3.4

### Changed

- 包名与仓库名统一为 `llm-provider-kit`：`package.json`、README、集成文档、React 示例、导出的 TS 头部注释与 Schema `$id` 全部同步；CLI 保留 `provider-registry` 兼容别名。
- `package.json` 的 `repository` / `homepage` / `bugs` 指向真实仓库 `lawson2019/llm-provider-kit`，不再使用 `your-org` 占位。
- README 重写开头、试用路径与仓库结构，补充在线 Demo 地址、CI / Pages 徽章，并说明 `reference ≠ verified` 的统计口径。
- Demo 品牌化为「LLM Provider Kit」：更新页面标题、meta 描述、顶部 GitHub 入口与页脚声明。

### Added

- `.github/workflows/pages.yml`：push 到 `main` 时构建 `demo/index.html` 并发布到 GitHub Pages（<https://lawson2019.github.io/llm-provider-kit/>），Demo 原始文件即线上站点。
- `.github/workflows/build-demo.yml`：数据或模板变化后自动重建并提交 `demo/index.html`，避免生成产物与源数据脱节；`validate` 在 PR 上仍检查产物是否同步。

## 0.3.3

### Security

- Demo 的请求预览和「复制 JSON」现在只输出脱敏后的配置，不再把原始 API Key / Token 写入 DOM 或剪贴板；React 参考组件与 skill 模板同步。
- Demo 的请求配置补齐 `endpoint.auth` 接入面级鉴权覆盖，和核心库 `buildRequestConfig()` 对齐；新增 142 个 provider/endpoint 组合的 parity 回归。

### Fixed

- CI 与 README 中的 `show workbuddy` 示例移除；该条已在 0.3.2 删除。CI 增加 `test:demo` 与 `test:scaffold`。
- `docs/integration.md` 的 tgz 版本从 0.2.0 更新为 0.3.3；`docs/omniroute-import.md` 的无 `probe.modelsUrl` 数字更新为 61/104。
- `inferAuthMode` / `inferBillingMode` 从 `registry.mjs`、`fields.mjs` 抽到共享 `src/infer.mjs`。
- 生成器复制模块清单补上 `infer.mjs`，避免生成的页面缺依赖。

### Added

- `provider-registry-builder` skill 增加 `--stack vanilla` 静态模板：`index.html + app.js + styles.css`，无需 React/Vite。
- 生成页增加 Provider 搜索、`?provider=` 深链、tier 状态统计和订阅提示去重。
- README 增加「Schema 能力 ≠ 当前数据覆盖」表，明确 oauth / device-code / browser-cookie / local-session / session 当前为 0 条。
- `test:demo`、`test:scaffold`、`test:all` 脚本。

## 0.3.2

- 删除 5 条 session-only Provider，统一为 131 条。
- README / 导入说明明确 `reference ≠ verified`；画廊加入状态徽标。

## 0.3.1

- 修复 OmniRoute 导入审计的 3 个 P0、6 个 P1；新增 `endpoint.auth`。

## 0.3.0

- 从 OmniRoute 导入 104 条 API Key Provider。
