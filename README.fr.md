# llm-provider-kit

[English](README.en.md) · [简体中文](README.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · **Français**

Registre de métadonnées de fournisseurs LLM, fourni en JSON brut, sans dépendances d'exécution, sous licence MIT. Il s'adresse à toute personne qui ajoute un écran de configuration des fournisseurs à une application d'IA, un assistant de programmation ou une passerelle : **108 fournisseurs et 142 endpoints**.

Chaque entrée de fournisseur porte ses propres endpoints, son schéma d'authentification, ses champs de formulaire et ses métadonnées de quota, avec des indicateurs de risque lorsque cela est pertinent.

## Demo

Démo en ligne (English / 中文) : <https://lawson2019.github.io/llm-provider-kit/>

![Interface de configuration des fournisseurs](docs/preview.svg)

## Donnez ceci à votre assistant de programmation

Collez le prompt ci-dessous dans n'importe quel assistant de programmation pour générer une interface de configuration des fournisseurs pour votre projet. Aucun clone du dépôt n'est requis.

```text
Vous ajoutez une interface de configuration de fournisseurs LLM à mon projet. Ne clonez aucun dépôt ; ne récupérez que les URL publiques ci-dessous.

1. Lisez d'abord le manifest. Il indique la version actuelle, le nombre d'enregistrements et les URL canoniques des ressources — utilisez-le comme référence de base, les URL Pages étant prioritaires et raw.githubusercontent.com servant de repli :
   - https://lawson2019.github.io/llm-provider-kit/manifest.json

2. Lisez le guide du Skill pour le mapping des champs, les règles d'en-têtes d'authentification, la résolution des endpoints, le masquage des secrets et les règles d'aperçu de la requête :
   - https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md

3. Récupérez les données du registre listées dans le manifest :
   - Fournisseurs : https://lawson2019.github.io/llm-provider-kit/data/providers.json
   - Niveaux : https://lawson2019.github.io/llm-provider-kit/data/tiers.json
   - Schéma : https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json
   Si une URL Pages échoue, utilisez https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/<chemin-relatif>.

4. Détectez la stack technique de mon projet — React, Vue, Svelte, vanilla JS ou HTML statique — et générez un écran de configuration des fournisseurs adapté.

5. L'écran doit inclure :
   - Un sélecteur avec recherche et basculement entre fournisseurs.
   - Un champ de clé / secret qui n'est jamais enregistré ni envoyé.
   - Sélection d'endpoints par fournisseur, en utilisant uniquement les endpoints et champs définis par le registre (protocole, baseURL, chemin, facturation et tout champ spécifique au fournisseur) ; n'ajoutez pas de sélecteurs de plan ou de région non définis par le registre.
   - En-têtes d'authentification dérivés du registre, les règles au niveau de l'endpoint prévalant sur le schéma au niveau du fournisseur.
   - Un aperçu de la requête avec les secrets masqués.
   - Des liens profonds utilisant ?provider=<id>, les identifiants provenant uniquement de providers.json.

6. Affichez uniquement les champs définis par chaque entrée — n'inventez pas de fournisseurs, d'endpoints, de niveaux, de champs ni de libellés de statut. Avant de terminer, vérifiez les comptes de fournisseurs et d'endpoints contre le manifest ; en cas d'écart, arrêtez-vous et signalez la discordance au lieu de combler les lacunes par devinette.
```

## Ce que vous obtenez

L'interface générée prend en charge cinq stacks — **React · Vue · Svelte · vanilla JS · HTML statique** — et comprend :

- **Changement de fournisseur** : un sélecteur avec recherche sur l'ensemble du registre.
- **Niveaux** : Starter (12), Mainstream (37) et Full (les 108).
- **En-têtes d'authentification** : identifiants ajoutés selon le schéma d'authentification du registre.
- **Aperçu de la requête** : l'URL et les en-têtes assemblés, secrets masqués.
- **Liens profonds** : ouverture d'un fournisseur précis via `?provider=`.

## Liens

- [Dépôt GitHub](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [provider.schema.json](https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Répertoire du Skill](skills/llm-provider-kit)
- [Installation et utilisation](docs/install.md)
- [Contribuer](docs/contributing.md)
- [Licence](LICENSE)

## Licence

MIT. Les noms de marque et les logos appartiennent à leurs propriétaires respectifs.
