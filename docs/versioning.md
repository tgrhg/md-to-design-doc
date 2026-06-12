# 設計書のバージョン管理

## 目的

Markdown、Mermaid、画像アセットを Git で差分管理しつつ、生成された HTML がどの設計書バージョンとコミットから作られたかを追跡できるようにします。

## 管理単位

| 対象 | 推奨する管理方法 | レビュー観点 |
| --- | --- | --- |
| 設計書全体 | `package.json` の `version` をドキュメント版として扱う | リリース単位で説明責任を持てるか |
| Markdown 本文 | `docs/**/*.md` を Git の通常差分でレビューする | 要件、ADR、表の意味が変わっていないか |
| 図 | Markdown 内の Mermaid ブロックまたは画像アセットをレビューする | 依存方向、ライフライン、境界の変更が意図通りか |
| 生成 HTML | PR Preview URL または artifact の `site/` と `site/version.json` を確認する | 表示崩れと生成元コミットを確認できるか |

## 確認方法

1. ローカルで `npm test` を実行する。
2. `site/version.json` を開き、`docVersion`、`refName`、`shortSha`、`buildTime` を確認する。
3. PR ではコメントされた Preview URL を開き、同じ `version.json` と HTML を確認する。
4. サイドバーの「公開済みバージョン」で、production と公開中の PR preview が一覧できることを確認する。
5. main マージ後は公開中の GitHub Pages のフッターで版と短縮 SHA を確認する。

## 図の版管理ルール

- 大きな構成変更を伴う図は `title` または `caption` に `v0.3` のような図版を明記する。
- 再利用する図は Mermaid を含む Markdown ページ、または `docs/assets/images/` 配下の画像として管理する。
- 図の見た目だけの変更と意味の変更は、PR の説明で分けて記載する。
- 表示確認で使った Preview URL、Version index、artifact 名、短縮 SHA を PR コメントに残す。
