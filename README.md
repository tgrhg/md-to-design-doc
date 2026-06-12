# Markdown Design Docs Sample

Markdown で設計書を管理し、GitHub Pages で **MkDocs Material** ベースのきれいな設計書サイトとして公開するための検証用リポジトリです。`docs/` 配下の Markdown と図を MkDocs で `site/` に変換し、GitHub Actions で自動生成・公開します。

## ローカル確認

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm test
python3 -m http.server 8000 -d site
```

ブラウザで <http://localhost:8000> を開くと、生成された設計書サイトを確認できます。ヘッダーのバージョンチップ、サイドバーの「公開済みバージョン」、`site/version.json` にはドキュメント版、Git ref、短縮 SHA、ビルド時刻が表示されます。

## MkDocs Material 構成

このリポジトリは、独自の Markdown to HTML 変換ではなく、`mkdocs.yml` で MkDocs Material を設定してサイトを生成します。Material テーマのナビゲーション、検索、コードコピー、目次追従を利用し、リポジトリ固有の要件だけを薄いカスタム実装として追加しています。

- `mkdocs.yml`: MkDocs Material のテーマ、ナビゲーション、Markdown 拡張、Mermaid 設定
- `docs/guides/`: 設計書 PR の作り方、ディレクトリ構成、ドキュメント生成の仕組み、MkDocs Material 便利機能のサンプル
- `docs/stylesheets/design-docs.css`: バージョン表示などのサイト固有スタイル
- `docs/javascripts/version-sidebar.js`: `version.json` と `previews/versions.json` を読み込み、バージョン情報を表示
- `scripts/write-version.mjs`: ビルド後に `site/version.json` を出力

## PR Preview URL

PR の HTML をダウンロードせずに確認したい場合は、GitHub Pages の公開元を **Deploy from a branch / `gh-pages` / root** に設定します。workflow は production を `gh-pages` のルートに、PR preview を `gh-pages/previews/pr-<番号>/` に公開し、PR コメントへ Preview URL を投稿します。公開した preview は `gh-pages/previews/versions.json` に登録され、各ページのサイドバーにある「公開済みバージョン」から production と並べてたどれます。

## 対応している表現

- Markdown による設計書本文
- Mermaid によるシステム構成図、フロー図、シーケンス図
- `docs/assets/images/` 配下の画像参照
- 設計書の変更・管理ガイド、ドキュメント生成の仕組み、PR 本文テンプレート
- MkDocs Material によるサイドナビ、検索、目次、テーブル、コードブロック、Admonition、Details、Tabs、Task list
- `site/version.json` と画面上のバージョン表示による生成元バージョンの確認
- PR ごとの Pages Preview URL と HTML artifact による視覚確認
- サイドバーの「公開済みバージョン」から PR preview を辿るバージョン一覧

## ディレクトリ構成

```text
mkdocs.yml                         # サイト設定、ナビゲーション、Markdown 拡張
requirements.txt                   # MkDocs / Material の Python 依存
package.json                       # build / test コマンドとドキュメント版
docs/
  index.md                         # ポータルの入口
  architecture/                    # 個別システム・機能の設計書
    sample-ec-service.md
  guides/                          # 設計書の書き方・運用ガイド
    design-doc-management.md
    documentation-generation.md
    mkdocs-material-cheatsheet.md
  assets/images/                   # 画像アセット
    sample-system-context.svg
  javascripts/version-sidebar.js   # バージョン表示用 JS
  stylesheets/design-docs.css      # サイト固有スタイル
  pr-visual-review.md
  versioning.md
scripts/write-version.mjs          # site/version.json 出力
.github/workflows/pages.yml        # MkDocs build / Pages / PR preview workflow
```
