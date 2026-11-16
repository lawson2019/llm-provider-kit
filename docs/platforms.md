# 平台分发调研与授权缺口 — 2026-11-16

发布物形态：Skill（`SKILL.md` frontmatter `name`/`description` + 脚本 + 公开数据 URL 引用），仓库 `lawson2019/llm-provider-kit`（public，默认分支 `main`）。

> 本轮原则：未实际登录/授权任何第三方平台；未向他人仓库提交 PR/Issue；下表「已上线」仅指仓库与 Pages 已公开可访问，不代表已被各目录收录。所有第三方收录状态均为**待授权 / 待就绪**，未伪造上线。

## 总览表

| # | 平台 | 状态 | 缺什么授权 / 前置条件 | 入口 URL |
|---|---|---|---|---|
| 1 | GitHub 仓库（repo + Pages） | 已上线（代码与 Demo 公开） | 无（写文件 / 分支 / PR 经 GitHub OAuth 连接器可用） | <https://github.com/lawson2019/llm-provider-kit> ｜ <https://lawson2019.github.io/llm-provider-kit/> |
| 2 | GitHub tag / Release（v0.6.0） | 待授权（连接器不能打 tag / 建 Release） | 浏览器登录会话、或本机 git 凭据、或 Actions 工作流 + `contents: write`、或带 `repo` 权限的 PAT | <https://github.com/lawson2019/llm-provider-kit/releases> |
| 3 | skills.sh（Vercel Labs 跨客户端目录） | 待就绪（**无需账号/Key**；待 Skill 目录推送到远端后被自动索引） | 前置：远端 public 仓库含可发现的 `SKILL.md`；无提交表单，按安装遥测排名；例行安全审计 | <https://skills.sh> ｜ CLI 源码 <https://github.com/vercel-labs/skills> |
| 4 | ClawHub（OpenClaw 生态市场） | 待授权 | ClawHub 账号并完成 `clawhub login`；发布 owner（个人 handle 或组织内 publisher 角色）；CI 通道需 `CLAWHUB_TOKEN`；上架前自动安全检查，必要时人工审核 | <https://clawhub.ai> ｜ 文档 <https://docs.openclaw.ai/tools/creating-skills> ｜ 发布流程 <https://docs.openclaw.ai/clawhub/publishing> |
| 5 | Smithery（Skills Registry + MCP 目录） | 待授权 | Smithery 账号（OAuth 登录）或 Smithery API Key（Bearer）；namespace 认领；收录含 `SKILL.md` 的 GitHub 仓库链接。本 Skill 非 MCP Server，MCP 发布通道不适用 | <https://smithery.ai> ｜ CLI 文档 <https://smithery.mintlify.dev/docs/concepts/cli> ｜ Skills API <https://www.smithery.ai/docs/api-reference/skills/create-a-new-skill-deprecated> |
| 6 | Anthropic 官方目录（Claude Directory） | 待授权 + **形态待改造** | ① Skill 必须打包成 **Plugin bundle**（`Skill 不能单独提交`）；② 付费 Claude 计划（Pro/Max/Ultra/Team/Enterprise，Free 不可提交）；Team/Enterprise 需 Owner 或授予 Directory 权限；③ 公开 GitHub 仓库；④ 新上架经人工审核。另有 Skills API 仅上传到自有 workspace，不是公开目录 | 开发者门户 <https://claude.ai/directory/manage> ｜ 发布说明 <https://claude.com/docs/directory/publish> ｜ 插件构建 <https://claude.com/docs/plugins/quickstart> |
| 7 | 社区 awesome 聚合仓（如 VoltAgent/awesome-agent-skills） | 待授权（未提交 PR） | GitHub 账号 fork + PR；维护者人工审核；要求 public 可用、有文档、**已有真实社区使用**，全新仓不收；条目 ≤10 词描述 | <https://github.com/VoltAgent/awesome-agent-skills> ｜ 贡献规范 <https://github.com/VoltAgent/awesome-agent-skills/blob/main/CONTRIBUTING.md> |
| 8 | MCP Registry（官方 MCP Server 目录） | 不适用 | 形态不符：收录 MCP Server（`server.json` + npm/PyPI/NuGet/OCI/MCPB 包或远程端点），不收 Skill。若未来包一层 MCP Server，再走 `mcp-publisher login github` + `publish` | <https://registry.modelcontextprotocol.io> ｜ 快速上手 <https://modelcontextprotocol.io/registry/quickstart> |
| 9 | agentskills.io（开放规范站） | 不适用 | 仅为 Skill 格式规范与客户端展示，无第三方提交流程 | <https://agentskills.io> |

