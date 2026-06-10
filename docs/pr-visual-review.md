# PR 時の視覚確認方針

## 目的

Markdown のテキスト差分だけでは、図の崩れ、画像リンク切れ、表の見え方を見落としやすいため、Pull Request ごとにビルド済み HTML を確認できるようにします。

## 推奨フロー

1. PR 作成時に GitHub Actions で `npm test` を実行する。
2. `site/` を artifact としてアップロードする。
3. レビュアーは artifact をダウンロードし、`index.html` をブラウザで開く。
4. Mermaid、PlantUML、画像、表の表示を視覚確認する。
5. 差分が大きい PR では、表示確認したスクリーンショットを PR コメントに添付する。

## 追加検討案

- Playwright で主要ページのスクリーンショットを取得し、PR artifact に含める
- reg-suit や BackstopJS で main ブランチとの差分画像を生成する
- GitHub Pages の preview deployment を使い、PR ごとに URL で確認する

## 判断基準

| 方法 | メリット | 注意点 |
| --- | --- | --- |
| HTML artifact | 導入が軽い | ダウンロードが必要 |
| スクリーンショット artifact | 視覚差分を残しやすい | 撮影対象ページの管理が必要 |
| Visual Regression | 差分検知を自動化できる | 初期設定とベースライン管理が必要 |
| Preview URL | レビュー体験がよい | Pages / 権限 / 公開範囲の設計が必要 |
