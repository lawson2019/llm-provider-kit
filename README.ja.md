# llm-provider-kit

[English](README.md) · [简体中文](README.zh-CN.md) · **日本語** · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md)

AI アプリ、Agent パネル、ゲートウェイに Provider 設定画面を追加したい人向けの、LLM プロバイダーと Agent ランタイムのメタデータレジストリです。現在 **108 プロバイダー / 7 エージェント**、依存関係ゼロ、MIT ライセンスです。

## Demo

オンラインデモ：<https://lawson2019.github.io/llm-provider-kit/>

![Provider configuration UI](docs/preview.png)

## Agent に渡すプロンプト

以下のプロンプトを任意のコーディング Agent に貼り付けると、リポジトリをクローンせずに自プロジェクト向けの Provider 設定 UI を生成できます。

```text
あなたは私のプロジェクトに LLM プロバイダー設定 UI を追加します。リポジトリはクローンしないでください。

1. まず次の公開リソースを読んでください：
   - Skill ガイド：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md
   - プロバイダーレジストリ：https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json

2. プロジェクトの技術スタック（React、Vue、Svelte、バニラ JS、静的 HTML）を判断し、それに合ったプロバイダー設定画面を生成してください。

3. 画面には以下を含めてください：
   - プロバイダーを検索・切り替えられる選択ピッカー；
   - 保存・送信されない Key / シークレット入力欄；
   - プロバイダーごとのエンドポイント選択（プラン・リージョン・プロトコル）；
   - レジストリから導出した認証ヘッダー；
   - シークレットをマスクしたリクエストプレビュー；
   - ?provider= / ?agent= パラメータによるディープリンク。

4. 各プロバイダーが定義するフィールドのみを描画し、プロバイダー・エンドポイント・ステータスラベルを自作しないでください。
```

## 生成できるもの

生成 UI は React / Vue / Svelte / バニラ JS / 静的 HTML の 5 スタックに対応します。含まれるもの：

- **プロバイダー切替**：検索可能なピッカーで全レジストリを切替；
- **階層ビュー**：Starter / Mainstream / Full の階層にグループ化；
- **認証ヘッダー**：レジストリの認証方式に沿って認証情報を付与；
- **リクエストプレビュー**：組み立てた URL とヘッダー、シークレットはマスク；
- **ディープリンク**：`?provider=` / `?agent=` で特定のプロバイダーや Agent を開く。

## リンク

- [providers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/providers.json)
- [agents.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/agents.json)
- [tiers.json](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/data/tiers.json)
- [SKILL.md](https://raw.githubusercontent.com/lawson2019/llm-provider-kit/main/skills/llm-provider-kit/SKILL.md)
- [Skill ディレクトリ](skills/llm-provider-kit)
- [貢献ガイド](docs/contributing.md)
- [License](LICENSE)

## License

MIT。ブランド名とロゴは各所有者に帰属します。
