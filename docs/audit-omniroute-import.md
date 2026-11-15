# OmniRoute API Key Provider 批量导入 — 独立只读审计报告

- 审计对象：`agent-provider-registry` HEAD `656db95`（`feat: import 106 OmniRoute api-key providers (v0.3.0)`）
- 对照来源：`references/OmniRoute` HEAD `82f60e5ef66cb8f4fd92929a44c3679ef844f84a`，分支 `release/v3.8.54`
- 审计日期：2026-11-14
- 适用范围：本报告 §1–§10 是 **v0.3.0（HEAD `656db95`）时的审计结论**；修复与关闭情况见 §11「修复复验（v0.3.1）」。
- 审计方式：三路独立复算（覆盖完整性 / 端点与鉴权映射 / 去重计费与文档一致性），全部结论由本地命令输出、源码行号或数据字段支撑，**不引用被审方（主 Agent）的任何结论**
- 只读声明：未修改 `data/providers.json`、未修改任何源码、未 commit / checkout / reset、未 `npm install`。审计结束时两仓库 `git status --short` 均为空，HEAD 未变。本文件是唯一新增物。

> **后续变更（v0.3.2）**：按产品决策删除 5 条 session-only Provider（`zai-coding-plan-session`、`doubao-desktop`、`workbuddy`、`codebuddy-cn`、`codebuddy-intl`），v0.3.2 时为 131 条（27 人工 + 104 导入）；v0.4.0 合并同品牌接入面后为 120 条（24 人工 + 96 导入）。本报告保留审计时点 `v0.3.1` 的 136 条基线；§1–§10 的历史数字用于复现当时的审计结论。
> 当前口径补充：104 条导入中 **61 条**没有 `probe.modelsUrl`；本报告 §2 / §11 里的 **63** 是审计时 106 条导入的旧口径。

---

## 0. 结论摘要

| 项目 | 结论 |
|---|---|
| 总体结论 | **不通过（P0 未清）**。数据骨架、鉴权映射、去重、文档数字四项均通过复核；但 3 条导入项的 requestURL / 必需协议头与上游契约不符，会让调用方直接拿到 404 / 400，必须在发布前修掉。修掉 P0 后可判「有条件通过」。 |
| P0 | **3 项**（涉及 5 个 Provider ID） |
| P1 | **6 项**（涉及 30 余条 ID） |
| P2 | **9 项** |
| Schema 校验 | `validate` 0 error / 0 warning；JSON Schema (Draft 2020-12, `jsonschema 4.26.0`) 0 error |
| 端点精确比对 | 106 条中 100 条与源 `baseUrl` 逐字符一致、4 条为「源基址 + 执行器归一化后一致」、**2 条多拼一段路径（P0）** |
| 鉴权映射 | `api-key-header` 4 条全部有 `headerName`，与源 `authHeader` 字面一致；`bearer`↔`api-key-header` 交叉错配 0；`authType` 与 `auth.scheme` 矛盾 0 |
| 协议映射 | 106 条 protocol 与源 `format` **全部一致**（openai-chat 101 / anthropic-messages 4 / openai-responses 1） |
| 去重 | 全量 138 条按 `requestURL+scheme+headerName` 聚类，**1 组真重复**（`iflytek` ↔ `sparkdesk`） |
| 文档一致性 | README 138/106/32/8 与数据一致；导入清单 70/14/22 与数据 `category` 分布一致；demo 可构建且与在库产物逐字节一致 |

---

## 1. 审计范围与未覆盖项

**在范围内**：`data/providers.json` 的 138 条（106 条 `tags:["imported"]` + 32 条人工）、`data/agents.json`、`src/schema.mjs`、`src/fields.mjs`、`src/registry.mjs`、`schemas/provider.schema.json`、`scripts/smoke.mjs`、`scripts/build-demo.mjs`、`demo/index.html`、`README.md`、`docs/omniroute-import.md`，以及 OmniRoute 侧 `open-sse/config/providers/registry/**`（287 个目录）与 `src/shared/constants/providers/apikey/**`。

**明确不在范围内**：
- 联网可达性验证（本次全程离线，未对任何上游发起真实请求）；
- 32 条人工维护条目的字段质量（仅在去重/冲突比对时作为对照）；
- OmniRoute 仓库自身的正确性（只用作事实基准）。

---

## 2. 复现命令

