# Release Notes — llm-provider-kit 0.6.0（Agent Skill）

> 发布日期：2026-11-16 ｜ 仓库：[`lawson2019/llm-provider-kit`](https://github.com/lawson2019/llm-provider-kit) ｜ 许可证：MIT
> 在线 Demo：<https://lawson2019.github.io/llm-provider-kit/>

## Skill 概览

| 项 | 值 |
|---|---|
| Skill 名称（frontmatter `name`） | `llm-provider-kit` |
| 兼容旧名 / CLI 别名 | `provider-registry-builder`（旧 Skill 目录收敛为兼容入口） |
| 形态 | Agent Skill：`SKILL.md`（YAML frontmatter：`name` / `description`）+ 可执行脚本 + 数据 URL 引用；不依赖整仓 clone 即可被 Agent 读取 |
| 版本 | `0.6.0`（与 `package.json` 一致） |
| 数据规模 | **108 个 Provider / 7 个 Agent 运行时**；分层 `starter` 12 / `mainstream` 37 / `full` 108；Schema `schemaVersion: 2` |
| 运行时要求 | Node.js ≥ 18（仅脚本 / CLI / 生成器需要；纯指令型读取无运行时要求） |
| 依赖 | 核心库与 CLI 零第三方依赖 |

## 这个 Skill 能做什么

- 查 LLM Provider 配置元数据：baseURL、接入面（endpoint）、鉴权模式与携带方式、计费、额度边界、表单字段、能力开关、接入备注。
- 由注册表数据**自动推导**配置表单字段、接入面解析与脱敏请求预览，不手写表单字段。
- 按分层（starter / mainstream / full）生成可运行的配置页：React 18 + Vite、Vue 3、Svelte 4、原生静态页或单文件 HTML。
- 提供零依赖 CLI：`list` / `show` / `fields` / `validate` / `export`。
- 生成器不联网、不写入真实 Key；请求预览脱敏，不把原始 Key 写进 DOM 或复制内容。

## 支持的框架 / Agent 运行时

Skill 遵循开放的 Agent Skills 格式（目录 + `SKILL.md`，frontmatter 仅需 `name` / `description`），可被以下类型的客户端发现与加载：

- **编码代理 / CLI**：Claude Code、OpenCode、Codex、Cursor、Windsurf、GitHub Copilot、OpenClaw 等（skills.sh 生态已收录 75+ 客户端，兼容路径见 install.md）。
- **JavaScript 集成**：ESM 库 `getFormFields` / `resolveEndpoint` / `buildRequestConfig` 等，Node ≥ 18；参考实现 `examples/react/`。
- **静态产物**：单文件 HTML Demo（GitHub Pages），浏览器直接打开，无外部脚本依赖。

> 本 Skill 本身**不是 MCP Server**，不通过 MCP 协议暴露工具；MCP 目录（Smithery MCP、MCP Registry）不适用于当前形态，见 `platforms.md`。

## 数据 URL（公开，免克隆引用）

基线分支 `main`，均已实测 HTTP 200：

| 数据 | URL |
|---|---|
| Provider 条目（108，Schema v2） | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json> |
| Agent / 运行时清单（7） | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json> |
| 分层视图 | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json> |
| 在线 Demo | <https://lawson2019.github.io/llm-provider-kit/> |
| 仓库 | <https://github.com/lawson2019/llm-provider-kit> |

> 边缘缓存提示：push 后短时间内 `raw.githubusercontent.com/.../main/...` 可能命中旧缓存；需要钉版本时改用提交 SHA 或 tag 引用（见 install.md）。

## 安装 / 引用命令

完整三种引用方式见 [`install.md`](./install.md)。速览：

```bash
# a. 直接让 Agent 读 raw SKILL.md（不克隆仓库）
#    URL 待 skills/llm-provider-kit/ 推送到 main 后生效，见 install.md 中的钉 SHA 写法

# b. 把 Skill 目录复制到项目 skills 目录
git clone --depth 1 https://github.com/lawson2019/llm-provider-kit.git
cp -R llm-provider-kit/skills/llm-provider-kit .claude/skills/

# c. 公开数据 URL + 生成脚本
npx skills add lawson2019/llm-provider-kit
# 或下载数据快照后本地生成：
node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
```

CLI（仓库内）：

```bash
node bin/cli.mjs list --category china
node bin/cli.mjs show volcengine-ark
node bin/cli.mjs validate
```

## 0.6.0 主要变更（面向使用者）

- **Breaking**：旧 `status` 分类（`verified` / `reference` / `stale`）从数据、Schema、校验器、CLI、Demo、类型与文档中全部移除；`verifiedAt` 保留为纯审计日期，不参与分类、筛选或渲染。
- 126 条全量官方复核后收敛为 **108 条**：确认 14 条、修正 32 条、因补不齐官方依据移除 17 条。
- `codestral` 并入 `mistral`（同品牌同端点），`codestral` 保留为 alias。
- 一批 baseURL / 鉴权 / 计费口径按官方文档修正（明细见仓库 `CHANGELOG.md`）。
- README 重写为短版定位说明；新增本 Agent Skill 打包形态（`skills/llm-provider-kit/`），旧 `skills/provider-registry-builder/` 保留为兼容入口。

## 边界（使用者须知）

- Skill 只负责配置元数据、表单推导与请求预览；**不转发请求、不保存密钥**。
- 不内置任何真实 Key / JWT / Cookie；贡献条目须附官方文档依据。
- 第三方中转、订阅边界等风险以条目 `notes` / `risk` 字段为准，安装前请自行核对。

## 链接

- 仓库：<https://github.com/lawson2019/llm-provider-kit>
- Demo：<https://lawson2019.github.io/llm-provider-kit/>
- 变更日志：<https://github.com/lawson2019/llm-provider-kit/blob/main/CHANGELOG.md>
- 贡献规范：<https://github.com/lawson2019/llm-provider-kit/blob/main/docs/contributing.md>
