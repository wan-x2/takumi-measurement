class FaceAnalyzer {
    constructor() {
        this.isModelLoaded = false;
        this.breathingBaseline = [];
        this.facialBaseline = null;
        this.detectionOptions = null;
    }

    async initialize() {
        try {
            console.log('Loading face-api models...');
            console.log('Current URL:', window.location.href);
            console.log('Protocol:', window.location.protocol);
            
            // モデルのベースパスを動的に設定
            const modelPath = window.location.protocol === 'file:' 
                ? './models' 
                : '/models';
            
            console.log('Model path:', modelPath);
            
            // 各モデルを個別に読み込んでエラーを特定
            try {
                console.log('Loading tiny face detector...');
                await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);
                console.log('✓ Tiny face detector loaded');
            } catch (e) {
                console.error('Failed to load tiny face detector:', e);
                throw e;
            }
            
            try {
                console.log('Loading face landmark model...');
                await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath);
                console.log('✓ Face landmark model loaded');
            } catch (e) {
                console.error('Failed to load face landmark model:', e);
                throw e;
            }
            
            try {
                console.log('Loading face expression model...');
                await faceapi.nets.faceExpressionNet.loadFromUri(modelPath);
                console.log('✓ Face expression model loaded');
            } catch (e) {
                console.error('Failed to load face expression model:', e);
                throw e;
            }
            
            this.detectionOptions = new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.5
            });
            
            this.isModelLoaded = true;
            console.log('✓ All face-api models loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load face-api models:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack
            });
            return false;
        }
    }

    async detectBreathing(videoElement) {
        if (!this.isModelLoaded || !videoElement) return null;

        try {
            const detections = await faceapi
                .detectSingleFace(videoElement, this.detectionOptions)
                .withFaceLandmarks();

            if (!detections) return null;

            const noseTip = detections.landmarks.getNose()[6];
            const chin = detections.landmarks.positions[8];
            
            const distance = Math.sqrt(
                Math.pow(noseTip.x - chin.x, 2) + 
                Math.pow(noseTip.y - chin.y, 2)
            );

            return {
                distance,
                timestamp: Date.now(),
                noseTip,
                chin
            };
        } catch (error) {
            console.error('Breathing detection error:', error);
            return null;
        }
    }

    calibrateBreathing(breathingData) {
        if (!breathingData || breathingData.length < 5) return false;
        
        this.breathingBaseline = breathingData.map(d => d.distance);
        const avg = this.breathingBaseline.reduce((a, b) => a + b, 0) / this.breathingBaseline.length;
        const variance = this.breathingBaseline.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / this.breathingBaseline.length;
        
        return {
            average: avg,
            variance,
            stability: variance < 10
        };
    }

    async analyzeFacialExpression(videoElement) {
        if (!this.isModelLoaded || !videoElement) return null;

        try {
            const detections = await faceapi
                .detectSingleFace(videoElement, this.detectionOptions)
                .withFaceExpressions();

            if (!detections) return null;

            const expressions = detections.expressions;
            const calmScore = (expressions.neutral || 0) * 0.7 + 
                            (expressions.happy || 0) * 0.3 - 
                            (expressions.angry || 0) * 0.5 - 
                            (expressions.surprised || 0) * 0.3 -
                            (expressions.disgusted || 0) * 0.4 -
                            (expressions.fearful || 0) * 0.4 -
                            (expressions.sad || 0) * 0.3;

            return {
                expressions,
                calmScore: Math.max(0, Math.min(1, calmScore)),
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Expression analysis error:', error);
            return null;
        }
    }

    setFacialBaseline(expressionData) {
        if (!expressionData) return false;
        this.facialBaseline = expressionData;
        return true;
    }

    calculateStressLevel(currentExpression) {
        if (!this.facialBaseline || !currentExpression) return 0;
        
        const baselineCalm = this.facialBaseline.calmScore;
        const currentCalm = currentExpression.calmScore;
        const stressLevel = Math.max(0, baselineCalm - currentCalm);
        
        return Math.min(1, stressLevel * 2);
    }

    analyzeBreathingStability(recentBreathingData) {
        if (!recentBreathingData || recentBreathingData.length < 3) return 1;
        
        const distances = recentBreathingData.map(d => d.distance);
        const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((a, b) => a + Math.pow(b - avgDistance, 2), 0) / distances.length;
        
        const baselineAvg = this.breathingBaseline.reduce((a, b) => a + b, 0) / this.breathingBaseline.length;
        const deviation = Math.abs(avgDistance - baselineAvg) / baselineAvg;
        
        const stability = 1 - Math.min(1, (variance / 100 + deviation));
        return Math.max(0, stability);
    }
}