```bash
cd /home/user/Doubao/chats/151833173454338/agent-provider-registry

# 2.1 基线
node bin/cli.mjs validate          # → 校验 providers=138 agents=8 / 通过（0 条提醒）
npm test                           # → smoke ok: 138 providers / 8 agents

# 2.2 JSON Schema（Draft 2020-12）
python3 - <<'EOF'
import json, jsonschema
data=json.load(open('data/providers.json')); schema=json.load(open('schemas/provider.schema.json'))
errs=list(jsonschema.Draft202012Validator(schema).iter_errors(data))
print('errors:',len(errs))
EOF
# → errors: 0

# 2.3 类型声明
tsc --noEmit --strict --skipLibCheck types/index.d.ts   # → 无输出，exit 0

# 2.4 全量 requestURL 与去重聚类（真实消费路径，不是读文本猜）
node --input-type=module -e "
import { buildRequestConfig } from './src/fields.mjs';
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('data/providers.json','utf8'));
const rows=d.providers.map(p=>({id:p.id,url:buildRequestConfig(p,{apiKey:'t'}).requestURL,scheme:p.auth?.scheme,hn:p.auth?.headerName||''}));
const m=new Map(); for(const r of rows){const k=r.url+'|'+r.scheme+'|'+r.hn; m.set(k,(m.get(k)||[]).concat(r.id))}
for(const [k,v] of [...m].filter(([k,v])=>v.length>1)) console.log('DUP:',v.join(', '),'=>',k);
"
# → DUP: iflytek, sparkdesk => https://spark-api-open.xf-yun.com/v1/chat/completions|bearer|

# 2.5 P0 复现（gitlawb 路径多拼一段）
node --input-type=module -e "
import { buildRequestConfig } from './src/fields.mjs';
import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('data/providers.json','utf8'));
for (const id of ['gitlawb','gitlawb-gmi']) {
  const p=d.providers.find(x=>x.id===id);
  console.log(id, '| path:', JSON.stringify(p.endpoints[0].path), '| requestURL:', buildRequestConfig(p,{apiKey:'t'}).requestURL);
}"
# → gitlawb    | path: undefined | requestURL: https://opengateway.gitlawb.com/v1/xiaomi-mimo/chat/completions
# → gitlawb-gmi| path: undefined | requestURL: https://opengateway.gitlawb.com/v1/gmi-cloud/chat/completions

# 2.6 覆盖漏斗（剥离注释后解析顶层 RegistryEntry，脚本见 §8）
python3 /path/to/funnel.py
# → 顶层RegistryEntry=236  apikey=192  固定httpURL=184  format允许=182  executor=default=133
```

---

## 3. P0 — 必须在发布前修复（3 项 / 5 个 ID）

### P0-1、P0-2 `gitlawb`、`gitlawb-gmi`：requestURL 多拼 `/chat/completions`

| 项 | 值 |
|---|---|
| 注册表 ID | `gitlawb`（`data/providers.json:5452`）、`gitlawb-gmi` |
| 源文件 | `open-sse/config/providers/registry/gitlawb/index.ts:9`、`.../gitlawb/gmi/index.ts:9` |
| 源 baseUrl | `https://opengateway.gitlawb.com/v1/xiaomi-mimo`、`https://opengateway.gitlawb.com/v1/gmi-cloud` |
| 期望 requestURL | 与源 baseUrl **完全相同**（上游按路径路由，无 `/chat/completions` 段） |
| 实际 requestURL | `.../v1/xiaomi-mimo/chat/completions`、`.../v1/gmi-cloud/chat/completions` |
| 根因 | 导入时未写 `endpoints[0].path`；`src/fields.mjs:57-61` 的 `DEFAULT_PROTOCOL_PATH` 对 `openai-chat` 回退补 `/chat/completions`（`getEndpointPath` at `src/fields.mjs:69`） |
| 上游证据 | ①执行器 `open-sse/executors/default.ts:450-468`：`default` 分支直接 `return this.config.baseUrl`（仅当条目声明 `urlSuffix` 时才追加），**不做路径归一化**；②`gitlawb`/`gitlawb-gmi` 源码均无 `urlSuffix` 字段，也无 `chatPath`（`grep -n "urlSuffix" gitlawb/index.ts gitlawb/gmi/index.ts` 无输出）、在 `buildUrl` 中也无 `case "gitlawb"` 特例；③运行时金样本 `tests/snapshots/provider/translate-path.json:2977-2978`、`:3009-3010`：`"url": {"nonStream": ".../v1/xiaomi-mimo", "stream": ".../v1/xiaomi-mimo"}` —— 上游实际请求的就是裸基址 |
| 影响 | 调用方按注册表配置会 POST 到上游不存在的路径，预期 404；这两个 Provider 等于不可用 |
| 复现 | §2.5 |

> 说明：这不是「源本身有歧义」。源 registry 的 `format: "openai"` 只表示请求体协议，`baseUrl` 已是完整路由终点；OmniRoute 执行器默认分支对 `baseUrl` 不做二次拼接（`default.ts:450-468` + 金样本双重可证）。反例参照：`bailian-coding-plan` 之所以正确，是因为它显式声明了 `chatPath:"/messages"` 且执行器为其保留 `case "bailian-coding-plan"`（`default.ts:307-311`），这类显式路径声明的条目本次导入的 requestURL 均正确。

### P0-3 `bailian-coding-plan`、`tabitoken`、`wafer`：Anthropic 必需头 `Anthropic-Version` 丢失

| 项 | 值 |
|---|---|
| 注册表 ID | `bailian-coding-plan`、`tabitoken`、`wafer`（3 条均为 `protocol: anthropic-messages`） |
| 源文件 | `bailian-coding-plan/index.ts:72`、`tabitoken/index.ts:43`、`wafer/index.ts:12` → 均为 `headers: getAnthropicCompatHeaders()` |
| 注册表现状 | 三条 `endpoints[0].headers` 均为 `{}`，`auth.extraHeaders` 为 `null`（见 §2.5 同款脚本，键为空数组） |
| 根因 | 导入映射只搬了 `baseUrl` / `authHeader`，**完全丢弃源 `headers` 块**；`buildRequestConfig` 不会按 protocol 自动补该头（`src/fields.mjs:288-322` 只处理 `auth.extraHeaders` 与 `endpoint.headers`） |
| 上游证据 | `tabitoken/index.ts:24` 注释明言：*"`headers` carries only `Anthropic-Version`, and it has to live on the entry rather than…"* —— 上游要求该头必须随条目携带 |
| 影响 | 严格按 Anthropic Messages 协议实现的上游会返回 400（missing `anthropic-version`）；三条均为「看似可用、实际调用即失败」 |
| 参照 | 同一 schema 下，人工条目 `zai` 的 `coding-anthropic` 端点带了该头，`scripts/smoke.mjs:25` 正是断言 `headers['anthropic-version']==='2023-06-01'` —— 说明注册表本身的契约要求这个头，而导入项没有满足 |

