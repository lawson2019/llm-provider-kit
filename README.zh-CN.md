# llm-provider-kit

[English](README.md) · **简体中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

一份以纯 JSON 提供、无运行时依赖的 LLM Provider 与 Agent 运行时元数据注册表，MIT 协议。适合要给 AI 应用、Agent 面板或网关加上 Provider 配置界面的开发者：**108 个 Provider / 7 个 Agent**，逐条收录接入点、鉴权方式、表单字段、额度说明，以及按需标注的风险提示。

## Demo

在线 Demo（English / 中文）：<https://lawson2019.github.io/llm-provider-kit/>

![Provider 配置界面](docs/preview.png)

## 复制这段给 Agent

把下面这段提示词贴给任意编程 Agent，即可为你的项目生成 Provider 配置界面，无需克隆仓库。

```text
你要为我的项目添加一个 LLM Provider 配置界面。不要克隆任何仓库。

1. 先读取这两份公开资源：
   - Skill 指南：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Provider 注册表：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. 判断我项目的技术栈（React、Vue、Svelte、原生 JS 或静态 HTML），生成与之匹配的 Provider 配置界面。

3. 界面需包含：
   - 可搜索、可切换的 Provider 选择器。
   - Key / 密钥输入框，不保存、不外发。
   - 按 Provider 选择接入点（套餐、区域、协议）。
   - 依据注册表推导的鉴权请求头。
   - 脱敏后的请求预览。
   - 通过 ?provider= / ?agent= 参数直达指定 Provider 或 Agent 的深链。

4. 只渲染各 Provider 自己定义的字段，不要编造 Provider、接入点、分层或状态标签。
```

## 能生成什么

生成的界面支持五种技术栈——**React · Vue · Svelte · 原生 JS · 静态 HTML**——包含：

- **Provider 切换**：覆盖全量注册表的可搜索选择器。
- **分层**：Starter（12）、Mainstream（37）、Full（全部 108）。
- **鉴权请求头**：按注册表登记的鉴权方式携带凭证。
- **请求预览**：拼装后的 URL 与请求头，密钥脱敏。
- **深链**：通过 `?provider=` / `?agent=` 直达指定 Provider 或 Agent。

## 链接

- [GitHub 仓库](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill 目录](skills/llm-provider-kit)
- [安装与引用](docs/install.md)
- [贡献指南](docs/contributing.md)
- [许可证](LICENSE)

## 许可证

MIT。品牌名称与 Logo 归各自所有者。
