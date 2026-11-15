# llm-provider-kit

**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

A metadata registry of LLM providers and agent runtimes, built for anyone adding a provider configuration screen to an AI app, an agent panel, or a gateway. It ships **108 providers / 7 agents**, zero dependencies, MIT licensed.

## Demo

Live demo: <https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## Give this to your Agent

Paste the prompt below into any coding agent to generate a provider configuration UI for your own project — no repository clone required.

```text
You are adding an LLM provider configuration UI to my project. Do NOT clone any repository.

1. Read these two public resources first:
   - Skill guide: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Provider registry: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Detect my project's tech stack — React, Vue, Svelte, vanilla JS, or static HTML — and generate a provider configuration screen that matches it.

3. The screen must include:
   - A provider picker to search and switch between providers;
   - A Key / secret input that is never saved or sent anywhere;
   - Endpoint selection (plan, region, protocol) per provider;
   - Authentication headers derived from the registry;
   - A request preview with secrets masked;
   - Deep links using ?provider= / ?agent= parameters.

4. Render only the fields each provider defines; do not invent providers, endpoints, or status labels.
```

## What you get

The generated UI supports five target stacks: **React · Vue · Svelte · vanilla JS · static HTML**. It includes:

- **Provider switching** — a searchable picker across the full registry;
- **Tiers** — providers grouped into Starter, Mainstream, and Full views;
- **Auth headers** — credentials attached per the registry's auth scheme;
- **Request preview** — assembled URL and headers, secrets masked;
- **Deep links** — open a specific provider or agent via `?provider=` / `?agent=`.

## Links

- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill directory](skills/llm-provider-kit)
- [Contributing guide](docs/contributing.md)
- [License](LICENSE)

## License

MIT. Brand names and logos belong to their respective owners.
