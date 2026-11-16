# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

LLM プロバイダーとエージェントランタイムのメタデータレジストリで、プレーンな JSON として提供され、実行時の依存関係はなく、MIT ライセンスです。AI アプリ、エージェントパネル、ゲートウェイにプロバイダー設定画面を追加するすべての人を対象としています。**108 プロバイダー / 7 エージェント** を収録し、エンドポイント、認証方式、フォーム項目、クォータに関するメモ、該当する場合のリスク情報を備えています。

## Demo

ライブデモ（English / 中文）：<https://lawson2019.github.io/llm-provider-kit/>

![プロバイダー設定 UI](docs/preview.png)

## エージェントに渡すプロンプト

以下のプロンプトを任意のコーディングエージェントに貼り付けると、あなたのプロジェクト向けのプロバイダー設定 UI を生成できます。リポジトリのクローンは不要です。

```text
あなたは私のプロジェクトに LLM プロバイダー設定 UI を追加します。リポジトリをクローンしないでください。

1. まず次の 2 つの公開リソースを読んでください：
   - Skill ガイド：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - プロバイダーレジストリ：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. プロジェクトの技術スタック（React、Vue、Svelte、バニラ JS、静的 HTML）を判別し、それに合ったプロバイダー設定画面を生成してください。

3. 画面には以下を含めてください：
   - プロバイダーを検索・切り替えられる選択ピッカー。
   - 保存も送信もされない Key / シークレット入力欄。
   - プロバイダーごとのエンドポイント選択（プラン・リージョン・プロトコル）。
   - レジストリから導出した認証ヘッダー。
   - シークレットをマスクしたリクエストプレビュー。
   - ?provider= / ?agent= パラメータを使ったディープリンク。

4. 各プロバイダーが定義するフィールドのみを描画し、プロバイダー、エンドポイント、ティア、ステータスラベルを自作しないでください。
```

## 生成できるもの

生成される UI は 5 つのスタック——**React · Vue · Svelte · バニラ JS · 静的 HTML**——に対応し、以下を含みます：

- **プロバイダー切替**：全レジストリを対象に検索できる選択ピッカーを備えます。
- **ティア**：Starter（12）、Mainstream（37）、Full（全 108）。
- **認証ヘッダー**：レジストリの認証方式に沿って認証情報を付与します。
- **リクエストプレビュー**：組み立てた URL とヘッダーを表示し、シークレットはマスクします。
- **ディープリンク**：`?provider=` / `?agent=` で特定のプロバイダーやエージェントを開きます。

## リンク

- [GitHub リポジトリ](https://github.com/lawson2019/llm-provider-kit)
- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill ディレクトリ](skills/llm-provider-kit)
- [インストールと使い方](docs/install.md)
- [コントリビュートガイド](docs/contributing.md)
- [ライセンス](LICENSE)

## ライセンス

MIT。ブランド名とロゴは各所有者に帰属します。
