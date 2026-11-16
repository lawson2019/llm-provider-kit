# llm-provider-kit

[English](README.en.md) · [简体中文](README.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

LLM プロバイダーのメタデータレジストリで、プレーンな JSON として提供され、実行時の依存関係はなく、MIT ライセンスです。AI アプリ、コーディングアシスタント、またはゲートウェイにプロバイダー設定画面を追加するすべての人を対象としています。**108 プロバイダー、142 エンドポイント** を収録しています。

各プロバイダーのエントリは、自身のエンドポイント、認証方式、フォーム項目、クォータのメタデータを備え、該当する場合にリスクフラグを付けています。

## Demo

ライブデモ（English / 中文）：<https://lawson2019.github.io/llm-provider-kit/>

![プロバイダー設定 UI](docs/preview.svg)

## コーディングアシスタントに渡すプロンプト

以下のプロンプトを任意のコーディングアシスタントに貼り付けると、あなたのプロジェクト向けのプロバイダー設定 UI を生成できます。リポジトリのクローンは不要です。

```text
あなたは私のプロジェクトに LLM プロバイダー設定 UI を追加します。リポジトリをクローンしないで、以下の公開 URL だけを取得してください。

1. まず manifest を読んでください。manifest には現在のバージョン、レコード件数、正規のリソース URL が記載されています。これを基線とします。Pages の URL を優先して、raw.githubusercontent.com をフォールバックとしてください：
   - https://lawson2019.github.io/llm-provider-kit/manifest.json

2. Skill ガイドを読んで、フィールドのマッピング、認証ヘッダーのルール、エンドポイントの解決、シークレットのマスク、リクエストプレビューのルールを確認してください：
   - https://lawson2019.github.io/llm-provider-kit/skills/llm-provider-kit/SKILL.md

3. manifest に記載されたレジストリデータを取得してください：
   - プロバイダー：https://lawson2019.github.io/llm-provider-kit/data/providers.json
   - ティア：https://lawson2019.github.io/llm-provider-kit/data/tiers.json
   - スキーマ：https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json
   Pages の URL が利用できない場合は、https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/<相対パス> を使用してください。

4. 私のプロジェクトのスタックを検出してください（React、Vue、Svelte、バニラ JS、または静的 HTML）。そのスタックに合ったプロバイダー設定画面を生成してください。

5. 画面には以下を含めてください：
   - プロバイダーを検索・切り替えられる選択ピッカー。
   - 保存も送信もされない Key / シークレット入力欄。
   - プロバイダーごとのエンドポイント選択。レジストリが定義するエンドポイントとフィールドのみを使用してください（プロトコル、baseURL、パス、課金方式、およびそのプロバイダー固有のフィールド）。レジストリが定義していないプランやリージョンの選択ピッカーは追加しないでください。
   - レジストリから導出した認証ヘッダー。エンドポイントレベルのルールはプロバイダーレベルの方式より優先されます。
   - シークレットをマスクしたリクエストプレビュー。
   - ?provider=<id> を使ったディープリンク。ID は providers.json からのみ取得してください。

6. 各エントリが定義するフィールドのみを描画して、プロバイダー、エンドポイント、ティア、フィールド、ステータスラベルを自作しないでください。完了前に、プロバイダーとエンドポイントの件数を manifest と照合してください。一致しない場合は、穴埋めせずに停止して不一致を報告してください。
```

## 生成できるもの

生成される UI は 5 つのスタック——**React · Vue · Svelte · バニラ JS · 静的 HTML**——に対応し、以下を含みます：

- **プロバイダー切替**：全レジストリを対象に検索できる選択ピッカーを備えます。
- **ティア**：Starter（12）、Mainstream（37）、Full（全 108）。
- **認証ヘッダー**：レジストリの認証方式に沿って認証情報を付与します。
- **リクエストプレビュー**：組み立てた URL とヘッダーを表示し、シークレットはマスクします。
- **ディープリンク**：`?provider=` で特定のプロバイダーを開きます。

## リンク

- [GitHub リポジトリ](https://github.com/lawson2019/llm-provider-kit)
- [manifest.json](https://lawson2019.github.io/llm-provider-kit/manifest.json)
- [llms.txt](https://lawson2019.github.io/llm-provider-kit/llms.txt)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [provider.schema.json](https://lawson2019.github.io/llm-provider-kit/schemas/provider.schema.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill ディレクトリ](skills/llm-provider-kit)
- [インストールと使い方](docs/install.md)
- [コントリビューションガイド](docs/contributing.md)
- [ライセンス](LICENSE)

## ライセンス

MIT。ブランド名とロゴは各所有者に帰属します。