> 严重度说明：是否必然 400 取决于各家网关的宽容度，但 `tabitoken` 自身注释已把该头定义为必须，且同批 4 条 anthropic 端点里 3 条缺失，属批量映射缺陷而非个案，因此定 P0。

---

## 4. P1 — 应修复（6 项）

### P1-1 `cline`：源为 OAuth-primary，按 api-key 导入；流式契约与集成头丢失

- 源：`registry/cline/index.ts:6-9`（`#DUAL-AUTH: OAuth-primary (WorkOS) but also accepts a direct Bearer API key`）、`:18 authType:"oauth"`、`:16 forceStream:true`、`:21-24 oauth` 块、`:27-29 extraHeaders`（`HTTP-Referer`/`X-Title`）
- 注册表：`authType:"bearer"`、`auth.mode:"api-key"`、无 `runtime`、无 `auth.extraHeaders`、无 oauth 块
- 问题：①违反 `docs/omniroute-import.md:15` 规则 2（只收 `authType:"apikey"`），说明筛选规则并未按字面执行；②`forceStream:true` 丢失——源注释明确「非流式请求上游返回 `generateText is not implemented` / 空 body」，注册表虽有 `runtime.forceStream` 字段可以表达，但值为空
- 最小修复：补 `runtime:{forceStream:true}`、`auth.extraHeaders`，并在 `notes` 写明这是 dual-auth（OAuth 主 + Bearer Key 可用）

### P1-2 `kilocode`：源为 OAuth(device-code) primary；网关必需头与匿名降级丢失

- 源：`registry/kilocode/index.ts:6-9`、`:14 authType:"oauth"`、`:22 anonymousApiKey:"anonymous"`、`:23-24 headers.X-KILOCODE-EDITORNAME`（注释：「required by the gateway」）、`:26-29` device-code oauth 块
- 注册表：`bearer` / `api-key`，无 `runtime`、无 `headers`、无匿名降级说明
- 问题：除同 P1-1 的规则违规外，**网关必需头 `X-KILOCODE-EDITORNAME` 缺失**，鉴权通过但请求可能被网关拒绝
- 最小修复：补 `auth.extraHeaders`（`X-KILOCODE-EDITORNAME`）、notes 写明匿名免费层与 device-code 的关系

### P1-3 `blackbox`：上游已 deprecated 且公开端点 404，仍标「官方 API / 低风险」

- 源：`registry/blackbox/index.ts:8-13`「api.blackbox.ai returns HTTP 404 on /v1/chat/completions and /v1/models… public inference surface has moved to the gated enterprise.blackbox.ai/v1」；`src/shared/constants/providers/apikey/frontier-labs.ts:112 deprecated:true`、`:113-114 deprecationReason`
- 注册表：`status:"reference"`、`risk.low/official-api`、`billing.payg`，`notes` 为通用模板话术，未提停服
- 问题：这是本批唯一有源侧「官方宣告失效」证据的条目，注册表却将其呈现为正常可用
- 最小修复：`status:"stale"`；`risk` 改 `medium/deprecated`；notes 写明公开端点已迁移

### P1-4 `iflytek` ↔ `sparkdesk`：同端点同鉴权的真重复

- 两条 requestURL 完全相同（`https://spark-api-open.xf-yun.com/v1/chat/completions`），均 `bearer`，endpoint path 相同，模型列表高度重叠
- 源侧本就重复：`iflytek/index.ts:8` 与 `sparkdesk/index.ts:8` 同 baseUrl、同 `authHeader:"bearer"`（`:10`）
- 影响：配置页出现两个同厂商同端点入口，用户会重复配置、额度与模型列表口径分裂
- 最小修复：保留一条，另一条删除或降为 `aliases`（源侧重复不是理由——注册表的价值正是归一化）

### P1-5 计费口径与源自述不符（4 条）

| ID | 源证据 | 注册表 | 问题 |
|---|---|---|---|
| `sensenova` | `sensenova/index.ts:11`「SenseNova **Token Plan** endpoint」 | `payg/api-key` | 与同批 3 条 token-plan 条目（`bailian-coding-plan`/`qwen-cloud-token-plan`/`xiaomi-mimo-token-plan` 均标 `subscription`）口径冲突 |
| `apmix` | `apmix/index.ts:4`「**subscription** LLM gateway」，`:6`「catalog is plan-scoped per key」 | `payg/api-key` | 订阅制标成按量 |
| `openadapter` | `openadapter/index.ts:3`「**subscription** LLM gateway」 | `payg/api-key` | 同上 |
| `factory` | `factory/index.ts:3`「hosted **subscription** gateway」，`:6-7` 付费 Droids 订阅 | `payg/api-key` | 同上 |

- 说明：`src/schema.mjs` 的 `BILLING_TO_QUOTA` 只校验 `billing`↔`quota` 内部自洽，不校验与产品事实是否相符，因此 `validate` 0 提醒并不代表计费正确
- 最小修复：确认后改 `subscription`（或 `mixed`），`quota.type` 同步，notes 写明「套餐额度 / API 余额是两套账」

