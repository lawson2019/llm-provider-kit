# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Español** · [Français](README.fr.md)

Registro de metadatos de proveedores de LLM y entornos de ejecución de agentes, pensado para quien quiera añadir una pantalla de configuración de proveedores a una app de IA, un panel de agentes o una pasarela. Incluye **108 proveedores / 7 agentes**, sin dependencias, licencia MIT.

## Demo

Demo en vivo: <https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## Dáselo a tu Agent

Pega el mensaje siguiente en cualquier agente de programación para generar una interfaz de configuración de proveedores para tu proyecto, sin clonar el repositorio.

```text
Vas a añadir una interfaz de configuración de proveedores LLM a mi proyecto. No clones ningún repositorio.

1. Lee primero estos dos recursos públicos:
   - Guía del Skill: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Registro de proveedores: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Detecta el stack de mi proyecto (React, Vue, Svelte, JS vanilla o HTML estático) y genera una pantalla de configuración de proveedores que encaje con él.

3. La pantalla debe incluir:
   - Un selector de proveedores con búsqueda y cambio entre proveedores;
   - Un campo de Key / secreto que no se guarda ni se envía a ningún sitio;
   - Selección de endpoint (plan, región, protocolo) por proveedor;
   - Cabeceras de autenticación derivadas del registro;
   - Una vista previa de la solicitud con secretos ocultados;
   - Enlaces profundos con los parámetros ?provider= / ?agent=.

4. Renderiza solo los campos que define cada proveedor; no inventes proveedores, endpoints ni etiquetas de estado.
```

## Qué obtienes

La interfaz generada admite cinco stacks: **React · Vue · Svelte · JS vanilla · HTML estático**. Incluye:

- **Cambio de proveedor**: selector con búsqueda sobre todo el registro;
- **Niveles**: proveedores agrupados en Starter, Mainstream y Full;
- **Cabeceras de auth**: credenciales según el esquema de autenticación del registro;
- **Vista previa de solicitud**: URL y cabeceras ensambladas, secretos ocultados;
- **Enlaces profundos**: abre un proveedor o agente con `?provider=` / `?agent=`.

## Enlaces

- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Directorio del Skill](skills/llm-provider-kit)
- [Guía de contribución](docs/contributing.md)
- [License](LICENSE)

## License

MIT. Los nombres de marca y los logotipos pertenecen a sus respectivos propietarios.
