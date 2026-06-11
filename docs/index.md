# Material Design Docs サンプルポータル

このリポジトリは、設計書を **Markdown** で管理し、GitHub Pages に静的サイトとして公開する検証用のサンプルです。UI は MkDocs Material をベースに、読みやすい余白、サイドナビ、検索、状態が分かるナビゲーションを備えたドキュメントサイトとして生成します。

## 検証ポイント

- 設計書本文は Markdown でレビュー・履歴管理する
- UML 図は PlantUML のコードブロックまたは `.puml` ファイルで管理する
- システム構成図は Mermaid / PlantUML / 画像ファイルを用途に応じて使い分ける
- 画像は `docs/assets/images/` に配置して Markdown から参照する
- GitHub Pages では Material Design 風の静的 HTML として公開する
- PR ではビルド済み HTML を artifact として確認し、必要に応じてスクリーンショット差分を追加する

## ドキュメント一覧

- [サンプル EC サービス設計書](architecture/sample-ec-service.md)
- [設計書の変更・管理ガイド](guides/design-doc-management.md)
- [MkDocs Material 便利機能サンプル](guides/mkdocs-material-cheatsheet.md)
- [PR 時の視覚確認方針](pr-visual-review.md)
- [設計書のバージョン管理](versioning.md)

## デザイン方針

| 観点 | 方針 |
| --- | --- |
| 視認性 | 本文領域をカード化し、見出しと表のコントラストを高める |
| 操作性 | サイドナビに現在ページのハイライトを表示する |
| 一貫性 | PlantUML、Mermaid、画像、表を MkDocs Material のトーンに揃えて表示する |
| 保守性 | Markdown 変換・ナビゲーション・検索は MkDocs Material に任せ、固有機能だけを hook / 追加 JS / 追加 CSS に分離する |

## 運用イメージ

1. [設計書の変更・管理ガイド](guides/design-doc-management.md)で置き場所、変更粒度、レビュー観点を確認する。
2. 設計変更を Markdown / PlantUML / Mermaid / 画像としてコミットする。
3. Pull Request を作成する。
4. GitHub Actions で静的サイトをビルドする。
5. PR コメントの Preview URL から HTML 表示と `version.json` を確認する。
6. 権限や Pages 設定で URL が使えない場合は artifact をフォールバックにする。
7. main ブランチにマージ後、GitHub Pages の production ルートに公開する。
