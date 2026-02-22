## コンポーネント設計
- Functional Component のみ
- Props は interface で定義（type ではなく interface）
- ファイル名は PascalCase

## MUI
- styled を優先、sx は避ける
- テーマトークンを使う（色・spacing のハードコード禁止）

## Redux Toolkit
- slice は features/ 配下
- 非同期処理は createAsyncThunk
- state の直接変更は immer 経由のみ

## 禁止事項
- any 禁止
- console.log を残さない
- as による型アサーションは原則禁止