---

## 逐项核实记录

### 1. GitHub 仓库 —— 已上线（代码层）

- **入口**：仓库 <https://github.com/lawson2019/llm-provider-kit>；Pages Demo <https://lawson2019.github.io/llm-provider-kit/>。
- **提交机制**：GitHub OAuth 连接器可写文件、建分支、提 PR、建 Issue、多文件推送；本机无 git push 凭据。
- **账号 / Key**：连接器已绑定 OAuth 账号；未使用任何明文 token。
- **人工审核**：仓库自身 CI（`validate.yml`）跑校验与测试；外部审核不适用。
- **收录形态**：public Git 仓库，目录内 `SKILL.md` + 脚本 + 数据 JSON。
- **现状**：当前构建产物为 108 Provider / 142 接入点；`skills/llm-provider-kit/` 与兼容入口 `skills/provider-registry-builder/` 均已在 `main`。

### 2. GitHub tag / Release —— 待授权（连接器能力缺口）

详见文末「GitHub tag / Release 可行性」一节。

### 3. skills.sh —— 待就绪，无需账号授权

- **入口**：<https://skills.sh>；CLI 开源于 <https://github.com/vercel-labs/skills>。
- **提交机制**：**无独立提交表单**。CLI/站点从 public GitHub 仓库自动索引标准位置下的 `SKILL.md`（根目录、`skills/`、`.claude/skills/` 等 60+ 路径，目录内最深三层）；也可用根目录 `skills.sh.json` 的 `paths` 声明自定义目录。安装命令 `npx skills add <owner/repo>`。
- **账号 / Key**：发现与索引不需要账号；排名基于匿名安装遥测。
- **人工审核**：例行安全审计；官方说明不保证每个 Skill 的质量，安装前需自行审查。
- **收录形态**：GitHub 仓库链接（不镜像内容），按仓库内 Skill 目录展示。
- **缺口 / 下一步**：先把 `skills/llm-provider-kit/` 推送到远端 `main`，确认 `npx skills find llm-provider-kit` 可检索到；README 可加安装数徽章 `https://skills.sh/b/lawson2019/llm-provider-kit`。

### 4. ClawHub（OpenClaw 生态）—— 待授权

- **入口**：市场 <https://clawhub.ai>（Skill / Plugin 两个页签，技能页 `hub.openclaw.ai/<owner>/<skill>`）；文档 <https://docs.openclaw.ai/tools/creating-skills>。
- **提交机制**：独立 CLI `npm i -g clawhub` → `clawhub login` → `clawhub skill publish ./<skill-dir> [--slug --name --owner --categories --topics]`；目录仓可复用官方 `openclaw/clawhub/.github/workflows/skill-publish.yml` 工作流批量发布。
- **账号 / Key**：ClawHub 账号登录；发布 owner 为个人 handle 或组织内具 `owner`/`admin`/`publisher` 角色者；CI 发布需 `clawhub_token`（仓库 Secrets 名 `CLAWHUB_TOKEN`），后续可配置 OIDC 可信发布。
- **人工审核**：发布后条目先存为 **pending**，对该产物跑自动化安全检查；检查通过前不进入搜索 / 安装 / 下载面；恶意内容、反复失败或超时则不发布。另有统计滥用信号、用户举报与员工人工审核（见 Moderation 文档）。
- **收录形态**：Skill 文件夹（`SKILL.md` + frontmatter + 资源）；插件走 npm 风格包名。元数据：≤3 个 category（固定 slug 表）、≤5 个 topic；保留词（`official`/`verified`/`trusted` 等）被拒绝。
- **缺口 / 下一步**：① 注册/登录 ClawHub 账号并确认可发布 owner；② 本地 `clawhub skill publish --dry-run` 校验；③ 正式发布需在授权会话中执行 `clawhub login` + publish，或在仓库配置 `CLAWHUB_TOKEN` 后走工作流。本轮未安装 CLI、未登录、未发布。

### 5. Smithery —— 待授权

