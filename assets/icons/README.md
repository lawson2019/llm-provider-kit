# 图标策略

本仓库不保存任何厂商 Logo 的独立二进制文件，只保存图标引用：Lobe Icons 的 `slug`，或厂商官网 favicon 的 `url`；Demo 构建缓存 `data/icon-embeds.json` 内嵌这些图标，仅用于页面渲染。

## slug 的来源

`icon.source: "lobe-icons"` 时，`icon.slug` 对应 [Lobe Icons](https://github.com/lobehub/lobe-icons) 的静态图标命名，例如：

| Provider | slug |
|---|---|
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| Google Gemini | `google` |
| Azure OpenAI | `azure` |
| AWS Bedrock | `aws` |
| DeepSeek | `deepseek` |
| Moonshot Kimi | `moonshot` |
| 智谱 GLM | `zhipu` |
| Z.ai | `zai` |
| 阿里云百炼 / Qwen | `qwen` |
| 火山方舟 | `volcengine` |
| 百度千帆 | `baidu` |
| 腾讯混元 | `hunyuan` |
| MiniMax | `minimax` |
| 硅基流动 | `siliconcloud` |
| OpenRouter | `openrouter` |
| Groq | `groq` |
| Mistral | `mistral` |
| xAI | `xai` |
| Together | `together` |
| Cloudflare | `cloudflare` |
| Ollama | `ollama` |
| vLLM | `vllm` |
| LM Studio | `lmstudio` |

## 找不到品牌图标时

`icon.source: "favicon"` + `icon.url` 指向厂商官网 favicon（当前用 `https://icon.horse/icon/{docs-host}` 取图），`icon.slug` 保留 Provider ID 便于检索。仓库不下载、不提交 Logo 文件。

## Demo 如何取图

`scripts/build-demo.mjs` 会读取 `data/icon-embeds.json`，把每个 Provider 的图标内嵌成 data URI 写进 `demo/index.html`；因此 Demo 运行时**不依赖** unpkg / icon.horse，离线打开也能看到全部图标。

`data/icon-embeds.json` 只是构建缓存：`providers.json` 仍保留 `slug` 或官网 favicon URL，不把图标二进制塞进注册表。Lobe 图标优先取 `-color.svg` 彩色版；没有彩色版的单色 SVG 会按 `icon.color` / `brandColor` 着色，避免整页黑白。图片加载完成前先显示**品牌色首字母块**；加载失败（图标缺失、data URI 损坏）时保持首字母块，不会出现空白。

## 使用方注意

- 如果你的产品要内嵌图标，请自行引入 `@lobehub/icons-static-svg` 或品牌官方资源，并遵守各自的商标 / 使用规范；
- 不要在仓库里提交厂商 Logo 的 PNG / SVG 二进制文件；
- 厂商改名或品牌升级时，只需更新 `slug` 与 `brandColor`；
- 找不到真实 slug 时不要造一个「差不多」的名字：改用 `source: "favicon"`，或先留回退，再补映射。

## 许可

图标代码与组织方式遵循 Lobe Icons 项目的许可；**品牌名称、Logo、商标归各自所有者**，本仓库仅作引用与识别用途。
