# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · **Français**

Registre de métadonnées de fournisseurs LLM et d'agents d'exécution, destiné à ceux qui ajoutent un écran de configuration des fournisseurs à une application IA, un panneau d'agents ou une passerelle. Il couvre **108 fournisseurs / 7 agents**, sans dépendance, sous licence MIT.

## Demo

Démo en ligne : <https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## Donnez ceci à votre Agent

Collez le prompt ci-dessous dans n'importe quel agent de code pour générer une interface de configuration des fournisseurs pour votre projet, sans cloner le dépôt.

```text
Tu ajoutes une interface de configuration de fournisseurs LLM à mon projet. Ne clone aucun dépôt.

1. Lis d'abord ces deux ressources publiques :
   - Guide du Skill : https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - Registre des fournisseurs : https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. Détecte le stack de mon projet (React, Vue, Svelte, JS vanilla ou HTML statique) et génère un écran de configuration des fournisseurs adapté.

3. L'écran doit inclure :
   - Un sélecteur de fournisseurs avec recherche et changement de fournisseur ;
   - Un champ de clé / secret qui n'est jamais enregistré ni envoyé ;
   - Le choix de l'endpoint (offre, région, protocole) par fournisseur ;
   - Les en-têtes d'authentification dérivés du registre ;
   - Un aperçu de la requête avec les secrets masqués ;
   - Des liens profonds via les paramètres ?provider= / ?agent=.

4. N'affiche que les champs définis par chaque fournisseur ; n'invente ni fournisseur, ni endpoint, ni libellé de statut.
```

## Ce que vous obtenez

L'interface générée prend en charge cinq stacks : **React · Vue · Svelte · JS vanilla · HTML statique**. Elle comprend :

- **Changement de fournisseur** : sélecteur avec recherche sur tout le registre ;
- **Niveaux** : fournisseurs regroupés en Starter, Mainstream et Full ;
- **En-têtes d'auth** : identifiants selon le schéma d'authentification du registre ;
- **Aperçu de requête** : URL et en-têtes assemblés, secrets masqués ;
- **Liens profonds** : ouverture d'un fournisseur ou d'un agent via `?provider=` / `?agent=`.

## Liens

- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Répertoire du Skill](skills/llm-provider-kit)
- [Guide de contribution](docs/contributing.md)
- [License](LICENSE)

## License

MIT. Les noms de marque et logos appartiennent à leurs propriétaires respectifs.
