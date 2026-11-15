# Changelog

## 0.6.0

### Changed

- **移除 `status` 分类（breaking）**：`verified` / `reference` / `stale` 从数据、Schema、校验器、CLI、Demo、类型与文档中全部删除；Demo 不再有状态筛选、状态徽标与「全部状态」下拉。`verifiedAt` 保留，仅作审计日期记录，不参与分类、筛选或渲染。
- **126 条全量官方复核**：每条的 baseURL、接入面路径、鉴权方式与计费模式都必须有官方文档站或厂商官方 GitHub 仓库依据。结论：确认 14 条、修正 32 条、因补不齐官方依据移除 17 条。
- Provider 总数 126 → **108**；`starter` 12 / `mainstream` 37 / `full` 108。
- `codestral` 并入 `mistral`：官方 SDK 与文档统一走 `api.mistral.ai/v1`，同品牌同端点不再单独建条，`codestral` 保留为 alias。
- `scripts/omniroute-url-fixture.json` 从「第三方源金标准」改为 imported 条目的 requestURL 快照，随官方更正同步，避免「改了值还叫金标准」。
- README 重写为短版：定位、在线 Demo、Quick Start、数据文件与核心字段、校验与发布、贡献入口；移除长篇审计历史与重复统计。

### Removed

- 17 条因无法在官方源核实 baseURL / 鉴权 / 计费而移除：`agentrouter`、`bai`、`chenzk`（原域名已停用）、`crof`（已关停转 Nahcrof）、`factory`（官方仅 Droid 会话接口）、`gitlawb`（仅单一中转基址）、`kie`（chat 端点按模型分前缀）、`lambda-ai`（官方公告 Inference API 下线）、`llamagate`（域名无 DNS）、`modal`（无托管 LLM 网关）、`monsterapi`（2025-07 停服）、`nube`（VPS 商，无 LLM API）、`predibase`（被收购、独立 API 停摆）、`sumopod`（仅 VPS 条款）、`tabitoken`、`v0-vercel`（订阅制产品入口）、`x5lab`。

### Fixed

- baseURL 修正：`iflytek`（`spark-api-open.xf-yun.com/v1` → 星辰 MaaS `maas-api.cn-huabei-1.xf-yun.com/v2`）、`liquid`（`api.liquid.ai/openai/v1`）、`galadriel`（`.ai` → `api.galadriel.com/v1/verified`）、`bazaarlink`（`api.bazaarlink.ai/v1`）、`tokenrouter`（`.com` → `.io`）、`token-kiosk`（`api-token-kiosk.gaib.ai/v1`）、`bytez`（`api.bytez.com/models/v2/openai/v1`）、`wandb`（`api.inference.wandb.ai/v1`）、`nous-research`（`inference-api.nousresearch.com/v1`）、`runcrate`（`api.runcrate.ai/v1`）、`publicai`（`api.publicai.co/v1`）、`charm-hyper`（`hyper.charm.land/v1`）、`heroku`（`us.inference.heroku.com/v1`）。
- 鉴权修正：`pioneer`（`x-api-key` → Bearer）、`xiaomi-mimo`（Anthropic 面 `x-api-key` → 官方 `api-key`）、`sarvam`（主 `api-subscription-key`，兼容 Bearer）。
- 计费口径修正（官方价格页有据才写具体值，否则 `unknown`）：`hetzner`、`typhoon` 改为免费，`inception`、`coze`、`agnes`、`ant-ling` 等改为混合，`internlm`、`freemodel-dev`、`galadriel`、`codestral` 标 `unknown`。
- 删除 `agentrouter` 后，smoke 的接入面级鉴权回归改用 `xiaomi-mimo`；被移除条目加入「不应存在」回归清单。


## 0.5.0

### Added

- 新增 6 个 Provider（均按官方文档建档，不带 `imported`）：
  - `sglang`：本地运行时 OpenAI 兼容 `http://localhost:30000/v1`，默认无鉴权，仅服务端启用 `--api-key` 时填 Key。
  - `nebius`：Nebius AI Studio `https://api.studio.nebius.com/v1`，Bearer。
  - `gmi-cloud`：GMI Cloud `https://api.gmi-serving.com/v1`，Bearer。
  - `litellm-proxy`：LiteLLM 自托管代理 `http://localhost:4000/v1`，Bearer 虚拟 Key，`free`。
  - `portkey-gateway`：Portkey 托管网关 `https://aigw.portkey.ai/v1`，Chat / Responses / Messages 三接入面。
  - `requesty`：Requesty 路由网关 `https://router.requesty.ai/v1`，Chat / Responses / Anthropic Messages。
