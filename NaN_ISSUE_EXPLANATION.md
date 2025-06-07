# 落ち着き評価値がNaNになる問題の解説と対策

## 問題の原因

落ち着き（calmness）の評価値がNaNになる主な原因は以下の通りです：

### 1. 表情データが空の場合
- `expressionData` 配列が空の場合、`averageCalmness` の計算で 0/0 = NaN となる
- カメラが正しく初期化されていない
- face-api.jsのモデルが読み込まれていない
- 顔が検出されない

### 2. ストレス抵抗値の計算エラー
- `stressExpressions` が空の場合、division by zero が発生
- `facialBaseline` が設定されていない場合、`calculateStressLevel` が正しく動作しない

### 3. 呼吸データの不足
- `breathingBaseline` が正しく設定されていない
- 呼吸検出が失敗している

## 対策

### 即座の修正
main.js の `compileMeasurements` メソッドを以下のように修正：

```javascript
compileMeasurements() {
    // ... 既存のコード ...
    
    // 表情データのチェックとデフォルト値設定
    let averageCalmness = 0.5; // デフォルト値
    if (this.expressionData.length > 0) {
        averageCalmness = this.expressionData.reduce((sum, exp) => sum + (exp.calmScore || 0), 0) / this.expressionData.length;
    }
    
    // ストレス抵抗値の安全な計算
    let stressResistance = 0.5; // デフォルト値
    const stressExpressions = this.expressionData.slice(-20);
    if (stressExpressions.length > 0) {
        const totalStress = stressExpressions.reduce((sum, exp) => 
            sum + (this.faceAnalyzer.calculateStressLevel(exp) || 0), 0);
        stressResistance = Math.max(0, 1 - (totalStress / stressExpressions.length));
    }
    
    // 呼吸安定性の安全な計算
    const recentBreathing = this.breathingData.slice(-10);
    let breathingStability = 0.5; // デフォルト値
    if (recentBreathing.length >= 3) {
        breathingStability = this.faceAnalyzer.analyzeBreathingStability(recentBreathing);
    }
    
    this.measurements.physiological = {
        breathingStability: isNaN(breathingStability) ? 0.5 : breathingStability,
        facialCalmness: isNaN(averageCalmness) ? 0.5 : averageCalmness,
        stressResistance: isNaN(stressResistance) ? 0.5 : stressResistance
    };
}
```

### 根本的な対策

1. **エラーハンドリングの強化**
   - 各分析メソッドでnullチェックを追加
   - デフォルト値の設定

2. **デバッグログの追加**
   - 各フェーズでのデータ収集状況をログ出力
   - エラー発生時の詳細情報を記録

3. **フォールバック機能**
   - カメラが利用できない場合の代替評価方法
   - 顔検出が失敗した場合の手動入力オプション

4. **テスト環境の整備**
   - face-api.jsモデルの確実なダウンロード確認
   - カメラ権限の事前チェック

## テスト方法

1. ブラウザのコンソールを開く
2. 測定を実行し、以下を確認：
   - `expressionData.length` が 0 より大きいか
   - `breathingData.length` が適切か
   - 各スコアがNaNでないか

3. 問題が続く場合は、カメラ権限とHTTPS接続を再確認