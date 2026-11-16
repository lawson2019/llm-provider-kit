# llm-provider-kit

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

A metadata registry of LLM providers and agent runtimes, shipped as plain JSON with no runtime dependencies, MIT licensed. It is for anyone adding a provider configuration screen to an AI app, an agent panel, or a gateway: **108 providers / 7 agents**, each with endpoints, auth scheme, form fields, quota notes, and risk flags where relevant.

## Demo

Live demo (English / 中文): <https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## Give this to your Agent

Paste the prompt below into any coding agent to generate a provider configuration UI for your project. No repository clone required.

```text
You are adding an LLM provider configuration UI to my project. Do NOT clone any repository.

1. Read these two public resources first:
   - Skill guide: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Provider registry: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Detect my project's tech stack — React, Vue, Svelte, vanilla JS, or static HTML — and generate a provider configuration screen that matches it.

3. The screen must include:
   - A provider picker to search and switch between providers.
   - A Key / secret input that is never saved or sent anywhere.
   - Endpoint selection (plan, region, protocol) per provider.
   - Authentication headers derived from the registry.
   - A request preview with secrets masked.
   - Deep links using ?provider= / ?agent= parameters.

4. Render only the fields each provider defines — do not invent providers, endpoints, tiers, or status labels.
```

## What you get

The generated UI supports five stacks — **React · Vue · Svelte · vanilla JS · static HTML** — and includes:

- **Provider switching**: a searchable picker across the full registry.
- **Tiers**: Starter (12), Mainstream (37), and Full (all 108).
- **Auth headers**: credentials attached per the registry's auth scheme.
- **Request preview**: the assembled URL and headers, secrets masked.
- **Deep links**: open a specific provider or agent via `?provider=` / `?agent=`.

## Links

- [GitHub repository](https://github.com/lawson2019/llm-provider-kit)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill directory](skills/llm-provider-kit)
- [Install & usage](docs/install.md)
- [Contributing](docs/contributing.md)
- [License](LICENSE)

## License

MIT. Brand names and logos belong to their respective owners.
