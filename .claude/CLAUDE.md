# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

en-japan 採用プラットフォーム（Next.js / TypeScript / MUI / Redux Toolkit）向けの開発ワークフローを自動化する Claude Code のプレイグラウンド。

## 技術スタック

- Next.js (App Router) / TypeScript
- MUI (styled 優先、sx 禁止)
- Redux Toolkit (createAsyncThunk / immer)
- Jest + React Testing Library

## ルール

コーディング規約・Git規約・テスト規約は `.claude/rules/` を参照。自動読み込みされる。

## アーキテクチャ

### スキルとエージェントの関係

スキル（ユーザーが直接呼ぶワークフロー）がエージェント（専門家）を組み合わせて処理を進める構造。

```
/dev-flow  ─→  planner(Opus) → implementer(Opus) → reviewer-*(Sonnet) → pr-creator(Sonnet)
/fix-pr    ─→  pr-fixer(Sonnet)
/commit    ─→  (直接実行、サブエージェントなし)
/component-template ─→ (直接実行)
/pr-template ─→ (直接実行)
```

### レビュワーの並列実行

2人以上のレビュワーを選択すると Agent Teams で並列実行される。各レビュワーは独立コンテキストで動き、互いの発見を議論・統合する。

| レビュワー | 観点 |
|---|---|
| reviewer-arch | コンポーネント設計・Next.js ベストプラクティス |
| reviewer-perf | 再レンダリング・メモ化・バンドルサイズ |
| reviewer-test | テストカバレッジ・ユーザー操作ベース |
| reviewer-sec | XSS・認証認可・機密データ露出 |

レビュー結果は 🔴 Must Fix / 🟡 Should Fix / 🟢 Good の3段階。Must Fix があれば implementer に差し戻される。

## Hooks

`settings.json` で以下が Edit/Write 後に自動実行される（`node_modules` が存在する場合のみ）:
- `tsc --noEmit` — 型チェック
- `eslint` — lint
- `prettier --check` — フォーマットチェック
