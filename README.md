# Markdown Design Docs Sample

Markdown で設計書を管理し、GitHub Pages で **MkDocs Material** ベースのきれいな設計書サイトとして公開するための検証用リポジトリです。

## ローカル確認

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# PlantUML 図を SVG に変換する場合は、ローカル実行できる plantuml コマンド、
# または PlantUML jar を用意して PLANTUML_JAR=/path/to/plantuml.jar を設定してください。
npm test
python3 -m http.server 8000 -d site
```

ブラウザで <http://localhost:8000> を開くと、生成された設計書サイトを確認できます。ヘッダーのバージョンチップ、サイドバーの「公開済みバージョン」、`site/version.json` にはドキュメント版、Git ref、短縮 SHA、ビルド時刻が表示されます。


## PlantUML のローカル変換

PlantUML のソースには内部設計情報が含まれる可能性があるため、ビルド時に外部の PlantUML サーバーへ送信しません。`hooks/plantuml.py` は次の順でローカルレンダラーを探し、SVG を HTML にインライン埋め込みします。

1. `PLANTUML_COMMAND` に指定したコマンド
2. `PLANTUML_JAR` に指定した jar を `java -jar` で実行
3. `PATH` 上の `plantuml` コマンド

ローカルレンダラーがない環境でもビルドは継続し、該当箇所には設定不足を示す SVG プレースホルダーを表示します。

## MkDocs Material 構成

このリポジトリは、独自の Markdown to HTML 変換ではなく、`mkdocs.yml` で MkDocs Material を設定してサイトを生成します。Material テーマのナビゲーション、検索、コードコピー、目次追従を利用し、リポジトリ固有の要件だけを薄いカスタム実装として追加しています。

- `mkdocs.yml`: MkDocs Material のテーマ、ナビゲーション、Markdown 拡張、Mermaid 設定
- `hooks/plantuml.py`: `plantuml` コードブロックと `*.puml.svg` 参照をローカル PlantUML でインライン SVG に変換
- `docs/stylesheets/design-docs.css`: PlantUML カードとバージョン表示の補助スタイル
- `docs/javascripts/version-sidebar.js`: `version.json` と `previews/versions.json` を読み込み、バージョン情報を表示
- `scripts/write-version.mjs`: ビルド後に `site/version.json` を出力

## PR Preview URL

PR の HTML をダウンロードせずに確認したい場合は、GitHub Pages の公開元を **Deploy from a branch / `gh-pages` / root** に設定します。workflow は production を `gh-pages` のルートに、PR preview を `gh-pages/previews/pr-<番号>/` に公開し、PR コメントへ Preview URL を投稿します。公開した preview は `gh-pages/previews/versions.json` に登録され、各ページのサイドバーにある「公開済みバージョン」から production と並べてたどれます。

## 対応している表現

- Markdown による設計書本文
- `plantuml` コードブロックからローカル変換した PlantUML SVG を表示
- `.puml` ファイルとして管理した PlantUML 図の参照（外部 PlantUML サーバーへ送信しない）
- Mermaid によるシステム構成図
- `docs/assets/images/` 配下の画像参照
- MkDocs Material によるサイドナビ、検索、目次、テーブル、コードブロック
- `site/version.json` と画面上のバージョン表示による生成元バージョンの確認
- PR ごとの Pages Preview URL と HTML artifact による視覚確認
- サイドバーの「公開済みバージョン」から PR preview を辿るバージョン一覧

## ディレクトリ構成

```text
mkdocs.yml
requirements.txt
docs/
  index.md
  architecture/sample-ec-service.md
  diagrams/order-sequence.puml
  assets/images/sample-system-context.svg
  javascripts/version-sidebar.js
  stylesheets/design-docs.css
  versioning.md
hooks/plantuml.py
scripts/write-version.mjs
.github/workflows/pages.yml
```