### P1-6 第三方网关与中转的 `risk` 清一色 `low/official-api`（22 条 aggregator + 若干 global）

- 事实：106 条导入项 `risk.level` 全为 `low`、`risk.variant` 全为 `official-api`（脚本核：`{ "low/official-api": 106 }`）
- `official-api` 在 `src/schema.mjs:109` 的词义是「官方 API」，而下列条目的源注释自述为第三方网关 / 中转 / 伪装客户端，语义高估：
  - `gitlawb`、`gitlawb-gmi`：`gitlawb/index.ts:12-15`、`gitlawb/gmi/index.ts:12-15` 固定 `User-Agent: OpenClaude/1.0`、`X-Title: OpenClaude CLI`、`HTTP-Referer: github.com/Gitlawb/openclaude`（伪装成第三方 CLI）
  - `orcarouter`：`HTTP-Referer: endpoint-proxy.local` / `X-Title: Endpoint Proxy` 伪装头
  - `api-airforce`：同款 endpoint-proxy 伪装头
  - `tabitoken`：`tabitoken/index.ts:5`「**NewAPI-based** Claude gateway」
  - `bai`：`bai/index.ts:14`「bai **resells** DeepSeek's deepseek-reasoner」
  - `kie`：`kie/index.ts:13`「the kie **proxy** surfaces」
  - `nube`：`nube/index.ts:12`「OpenAI-compatible **LiteLLM gateway (BYOK)**」
  - `dit`：`dit/index.ts:3-6`「router/gateway… marketplace where provider channels bid」
  - `wafer`：`wafer/index.ts:11-17` 第三方模型聚合目录
- 影响：`risk` 是供面板展示「账号封禁 / ToS 风险」的核心字段（`src/schema.mjs:100-115`），一律 `low/official-api` 会误导使用者
- 最小修复：至少把上述条目改为 `medium/unsupported`（伪装 UA/Referer 类可 `high`），官方托管型（如 `vercel-ai-gateway`）可保留 `low`

---

## 5. P2 — 建议改进（9 项）

| # | 问题 | 具体 ID / 证据 |
|---|---|---|
| P2-1 | 免费 / 混合额度统一标 `payg`，`billing.note` 为模板话术 | `longcat`（`longcat/index.ts:14-16` 一次性 10M token 免费 + 超量 PAYG）、`scaleway`（`:11` 新号 1M 免费）、`reka`、`ollama-cloud`（`:13` free/Pro/Max 分层）、`bluesminds`（`:14` 默认免费模型 + VIP 点数）、`api-airforce`（`:18` 55 个免费模型）、`freetheai`、`bazaarlink`、`dgrid`、`tokenrouter` |
| P2-2 | `category` 疑似应为 `aggregator` | `dit`、`nube`、`openadapter`、`factory`、`wafer`、`tabitoken`、`kie`、`bai`、`bluesminds`、`synthetic`（均现为 `global`） |
| P2-3 | `externalIds` 与源 id 不对齐 | `tencent-hunyuan` 的 `omniroute:hunyuan`，源 id 是 `tencent`（`tencent/index.ts:4`）；`dashscope` 的 `omniroute:alibaba`，但注册表主机是 CN 站，源里 CN 站是 `alibaba-cn` |
| P2-4 | 覆盖缺口 3 条 | `minimax-cn`（`minimax/cn/index.ts:8` `api.minimaxi.com`，国内端点，人工 `minimax` 用的是国际域，未覆盖）；`kimi-coding-apikey`（`kimi/coding-apikey/index.ts:5`，claude + `x-api-key` + `Anthropic-Version`，baseUrl 走 `KIMI_CODING_SHARED` 的 `.../messages?beta=true`，因是 spread 且带 query 被静态规则漏掉）；`uc-direct`（规则 ①-⑤ 全过，被以「特殊渠道语义」排除，理由未进书面规则） |
| P2-5 | `alternateFormats` 多接入面未录入 | `agentrouter`（源 `agentrouter/index.ts:19-31` 另有 openai-chat、openai-responses 两个面）、`tabitoken`、`xiaomi-mimo`、`xiaomi-mimo-token-plan` 各丢 1 个面 |
| P2-6 | `probe.modelsUrl` 覆盖 43/106 | 另 63 条源本身无 `modelsUrl`（不是导入丢失），属上游元数据缺失，可在 `notes` 说明 |
| P2-7 | `scripts/smoke.mjs` 对导入项只抽样 4 条（`agentrouter` path、`cerebras` scheme、`pioneer` headerName、`perplexity-agent` protocol） | 未断言：106 条 requestURL 正确性、`headerName` 完整性、全量 `status`/`verifiedAt`、去重、`headers`/`runtime` 保留；**P0-1/P0-2/P0-3 三类问题都能穿过当前测试** |
| P2-8 | 近名别名易混淆 | `dashscope` 别名 `qwen/tongyi/bailian`，与 `qwen-cloud`、`qwen-cloud-token-plan`、`bailian-coding-plan` 相邻；`baidu-qianfan` 别名 `qianfan`；`volcengine-ark` 别名 `volcengine` |
| P2-9 | 文档缺「逐条排除清单」，且若干关键数字不可复核 | `docs/omniroute-import.md:87-96` 只按「类型」列了少数被排除项；`135 / 201 / 199` 三个数字在 README、docs、scripts、package.json、demo 中**全仓库 0 命中**（`grep -rn "135\|201\|199" README.md docs/*.md scripts/*.mjs package.json` 无输出） |

