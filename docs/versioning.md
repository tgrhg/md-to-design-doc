# 設計書のバージョン管理方針

## 目的

設計書を Markdown と図のソースで管理し、変更理由・レビュー結果・公開状態を Git の履歴として追跡できるようにします。

## バージョンの単位

| 単位 | 使いどころ | 例 |
| --- | --- | --- |
| Pull Request | レビュー中の変更単位 | `feature/order-timeout-design` |
| Git tag | 公開済み設計書のスナップショット | `design-docs-v0.2.0` |
| GitHub Pages root | main の最新公開版 | `https://<owner>.github.io/<repo>/` |
| PR preview path | レビュー用の一時公開版 | `https://<owner>.github.io/<repo>/previews/pr-123/` |

## 推奨フロー

1. 設計変更ごとにブランチを作成する。
2. Markdown、PlantUML、Mermaid、画像を同じ PR に含める。
3. PR プレビュー URL で表示崩れやリンク切れを確認する。
4. main へマージしたあと、必要に応じて `design-docs-vX.Y.Z` タグを作成する。
5. リリースノートまたは ADR に「なぜ変えたか」を残す。

## バージョン番号の考え方

| 変更種別 | バージョン例 | 判断基準 |
| --- | --- | --- |
| Major | v1.0.0 → v2.0.0 | システム境界、主要アーキテクチャ、責務分担が大きく変わる |
| Minor | v1.0.0 → v1.1.0 | 新機能、主要シーケンス、運用方式が追加される |
| Patch | v1.0.0 → v1.0.1 | 誤字修正、補足追記、軽微な図の改善 |

## PR で確認する観点

- main の GitHub Pages は root URL のまま維持されているか。
- PR プレビューは `previews/pr-<PR番号>/` に分離されているか。
- UML 図のラベル、色、余白が読みやすいか。
- 画像ファイルの参照パスが切れていないか。
- バージョン表や ADR に変更意図が残っているか。
