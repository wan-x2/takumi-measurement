# トラブルシューティングガイド - 測定開始ボタンがクリックできない問題

## 問題の症状
「測定開始」ボタンがクリックできない、または反応しない

## 解決方法

### 1. HTTPSアクセスの確認
- **重要**: このアプリケーションはカメラアクセスのためHTTPS接続が必須です
- URL が `https://localhost:8443` であることを確認してください（httpではなくhttps）
- 証明書の警告が出た場合は「詳細設定」→「localhostにアクセスする（安全ではありません）」をクリック

### 2. サーバーの起動確認
```bash
# サーバーを起動
node js/setup-https.js

# 以下のメッセージが表示されることを確認
# Takumi Measurement System running at https://localhost:8443
```

### 3. ブラウザの互換性
推奨ブラウザ:
- Google Chrome (最新版)
- Microsoft Edge (最新版)
- Firefox (最新版)

### 4. カメラ権限の確認
1. ブラウザのアドレスバーの左側にあるカメラアイコンをクリック
2. カメラへのアクセスを「許可」に設定
3. ページを再読み込み（F5 または Ctrl+R）

### 5. コンソールでエラーを確認
1. F12キーを押して開発者ツールを開く
2. 「Console」タブを選択
3. 赤色のエラーメッセージを確認
4. 以下のようなエラーがないか確認:
   - `Failed to load face-api models`
   - `getUserMedia is not supported`
   - `Permission denied`

### 6. デバッグページでテスト
1. ブラウザで `https://localhost:8443/debug.html` にアクセス
2. 各テストボタンをクリックして動作確認
3. エラーメッセージを確認

### 7. キャッシュのクリア
1. Ctrl + Shift + R（Windows/Linux）または Cmd + Shift + R（Mac）でハード再読み込み
2. またはブラウザの設定からキャッシュをクリア

### 8. face-api.jsモデルの確認
```bash
# modelsディレクトリの確認
ls -la models/

# 以下のファイルが存在することを確認:
# - face_expression_model-shard1
# - face_expression_model-weights_manifest.json
# - face_landmark_68_model-shard1
# - face_landmark_68_model-weights_manifest.json
# - tiny_face_detector_model-shard1
# - tiny_face_detector_model-weights_manifest.json
```

### 9. 別のポートで試す
ポート8443が使用中の場合:
1. `js/setup-https.js` を編集
2. `const PORT = 8443;` を `const PORT = 8444;` に変更
3. サーバーを再起動
4. `https://localhost:8444` にアクセス

## それでも解決しない場合

1. ブラウザのコンソールログをコピー
2. 以下の情報を確認:
   - 使用しているブラウザとバージョン
   - OS（Windows/Mac/Linux）
   - エラーメッセージの全文

## よくある原因

1. **HTTP接続でアクセスしている** → HTTPSを使用
2. **カメラ権限がブロックされている** → 権限を許可
3. **ブラウザが古い** → 最新版に更新
4. **拡張機能の干渉** → シークレットモードで試す
5. **ファイアウォール/セキュリティソフトの干渉** → 一時的に無効化して確認