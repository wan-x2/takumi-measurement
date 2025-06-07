class TakumiMeasurementSystem {
    constructor() {
        this.cameraController = new CameraController();
        this.faceAnalyzer = new FaceAnalyzer();
        this.drawingAnalyzer = null;
        this.stressTester = new StressTester();
        this.evaluationEngine = new EvaluationEngine();
        this.characterAnimator = new CharacterAnimator();
        
        this.measurements = {
            drawing: {},
            physiological: {},
            recovery: {}
        };
        
        this.breathingData = [];
        this.expressionData = [];
        this.currentPhase = 'idle';
        this.timer = 60;
        this.phaseTimers = {};
        
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.startButton = document.getElementById('startButton');
        this.timerDisplay = document.getElementById('timer');
        this.phaseIndicator = document.getElementById('phaseIndicator');
        this.breathingIndicator = document.getElementById('breathingIndicator');
        this.resultsPanel = document.getElementById('resultsPanel');
        this.canvas = document.getElementById('drawingCanvas');
        
        this.drawingAnalyzer = new DrawingAnalyzer(this.canvas);
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startMeasurement());
        document.getElementById('retryButton').addEventListener('click', () => this.reset());
        
        document.addEventListener('click', () => {
            if (this.stressTester.audioContext && this.stressTester.audioContext.state === 'suspended') {
                this.stressTester.audioContext.resume();
            }
        });
    }

    async startMeasurement() {
        console.log('Starting measurement...');
        this.startButton.disabled = true;
        this.resultsPanel.style.display = 'none';
        
        const cameraReady = await this.cameraController.initialize();
        if (!cameraReady) {
            this.startButton.disabled = false;
            return;
        }
        
        await this.faceAnalyzer.initialize();
        this.stressTester.initialize();
        
        this.characterAnimator.updateCharacterState(null, 'ready');
        this.startSequence();
    }

    startSequence() {
        this.timer = 60;
        this.updateTimer();
        
        this.runPhase('calibration', 0, 10, () => this.calibrationPhase());
        this.runPhase('drawing', 10, 15, () => this.drawingPhase());
        this.runPhase('stress', 25, 20, () => this.stressPhase());
        this.runPhase('recovery', 45, 15, () => this.recoveryPhase());
    }

    runPhase(phaseName, startTime, duration, phaseFunction) {
        this.phaseTimers[phaseName] = setTimeout(() => {
            this.currentPhase = phaseName;
            this.updatePhaseIndicator(phaseName);
            this.characterAnimator.updateCharacterState(null, phaseName);
            phaseFunction.call(this);
        }, startTime * 1000);
    }

    updateTimer() {
        const timerInterval = setInterval(() => {
            this.timer--;
            this.timerDisplay.textContent = this.timer;
            
            if (this.timer <= 0) {
                clearInterval(timerInterval);
                this.completeSequence();
            }
        }, 1000);
    }

    updatePhaseIndicator(phase) {
        const phaseNames = {
            calibration: '初期校正',
            drawing: '円描画',
            stress: '負荷試験',
            recovery: '回復評価'
        };
        this.phaseIndicator.textContent = phaseNames[phase] || phase;
    }

    async calibrationPhase() {
        console.log('Calibration phase started');
        this.breathingIndicator.style.display = 'block';
        this.stressTester.startBackgroundMusic();
        
        let breathCount = 0;
        const breathInterval = setInterval(async () => {
            if (breathCount >= 5 || this.currentPhase !== 'calibration') {
                clearInterval(breathInterval);
                this.breathingIndicator.style.display = 'none';
                
                if (this.breathingData.length >= 5) {
                    const calibration = this.faceAnalyzer.calibrateBreathing(this.breathingData);
                    console.log('Breathing calibrated:', calibration);
                }
                
                if (this.expressionData.length > 0) {
                    this.faceAnalyzer.setFacialBaseline(this.expressionData[this.expressionData.length - 1]);
                }
                return;
            }
            
            breathCount++;
            document.querySelector('.breath-count').textContent = `${breathCount}/5`;
            
            const breathingMeasurement = await this.faceAnalyzer.detectBreathing(this.cameraController.getVideoElement());
            if (breathingMeasurement) {
                this.breathingData.push(breathingMeasurement);
            }
            
            const expression = await this.faceAnalyzer.analyzeFacialExpression(this.cameraController.getVideoElement());
            if (expression) {
                this.expressionData.push(expression);
            }
        }, 2000);
    }

    drawingPhase() {
        console.log('Drawing phase started');
        this.drawingAnalyzer.reset();
        this.canvas.style.border = '2px solid #4ecdc4';
        
        const monitorInterval = setInterval(async () => {
            if (this.currentPhase !== 'drawing') {
                clearInterval(monitorInterval);
                this.canvas.style.border = 'none';
                return;
            }
            
            const breathing = await this.faceAnalyzer.detectBreathing(this.cameraController.getVideoElement());
            if (breathing) {
                this.breathingData.push(breathing);
            }
            
            const expression = await this.faceAnalyzer.analyzeFacialExpression(this.cameraController.getVideoElement());
            if (expression) {
                this.expressionData.push(expression);
            }
        }, 1000);
    }

    stressPhase() {
        console.log('Stress phase started');
        this.stressTester.startStressTest();
        
        const stressMonitor = setInterval(async () => {
            if (this.currentPhase !== 'stress') {
                clearInterval(stressMonitor);
                return;
            }
            
            const expression = await this.faceAnalyzer.analyzeFacialExpression(this.cameraController.getVideoElement());
            if (expression) {
                this.expressionData.push(expression);
                const stressLevel = this.faceAnalyzer.calculateStressLevel(expression);
                console.log('Stress level:', stressLevel);
            }
        }, 500);
    }

    async recoveryPhase() {
        console.log('Recovery phase started');
        this.stressTester.stopStressTest();
        
        const recoveryMetrics = await this.stressTester.getRecoveryMetrics();
        this.measurements.recovery = recoveryMetrics;
        
        const recoveryMonitor = setInterval(async () => {
            if (this.currentPhase !== 'recovery') {
                clearInterval(recoveryMonitor);
                return;
            }
            
            const breathing = await this.faceAnalyzer.detectBreathing(this.cameraController.getVideoElement());
            if (breathing) {
                this.breathingData.push(breathing);
            }
        }, 1000);
    }

    async completeSequence() {
        console.log('Measurement complete');
        this.currentPhase = 'complete';
        
        this.compileMeasurements();
        const results = this.evaluationEngine.calculateTakumiScore(this.measurements);
        
        this.characterAnimator.updateCharacterState(results.totalScore, 'complete');
        this.displayResults(results);
        
        this.stressTester.stopBackgroundMusic();
        this.cameraController.stop();
    }

    compileMeasurements() {
        const circleAnalysis = this.drawingAnalyzer.analyzeCircleAccuracy();
        const smoothness = this.drawingAnalyzer.analyzeSmoothness();
        const tremor = this.drawingAnalyzer.detectHandTremor();
        const speedConsistency = this.drawingAnalyzer.analyzeSpeedConsistency();
        
        this.measurements.drawing = {
            circleAccuracy: circleAnalysis,
            smoothness,
            tremor,
            speedConsistency,
            completeness: circleAnalysis.completeness
        };
        
        // 呼吸安定性の安全な計算
        const recentBreathing = this.breathingData.slice(-10);
        let breathingStability = 0.5; // デフォルト値
        if (recentBreathing.length >= 3) {
            breathingStability = this.faceAnalyzer.analyzeBreathingStability(recentBreathing);
        }
        
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
        
        // NaNチェックを含めた最終的な値の設定
        this.measurements.physiological = {
            breathingStability: isNaN(breathingStability) ? 0.5 : breathingStability,
            facialCalmness: isNaN(averageCalmness) ? 0.5 : averageCalmness,
            stressResistance: isNaN(stressResistance) ? 0.5 : stressResistance
        };
        
        console.log('Physiological measurements:', this.measurements.physiological);
    }

    displayResults(results) {
        document.getElementById('takumiScore').textContent = results.totalScore;
        document.getElementById('scoreRank').textContent = results.rank;
        document.getElementById('scoreRank').className = `score-rank rank-${results.rank.toLowerCase()}`;
        
        document.getElementById('precisionScore').textContent = results.breakdown.precision;
        document.getElementById('precisionBar').style.width = `${results.breakdown.precision}%`;
        
        document.getElementById('calmnessScore').textContent = results.breakdown.calmness;
        document.getElementById('calmnessBar').style.width = `${results.breakdown.calmness}%`;
        
        document.getElementById('dexterityScore').textContent = results.breakdown.dexterity;
        document.getElementById('dexterityBar').style.width = `${results.breakdown.dexterity}%`;
        
        document.getElementById('advice').textContent = results.advice;
        
        this.resultsPanel.style.display = 'block';
    }

    reset() {
        Object.values(this.phaseTimers).forEach(timer => clearTimeout(timer));
        this.phaseTimers = {};
        
        this.breathingData = [];
        this.expressionData = [];
        this.measurements = {
            drawing: {},
            physiological: {},
            recovery: {}
        };
        
        this.timer = 60;
        this.timerDisplay.textContent = '60';
        this.currentPhase = 'idle';
        this.phaseIndicator.textContent = '準備中';
        
        this.drawingAnalyzer.reset();
        this.characterAnimator.reset();
        this.resultsPanel.style.display = 'none';
        this.startButton.disabled = false;
        
        this.stressTester.stopBackgroundMusic();
        this.stressTester.stopStressTest();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const system = new TakumiMeasurementSystem();
    console.log('Takumi Measurement System initialized');
});