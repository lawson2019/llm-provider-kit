# llm-provider-kit

[English](README.en.md) · **简体中文** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

一份以纯 JSON 提供、无运行时依赖的 **LLM Provider** 元数据注册表，MIT 协议。适合要给 AI 应用、编程助手或模型网关加上 Provider 配置界面的开发者：**108 个 Provider、142 个接入点**。

每个 Provider 条目收录自己的接入点、鉴权方式、表单字段与额度元信息，并按需标注风险标记。

## Demo

在线 Demo（English / 中文）：<https://lawson2019.github.io/llm-provider-kit/>

![Provider 配置界面](docs/preview.svg)

## 交给 AI 编程助手

把下面这段提示词贴给任意编程助手，即可为你的项目生成 Provider 配置界面，无需克隆仓库。

```text
你要为我的项目添加一个 LLM Provider 配置界面。不要克隆任何仓库，只从下面的公开地址取数。

1. 先读 manifest：它给出当前版本、条目计数与规范资源地址，作为基线（Pages 地址优先，raw.githubusercontent.com 为回退）：
   - https://lawson2019.github.io/llm-provider-kit/manifest.json

2. 读 Skill 指南，了解字段映射、鉴权头规则、接入点解析、密钥脱敏与请求预览规则：
   - https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md

3. 按 manifest 中列出的地址拉取注册表数据：
   - Provider 清单：https://lawson2019.github.io/llm-provider-kit/data/providers.json
   - 分层清单：https://lawson2019.github.io/llm-provider-kit/data/tiers.json
   - 结构定义：https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json
   若 Pages 地址不可用，改用 https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/<相对路径>。

4. 判断我项目所使用的技术栈（React、Vue、Svelte、Vanilla JS 或静态 HTML），生成与之匹配的 Provider 配置界面。

5. 界面需包含：
   - 可搜索、可切换的 Provider 选择器。
   - Key / 密钥输入框，不保存、不外发。
   - 按 Provider 选择接入点，仅使用注册表定义的端点与字段（协议、baseURL、路径、计费方式，以及该 Provider 自定义字段）；不要添加注册表未定义的套餐 / 区域选择器。
   - 依据注册表推导鉴权请求头，接入点级规则优先于 Provider 级。
   - 脱敏后的请求预览。
   - 通过 ?provider=<id> 直达深链，id 只能取自 providers.json。

6. 只渲染各条目自己定义的字段，不要编造 Provider、接入点、分层、字段或状态标签。完成前把 Provider 与接入点计数与 manifest 基线核对；若不一致，停下并报告差异，不要靠猜测补齐。
```

## 能生成什么

生成的界面支持五种技术栈——**React · Vue · Svelte · Vanilla JS · 静态 HTML**——包含：

- **Provider 切换**：覆盖全量注册表的可搜索选择器。
- **分层**：Starter（12）、Mainstream（37）、Full（全部 108）。
- **鉴权请求头**：按注册表登记的鉴权方式携带凭证。
- **请求预览**：拼装后的 URL 与请求头，密钥脱敏。
- **深链**：通过 `?provider=` 直达指定 Provider。

## 链接

- [GitHub 仓库](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [provider.schema.json](https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill 目录](skills/llm-provider-kit)
- [安装与使用](docs/install.md)
- [贡献指南](docs/contributing.md)
- [许可证](LICENSE)

## 许可证

MIT。品牌名称与 Logo 归各自所有者。