- 既有条目补官方接入面：`openai`、`upstage`、`plamo` 补 OpenAI Responses 面；`google-gemini` 补 OpenAI 兼容层；`perplexity` 补 Agent API 面；`moonshot-kimi` 补 Anthropic 兼容面；`ollama-cloud`、`openrouter`、`vercel-ai-gateway`、`nanogpt`、`orcarouter`、`openadapter` 补 Anthropic Messages 面（`vercel-ai-gateway`、`nanogpt` 另补 Responses 面）。

### Changed

- 15 条 OmniRoute 导入条目经官方文档逐字核对后纳入人工维护，移除 `imported` 标记并补 `verifiedAt: 2026-11-15`：`cohere`、`ai21`、`perplexity`、`writer`、`upstage`、`plamo`、`ollama-cloud`、`huggingface`、`cerebras`、`deepinfra`、`vercel-ai-gateway`、`aimlapi`、`nanogpt`、`orcarouter`、`openadapter`。
- Provider 总数 120 → 126（47 人工维护 + 79 导入）；`starter` 12 / `mainstream` 37 / `full` 126，README、package、Demo、tiers、测试与 URL 金标准同步。
- 本轮 51 条变更全部附官方文档 URL（共 99 条依据）；OmniRoute、models.dev、OpenRouter 目录、LiteLLM provider 列表等第三方来源仅作发现线索，不作为字段最终依据；核不到官方逐字依据的条目不纳入人工维护。
- 仍属导入的条目不带 `verifiedAt`，本轮仅按官方文档修正 docs 深链、备注与风险分级。
- 6 个新增条目的图标全部在构建时内联为 data URI（2 个取 Lobe 单色 SVG，4 个按品牌色生成首字母 SVG）；内嵌图标数 126 = Provider 总数，Demo 运行时零外部图源。

### Fixed

- 修正 baseURL / 主机：`cohere` `api.cohere.com/compatibility/v1` → `api.cohere.ai/compatibility/v1`；`gigachat` `gigachat.devices.sberbank.ru/api/v1` → `api.giga.chat/v1`；`minimax` `api.minimax.chat/v1` → `api.minimax.cn/v1`（Anthropic 面 `api.minimax.cn/anthropic`，移除误置的 `api.minimaxi.com`）；`together` `api.together.xyz/v1` → `api.together.ai/v1`；`hyperbolic` `api.hyperbolic.xyz/v1` → `api.hyperbolic.ai/inference/v1`；`nanogpt` baseURL 与 `probe.modelsUrl` 改为 `api.nano-gpt.com/api/v1`。
- 修正端点 path：`writer` `/chat/completions` → `/chat`；`perplexity` Agent 面规范为 `/v1/agent`；`dashscope` Token Plan Anthropic 面 path `/messages` → `/v1/messages`，baseURL 去掉冗余 `/v1`。
- 补齐一批导入条目的官方文档深链（原仅裸域名）：`meta-llama`、`modelscope`、`stepfun`、`baichuan`、`yi`、`qiniu`、`novita`、`sambanova`、`nvidia`、`baseten`、`featherless-ai`、`chutes`、`scaleway`、`friendliai`、`inference-net`、`aimlapi`、`nanogpt`、`orcarouter`、`openadapter`、`huggingface`、`cerebras`、`deepinfra`、`ai21`、`perplexity`、`writer`、`upstage`、`plamo`、`cohere`、`gigachat`、`byteplus`、`lmstudio`、`hyperbolic` 等。
- 移出 OmniRoute 投影集合 2 条：`gigachat`、`hyperbolic` 经官方更正过端点后，不再作为「OmniRoute 源金标准」投影保留，两条均移除 `imported` 标记并从 URL 金标准 fixture 删除——`hyperbolic` 补 `verifiedAt: 2026-11-15`；`gigachat` 鉴权需 OAuth 换取短期 token、运行时不建模该换流流程。金标准 fixture 只保留仍属导入条目的原始投影，不再是「改了值还叫金标准」。`lmstudio`、`openrouter` 的 `verifiedAt` 统一为 `2026-11-15`。

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
- README 重写开头、试用路径与仓库结构，补充在线 Demo 地址、CI / Pages 徽章，并说明条目核对口径。
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
- 生成页增加 Provider 搜索、`?provider=` 深链、tier 条数统计和订阅提示去重。
- README 增加「Schema 能力 ≠ 当前数据覆盖」表，明确 oauth / device-code / browser-cookie / local-session / session 当前为 0 条。
- `test:demo`、`test:scaffold`、`test:all` 脚本。

## 0.3.2

- 删除 5 条 session-only Provider，统一为 131 条。
- README / 导入说明补充条目核对口径。

## 0.3.1

- 修复 OmniRoute 导入审计的 3 个 P0、6 个 P1；新增 `endpoint.auth`。

## 0.3.0

- 从 OmniRoute 导入 104 条 API Key Provider。
