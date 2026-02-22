---
name: review
description: 他人のPRをレビューする際のサポート。差分を分析し、観点別のレビューコメント下書きを生成する。PRレビュー、コードレビュー、他人のPR確認時に使う。
disable-model-invocation: true
---

以下の順番で進めてください：

## 引数の解析
$ARGUMENTS を以下のように解析する：
- PR番号: 数字 or "#123" 形式（必須）
- レビュワー指定: "review:[reviewers]" があれば指定に従う（任意）
  - arch / perf / test / sec / all
  - カンマ区切りで複数可（例: arch,perf）
  - 指定なしなら Step 1 で対話的に選択

## Step 1: レビュワー選択
引数に指定があればスキップ。なければ以下を表示：

「番号 or all で選んでください：
 1. arch — コンポーネント設計・Next.js
 2. perf — パフォーマンス
 3. test — テストカバレッジ
 4. sec  — セキュリティ
 5. all  — 全員」

## Step 2: PRの差分取得
gh CLI でPRの変更ファイルと差分を取得する：
```bash
gh pr diff <PR番号>
gh pr view <PR番号> --json title,body,headRefName,baseRefName,files
```

変更ファイル一覧を表示する：
```
PR #142: ユーザーカード機能の追加 (feature/user-card → main)
変更ファイル: 5件
  M src/components/UserCard.tsx
  A src/components/UserCard.test.tsx
  M src/hooks/useAuth.ts
  A src/utils/format.ts
  M src/store/userSlice.ts
```

## Step 3: 観点別レビュー
選択されたレビュワーに対応する reviewer-* agent を subagent で実行する。

- 1人 → subagent で実行
- 2人以上 → Agent Teams で並列実行

各 agent には**差分のあるファイルだけ**をレビュー対象として渡す。

## Step 4: レビュー結果の統合・表示
全レビュワーの結果を統合し、以下の形式でターミナルに表示する：
```
📝 PR #142 レビュー結果
━━━━━━━━━━━━━━━━━━━━

🔴 Must Fix（2件）

1. [arch] src/components/UserCard.tsx:24
   Props に children の型が定義されていない。
   PropsWithChildren を使うか、children を明示的に interface に追加する。

2. [sec] src/utils/format.ts:8
   正規表現にReDoS脆弱性がある。
   ユーザー入力を受ける箇所なので安全なパターンに置換すべき。

🟡 Should Fix（1件）

3. [perf] src/components/UserCard.tsx:40
   画像に lazy loading が未適用。
   ページ初期表示のパフォーマンスに影響する可能性がある。

🟢 Good（2件）

- [test] UserCard.test.tsx のテストがユーザー操作ベースで書かれている
- [arch] userSlice.ts の createAsyncThunk の使い方が適切

━━━━━━━━━━━━━━━━━━━━
🔴 2件 🟡 1件 🟢 2件
```

**ここで止まる。** GitHub への投稿はユーザーが自分で判断して行う。
