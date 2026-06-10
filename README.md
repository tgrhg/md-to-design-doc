# Markdown Design Docs Sample

Markdown で設計書を管理し、GitHub Pages で Material Design 風のきれいな設計書サイトとして公開するための検証用リポジトリです。

## ローカル確認

```bash
npm test
python3 -m http.server 8000 -d site
```

ブラウザで <http://localhost:8000> を開くと、生成された設計書サイトを確認できます。

## 対応している表現

- Markdown による設計書本文
- `plantuml` コードブロックから Material Design 風テーマを適用した PlantUML SVG を表示
- `.puml` ファイルとして管理した PlantUML 図の参照
- Mermaid によるシステム構成図
- `docs/assets/images/` 配下の画像参照
- Material Design 風のサイドナビ、カード、テーブル、コードブロック、図表フレーム
- PR ごとの HTML artifact と GitHub Pages preview URL による視覚確認
- Git tag と PR 単位での設計書バージョン管理

## GitHub Pages の運用

GitHub Pages の公開元は `gh-pages` ブランチの root にします。これにより、main の公開サイトを root に維持しながら、PR の確認用サイトを `previews/pr-<PR番号>/` に並べて公開できます。

| 対象 | URL パス | 用途 |
| --- | --- | --- |
| main 公開版 | `/` | 利用者が参照する最新の設計書 |
| PR プレビュー | `/previews/pr-<PR番号>/` | レビュアーが変更後の見た目を確認する一時サイト |
| artifact | GitHub Actions artifact | Pages 設定前や権限制約がある場合の確認手段 |

PR が close / merge されると、対応する preview ディレクトリは workflow で削除します。

## バージョン管理

設計書の公開スナップショットは `design-docs-vX.Y.Z` のような Git tag で管理します。詳細は [設計書のバージョン管理方針](docs/versioning.md) を参照してください。

## ディレクトリ構成

```text
docs/
  index.md
  architecture/sample-ec-service.md
  diagrams/order-sequence.puml
  assets/images/sample-system-context.svg
  pr-visual-review.md
  versioning.md
scripts/build-site.mjs
.github/workflows/pages.yml
```