---

## 6. 覆盖完整性复核

### 6.1 独立漏斗

| 阶段 | 规则 | 数量 |
|---|---|---|
| 顶层 `RegistryEntry`（`export const X: RegistryEntry = {`，剥离 `//`、`/* */` 注释后做花括号配对解析） | — | **236** |
| + `authType:"apikey"` | ② | **192** |
| + 固定 `http(s)` baseUrl 且不含 `{...}` | ③ | **184** |
| + `format ∈ {openai, openai-responses, claude, gemini}` | ④ | **182** |
| + `executor:"default"` | ⑤ | **133** |
| 实际导入（`tags:["imported"]`） | ⑥ | **106** |

**差额对账（与声称口径自洽）**：133 条规则合格 = **104 条已导入** + **29 条未导入**；另有 **2 条源 `authType:"oauth"` 的双鉴权条目**（`cline`、`kilocode`）被特批导入。因此「候选 135 = 133 + 2」成立，135→106 的差额 29 也可逐条落地。**声称的筛选口径数值是对的**，问题在于：这 2 条特批与 29 条逐条排除理由**都没有写进任何产物**（P1-1/P1-2/P2-9）。

> 口径说明：解析需剥离注释——`cline/index.ts:7-9`、`kilocode/index.ts:7-8` 的注释里就写着 `authType:"apikey"`，按文本 grep 会把两条 oauth 条目误记为 apikey。另有 5 处 `...SHARED` spread 条目（`kimi/coding`、`kimi/coding-apikey`、`moonshot`、`zcode`）静态解析看不到其 `baseUrl`，`kimi-coding-apikey` 因此被漏掉（P2-4）。

### 6.2 29 条未导入逐条落地

| 分类 | 数量 | ID | 判定 |
|---|---|---|---|
| 与 32 条人工条目厂商等价 | 19 | `alibaba`(国际站)、`alibaba-cn`、`anthropic`、`baidu`、`bigmodel`、`deepseek`、`doubao`、`gemini`、`groq`、`minimax`、`mistral`、`openai`、`openrouter`、`qianfan`、`tencent`、`volcengine`、`volcengine-agent-plan`、`volcengine-coding-plan`、`zai` | 合理 |
| 媒体生成 | 4 | `haiper`(视频)、`ideogram`(图像)、`leonardo`(图像)、`udio`(音频) | 合理 |
| 规则外特殊 | 6 | `databricks`(workspace 占位模板)、`dify`(原生 `/v1/chat-messages`)、`nlpcloud`(GPU 专用执行器)、`oneminai`(私有 prompt/SSE)、`uc-direct`(特殊渠道)、`minimax-cn`(国内端点) | 4 合理 + 2 存疑（`uc-direct`、`minimax-cn`，见 P2-4） |

### 6.3 三类专项

| 类别 | 结论 |
|---|---|
| 国内厂商 | **未发现旗舰 LLM 厂商被无理由排除**。阿里/百度/火山/腾讯/MiniMax/智谱/月之暗面均有人工条目覆盖；真实缺口是 `minimax-cn` 国内端点与 `kimi-coding-apikey`（P2-4）。 |
| 聚合网关 | 22 条 aggregator 已导入，头部 `openrouter` 由人工条目覆盖；唯一规则内存疑排除是 `uc-direct`。 |
| Coding / Token Plan | 已导入 5 条（`bailian-coding-plan`、`qwen-cloud`、`qwen-cloud-token-plan`、`xiaomi-mimo`、`xiaomi-mimo-token-plan`）；火山两条 plan 由人工条目覆盖；漏收 1 条 `kimi-coding-apikey`（P2-4）。 |

---

## 7. 去重、语义映射、文档与产物一致性

### 7.1 去重

- **精确重复（requestURL + scheme + headerName）**：全量 138 条中 **1 组** —— `iflytek` ↔ `sparkdesk`（P1-4）。
- **同 eTLD+1 多条目 11 组**，逐组判定：`x.ai`(zai/zai-coding-plan)、`aliyuncs.com`(dashscope/qwen-cloud/qwen-cloud-token-plan/bailian-coding-plan)、`volces.com`(ark/coding-plan/agent-plan)、`tencent.com`(codebuddy-cn/tencent-hunyuan)、`mistral.ai`(mistral/codestral)、`gitlawb.com`(gitlawb/gitlawb-gmi)、`perplexity.ai`(perplexity/perplexity-agent)、`xiaomimimo.com`(mimo/mimo-token-plan) 等 —— 均为区域 / 产品 / 协议分面，**合理**；只有 `xf-yun.com` 是真重复。
- **导入 ↔ 人工之间无 URL 重复**，说明「不与已有 32 条重复」这条规则实际被执行了。
- **`baidu` 处理正确**：注册表无 `id:"baidu"`；`baidu-qianfan` 的 `externalIds.omniroute="baidu"`。源侧 `baidu/index.ts` 与 `qianfan/index.ts` 本就是同 URL 的重复条目，只保留一条并回链到 `baidu` 是合理归一化。`externalIds` 冲突扫描 **0 组**（注意 `src/schema.mjs` 对冲突只 `push warning`，不升级为 error，所以 0 提醒 ≠ 无冲突，须人工核；本次已核）。
- **成对映射**：`alibaba/dashscope`、`qianfan/baidu-qianfan`、`volcengine/volcengine-ark`、`tencent/tencent-hunyuan`、`minimax/minimax-cn` 均为「只存一条」，语义一致；但 `tencent-hunyuan` 的 ext 值 `hunyuan` 与源 id `tencent` 不对齐（P2-3）。

