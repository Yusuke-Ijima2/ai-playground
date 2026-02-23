---
name: dev-flow
description: チケットから実装・レビュー・PRまで一気通貫で実行。「/dev-flow PROJ-1234」や「/dev-flow PROJ-1234 from develop」のように使う。
disable-model-invocation: true
---

以下の順番で進めてください：

## 引数の解析

$ARGUMENTS を以下のように解析する：

- チケット情報: チケット番号、JiraのURL、またはチケットの説明（必須）
- ベースブランチ: "from [ブランチ名]" があればそれ、なければ main
- レビュワー指定: "review:[reviewers]" があれば指定に従う（任意）
  - arch / perf / test / sec / all / skip
  - カンマ区切りで複数可（例: review:arch,perf）
  - 指定なしなら Step 2 で対話的に選択

## Step 1: 計画

planner subagent でチケット取得・ブランチ作成・計画立案。
**必ず止まって確認を求める。**

## Step 2: レビュワー選択

review: 指定があればスキップ。なければ以下を表示：

「番号 or all / skip で選んでください：

1.  arch — コンポーネント設計・Next.js
2.  perf — パフォーマンス
3.  test — テストカバレッジ
4.  sec — セキュリティ
5.  all — 全員
6.  skip — レビューなし」

ユーザーの入力を解析する：

- 番号（例: "1,3"）→ 対応するレビュワーを選択
- エイリアス（例: "arch,sec"）→ そのまま使用
- "all" → 全員
- "skip" → レビューをスキップ

## Step 3: 実装

implementer subagent で実装する。

## Step 4: レビュー

skip ならスキップ。

- 1人 → 該当の reviewer-[name] agent を subagent で実行
- 2人以上 → Agent Teams で並列実行、互いに議論させる

結果を 🔴 Must Fix / 🟡 Should Fix / 🟢 Good で統合。
Must Fix あれば implementer に差し戻し→再レビュー。

## Step 5: ユーザー確認

変更ファイル一覧と差分サマリーを表示。
**「コードを確認してください。PRに進めていいですか？」と聞く。**
修正指示があれば implementer に戻す。

## Step 6: PR作成

pr-creator subagent でコミット・PR作成。
コミット前に内容確認を求める。
