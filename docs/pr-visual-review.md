# PR 時の視覚確認方針

## 目的

Markdown のテキスト差分だけでは、図の崩れ、画像リンク切れ、表の見え方を見落としやすいため、Pull Request ごとにビルド済み HTML を確認できるようにします。

## 推奨フロー

1. PR 作成時に GitHub Actions で `npm test` を実行する。
2. 同一リポジトリ内の PR では、`gh-pages` ブランチの `previews/pr-<番号>/` に PR 版 HTML を公開する。
3. workflow が `previews/versions.json` に PR preview を登録し、各ページのサイドバーにある「公開済みバージョン」からたどれるようにする。
4. workflow が PR コメントに投稿する Preview URL、または Version index からサイトを開いてサイドバーを確認する。
5. 画面フッターまたは `version.json` で、レビュー対象のドキュメント版・短縮 SHA・ビルド時刻を確認する。
6. Mermaid、画像、表の表示を視覚確認する。
7. artifact の `design-docs-site` は、権限や Pages 設定で preview URL を使えない場合のフォールバックとして確認する。

## GitHub Pages で PR 差分を確認したい場合

main で公開している GitHub Pages を維持したまま PR 差分を URL で確認するため、このリポジトリでは **branch-based Pages preview** を採用します。

- production は `gh-pages` ブランチのルートに公開する。
- PR preview は同じ `gh-pages` ブランチの `previews/pr-<番号>/` に別バージョンとして公開する。
- PR が更新されるたびに同じ preview subpath を上書きし、`previews/versions.json` の該当エントリを更新する。
- PR が closed になったら該当 preview subpath を空にし、`previews/versions.json` からも削除する。

GitHub Pages の設定は、リポジトリの **Settings > Pages > Build and deployment** で **Deploy from a branch** を選び、branch を `gh-pages`、folder を `/ (root)` にします。これにより production URL は維持しつつ、PR 版は `/previews/pr-<番号>/` で直接確認できます。

## 追加検討案

- Playwright で主要ページのスクリーンショットを取得し、PR artifact に含める
- reg-suit や BackstopJS で main ブランチとの差分画像を生成する
- fork からの PR も URL preview したい場合は、preview 専用 Pages リポジトリまたは外部ホスティングに分離する

## 判断基準

| 方法 | メリット | 注意点 |
| --- | --- | --- |
| HTML artifact | 権限や fork PR に強い | ダウンロードが必要 |
| スクリーンショット artifact | 視覚差分を残しやすい | 撮影対象ページの管理が必要 |
| Visual Regression | 差分検知を自動化できる | 初期設定とベースライン管理が必要 |
| Preview URL | ダウンロード不要でレビュー体験がよい | `gh-pages` branch publishing の Pages 設定が必要 |