### 7.2 状态与可信度

- 106 条导入项 **全部 `status:"reference"`**，**0 条带 `verifiedAt`**，无伪造「已验证」痕迹。
- 20 条 `verified` 全为人工条目，`verifiedAt` 均为 `2026-11-14`（非未来日期）。
- 12 条人工 `reference` 未被本次导入污染。

### 7.3 文档与产物

| 核对项 | 文档写 | 实测 | 差异 |
|---|---|---|---|
| `README.md:6` | 138 Provider / 8 Agent | 138 / 8 | 一致 |
| `README.md:265` | 138（含 106 条导入） | 138 / 106 | 一致 |
| `README.md:313` | 32 + 106 = 138 | 32 / 106 / 138 | 一致 |
| `docs/omniroute-import.md:75/79/83` | 海外 70 / 国内 14 / 聚合 22 | 清单 70/14/22；数据 `category` global 70 / china 14 / aggregator 22 | 一致（清单 id 全存在、全 imported，数据中 imported 但不在清单 0 条） |
| demo 统计 | — | 138 / verified 20 / reference 118；byCategory global 83 / china 25 / aggregator 25 / agent 2 / local 3 | 一致 |
| `135 / 201 / 199` | 未出现在任何产物 | — | **不可复核**（P2-9） |

- **demo 可构建**：在仓库只读副本中执行 `node scripts/build-demo.mjs` → `138 providers / 8 agents，273.2 KB`，产物与在库 `demo/index.html` **逐字节一致**（`diff -q` IDENTICAL），CI 亦用同法校验。
- **深链**：实现为 query string（`demo/template.html:205-213` 的 `URLSearchParams`，`?provider=` / `?agent=`），**不存在 `#/provider/<id>` hash 路由**；README:57 的写法与实现一致。未知 id 会静默回退首条（`template.html:340-341`），不报错。

---

## 8. 最小修复建议（按优先级）

1. **P0-1/P0-2（必改）**：`gitlawb`、`gitlawb-gmi` 把 `endpoints[0].protocol` 改为 `"unknown"`，使 `getEndpointPath` 返回空、requestURL 保持源 baseUrl；或删除这两条并列入人工复核。改法已实测（内存修改，未落盘）：
   ```bash
   node --input-type=module -e "
   import { buildRequestConfig } from './src/fields.mjs';
   import fs from 'node:fs';
   const d=JSON.parse(fs.readFileSync('data/providers.json','utf8'));
   const g=d.providers.find(p=>p.id==='gitlawb');
   console.log('现状:', buildRequestConfig(g,{apiKey:'t'}).requestURL);
   const fixed=JSON.parse(JSON.stringify(g)); fixed.endpoints[0].protocol='unknown';
   console.log('修复:', buildRequestConfig(fixed,{apiKey:'t'}).requestURL);"
   # 现状: https://opengateway.gitlawb.com/v1/xiaomi-mimo/chat/completions
   # 修复: https://opengateway.gitlawb.com/v1/xiaomi-mimo
   ```
   若坚持保留 `openai-chat` 协议语义，则需在 schema 里允许 `path: ""`（当前 `src/schema.mjs` 的 `validateEndpoint` 要求 `path` 非空且以 `/` 开头，无法表达「裸基址」）。
2. **P0-3（必改）**：给 `bailian-coding-plan`、`tabitoken`、`wafer` 的 `endpoints[0].headers` 补 `{"anthropic-version":"2023-06-01"}`（与人工 `zai` 条目同形）。
3. **P1-1/P1-2**：`cline` 补 `runtime.forceStream:true` + `auth.extraHeaders`；`kilocode` 补 `auth.extraHeaders.{"X-KILOCODE-EDITORNAME":"OmniRoute"}`；两条 notes 写明 dual-auth 性质。
4. **P1-3**：`blackbox` → `status:"stale"`、`risk:{level:"medium",variant:"deprecated"}`。
5. **P1-4**：合并 `iflytek`/`sparkdesk`，保留一条 + `aliases`。
6. **P1-5**：复核 `sensenova`、`apmix`、`openadapter`、`factory` 的 `billing.mode`/`quota.type`。
7. **P1-6**：按 §4 清单把 22 条 aggregator 及伪装头/中转类条目的 `risk.variant` 从 `official-api` 改为 `unsupported`（伪装 UA/Referer 可 `high`）。
8. **P2-7（防回归）**：在 `scripts/smoke.mjs` 增加三条断言——①`buildRequestConfig` 的 requestURL 必须等于源 baseUrl（至少覆盖存在 `path` 缺失风险的条目）；②所有 `protocol:"anthropic-messages"` 端点必须带 `anthropic-version`；③`imported` 条目必须全为 `reference` 且无 `verifiedAt`。这三条正好能拦住本次三个 P0。
9. **P2-4/P2-9**：补 `minimax-cn`、`kimi-coding-apikey`（后者需支持 baseUrl 携带 `?beta=true` 查询串）；在 `docs/omniroute-import.md` 追加「29 条未导入逐条表」与「2 条 dual-auth 特批说明」。

---

## 9. 附录：覆盖漏斗脚本（可独立运行）

