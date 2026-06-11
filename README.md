# Markdown Design Docs Sample

Markdown で設計書を管理し、GitHub Pages で Material Design 風のきれいな設計書サイトとして公開するための検証用リポジトリです。

## ローカル確認

```bash
npm test
python3 -m http.server 8000 -d site
```

ブラウザで <http://localhost:8000> を開くと、生成された設計書サイトを確認できます。ヘッダー、フッター、`site/version.json` にはドキュメント版、Git ref、短縮 SHA、ビルド時刻が表示されます。


## PR Preview URL

PR の HTML をダウンロードせずに確認したい場合は、GitHub Pages の公開元を **Deploy from a branch / `gh-pages` / root** に設定します。workflow は production を `gh-pages` のルートに、PR preview を `gh-pages/previews/pr-<番号>/` に公開し、PR コメントへ Preview URL を投稿します。公開した preview は `gh-pages/previews/versions.json` に登録され、各ページのサイドバーにある「公開済みバージョン」から production と並べてたどれます。

## 対応している表現

- Markdown による設計書本文
- `plantuml` コードブロックから PlantUML SVG を表示
- `.puml` ファイルとして管理した PlantUML 図の参照
- Mermaid によるシステム構成図
- `docs/assets/images/` 配下の画像参照
- Material Design 風のサイドナビ、カード、テーブル、コードブロック
- Material Design 風のフレームと PlantUML テーマによる見やすい UML 図
- `site/version.json` と画面フッターによる生成元バージョンの確認
- PR ごとの Pages Preview URL と HTML artifact による視覚確認
- サイドバーの「公開済みバージョン」から PR preview を辿るバージョン一覧

## ディレクトリ構成

```text
docs/
  index.md
  architecture/sample-ec-service.md
  diagrams/order-sequence.puml
  assets/images/sample-system-context.svg
  versioning.md
scripts/build-site.mjs
.github/workflows/pages.yml
```
