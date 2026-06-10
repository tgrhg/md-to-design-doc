# 設計書のバージョン管理

## 目的

Markdown、PlantUML、画像アセットを Git で差分管理しつつ、生成された HTML がどの設計書バージョンとコミットから作られたかを追跡できるようにします。

## 管理単位

| 対象 | 推奨する管理方法 | レビュー観点 |
| --- | --- | --- |
| 設計書全体 | `package.json` の `version` をドキュメント版として扱う | リリース単位で説明責任を持てるか |
| Markdown 本文 | `docs/**/*.md` を Git の通常差分でレビューする | 要件、ADR、表の意味が変わっていないか |
| UML 図 | `.puml` ファイル、または Markdown 内の `plantuml` ブロックをレビューする | 依存方向、ライフライン、境界の変更が意図通りか |
| 生成 HTML | PR Preview URL または artifact の `site/` と `site/version.json` を確認する | 表示崩れと生成元コミットを確認できるか |

## 確認方法

1. ローカルで `npm test` を実行する。
2. `site/version.json` を開き、`docVersion`、`refName`、`shortSha`、`buildTime` を確認する。
3. PR ではコメントされた Preview URL を開き、同じ `version.json` と HTML を確認する。
4. main マージ後は公開中の GitHub Pages のフッターで版と短縮 SHA を確認する。

## 図の版管理ルール

- 大きな構成変更を伴う UML 図は `title` または `caption` に `v0.3` のような図版を明記する。
- 再利用する図は `.puml` ファイルに切り出し、Markdown から `*.puml.svg` として参照する。
- 図の見た目だけの変更と意味の変更は、PR の説明で分けて記載する。
- 表示確認で使った Preview URL、artifact 名、短縮 SHA を PR コメントに残す。
