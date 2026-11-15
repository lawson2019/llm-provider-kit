# 安装与引用指南 — llm-provider-kit 0.6.0

仓库：<https://github.com/lawson2019/llm-provider-kit>（public，默认分支 `main`）
Skill 目录：`skills/llm-provider-kit/`（已在 `main` 上，Pages 与 raw 均可直接读取）
兼容旧入口：`skills/provider-registry-builder/`（脚本转发到根 `scripts/scaffold.mjs`，保留兼容）。

> 远端基线（2026-11-16 只读核验）：main HEAD `41ac2b22958ec3da3ddd111ea080f933753e128c`；远端 `skills/` 下当前仅有 `provider-registry-builder/`。`skills/llm-provider-kit/` 落地前，方法 a / b 中指向该目录的链接会 404，可先用旧目录或等合入后再引用。

---

## 方式 a：直接让 Agent 读 raw SKILL.md（不克隆仓库）

Agent 只需要指令与元数据时，把 raw `SKILL.md` 地址交给它读取；脚本与数据按需从公开 URL 拉取。

```text
https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
```

钉版本（推荐生产使用，避免 main 漂移；把 `<SHA>` 换成对应提交或 tag）：

```text
https://raw.githubusercontent.com/lawson2019/llm-provider-kit/<SHA>/skills/llm-provider-kit/SKILL.md
```

配套公开数据 URL（免克隆，HTTP 200 已实测）：

```text
https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json
https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json
https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json
```

注意：

- raw 地址在 push 后短时间内可能命中边缘缓存返回旧内容；钉 SHA 可规避。
- 此方式只加载指令；若 Skill 的脚本（`scripts/`）要在本地执行，仍需用方式 b 把目录取下来。

## 方式 b：复制 Skill 目录到项目 skills 目录

### b1. 整仓克隆后复制

```bash
git clone --depth 1 https://github.com/lawson2019/llm-provider-kit.git
# 复制到 Claude Code 的 skills 目录
mkdir -p .claude/skills
cp -R llm-provider-kit/skills/llm-provider-kit .claude/skills/
```

### b2. 只取 Skill 目录（稀疏检出，不拉整仓）

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/lawson2019/llm-provider-kit.git
cd llm-provider-kit
git sparse-checkout set skills/llm-provider-kit data
```

### 各 Agent 的 skills 目录对照

`SKILL.md` 放在下列任一标准位置即可被对应客户端发现（目录名与 frontmatter `name` 保持一致）：

| Agent / 客户端 | 目录 |
|---|---|
| Claude Code | `.claude/skills/<name>/` |
| 通用 Agent 约定 | `.agents/skills/<name>/`、`skills/<name>/` |
| Continue | `.continue/skills/<name>/` |
| Windsurf | `.windsurf/skills/<name>/` |
| Cursor / Codex / OpenCode / Copilot / Gemini CLI 等 | 对应各自 skills 目录；跨端安装可用 `npx skills add`（见下） |

跨端 CLI（skills.sh 生态，Node ≥ 22.20）：

```bash
npx skills add lawson2019/llm-provider-kit
# 选择具体 Skill 与目标 Agent：
npx skills add lawson2019/llm-provider-kit --skill llm-provider-kit -a claude-code
```

### 复制后验收

1. 目录内含 `SKILL.md`，frontmatter 有 `name: llm-provider-kit` 与一行 `description`；
2. 数据条数与基线一致：`providers` 108、`agents` 7、tiers `starter` 12 / `mainstream` 37 / `full` 108；
3. 仓库根目录跑 `node bin/cli.mjs validate` 通过；
4. 未带入任何真实 Key / JWT / Cookie。

## 方式 c：公开数据 URL + 生成脚本（不安装 Skill 本体）

只需要配置页 / 表单推导结果时，直接下载公开数据快照，用仓库生成器在本地产出页面。

```bash
# 1. 拉取数据快照（可钉版本：把 main 换成提交 SHA 或 tag）
mkdir -p ./registry-data
curl -fsSL -o ./registry-data/providers.json \
  https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json
curl -fsSL -o ./registry-data/agents.json \
  https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json
curl -fsSL -o ./registry-data/tiers.json \
  https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json

# 2. 取生成器脚本（克隆或稀疏检出 scripts/ 与 src/）
git clone --depth 1 --filter=blob:none --sparse https://github.com/lawson2019/llm-provider-kit.git
cd llm-provider-kit
git sparse-checkout set scripts src bin schemas types

# 3. 按分层与栈生成配置页（--data 指向下载好的快照目录）
node scripts/scaffold.mjs --tier starter --stack react --data ../registry-data --out ../my-key-page
# 其他栈：--stack vue | svelte | vanilla | html
# 分层：--tier starter | mainstream | full
```

生成产物包含：表单组件、浏览器可用的注册表函数、当前 tier 的 Provider 快照；字段 / 端点 / 鉴权 / 请求预览全部来自注册表数据。

### 作为 JS 库引用（Node 项目）

```js
import { getFormFields, resolveEndpoint, buildRequestConfig } from 'llm-provider-kit';
```

- 从 GitHub 安装：`npm install github:lawson2019/llm-provider-kit`（或指定 tag / SHA）；
- 导出入口见 `package.json` 的 `exports`；类型声明在 `types/index.d.ts`。

## 兼容旧入口

旧 Skill `provider-registry-builder` 的指令与脚本仍在 `skills/provider-registry-builder/`，其 `scripts/scaffold.mjs` 转发到根 `scripts/scaffold.mjs`。新接入请以 `llm-provider-kit` 为准；旧引用在 0.6.0 仍可用，后续版本可能移除。

## 常见问题

- **raw 链接 404**：确认 `skills/llm-provider-kit/` 已合入 `main`；在此之前请引用 `skills/provider-registry-builder/` 或本地克隆。
- **条数对不上**：main-ref 可能命中边缘缓存；改用提交 SHA 取数，或本地跑 `node bin/cli.mjs validate` 核对。
- **需要鉴权吗**：读取公开仓库与公开数据 URL 不需要账号或 Key；提交 / 发布到各目录才需要对应平台授权（见 `platforms.md`）。
