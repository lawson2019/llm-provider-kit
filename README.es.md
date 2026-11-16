# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Español** · [Français](README.fr.md)

Registro de metadatos de proveedores de LLM y entornos de ejecución de agentes, distribuido como JSON simple, sin dependencias en tiempo de ejecución y con licencia MIT. Está pensado para quien vaya a añadir una pantalla de configuración de proveedores a una app de IA, un panel de agentes o una pasarela: **108 proveedores / 7 agentes**, cada uno con sus endpoints, esquema de autenticación, campos de formulario, notas de cuota y avisos de riesgo cuando procede.

## Demo

Demo en vivo (English / 中文): <https://lawson2019.github.io/llm-provider-kit/>

![Interfaz de configuración de proveedores](docs/preview.png)

## Dáselo a tu agente

Pega el siguiente prompt en cualquier agente de programación para generar una interfaz de configuración de proveedores para tu proyecto. No es necesario clonar el repositorio.

```text
Vas a añadir una interfaz de configuración de proveedores de LLM a mi proyecto. No clones ningún repositorio.

1. Lee primero estos dos recursos públicos:
   - Guía del Skill: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Registro de proveedores: https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Detecta el stack tecnológico de mi proyecto — React, Vue, Svelte, vanilla JS o HTML estático — y genera una pantalla de configuración de proveedores que se ajuste a él.

3. La pantalla debe incluir:
   - Un selector de proveedores con búsqueda y cambio entre proveedores.
   - Un campo de clave / secreto que nunca se guarda ni se envía a ningún sitio.
   - Selección de endpoint (plan, región, protocolo) por proveedor.
   - Cabeceras de autenticación derivadas del registro.
   - Una vista previa de la solicitud con los secretos ocultados.
   - Enlaces profundos con los parámetros ?provider= / ?agent=.

4. Renderiza solo los campos que define cada proveedor — no inventes proveedores, endpoints, niveles ni etiquetas de estado.
```

## Qué obtienes

La interfaz generada admite cinco stacks: **React · Vue · Svelte · vanilla JS · HTML estático**. Incluye:

- **Cambio de proveedor**: un selector con búsqueda sobre todo el registro.
- **Niveles**: Starter (12), Mainstream (37) y Full (los 108).
- **Cabeceras de autenticación**: credenciales añadidas según el esquema de autenticación del registro.
- **Vista previa de la solicitud**: la URL y las cabeceras ensambladas, con los secretos ocultados.
- **Enlaces profundos**: abre un proveedor o agente concreto mediante `?provider=` / `?agent=`.

## Enlaces

- [Repositorio GitHub](https://github.com/lawson2019/llm-provider-kit)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Directorio del Skill](skills/llm-provider-kit)
- [Instalación y uso](docs/install.md)
- [Contribuir](docs/contributing.md)
- [Licencia](LICENSE)

## Licencia

MIT. Los nombres de marca y los logotipos pertenecen a sus respectivos propietarios.
