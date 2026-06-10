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
- `plantuml` コードブロックから PlantUML SVG を表示
- `.puml` ファイルとして管理した PlantUML 図の参照
- Mermaid によるシステム構成図
- `docs/assets/images/` 配下の画像参照
- Material Design 風のサイドナビ、カード、テーブル、コードブロック
- PR ごとの HTML artifact による視覚確認

## ディレクトリ構成

```text
docs/
  index.md
  architecture/sample-ec-service.md
  diagrams/order-sequence.puml
  assets/images/sample-system-context.svg
scripts/build-site.mjs
.github/workflows/pages.yml
```
