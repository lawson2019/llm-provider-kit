# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · **Français**

Registre de métadonnées de fournisseurs LLM et d'agents d'exécution, fourni au format JSON, sans dépendance d'exécution, sous licence MIT. Il s'adresse à toute personne qui ajoute un écran de configuration des fournisseurs à une application IA, un panneau d'agents ou une passerelle : **108 fournisseurs / 7 agents**, chacun avec ses endpoints, son schéma d'authentification, ses champs de formulaire, ses notes de quota et ses indicateurs de risque lorsque cela est pertinent.

## Demo

Démo en ligne (English / 中文) : <https://lawson2019.github.io/llm-provider-kit/>

![Interface de configuration des fournisseurs](docs/preview.png)

## Donnez ceci à votre agent

Collez le prompt ci-dessous dans n'importe quel agent de code pour générer une interface de configuration des fournisseurs pour votre projet. Aucun clone du dépôt n'est requis.

```text
Ajoutez une interface de configuration de fournisseurs LLM à mon projet. Ne clonez aucun dépôt.

1. Lisez d'abord ces deux ressources publiques :
   - Guide du Skill : https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Registre des fournisseurs : https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Détectez la stack technique de mon projet — React, Vue, Svelte, vanilla JS ou HTML statique — et générez un écran de configuration des fournisseurs adapté.

3. L'écran doit inclure :
   - Un sélecteur de fournisseurs avec recherche et changement de fournisseur.
   - Un champ de clé / secret qui n'est jamais enregistré ni envoyé.
   - Le choix de l'endpoint (plan, région, protocole) par fournisseur.
   - Les en-têtes d'authentification dérivés du registre.
   - Un aperçu de la requête avec les secrets masqués.
   - Des liens profonds via les paramètres ?provider= / ?agent=.

4. N'affichez que les champs définis par chaque fournisseur — n'inventez ni fournisseur, ni endpoint, ni niveau, ni libellé de statut.
```

## Ce que vous obtenez

L'interface générée prend en charge cinq stacks : **React · Vue · Svelte · vanilla JS · HTML statique**. Elle comprend :

- **Changement de fournisseur** : un sélecteur avec recherche sur l'ensemble du registre.
- **Niveaux** : Starter (12), Mainstream (37) et Full (les 108).
- **En-têtes d'authentification** : identifiants ajoutés selon le schéma d'authentification du registre.
- **Aperçu de la requête** : l'URL et les en-têtes assemblés, secrets masqués.
- **Liens profonds** : ouverture d'un fournisseur ou d'un agent précis via `?provider=` / `?agent=`.

## Liens

- [Dépôt GitHub](https://github.com/lawson2019/llm-provider-kit)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Répertoire du Skill](skills/llm-provider-kit)
- [Installation et utilisation](docs/install.md)
- [Contribuer](docs/contributing.md)
- [Licence](LICENSE)

## Licence

MIT. Les noms de marque et les logos appartiennent à leurs propriétaires respectifs.
