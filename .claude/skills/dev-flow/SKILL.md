---
name: dev-flow
description: チケットから実装・レビュー・PRまで一気通貫で実行。「/dev-flow PROJ-1234」や「/dev-flow PROJ-1234 from develop」のように使う。
---

以下の順番で進めてください：

## Step 1: 計画
planner subagent で $ARGUMENTS のチケットを取得し、
ブランチを作成し、実装計画を立てる。
$ARGUMENTS にはチケット番号（必須）とベースブランチ（任意）が入る。
例: "PROJ-1234" / "PROJ-1234 from develop"
計画を出力したら**必ず一度止まって確認を求める**。

## Step 2: 実装
承認を得たら implementer subagent で実装する。

## Step 3: レビュー
実装完了後、reviewer subagent でレビューする。
Must Fix があれば implementer に差し戻して修正。

## Step 4: ユーザー確認
レビュー承認後、変更ファイル一覧と差分サマリーを表示する。
**必ず止まって「コードを確認してください。PRに進めていいですか？」と聞く。**
ユーザーから修正指示があれば implementer に戻す。

## Step 5: PR作成
承認を得たら pr-creator subagent でコミット・PR作成。
コミット前に内容確認を求める。