- **入口**：<https://smithery.ai>；CLI 文档 <https://smithery.mintlify.dev/docs/concepts/cli>；Skills API 文档 <https://www.smithery.ai/docs/api-reference/skills/create-a-new-skill-deprecated>。
- **提交机制**：
  - Skills（链接 GitHub 仓库）：API `PUT /skills/{slug}`（旧 `POST /skills`），body `{namespace, slug, gitUrl}`，`gitUrl` 指向含 `SKILL.md` 的 GitHub 仓库；社区 runbook 记录 CLI `smithery skill publish <dir> --namespace <ns> --name <name>`（具体子命令以本机 `smithery skill --help` 为准）。
  - MCP Server：`smithery mcp publish <url|bundle.mcpb> -n <org/server>`。**本 Skill 不是 MCP Server，此通道不适用。**
- **账号 / Key**：`smithery auth login`（OAuth）；API 调用使用 Smithery API Key 作为 Bearer token；需要可发布的 namespace。
- **人工审核**：API 响应含 `listed` 标志；官方文档未写明固定人工审核流程，收录后可再 claim / 管理条目。
- **收录形态**：Skill 链接 GitHub 仓库；MCP 为 URL 或 `.mcpb` 包。
- **缺口 / 下一步**：① 完成 Smithery 账号 OAuth 登录并确认 namespace；② 准备 API Key（如走 API）；③ 远端仓库含可识别的 `SKILL.md` 后再提交链接。本轮未登录、未调用 API。

### 6. Anthropic 官方目录（Claude Directory）—— 待授权 + 形态待改造

- **入口**：开发者门户 <https://claude.ai/directory/manage>；发布规则 <https://claude.com/docs/directory/publish>；插件快速上手 <https://claude.com/docs/plugins/quickstart>。
- **提交机制**：门户网页表单 `Submit new` → 选 **Plugin bundle** 或 **MCP connector**。**Skill 不是独立提交类型**，必须放进插件包：`.claude-plugin/plugin.json` 清单 + `skills/<name>/SKILL.md` + README（≥40 词）+ LICENSE；仓库上线前必须 public。
- **账号 / Key**：claude.ai 账号；**付费计划** Pro / Max / Ultra / Team / Enterprise，Free 不可提交；Team/Enterprise 需 Owner，或 Owner 在组织角色中授予 Directory 权限；listing 归属于提交时所在组织，同一仓库目录首个提交的组织持有该条目。
- **人工审核**：每个版本自动校验 + 安全扫描；**新 listing 上架前有人工审核**；审核时长不固定，状态在门户跟踪。
- **收录形态**：Plugin bundle（可内含 skills / commands / hooks / MCP 引用）。
- **补充通道（非公开目录）**：Claude Skills API `POST /v1/skills`（`x-api-key` + beta header）只能把自定义 Skill 上传到**自己的 workspace**，不形成公开目录收录。
- **缺口 / 下一步**：① 把 Skill 包装成插件包（补 `plugin.json`、README、LICENSE 字段，`claude plugin validate` 通过）；② 由符合计划与角色的 claude.ai 账号在门户提交；③ 等待审核。本轮未做插件打包、未登录门户。
- **另注**：`anthropics/skills` 是 Anthropic 官方示例仓，README 仅说明「看到优秀 Partner Skill 会在此高亮」，无开放第三方提交队列。

### 7. 社区 awesome 聚合仓 —— 待授权（PR，未提交）

- **代表仓**：[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)（1497+ Skill，社区维护）；同类还有 `hesreallyhim/awesome-claude-code`、`chat2anyllm/awesome-claude-skills`（按配置自动目录化）等。
- **提交机制**：fork → PR 修改 README 分类尾部，条目格式 `- **[author/skill-name](https://github.com/author/repo/path)** - 一句话描述（≤10 词）`；PR 标题 `Add skill: author/skill-name`。
- **账号 / Key**：GitHub 账号（fork + PR）。
- **人工审核**：维护者审核全部提交，不符合质量标准可拒绝；**要求已有真实社区使用**，刚创建的新 Skill 不接受，需先积累用户。
- **收录形态**：仅链接，不镜像内容。
- **缺口 / 下一步**：Skill 先在 GitHub 落地并积累安装 / 使用；确认目标仓的条目格式与分类后，再由账号拥有者授权提 PR。本轮按要求**未向任何他人仓库提交 PR/Issue**。

### 8. MCP Registry（官方）—— 不适用

