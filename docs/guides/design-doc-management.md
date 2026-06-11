# 設計書の変更・管理ガイド

## 目的

このページは、設計書を変更する Pull Request を作るときに「何を、どこに、どの粒度で、どう確認すればよいか」を判断するための運用ガイドです。Markdown、PlantUML、Mermaid、画像を Git で管理し、レビューでは **設計内容の妥当性** と **生成されたサイトの読みやすさ** の両方を確認します。

設計書がどのように HTML 化され、GitHub Actions で自動公開されるかは [ドキュメント生成の仕組み](documentation-generation.md) を参照してください。

## まず判断すること

| 変更したいこと | 置き場所 | 推奨フォーマット | レビュー観点 |
| --- | --- | --- | --- |
| システム・機能の説明を追加する | `docs/architecture/` | Markdown | 要件、責務、境界、用語が明確か |
| 複数ページから参照する図を追加する | `docs/diagrams/` | PlantUML `.puml` | 依存方向、同期/非同期、外部境界が正しいか |
| ページ内だけで使う軽量な図を書く | 対象の Markdown 内 | Mermaid / PlantUML コードブロック | 本文との差分が追いやすいか |
| スクリーンショットや既存図を載せる | `docs/assets/images/` | SVG / PNG / JPEG | 代替テキスト、解像度、機密情報の有無 |
| 運用ルール・レビュー手順を更新する | `docs/guides/` | Markdown | 実際の PR フローで使える内容か |
| 公開・Preview・版管理を変更する | `docs/versioning.md` / `docs/pr-visual-review.md` | Markdown | URL、artifact、SHA の確認手順が明確か |

## 推奨ディレクトリ構成

```text
.
├── mkdocs.yml                         # サイト設定、ナビゲーション、Markdown 拡張
├── requirements.txt                   # MkDocs / Material の Python 依存
├── package.json                       # build / test コマンドとドキュメント版
├── hooks/
│   └── plantuml.py                    # PlantUML を SVG 表示へ変換する MkDocs hook
├── scripts/
│   └── write-version.mjs              # site/version.json を出力
└── docs/
    ├── index.md                       # ポータルの入口
    ├── architecture/                  # 個別システム・機能の設計書
    │   └── sample-ec-service.md
    ├── guides/                        # 設計書の書き方・運用ガイド
    │   ├── design-doc-management.md
    │   ├── documentation-generation.md
    │   └── mkdocs-material-cheatsheet.md
    ├── diagrams/                      # 再利用する PlantUML ソース
    │   └── order-sequence.puml
    ├── assets/
    │   └── images/                    # 画像アセット
    │       └── sample-system-context.svg
    ├── javascripts/                   # サイト固有の追加 JS
    │   └── version-sidebar.js
    └── stylesheets/                   # サイト固有の追加 CSS
        └── design-docs.css
```

!!! tip "迷ったときの置き場所"
    本文と一緒に読まないと意味が分からない図は Markdown 内に書き、他ページでも使う図や差分レビューしたい図は `docs/diagrams/` に切り出します。運用手順やテンプレートは `docs/guides/` に置くと、設計書本文と管理ルールを分けて保守できます。

## 設計書 PR の基本フロー

1. **変更理由を明確にする**
   - 仕様変更、障害対応、運用改善、図の整理など、PR の目的を 1 つに絞ります。
   - 影響範囲が広い場合は、本文・図・運用ルールを分けた PR にします。
2. **適切なファイルを更新する**
   - 設計本文は `docs/architecture/`、運用ルールは `docs/guides/`、共通図は `docs/diagrams/` を優先します。
   - `mkdocs.yml` の `nav` に追加しないとサイトのナビゲーションに表示されないため、新規ページを作ったら必ず確認します。
   - 生成・公開の流れを変える場合は、GitHub Actions workflow と [ドキュメント生成の仕組み](documentation-generation.md) を同時に更新します。
3. **図と本文を同時に更新する**
   - 図だけ、本文だけの変更は内容の不整合が起きやすいため、依存関係・責務・処理順序を本文にも記載します。
   - 大きな図は `title` や `caption` に図版を付け、何が変わったかを PR 説明に書きます。
4. **ローカルで生成結果を確認する**
   - `npm test` を実行し、MkDocs の strict build でリンク切れや設定ミスを検出します。
   - 必要に応じて `python3 -m http.server 8000 -d site` で生成 HTML を開き、表・図・目次・検索対象を確認します。
5. **PR でレビューしやすい情報を残す**
   - 変更したページ、主な設計判断、確認した Preview URL / artifact / 短縮 SHA を PR 本文に書きます。
   - 図の見た目だけの変更と、設計意味の変更は分けて説明します。

## PR 本文テンプレート

```markdown
## 目的
- なぜ設計書を変更するのか

## 変更内容
- 追加・更新したページ:
- 更新した図・画像:
- 影響するシステム/機能:

## レビューしてほしい観点
- 責務分担・依存方向が正しいか
- 要件や制約の抜け漏れがないか
- 図と本文に矛盾がないか
- 表示崩れやリンク切れがないか

## 確認結果
- `npm test`:
- Preview URL:
- `site/version.json` の shortSha:
```

## 変更粒度の目安

| 粒度 | 適したケース | 避けたいケース |
| --- | --- | --- |
| 1 ページだけ更新 | 説明の補足、表の追加、軽微な図修正 | 複数システムにまたがる設計変更 |
| 本文 + 図を同時更新 | 構成変更、シーケンス変更、外部連携追加 | 図の見た目だけを整える変更 |
| ガイドページ追加 | チーム共通の運用ルールやテンプレート追加 | 特定機能だけの一時メモ |
| `mkdocs.yml` 更新 | ナビゲーション追加、Markdown 拡張追加 | ページ本文だけで完結する変更 |

## レビュー前チェックリスト

- [ ] 新規ページを `mkdocs.yml` の `nav` に追加した。
- [ ] 見出し階層が `#` → `##` → `###` の順に揃っている。
- [ ] 画像には意味が分かる代替テキストを付けた。
- [ ] PlantUML / Mermaid の図と本文の説明が一致している。
- [ ] 機密情報、個人情報、内部 URL、アクセストークンが含まれていない。
- [ ] `npm test` で strict build が成功した。
- [ ] Preview URL または artifact で HTML 表示を確認した。

## よくあるケース別の対応

??? question "設計書に新しいページを追加したい"
    1. `docs/architecture/` または `docs/guides/` に Markdown を追加します。
    2. `mkdocs.yml` の `nav` にページを追加します。
    3. `docs/index.md` のドキュメント一覧にも必要に応じてリンクを追加します。
    4. `npm test` でリンクとビルドを確認します。

??? question "既存図を差し替えたい"
    画像ファイルを `docs/assets/images/` に置き、Markdown から相対パスで参照します。スクリーンショットの場合は、機密情報や個人情報をマスクしてからコミットします。差し替え前後で設計意味が変わる場合は、本文にも変更理由を書きます。

??? question "PlantUML を別ファイルで管理したい"
    `docs/diagrams/example.puml` を作り、Markdown では `![図の説明](../diagrams/example.puml.svg)` のように参照します。MkDocs hook が `.puml` の内容を読み取り、生成 HTML では SVG として表示します。

??? question "レビューで表示崩れを指摘された"
    Markdown の表、長いコードブロック、画像サイズ、見出し階層を確認します。見た目だけの修正でも、読みやすさに関わる場合は PR で「設計意味は変えていない」と明記します。
