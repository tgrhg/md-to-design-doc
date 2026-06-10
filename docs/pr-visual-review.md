# PR 時の視覚確認方針

## 目的

Markdown のテキスト差分だけでは、図の崩れ、画像リンク切れ、表の見え方を見落としやすいため、Pull Request ごとにビルド済み HTML を確認できるようにします。

## 推奨フロー

1. PR 作成時に GitHub Actions で `npm test` を実行する。
2. `site/` を artifact としてアップロードする。
3. レビュアーは artifact をダウンロードし、`index.html` をブラウザで開く。
4. `site/version.json` と画面フッターで、レビュー対象のドキュメント版・短縮 SHA・ビルド時刻を確認する。
5. Mermaid、PlantUML、画像、表の表示を視覚確認する。
6. 差分が大きい PR では、表示確認したスクリーンショットを PR コメントに添付する。

## GitHub Pages で PR 差分を確認したい場合

main で公開している GitHub Pages を維持したまま PR 差分を URL で確認したい場合は、次の優先順位で選択します。

1. **標準運用:** 現在の workflow のまま PR artifact を確認する。production の Pages deployment を一切更新しないため最も安全です。
2. **URL が必須の場合:** preview 専用の Pages リポジトリ、または外部プレビュー環境に `site/` をデプロイする。main の Pages とは別ホストにするため、公開中の本番サイトを上書きしません。
3. **同一 Pages 上に置く場合:** production と PR preview を同じ Pages artifact に同梱して `/previews/pr-<番号>/` のようなサブパスで公開する。ただし PR ごとに Pages deployment が走るため、権限、公開範囲、古い preview の削除、production コンテンツを同梱する仕組みを設計してから導入します。

> 現時点のこのリポジトリでは、main の公開内容を維持することを優先し、PR では `design-docs-site` artifact と `version.json` を確認する方針にしています。

## 追加検討案

- Playwright で主要ページのスクリーンショットを取得し、PR artifact に含める
- reg-suit や BackstopJS で main ブランチとの差分画像を生成する
- preview 専用 Pages リポジトリまたは外部ホスティングに PR ごとの URL を発行する

## 判断基準

| 方法 | メリット | 注意点 |
| --- | --- | --- |
| HTML artifact | 導入が軽く main の Pages を上書きしない | ダウンロードが必要 |
| スクリーンショット artifact | 視覚差分を残しやすい | 撮影対象ページの管理が必要 |
| Visual Regression | 差分検知を自動化できる | 初期設定とベースライン管理が必要 |
| Preview URL | レビュー体験がよい | main の Pages を維持するため preview 専用ホストまたは同梱デプロイ設計が必要 |
