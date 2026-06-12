# サンプル EC サービス設計書

## 1. 概要

サンプル EC サービスは、商品検索、カート、注文、決済を提供する Web アプリケーションです。本文は Markdown で管理し、図は用途に応じて Mermaid または画像ファイルを利用します。

## 2. スコープ

- 利用者向けの商品閲覧と注文
- 管理者向けの商品・在庫管理
- 外部決済サービスとの連携
- 注文完了通知の送信

## 3. システム構成図（Mermaid）

Mermaid は軽量な構成図やフロー図に向いています。GitHub 上の Markdown プレビューでも一定の確認ができます。

```mermaid
flowchart LR
  user[利用者ブラウザ] --> cdn[CDN / WAF]
  cdn --> web[Web Frontend]
  web --> api[Backend API]
  api --> db[(Order DB)]
  api --> cache[(Redis Cache)]
  api --> payment[外部決済]
  api --> queue[Message Queue]
  queue --> mail[通知 Worker]
```

## 4. コンポーネント図（Mermaid）

コンポーネント間の依存方向も Mermaid で記述します。ビルド時に外部の図生成サービスへアクセスしない構成にしています。

```mermaid
flowchart LR
  customer[Customer]

  subgraph experience[Experience]
    web[Web Frontend]
  end

  subgraph core[Core API]
    api[Backend API]
    order[Order Service]
  end

  subgraph integration[Integration]
    payment[Payment Adapter]
    db[(Order DB)]
    queue[[Order Events]]
  end

  customer -->|商品検索・注文| web
  web -->|REST API| api
  api -->|注文作成| order
  order -->|決済要求| payment
  order -->|注文保存| db
  order -->|注文イベント| queue
```

## 5. シーケンス図（Mermaid）

処理順序を本文と一緒にレビューしたい場合も Mermaid の `sequenceDiagram` を使います。

```mermaid
sequenceDiagram
  autonumber
  actor Customer as 利用者
  participant Web as Web Frontend
  participant API as Backend API
  participant Order as Order Service
  participant Pay as Payment Adapter
  participant DB as Order DB
  participant Queue as Order Events

  Customer->>Web: 注文確定
  Web->>API: POST /orders
  API->>Order: 注文作成依頼
  Order->>Pay: 決済要求
  Pay-->>Order: 決済結果
  Order->>DB: 注文保存
  Order->>Queue: 注文イベント発行
  Order-->>API: 注文ID
  API-->>Web: 201 Created
  Web-->>Customer: 注文完了表示
```

## 6. 画像アセットの管理

画面キャプチャ、手書きの概念図、既存システムの構成図などは `docs/assets/images/` に保存して参照します。

![管理対象画像の例](../assets/images/sample-system-context.svg)

## 7. 非機能要件サンプル

| 分類 | 要件 | 補足 |
| --- | --- | --- |
| 可用性 | 月間稼働率 99.9% | CDN と Backend API を冗長化する |
| 性能 | 商品検索 P95 500ms 未満 | キャッシュを活用する |
| セキュリティ | 管理画面は SSO 必須 | 監査ログを保存する |
| 運用 | 障害通知は 5 分以内 | 監視アラートを ChatOps に連携する |

## 8. 図のバージョン管理サンプル

| 対象 | 現行版 | 管理方法 | 確認ポイント |
| --- | --- | --- | --- |
| コンポーネント図 | v0.3 | Markdown 内の Mermaid ブロックを Git 管理 | パッケージ境界、依存方向、凡例の見やすさ |
| 注文作成シーケンス | v0.3 | Markdown 内の Mermaid シーケンス図を Git 管理 | 同期処理、外部連携、永続化タイミング |

設計書サイトのヘッダーとフッターには `package.json` のドキュメントバージョン、Git ref、短縮 SHA、ビルド時刻を表示します。PR では `site/version.json` も artifact に含まれるため、レビューした HTML がどのコミットから生成されたかを確認できます。

## 9. ADR サンプル

### ADR-001: 図の管理方式

- ステータス: 採用
- 決定: テキストでレビューしたい図は Mermaid、外部作成図やスクリーンショットは画像として管理する
- 理由: ビルド時の外部図生成サービス依存をなくし、MkDocs Material 標準寄りの構成で運用するため
