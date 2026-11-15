# llm-provider-kit

[English](README.md) · **简体中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

一份面向 AI 应用、Agent 面板或网关的 LLM Provider 与 Agent 运行时配置元数据注册表，供需要在产品里加入 Provider 配置界面的开发者使用。当前收录 **108 个 Provider / 7 个 Agent**，零依赖，MIT 协议。

## Demo

在线 Demo：<https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## 复制这段给 Agent

把下面这段提示词贴给任意编程 Agent，即可为你的项目生成 Provider 配置界面，无需克隆仓库。

```text
你要为我的项目添加一个 LLM Provider 配置界面。不要克隆任何仓库。

1. 先阅读下面两个公开资源：
   - Skill 指南：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Provider 注册表：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. 判断我项目的技术栈（React、Vue、Svelte、原生 JS 或静态 HTML），生成与之匹配的 Provider 配置界面。

3. 界面需包含：
   - Provider 选择器，可搜索并切换不同 Provider；
   - Key / 密钥输入框，不保存、不外发；
   - 按 Provider 选择接入面（套餐、区域、协议）；
   - 依据注册表推导的鉴权请求头；
   - 脱敏后的请求预览；
   - 通过 ?provider= / ?agent= 参数打开指定 Provider 或 Agent 的深链。

4. 只渲染各 Provider 自己定义的字段，不要编造 Provider、接入面或状态标签。
```

## 能生成什么

生成的界面支持五种技术栈：**React · Vue · Svelte · 原生 JS · 静态 HTML**，包含：

- **Provider 切换**：可搜索的选择器，覆盖全量注册表；
- **分层视图**：按 Starter / Mainstream / Full 分层展示；
- **鉴权头**：按注册表的鉴权方式携带凭证；
- **请求预览**：拼装后的 URL 与请求头，密钥脱敏；
- **深链**：通过 `?provider=` / `?agent=` 直达指定 Provider 或 Agent。

## 链接

- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill 目录](skills/llm-provider-kit)
- [贡献指南](docs/contributing.md)
- [License](LICENSE)

## License

MIT。品牌名称与 Logo 归各自所有者。
