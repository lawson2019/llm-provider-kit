# Release Notes — llm-provider-kit 0.7.0（Provider-only）

> 发布日期：2026-11-17 ｜ 仓库：[`lawson2019/llm-provider-kit`](https://github.com/lawson2019/llm-provider-kit) ｜ 许可证：MIT
> 在线 Demo：<https://lawson2019.github.io/llm-provider-kit/>

## 本版重点

- **收敛为单一 Provider 数据域**：移除此前的第二数据域（运行时清单）及其 Demo 页签、深链、公开 API、类型声明、manifest 资源与文档入口。
- **默认 README 改为中文**：`README.md` 为简体中文主版，英文版迁至 `README.en.md`；日 / 韩 / 西 / 法版本同步更新。
- **Demo 介绍区与统计**：只展示 Provider 与接入点数量，保留 `?provider=<id>` 深链与复制提示词入口。

## Skill 概览

| 项 | 值 |
|---|---|
| Skill 名称（frontmatter `name`） | `llm-provider-kit` |
| 形态 | Skill：`SKILL.md`（YAML frontmatter：`name` / `description`）+ 可执行脚本 + 数据 URL 引用；不依赖整仓 clone 即可读取 |
| 版本 | `0.7.0`（与 `package.json` 一致） |
| 数据规模 | **108 个 Provider / 142 个接入点**；分层 `starter` 12 / `mainstream` 37 / `full` 108；Schema `schemaVersion: 2` |
| 运行时要求 | Node.js ≥ 18（仅脚本 / CLI / 生成器需要；纯指令型读取无运行时要求） |
| 依赖 | 核心库与 CLI 零第三方依赖 |

## 这个 Skill 能做什么

- 查 LLM Provider 配置元数据：baseURL、接入点（endpoint）、鉴权模式与携带方式、计费、额度边界、表单字段、能力开关、接入备注。
- 由注册表数据**自动推导**配置表单字段、接入点解析与脱敏请求预览，不手写表单字段。
- 按分层（starter / mainstream / full）生成可运行的配置页：React 18 + Vite、Vue 3、Svelte 4、原生静态页或单文件 HTML。
- 提供零依赖 CLI：`list` / `show` / `fields` / `validate` / `stats` / `export`。
- 生成器不联网、不写入真实 Key；请求预览脱敏，不把原始 Key 写进 DOM 或复制内容。

## 支持的使用方式

- **AI 编程助手 / CLI**：Claude Code、OpenCode、Codex、Cursor、Windsurf、GitHub Copilot 等可读取 `SKILL.md` 的客户端；兼容路径见 `install.md`。
- **JavaScript 集成**：ESM 库 `getFormFields` / `resolveEndpoint` / `buildRequestConfig` 等，Node ≥ 18；参考实现 `examples/react/`。
- **静态产物**：单文件 HTML Demo（GitHub Pages），浏览器直接打开，无外部脚本依赖。

> 本 Skill 本身**不是 MCP Server**，不通过 MCP 协议暴露工具；MCP 目录不适用于当前形态，见 `platforms.md`。

## 数据 URL（公开，免克隆引用）

基线分支 `main`：

| 数据 | URL |
|---|---|
| Provider 条目（108，Schema v2） | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json> |
| 分层视图 | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json> |
| 结构定义 | <https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/schemas/provider.schema.json> |
| 在线 Demo | <https://lawson2019.github.io/llm-provider-kit/> |
| 仓库 | <https://github.com/lawson2019/llm-provider-kit> |

> 边缘缓存提示：push 后短时间内 `raw.githubusercontent.com/.../main/...` 可能命中旧缓存；需要钉版本时改用提交 SHA 或 tag 引用（见 install.md）。

## 安装 / 引用命令

完整三种引用方式见 [`install.md`](./install.md)。速览：

```bash
# a. 直接让编程助手读 raw SKILL.md（不克隆仓库）
#    URL 见 install.md 中的钉 SHA 写法

# b. 把 Skill 目录复制到项目 skills 目录
git clone --depth 1 https://github.com/lawson2019/llm-provider-kit.git
cp -R llm-provider-kit/skills/llm-provider-kit .claude/skills/

# c. 只用公开数据 + 生成器
node scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
```

## 兼容性

- `provider-registry-builder` 旧 Skill 目录仍作为兼容入口保留，脚本转发到根 `scripts/scaffold.mjs`。
- 依赖旧运行时清单的导入方需要改为只读 `data/providers.json`；Provider 条目结构未变。
