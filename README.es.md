# llm-provider-kit

[English](README.en.md) · [简体中文](README.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · **Español** · [Français](README.fr.md)

Registro de metadatos de proveedores de LLM, distribuido como JSON en bruto, sin dependencias en tiempo de ejecución y con licencia MIT. Está pensado para quien vaya a añadir una pantalla de configuración de proveedores a una app de IA, un asistente de programación o una pasarela: **108 proveedores y 142 endpoints**.

Cada entrada de proveedor incluye sus propios endpoints, esquema de autenticación, campos de formulario y metadatos de cuota, con avisos de riesgo cuando procede.

## Demo

Demo en vivo (English / 中文): <https://lawson2019.github.io/llm-provider-kit/>

![Interfaz de configuración de proveedores](docs/preview.svg)

## Dáselo a tu asistente de programación

Pega el siguiente prompt en cualquier asistente de programación para generar una interfaz de configuración de proveedores para tu proyecto. No es necesario clonar el repositorio.

```text
Vas a añadir una interfaz de configuración de proveedores de LLM a mi proyecto. No clones ningún repositorio; obtén solo las direcciones públicas que se indican a continuación.

1. Lee primero el manifest. Proporciona la versión actual, el recuento de registros y las direcciones canónicas de los recursos; úsalo como línea de base, con las direcciones de Pages como principal y raw.githubusercontent.com como respaldo:
   - https://lawson2019.github.io/llm-provider-kit/manifest.json

2. Lee la guía del Skill para el mapeo de campos, las reglas de cabeceras de autenticación, la resolución de endpoints, el enmascarado de secretos y las reglas de vista previa de la solicitud:
   - https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md

3. Obtén los datos del registro que figuran en el manifest:
   - Proveedores: https://lawson2019.github.io/llm-provider-kit/data/providers.json
   - Niveles: https://lawson2019.github.io/llm-provider-kit/data/tiers.json
   - Esquema: https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json
   Si una dirección de Pages no funciona, usa https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/<ruta-relativa>.

4. Detecta el stack tecnológico de mi proyecto — React, Vue, Svelte, vanilla JS o HTML estático — y genera una pantalla de configuración de proveedores que se ajuste a él.

5. La pantalla debe incluir:
   - Un selector con búsqueda para cambiar entre proveedores.
   - Tres modos de alcance de proveedores: comunes (nivel Starter), todos y personalizado con casillas; los ids personalizados deben provenir de providers.json.
   - Panel compacto de configuración en tiempo de ejecución: Base URL, API Key y Model ID; si existe probe.modelsUrl, permite listar modelos y elegir uno, manteniendo la entrada manual.
   - Modelo personalizado: guarda un Model ID y un nombre visible opcional; solo se guardan localmente los metadatos del modelo, nunca la clave. La entrada guardada se añade al selector de modelos.
   - Un campo de clave / secreto que nunca se guarda ni se registra; solo se envía al proveedor seleccionado cuando el usuario pulsa explícitamente «Listar modelos».
   - Iconos de proveedor opcionales con un interruptor para ocultarlos.
   - Selección de endpoints por proveedor, usando solo los endpoints y campos definidos por el registro (protocolo, baseURL, ruta, facturación y cualquier campo específico del proveedor); no añadas selectores de plan o región que el registro no defina.
   - Cabeceras de autenticación derivadas del registro, con las reglas a nivel de endpoint prevaleciendo sobre el esquema a nivel de proveedor.
   - Una vista previa de la solicitud con los secretos enmascarados.
   - Enlaces profundos con ?provider=<id>, cuyos identificadores se toman únicamente de providers.json.

6. Renderiza solo los campos que define cada entrada — no inventes proveedores, endpoints, niveles, campos ni etiquetas de estado. Antes de terminar, comprueba el recuento de proveedores y endpoints contra el manifest; si no coinciden, para el proceso y reporta la discrepancia en lugar de rellenar los huecos por adivinación.
```

## Qué obtienes

La interfaz generada admite cinco stacks — **React · Vue · Svelte · vanilla JS · HTML estático** — e incluye:

- **Configuración rápida**: Base URL, API Key, Model ID, listado de modelos, modelos personalizados e interruptor de iconos.
- **Niveles**: Starter (12), Mainstream (37) y Full (los 108).
- **Cabeceras de autenticación**: credenciales añadidas según el esquema de autenticación del registro.
- **Vista previa de la solicitud**: la URL y las cabeceras ensambladas, con los secretos enmascarados.
- **Enlaces profundos**: abre un proveedor concreto mediante `?provider=`.

## Enlaces

- [Repositorio GitHub](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [provider.schema.json](https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Directorio del Skill](skills/llm-provider-kit)
- [Instalación y uso](docs/install.md)
- [Contribuir](docs/contributing.md)
- [Licencia](LICENSE)

## Licencia

MIT. Los nombres de marca y los logotipos pertenecen a sus respectivos propietarios.
