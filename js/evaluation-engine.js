class EvaluationEngine {
    constructor() {
        this.weights = {
            precision: 0.4,
            calmness: 0.3,
            dexterity: 0.3
        };
        
        this.rankThresholds = {
            SSS: 96,
            S: 86,
            A: 71,
            B: 41,
            C: 0
        };
    }

    calculateTakumiScore(measurements) {
        const precisionScore = this.calculatePrecisionScore(measurements.drawing);
        const calmnessScore = this.calculateCalmnessScore(measurements.physiological);
        const dexterityScore = this.calculateDexterityScore(measurements.drawing, measurements.recovery);
        
        const totalScore = Math.round(
            precisionScore * this.weights.precision +
            calmnessScore * this.weights.calmness +
            dexterityScore * this.weights.dexterity
        );
        
        const rank = this.determineRank(totalScore);
        const advice = this.generateAdvice(precisionScore, calmnessScore, dexterityScore, rank);
        
        return {
            totalScore,
            rank,
            breakdown: {
                precision: Math.round(precisionScore),
                calmness: Math.round(calmnessScore),
                dexterity: Math.round(dexterityScore)
            },
            advice
        };
    }

    calculatePrecisionScore(drawingData) {
        if (!drawingData) return 0;
        
        const {
            circleAccuracy = {},
            smoothness = 0,
            completeness = 0
        } = drawingData;
        
        const accuracyWeight = 0.5;
        const smoothnessWeight = 0.3;
        const completenessWeight = 0.2;
        
        const score = (
            (circleAccuracy.accuracy || 0) * accuracyWeight +
            smoothness * smoothnessWeight +
            (circleAccuracy.completeness || completeness) * completenessWeight
        ) * 100;
        
        return Math.min(100, Math.max(0, score));
    }

    calculateCalmnessScore(physiologicalData) {
        if (!physiologicalData) return 0;
        
        const {
            breathingStability = 0,
            facialCalmness = 0,
            stressResistance = 0
        } = physiologicalData;
        
        const breathingWeight = 0.4;
        const facialWeight = 0.3;
        const stressWeight = 0.3;
        
        const score = (
            breathingStability * breathingWeight +
            facialCalmness * facialWeight +
            stressResistance * stressWeight
        ) * 100;
        
        return Math.min(100, Math.max(0, score));
    }

    calculateDexterityScore(drawingData, recoveryData) {
        if (!drawingData && !recoveryData) return 0;
        
        const speedConsistency = drawingData?.speedConsistency || 0;
        const handSteadiness = 1 - (drawingData?.tremor || 0);
        const recoverySpeed = this.normalizeRecoverySpeed(recoveryData?.recoveryTime || 15);
        
        const consistencyWeight = 0.35;
        const steadinessWeight = 0.35;
        const recoveryWeight = 0.3;
        
        const score = (
            speedConsistency * consistencyWeight +
            handSteadiness * steadinessWeight +
            recoverySpeed * recoveryWeight
        ) * 100;
        
        return Math.min(100, Math.max(0, score));
    }

    normalizeRecoverySpeed(recoveryTime) {
        const idealRecovery = 5;
        const maxRecovery = 15;
        
        if (recoveryTime <= idealRecovery) return 1;
        if (recoveryTime >= maxRecovery) return 0;
        
        return 1 - ((recoveryTime - idealRecovery) / (maxRecovery - idealRecovery));
    }

    determineRank(score) {
        if (score >= this.rankThresholds.SSS) return 'SSS';
        if (score >= this.rankThresholds.S) return 'S';
        if (score >= this.rankThresholds.A) return 'A';
        if (score >= this.rankThresholds.B) return 'B';
        return 'C';
    }

    generateAdvice(precision, calmness, dexterity, rank) {
        const weakestArea = this.findWeakestArea(precision, calmness, dexterity);
        
        const adviceMap = {
            precision: {
                SSS: "完璧な精密さです！この調子を維持し、さらなる高みを目指しましょう。",
                S: "優れた精密さです。より滑らかな動きを意識すると完璧に近づけます。",
                A: "良好な精密さです。ゆっくりと正確に描くことを心がけましょう。",
                B: "精密さに改善の余地があります。まず大きな円から練習してみましょう。",
                C: "精密さを向上させましょう。深呼吸をして、ゆっくり始めることが大切です。"
            },
            calmness: {
                SSS: "驚異的な精神統一力！あなたは真の匠の境地にいます。",
                S: "素晴らしい落ち着きです。瞑想や呼吸法でさらに向上できます。",
                A: "良い集中力です。ストレス時も深呼吸を忘れずに。",
                B: "落ち着きを保つ練習が必要です。日々の瞑想を試してみましょう。",
                C: "リラックス方法を見つけましょう。まずは5分間の深呼吸から始めてください。"
            },
            dexterity: {
                SSS: "卓越した器用さ！あなたの手は芸術家のようです。",
                S: "優秀な器用さです。日常的な細かい作業でさらに磨けます。",
                A: "良い器用さです。ペン回しなどで指の柔軟性を高めましょう。",
                B: "器用さを向上させる余地があります。箸で豆をつまむ練習がおすすめです。",
                C: "基礎的な手の運動から始めましょう。グーパー運動を1日50回行ってください。"
            }
        };
        
        const primaryAdvice = adviceMap[weakestArea][rank];
        const drivingAdvice = this.generateDrivingAdvice(rank, precision, calmness, dexterity);
        
        return `${primaryAdvice}\n\n運転適性: ${drivingAdvice}`;
    }

    findWeakestArea(precision, calmness, dexterity) {
        const scores = {
            precision,
            calmness,
            dexterity
        };
        
        return Object.entries(scores).reduce((min, [key, value]) => 
            value < scores[min] ? key : min
        , 'precision');
    }

    generateDrivingAdvice(rank, precision, calmness, dexterity) {
        const avgScore = (precision + calmness + dexterity) / 3;
        
        if (rank === 'SSS' || rank === 'S') {
            return "優秀な運転適性があります。プロドライバーレベルの資質を持っています。";
        } else if (rank === 'A') {
            return "良好な運転適性です。安全運転を心がければ問題ありません。";
        } else if (rank === 'B') {
            return "標準的な運転適性です。疲労時の運転は控え、定期的な休憩を取りましょう。";
        } else {
            return "運転時は特に注意が必要です。体調が万全な時のみ運転し、長距離は避けましょう。";
        }
    }
}