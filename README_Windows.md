# Takumi Measurement System - Windows セットアップガイド

## 必要なソフトウェア

1. **Node.js** (バージョン16以上)
   - ダウンロード: https://nodejs.org/
   - LTS版を推奨

2. **Git** (git導入でバンドルされるopensslを利用する為)
   
## インストール手順

### 1. 自動インストール（推奨）

```batch
cd takumi-measurement
scripts\install.bat
```

このスクリプトは以下を実行します：
- Node.jsとnpmの確認
- 必要なパッケージのインストール
- SSL証明書の生成
- face-api.jsモデルのダウンロード

### 2. 手動インストール

もし自動インストールが失敗した場合：

#### 依存関係のインストール
```batch
npm install
```

#### SSL証明書の生成

```batch
mkdir certs
bash -c "if command -v openssl >/dev/null 2>&1; then openssl req -x509 -newkey rsa:2048 -keyout certs/server.key -out certs/server.crt -days 365 -nodes -subj '/C=JP/ST=Tokyo/L=Tokyo/O=Takumi/CN=localhost' && echo 'SSL certificates generated successfully.'; else echo 'OpenSSL not found in Git Bash'; exit 1; fi"
```

#### モデルファイルのダウンロード
```batch
node js\download-models.js
```

## アプリケーションの起動

### 簡単な起動方法
```batch
start.bat
```

### 手動起動
```batch
node js\setup-https.js
```

## アクセス方法

ブラウザで以下のURLにアクセス：
```
https://localhost:8443
```

**注意**: 自己署名証明書を使用しているため、ブラウザで警告が表示されます。
- Chrome/Edge: 「詳細設定」→「localhost にアクセスする（安全ではありません）」
- Firefox: 「詳細設定」→「危険性を承知で続行」

## トラブルシューティング

### OpenSSLが見つからない
- 環境変数PATHにOpenSSLのbinフォルダを追加してください
- または、PowerShellスクリプトを使用してください

### ポート8443が使用中
`js\setup-https.js`を編集して、別のポート番号に変更してください：
```javascript
const PORT = 8444; // 別のポート番号
```

### カメラが動作しない
- ブラウザでカメラの使用を許可してください
- HTTPSでないと最新のブラウザではカメラが使用できません

### モデルの読み込みエラー
```batch
node js\download-models.js
```
を再実行してください。

## 必要なファイル

以下のファイルは手動で追加する必要があります：
- `image/c.png` - 猫のキャラクター画像
- `image/irritating1.png` - ストレス画像1
- `image/irritating2.png` - ストレス画像2
- `image/irritating3.png` - ストレス画像3
- `sound/backmusic.mp3` - BGM（オプション）

## セキュリティに関する注意

このアプリケーションは自己署名証明書を使用しています。本番環境では、正式な証明書を使用してください。