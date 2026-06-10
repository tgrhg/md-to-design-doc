# Material Design Docs サンプルポータル

このリポジトリは、設計書を **Markdown** で管理し、GitHub Pages に静的サイトとして公開する検証用のサンプルです。UI は Material Design の考え方を参考に、読みやすい余白、角丸カード、サイドナビ、状態が分かるナビゲーションを備えたドキュメントサイトとして生成します。

## 検証ポイント

- 設計書本文は Markdown でレビュー・履歴管理する
- UML 図は PlantUML のコードブロックまたは `.puml` ファイルで管理する
- システム構成図は Mermaid / PlantUML / 画像ファイルを用途に応じて使い分ける
- 画像は `docs/assets/images/` に配置して Markdown から参照する
- GitHub Pages では Material Design 風の静的 HTML として公開する
- PR では GitHub Pages のプレビュー URL と artifact で差分を視覚確認する

## ドキュメント一覧

- [サンプル EC サービス設計書](architecture/sample-ec-service.md)
- [PR 時の視覚確認方針](pr-visual-review.md)
- [設計書のバージョン管理方針](versioning.md)

## デザイン方針

| 観点 | 方針 |
| --- | --- |
| 視認性 | 本文領域をカード化し、見出しと表のコントラストを高める |
| 操作性 | サイドナビに現在ページのハイライトを表示する |
| 一貫性 | PlantUML、Mermaid、画像、表を同じ Material 風トーンで表示する |
| 保守性 | CSS とビルドスクリプトのみで完結し、Markdown の管理方法は変えない |

## 運用イメージ

1. 設計変更を Markdown / PlantUML / Mermaid / 画像としてコミットする。
2. Pull Request を作成する。
3. GitHub Actions で静的サイトをビルドする。
4. PR コメントに投稿された preview URL で HTML 表示を確認する。
5. main ブランチにマージ後、root の GitHub Pages に公開する。
6. 必要に応じて `design-docs-vX.Y.Z` の Git tag を作成する。
