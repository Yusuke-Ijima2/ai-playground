# ユーザーについて

Yusuke-Ijimaが操作。前置きや挨拶は不要。

## よく使うコマンド

- 開発サーバー: `npm run dev`
- ビルド: `npm run build`
- テスト: `npm test`
- テスト（単体）: `npm test -- path/to/file`
- lint: `npx eslint .`
- 型チェック: `npx tsc --noEmit`
- フォーマット: `npx prettier --check .`

## アーキテクチャ

### スキルとエージェントの関係

スキル（ユーザーが直接呼ぶワークフロー）がエージェント（専門家）を組み合わせて処理を進める構造。

```
/dev-flow  ─→  planner(Opus) → implementer(Opus) → reviewer-*(Sonnet) → pr-creator(Sonnet)
/fix-pr    ─→  pr-fixer(Sonnet)
/review    ─→  reviewer-*(Sonnet) ※他人のPRレビュー用
/commit    ─→  (直接実行、サブエージェントなし)
/component-template ─→ (直接実行)
/pr-template ─→ (直接実行)
```

### レビュワーの並列実行

2人以上のレビュワーを選択すると Agent Teams で並列実行される。各レビュワーは独立コンテキストで動き、互いの発見を議論・統合する。

| レビュワー    | 観点                                           |
| ------------- | ---------------------------------------------- |
| reviewer-arch | コンポーネント設計・Next.js ベストプラクティス |
| reviewer-perf | 再レンダリング・メモ化・バンドルサイズ         |
| reviewer-test | テストカバレッジ・ユーザー操作ベース           |
| reviewer-sec  | XSS・認証認可・機密データ露出                  |

レビュー結果は 🔴 Must Fix / 🟡 Should Fix / 🟢 Good の3段階。Must Fix があれば implementer に差し戻される。
