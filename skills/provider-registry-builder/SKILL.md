---
name: provider-registry-builder
display_name: "Provider 配置页生成（已废弃）"
description: "[已废弃 DEPRECATED] 本 Skill 已收敛为兼容入口，配置页生成能力迁移到 llm-provider-kit。新任务请直接使用 llm-provider-kit（支持 react / vue / svelte / vanilla / html 五栈、公开数据直读、分层选择与脱敏请求预览）。本目录仅保留旧命令的委托入口，不要在这里新增模板或字段逻辑。"
---

# ⚠️ 已废弃：请迁移到 `llm-provider-kit`

本 Skill `provider-registry-builder` 已不再维护为独立的活动 Skill。**所有生成逻辑、模板与文档以新 Skill 为准：**

- **新 Skill**：[`../llm-provider-kit/SKILL.md`](../llm-provider-kit/SKILL.md)
- **字段 / 枚举 / 协议速查**：[`../llm-provider-kit/reference.md`](../llm-provider-kit/reference.md)
- **需求示例**：[`../llm-provider-kit/examples/README.md`](../llm-provider-kit/examples/README.md)

## 为什么迁移

旧 Skill 只支持 React 与 vanilla 两种栈，且假设数据来自本地仓库。新 Skill `llm-provider-kit`：

- 支持 `react` / `vue` / `svelte` / `vanilla` / `html` 五种技术栈；
- 可直接读取公开 Pages / raw URL 上的注册表数据，无需 clone 仓库（`--data` 传入下载快照）；
- 字段、接入面、鉴权头与请求预览仍全部由注册表数据推导，不手写死字段。

## 旧命令仍然可用（兼容委托）

为避免打断已有脚本与文档，本目录的 wrapper 会把参数原样转发到根目录生成器，旧的 `--stack react` / `--stack vanilla` 命令继续可用：

```bash
# 旧命令（兼容保留，等价于调用根目录 scripts/scaffold.mjs）
node skills/provider-registry-builder/scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
node skills/provider-registry-builder/scripts/scaffold.mjs --tier starter --stack vanilla --out ../my-static-page
```

等价的新写法（推荐）：

```bash
node skills/llm-provider-kit/scripts/scaffold.mjs --tier starter --stack react --out ../my-key-page
node skills/llm-provider-kit/scripts/scaffold.mjs --tier starter --stack vanilla --out ../my-static-page
```

新增栈 `vue` / `svelte` / `html` 只在新 Skill 中提供文档与模板；旧入口透传参数，若传入这三个栈也会由新生成器处理，但用法说明请查新 Skill。

## 迁移方式

1. 把调用本 Skill 的 prompt / 脚本改为指向 `llm-provider-kit`；
2. 需要新技术栈时，按新 Skill 的「技术栈决策表」选 `--stack`；
3. 不要在本目录复制或修改模板、字段逻辑；模板统一维护在 `skills/llm-provider-kit/assets/`；
4. 旧生成产物无需返工：已生成的 react / vanilla 页面继续可用，重新生成时走新命令即可。

## 边界（与新 Skill 一致）

- 不新增 Provider、不联网拉取页面、不提交任何真实 Key / JWT / Cookie；
- 生成页只负责配置 UI 与脱敏预览，不转发请求、不持久化密钥。
