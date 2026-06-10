# PR 時の視覚確認方針

## 目的

Markdown のテキスト差分だけでは、図の崩れ、画像リンク切れ、表の見え方を見落としやすいため、Pull Request ごとにビルド済み HTML を確認できるようにします。

## 推奨フロー

1. PR 作成時に GitHub Actions で `npm test` を実行する。
2. `site/` を artifact としてアップロードする。
3. 同じ `site/` を `gh-pages` ブランチの `previews/pr-<PR番号>/` に配置する。
4. GitHub Actions が PR コメントに preview URL と main URL を投稿する。
5. レビュアーは preview URL で変更後の見た目を確認し、必要に応じて main URL と見比べる。
6. PR が close / merge されたら preview ディレクトリを削除する。

## GitHub Pages で main を維持したまま PR 差分を確認する方法

GitHub Pages の公開元を `gh-pages` ブランチにし、main の公開版を root、PR の公開版をサブディレクトリに分けます。

| 種類 | 公開先 | 更新タイミング |
| --- | --- | --- |
| main の公開版 | `/` | main への push または手動実行 |
| PR プレビュー | `/previews/pr-<PR番号>/` | PR 作成・更新時 |
| PR プレビュー削除 | `/previews/pr-<PR番号>/` を削除 | PR close / merge 時 |

この方式では PR のサイトを GitHub Pages 上に置いても root の main サイトを置き換えません。ただし、GitHub Pages の設定は **Deploy from a branch** で `gh-pages` / root を公開元にする必要があります。

## 追加検討案

- Playwright で主要ページのスクリーンショットを取得し、PR artifact に含める
- reg-suit や BackstopJS で main ブランチとの差分画像を生成する
- private repository で公開範囲を制御したい場合は GitHub Pages の公開範囲または別の preview 環境を検討する

## 判断基準

| 方法 | メリット | 注意点 |
| --- | --- | --- |
| HTML artifact | 導入が軽い | ダウンロードが必要 |
| スクリーンショット artifact | 視覚差分を残しやすい | 撮影対象ページの管理が必要 |
| Visual Regression | 差分検知を自動化できる | 初期設定とベースライン管理が必要 |
| PR Preview URL | レビュー体験がよく main を維持できる | `gh-pages` ブランチ公開と PR 権限設計が必要 |
