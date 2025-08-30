# Github issue の実行

GitHub issue を読み込み、実装を行なって、PR の作成まで行います。

## コマンド実行

/exec-issue 1234

<!-- >この場合 $ARGUMENTS = 1234 <-->

## ワークフロー

下記のワークフローに従って、タスクの実行をしてください。

1. `gh issue $ARGUMENTS`で issue の内容を取得
2. develop branch にチェックアウトして、`git pull`を行い最新状態を取得する。
3. default branch から `git switch -c issue/$ARGUMENTS`でブランチを作成
4. issue の内容に従って実装
5. 変更を commit & push
6. default branch 向けの Pull Request を作成

## 命名規則

- branch の名前は`issue/$ARGUMENTS`にすること
- PR の名前は対象の issue と同じ名前にすること
- commit には下記のいずれかのプレフィックスをつけること
  - feat: 機能の開発
  - fix: 機能の修正
  - refactor: 挙動の変わらないコードの修正
  - test: テストの作成、修正
  - chore: その他

## 制約

作業の切れ目でこまめにコミットを行ってください。