```python
import re, os, json
ROOT='/home/user/Doubao/chats/151833173454338/references/OmniRoute/open-sse/config/providers/registry'
REG='/home/user/Doubao/chats/151833173454338/agent-provider-registry/data/providers.json'

def strip_comments(s):
    s=re.sub(r'/\*.*?\*/','',s,flags=re.S)
    s=re.sub(r'(?m)^\s*//.*$','',s)
    return re.sub(r'(?m)\s//.*$','',s)

entries=[]
for dp,_,fs in os.walk(ROOT):
    for f in fs:
        if f!='index.ts': continue
        p=os.path.join(dp,f); code=strip_comments(open(p,encoding='utf-8').read())
        for m in re.finditer(r'export const (\w+)\s*:\s*RegistryEntry\s*=\s*\{',code):
            start=m.end()-1; depth=0; i=start
            while i<len(code):
                if code[i]=='{': depth+=1
                elif code[i]=='}':
                    depth-=1
                    if depth==0: break
                i+=1
            body=code[start:i+1]
            fld=lambda k:(re.search(k+r':\s*["\']([^"\']+)["\']',body) or [None,None])[1]
            entries.append(dict(id=fld('id'),auth=fld('authType'),fmt=fld('format'),
                                exe=fld('executor'),url=fld('baseUrl'),file=p))

s1=len(entries)
a=[e for e in entries if e['auth']=='apikey']
b=[e for e in a if e['url'] and e['url'].startswith(('http://','https://')) and '{' not in e['url']]
c=[e for e in b if e['fmt'] in ('openai','openai-responses','claude','gemini')]
d=[e for e in c if e['exe']=='default']
print(f'顶层={s1} apikey={len(a)} 固定URL={len(b)} format={len(c)} executor={len(d)}')

reg=json.load(open(REG))
imp={p['externalIds']['omniroute'] for p in reg['providers']
     if 'imported' in (p.get('tags') or []) and 'omniroute' in (p.get('externalIds') or {})}
print('合格未导入:', sorted(e['id'] for e in d if e['id'] not in imp))
```

---

## 10. 附：对被审方关键声称的复核结果

| 声称 | 复核结论 |
|---|---|
| `validate` 0 条提醒 | ✅ 复现（`providers=138 agents=8 / 通过（0 条提醒）`） |
| `npm test` 通过 | ✅ 复现（`smoke ok: 138 providers / 8 agents`） |
| JSON Schema 0 errors | ✅ 复现（Draft 2020-12，0 error） |
| `tsc --noEmit --strict --skipLibCheck` 0 errors | ✅ 复现（exit 0） |
| 138 Provider / 8 Agent / 32 人工 / 106 导入 | ✅ 复现 |
| 导入项全部 `reference`、保留 `externalIds.omniroute`、notes 保留原 baseUrl | ✅ 复现（106/106，0 条 `verifiedAt`） |
| 顶层候选 135 / 新增 106 | ✅ 口径自洽（133 规则合格 + 2 条 dual-auth 特批 = 135；差额 29 可逐条落地），但**未写入任何文档** |
| `201` 个文件 `authType:"apikey"` / `199` 有 baseUrl | ⚠️ 不可复核：该数字不在注册表仓库任何产物中；本次独立复算为 192 条 apikey 顶层条目（184 条固定 URL） |
| 「95 条/29 条被排除」类型原因已在文档说明 | ❌ 文档只按类型列了少数几条，未逐条列出 29 条 |

---

## 11. 修复复验（v0.3.1）

修复原则：优先保证真正的「baseURL + API Key」接入；不满足该前提、已废弃或重复的条目直接去除。未修改 32 条人工条目的既有语义，未伪造 `verified`，未联网请求上游。

### 11.1 修复后基线

| 项 | 值 |
|---|---|
| Provider 总数 | **136**（32 人工 + 104 导入） |
| 导入条目 | **104**（初始 106，删除 4 / 新增 2） |
| Agent | 8 |
| `validate` | 通过（0 error / 0 warning） |
| `npm test` | `smoke ok: 136 providers / 8 agents / 104 imported` |
| JSON Schema (Draft 2020-12) | 0 error |
| `tsc --noEmit --strict --skipLibCheck` | 0 error |
| `npm run build:demo` | 136 providers / 8 agents，产物与数据一致 |
| 版本 | `0.3.1` |

### 11.2 P0 关闭情况（3/3 关闭）

| 编号 | 处置 | 复验 |
|---|---|---|
| P0-1 `gitlawb` | 保留，`endpoints[0].protocol` 改为 `unknown`、去掉 `path`，risk 升 `high/unsupported` 并写明伪装 UA/Referer | `requestURL` = `https://opengateway.gitlawb.com/v1/xiaomi-mimo`（裸基址），与源执行器 default 分支一致 |
| P0-2 `gitlawb-gmi` | 同上 | `requestURL` = `https://opengateway.gitlawb.com/v1/gmi-cloud` |
| P0-3 `bailian-coding-plan` / `tabitoken` / `wafer` | 三条 `endpoint.headers` 补 `anthropic-version: 2023-06-01`；同批 `agentrouter` 也补齐 | 四条 `anthropic-messages` 端点均带头，smoke 全量断言 |

### 11.3 P1 关闭情况（6/6 关闭）