- **入口**：<https://registry.modelcontextprotocol.io>；快速上手 <https://modelcontextprotocol.io/registry/quickstart>。
- **收录形态**：MCP Server 元数据目录（`server.json` + npm / PyPI / NuGet / OCI / MCPB 包，或公开远程端点）；**不收录 Skill**。
- **提交机制（仅备查）**：`mcp-publisher` CLI → `login github`（设备码 OAuth）→ `publish`；GitHub 认证下命名空间须为 `io.github.<username>/*`；包类型有归属校验（npm 用 `package.json` 的 `mcpName` 等）。
- **判定**：当前发布物是 Skill，形态不符，**不适用**。若后续把注册表查询能力包成一个 MCP Server，再评估此通道。

### 9. agentskills.io —— 不适用

开放规范与客户端展示站，定义 Skill 格式，无第三方注册 / 提交流程。

---

## GitHub tag / Release 可行性（基于连接器实测能力）

### 只读实测结果（2026-11-16）

| 项 | 实测值 |
|---|---|
| 现有 tag | 仅 **`v0.3.3`**（annotated tag；指向 commit `bfc0395307ed9db9d0b6499416df5488b63d3a74`；tagger `github-actions[bot]`；2026-11-15T08:39:19Z；tag message `v0.3.3`） |
| Releases | **空列表**（`list_releases` 返回 `[]`） |
| 最新 Release | `get_latest_release` 返回 **404**（尚无任何 Release 对象） |
| 分支 | `main`（HEAD `41ac2b22…`）、`gh-pages`（HEAD `8385af09…`） |
| `package.json` 版本 | `0.6.0`（即：版本号已到 0.6.0，但远端尚无 v0.6.0 tag / Release） |

### 连接器能力边界

GitHub OAuth 连接器目录中与发布相关的工具：

- **只读**：`list_tags`、`list_releases`、`get_latest_release`、`get_release_by_tag`、`get_tag`。
- **可写（代码层）**：`create_or_update_file`、`push_files`、`create_branch`、`create_pull_request`、Issue 相关。
- **缺失**：**没有** `create_tag`（建 git ref / 标注标签）工具，**没有** `create_release` 工具；也不能经连接器执行 `git push --tags`。

### 要发 v0.6.0 tag / Release，缺的步骤

1. 在目标提交（main HEAD 或指定提交）上打 **v0.6.0** 标签（推荐 annotated）；
2. 基于该标签创建 **Release 对象**：标题、Release Notes（可用 `release-notes-0.6.0.md`）、可选附件；
3. （可选）把 tag / Release 信息回写仓库元数据。

### 可行通道（按是否需要额外授权排序）

| 通道 | 做法 | 所需授权 | 连接器能否直接完成 |
|---|---|---|---|
| A. 网页端手动 | GitHub 网页 → Releases → Draft a new release → 输入 `v0.6.0` 并选择/新建标签 → 粘贴 Notes → 发布 | 浏览器内已登录的 GitHub 会话 | 否（连接器无浏览器登录态，也无 release 工具） |
| B. 本机 git + gh | `git tag -a v0.6.0 -m "..."` → `git push origin v0.6.0` → `gh release create v0.6.0` | 本机 git push 凭据 / `GH_TOKEN`；当前本机**无 push 凭据** | 否 |
| C. GitHub Actions 工作流 | 连接器可先写一个 `workflow_dispatch` 工作流：`permissions: contents: write`，用内置 `GITHUB_TOKEN` 执行 `gh release create v0.6.0 ...`（必要时先 `git tag`） | 仓库 Actions 权限策略允许 `contents: write`；工作流文件需先合入 main | 部分：连接器能写 workflow 文件；触发与发布结果需在 Actions 侧确认；连接器本身仍不直接建 tag/release |
| D. REST API + PAT | `POST /repos/lawson2019/llm-provider-kit/git/refs` 建标签；`POST /repos/lawson2019/llm-provider-kit/releases` 建 Release | 带 `repo` 权限的 Personal Access Token；当前**未配置任何 token**，禁止写入明文 token | 否 |

**结论**：v0.6.0 的 tag 与 Release **不能通过当前 GitHub OAuth 连接器直接创建**；最短路径是通道 A（网页端手动），自动化路径是通道 C（补一个受 `contents: write` 保护的发布工作流）。在标签 / Release 创建前，外部只能按 `main` 分支或 commit SHA 引用本 Skill。
