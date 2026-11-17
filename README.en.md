# llm-provider-kit

[简体中文](README.md) · **English** · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

A metadata registry for LLM providers, shipped as plain JSON with no runtime dependencies, MIT licensed. It is for anyone adding a provider configuration screen to an AI app, a coding assistant, or a gateway: **108 providers and 142 endpoints**.

Each provider entry carries its own endpoints, auth scheme, form fields, and quota metadata, with risk flags where relevant.

## Demo

Live demo (English / 中文): <https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.svg)

## Give this to your coding assistant

Paste the prompt below into any coding assistant to generate a provider configuration UI for your project. No repository clone required.

```text
You are adding an LLM provider configuration UI to my project. Do NOT clone any repository; fetch only the public URLs below.

1. Read the manifest first. It gives the current version, record counts, and the canonical resource URLs — use it as the baseline, with the Pages URLs as primary and raw.githubusercontent.com as fallback:
   - https://lawson2019.github.io/llm-provider-kit/manifest.json

2. Read the Skill guide for field mapping, auth-header rules, endpoint resolution, secret masking, and request-preview rules:
   - https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md

3. Fetch the registry data listed in the manifest:
   - Providers: https://lawson2019.github.io/llm-provider-kit/data/providers.json
   - Tiers: https://lawson2019.github.io/llm-provider-kit/data/tiers.json
   - Schema: https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json
   If a Pages URL fails, use https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/<relative-path>.

4. Detect my project's stack — React, Vue, Svelte, vanilla JS, or static HTML — and generate a matching provider configuration screen.

5. The screen must include:
   - A searchable picker to switch between providers.
   - Three provider-scope modes: common (starter tier), all, and custom checkboxes; custom IDs must come from providers.json.
   - A compact runtime panel with Base URL, API Key, and Model ID; when probe.modelsUrl exists, list models and let the user pick one, with manual entry as fallback.
   - A custom-model action: save a Model ID plus an optional display name; only model metadata is stored locally, never the key, and the saved entry joins the model picker.
   - A key/secret input that is never saved or logged; it is sent only to the selected provider when the user explicitly lists models.
   - Optional provider icons with a toggle.
   - Endpoint selection per provider, using only the endpoints and fields the registry defines (protocol, baseURL, path, billing, and any provider-specific field); do not add plan or region selectors the registry does not define.
   - Auth headers derived from the registry, with endpoint-level rules overriding the provider-level scheme.
   - A request preview with secrets masked.
   - Deep links using ?provider=<id>, with IDs taken only from providers.json.

6. Render only the fields each entry defines — do not invent providers, endpoints, tiers, fields, or status labels. Before you finish, check the provider and endpoint counts against the manifest; if they differ, stop and report the mismatch instead of filling the gaps.
```

## What you get

The generated UI supports five stacks — **React · Vue · Svelte · vanilla JS · static HTML** — and includes:

- **Quick runtime config**: Base URL, API Key, Model ID, model listing, custom models, and an icon toggle.
- **Tiers**: Starter (12), Mainstream (37), and Full (all 108).
- **Auth headers**: credentials attached per the registry's auth scheme.
- **Request preview**: the assembled URL and headers, secrets masked.
- **Deep links**: open a specific provider via `?provider=`.

## Links

- [GitHub repository](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [provider.schema.json](https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill directory](skills/llm-provider-kit)
- [Install & usage](docs/install.md)
- [Contributing](docs/contributing.md)
- [License](LICENSE)

## License

MIT. Brand names and logos belong to their respective owners.