| 编号 | 处置 |
|---|---|
| P1-1 `cline` | **删除**（源 OAuth-primary，非纯 API Key；连带丢失的 `forceStream` 不再补） |
| P1-2 `kilocode` | **删除**（源 device-code 为主，非纯 API Key） |
| P1-3 `blackbox` | **删除**（源 `deprecated:true`、公开端点 404） |
| P1-4 `iflytek` ↔ `sparkdesk` | **删除 `sparkdesk`**，保留 `iflytek`；全表 requestURL + 鉴权重复归零 |
| P1-5 计费口径 | `sensenova`、`apmix`、`openadapter`、`factory` → `billing.subscription`，`quota.type` 同步，notes 写明「套餐额度与 API 余额是两套账」 |
| P1-6 risk 语义 | 32 条修正：聚合 / 中转 → `medium/unsupported`；`gitlawb`、`gitlawb-gmi`、`api-airforce`、`orcarouter`（伪装头）→ `high/unsupported`；`vercel-ai-gateway` 保留 `low`。分布：low 70 / medium-subscription 2 / medium-unsupported 28 / high 4 |

### 11.4 P2 关闭情况（6/9 关闭）

| 编号 | 处置 |
|---|---|
| P2-1 免费 / 混合额度统一 `payg` | **保留**：`longcat`、`scaleway`、`reka`、`ollama-cloud`、`bluesminds`、`api-airforce`、`freetheai`、`bazaarlink`、`dgrid`、`tokenrouter` 仍为 `payg`（免费档细节已写在 `billing.note` 的来源说明之外，未逐条改 `mixed`） |
| P2-2 category 归类 | 10 条 → `aggregator`（`dit`、`nube`、`openadapter`、`factory`、`wafer`、`tabitoken`、`kie`、`bai`、`bluesminds`、`synthetic`） |
| P2-3 externalIds 偏差 | `tencent-hunyuan.omniroute = tencent`；`dashscope.omniroute = alibaba-cn`（`intl` 端点未改动，理由写入 notes） |
| P2-4 覆盖缺口 | 新增 `minimax-cn`（`api.minimaxi.com`，国内站）、`kimi-coding-apikey`（`api.kimi.com/coding/v1` + `/messages?beta=true`）；`uc-direct` 继续排除，理由已写入 `docs/omniroute-import.md` |
| P2-5 alternateFormats 遗漏 | 补 5 个接入面：`agentrouter`（openai-chat / openai-responses）、`tabitoken`（openai-chat）、`xiaomi-mimo`、`xiaomi-mimo-token-plan`（各 1 个 anthropic），均取自源 `alternateFormats`，无臆造 |
| P2-6 63 条无 `probe.modelsUrl` | **保留**：源本身未提供 `modelsUrl`，不是导入丢失 |
| P2-7 smoke 覆盖不足 | 重写：104 条 requestURL 与源金标准逐一比对（`scripts/omniroute-url-fixture.json`）、`api-key-header` 的 `headerName`、`anthropic-version`、`status` 全 `reference` 且无 `verifiedAt`、全表无 requestURL + 鉴权重复、`externalIds` 无一对多 |
| P2-8 近名别名混淆 | **保留**：别名未改动，已在相关条目 notes 中区分站点（CN / intl / token plan） |
| P2-9 文档缺逐条排除表 / 关键数字不可复核 | `docs/omniroute-import.md` 重写：补漏斗（236→192→184→182→133→104）、30 条未导入逐条表、`uc-direct` 主动排除理由、三份清单按实际 `category` 更新（57 / 15 / 32） |

### 11.5 本次配套变更

- **新增能力**：`endpoint.auth`（接入面级鉴权覆盖）。同一 Provider 的不同接入面可以要求不同 header（`agentrouter` 默认面 `x-api-key`、OpenAI 面 `bearer`；`xiaomi-mimo` 默认 `bearer`、Anthropic 面 `x-api-key`）。已同步更新 `schemas/provider.schema.json`、`src/schema.mjs`、`src/fields.mjs`、`types/index.d.ts`；缺省仍继承 Provider 级 `auth`，32 条人工条目行为不变。
- **回归防护**：`scripts/omniroute-url-fixture.json` 固化 104 条期望 `requestURL`（由源 `baseUrl` + `chatPath` / `urlSuffix` 推导，`gigachat` / `xiaomi-mimo*` 按源执行器归一化规则补 `/chat/completions`），smoke 逐条比对，导入侧 URL 漂移会立刻失败。
- **产物**：`demo/index.html` 重新构建，`docs/preview.png`、`docs/preview-session.png` 重新截取（1440×1100）。

### 11.6 仍存问题（不阻断）

1. P2-1 免费 / 混合额度口径：10 条仍统一标 `payg`，未逐条改 `mixed`；
2. P2-6 63/104 条无 `probe.modelsUrl`（上游缺失）；
3. P2-8 近名别名（`qwen` / `bailian` / `qianfan` / `volcengine`）仍可能让检索落到相邻条目；
4. 源 `alternateFormats` 的动态指纹头（Codex CLI / OpenClaude / endpoint-proxy UA）无法静态内联，仅在 notes 说明；
5. 全部条目为离线目录投影，未做联网可达性验证。

### 11.7 复验命令

```bash
cd /home/user/Doubao/chats/151833173454338/agent-provider-registry
node bin/cli.mjs validate      # providers=136 agents=8 / 通过（0 条提醒）
npm test                       # smoke ok: 136 providers / 8 agents / 104 imported
npm run build:demo             # 136 providers / 8 agents
tsc --noEmit --strict --skipLibCheck types/index.d.ts
python3 -c "import json,jsonschema; d=json.load(open('data/providers.json')); s=json.load(open('schemas/provider.schema.json')); print(len(list(jsonschema.Draft202012Validator(s).iter_errors(d))))"
```
