---
name: fix-pr
description: PRのレビュー指摘を読み取り、指摘ごとに修正・コミット・pushし、rulesに反映する。PRレビュー対応、レビュー指摘の修正、PR指摘のfix時に使う。
disable-model-invocation: true
---

以下の順番で進めてください：

## 引数の解析
$ARGUMENTS を以下のように解析する：
- PR番号: 数字 or "#123" 形式
- 引数がない場合はカレントブランチのPRを自動検出：
  `gh pr view --json number -q .number`

## Step 1: 指摘コメントの取得
gh CLI でPRのレビューコメントを取得する。

PR review comments（ファイル行へのコメント）：
```bash
gh api repos/{owner}/{repo}/pulls/{PR番号}/comments \
  --jq '.[] | {id: .id, in_reply_to_id: .in_reply_to_id, path: .path, line: .line, body: .body, user: .user.login}'
```

PR reviews（全体コメント付きレビュー）：
```bash
gh api repos/{owner}/{repo}/pulls/{PR番号}/reviews \
  --jq '.[] | select(.state == "CHANGES_REQUESTED" or .state == "COMMENTED") | {id: .id, body: .body, user: .user.login, state: .state}'
```

owner/repo は `gh repo view --json owner,name` で取得する。

以下のルールでフィルタする：
- `in_reply_to_id` がある返信コメントは除外（元コメントだけ対象）
- 自分（PRの作成者）のコメントは除外
- 空の body や承認のみのレビューは除外

結果を以下の形式で一覧表示する：
```
指摘 1: [src/components/UserCard.tsx:24] @tanaka
  内容: Props に children の型が定義されていない

指摘 2: [src/hooks/useAuth.ts:15] @tanaka
  内容: console.log が残っている
```

指摘が0件なら「✅ 未解決の指摘はありません」と出力して終了。

## Step 2: 修正計画の提示と確認
各指摘について以下を表形式で提示する：
```
| # | 指摘内容（要約） | 修正方針 | コミットメッセージ |
|---|----------------|---------|-----------------|
| 1 | children型未定義 | PropsWithChildren を使用 | fix: add children type to UserCard props |
| 2 | console.log残存 | 削除 | fix: remove console.log from useAuth |
```

コミットメッセージは `.claude/rules/git-conventions.md` のルールに従う（emoji + prefix、日本語）。

**必ず止まって「この計画で修正を進めていいですか？」と確認を求める。**
ユーザーが修正方針やコミットメッセージを変更したい場合は反映する。

## Step 3: 指摘ごとに修正・コミット
承認を得たら、pr-fixer agent を使い **指摘1つずつ** 以下を繰り返す：

1. 該当ファイルを修正（指摘された内容**だけ**。関連する改善を勝手に入れない）
2. 修正前に周辺コードを読み、既存スタイルに合わせる
3. .claude/rules/ のルールファイルがあれば参照し規約に沿う
4. `git add <修正ファイル>`
5. `git commit -m "<承認済みコミットメッセージ>"`

**複数の指摘を1コミットにまとめない。**
各コミットのSHAを記録しておく。

## Step 4: push
全コミット完了後：
```bash
git push
```

## Step 5: 指摘コメントへの返信
各指摘コメントに対して、対応したコミットSHAを返信する。

まずコメントへの直接返信を試みる：
```bash
gh api repos/{owner}/{repo}/pulls/{PR番号}/comments/{コメントID}/replies \
  -f body="Fixed in "
```

直接返信が失敗した場合（権限不足・APIエラー等）は、
PRに1つのコメントで全対応をまとめて投稿する：
```bash
gh pr comment {PR番号} --body "## レビュー対応
- 指摘1: Fixed in <commit-sha>
- 指摘2: Fixed in <commit-sha>
..."
```

## Step 6: rules への反映
全指摘を振り返り、**今後同じ指摘を受けないために** .claude/rules/ に反映する。

以下の判断基準で分類する：
- 既存 rules ファイルのスコープ内 → 該当ファイルに追記
- 新しいカテゴリ → 新規 rules ファイルを作成
- 一般的な typo やケアレスミス → 反映不要
- プロジェクト固有でない一般常識 → 反映不要

反映候補を表形式で提示する：
```
| 指摘 | 反映先 | 追加内容 |
|------|-------|---------|
| children型未定義 | rules/coding-conventions.md | 「children を受けるコンポーネントは PropsWithChildren を使う」 |
| ReDoS脆弱性 | rules/security.md（新規） | 「ユーザー入力に正規表現を使う場合はReDoSを考慮する」 |
| console.log残存 | — | 反映不要（lint で検出可能） |
```

**必ず止まって「この内容で rules に反映していいですか？」と確認を求める。**

承認後に反映を実行し、コミット・push する：
```bash
git add .claude/rules/
git commit -m "docs: update rules based on PR #<PR番号> review feedback"
git push
```
