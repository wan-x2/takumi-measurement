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
        // デバッグ: ボタンのクリック可能性を確認
        console.log('Setting up event listeners...');
        console.log('Start button element:', this.startButton);
        console.log('Start button computed style:', window.getComputedStyle(this.startButton));
        
        // iOS audio handling - must be initialized on user interaction
        const initializeAudioForIOS = async () => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            
            if (isIOS) {
                console.log('iOS detected, initializing audio...');
                
                // Initialize audio context
                if (!this.stressTester.audioContext) {
                    this.stressTester.initialize();
                }
                
                // Play and immediately pause to unlock audio on iOS
                const bgMusic = document.getElementById('bgMusic');
                if (bgMusic) {
                    bgMusic.volume = 0.01; // Very low volume for initialization
                    try {
                        await bgMusic.play();
                        bgMusic.pause();
                        bgMusic.currentTime = 0;
                        bgMusic.volume = 0.3; // Reset to normal volume
                        console.log('iOS audio unlocked successfully');
                    } catch (e) {
                        console.warn('iOS audio initialization failed:', e);
                    }
                }
            }
        };
        
        // クリックイベントの詳細なデバッグ
        this.startButton.addEventListener('click', async (e) => {
            console.log('Start button clicked!', e);
            console.log('Click coordinates:', e.clientX, e.clientY);
            console.log('Button disabled state:', this.startButton.disabled);
            
            // Initialize audio for iOS on first user interaction
            await initializeAudioForIOS();
            
            this.startMeasurement();
        });
        
        // キャプチャフェーズでもイベントを確認
        this.startButton.addEventListener('click', (e) => {
            console.log('Start button clicked (capture phase)');
        }, true);
        
        // ポインターイベントも確認
        this.startButton.addEventListener('pointerdown', (e) => {
            console.log('Pointer down on start button');
        });
        
        document.getElementById('retryButton').addEventListener('click', async (e) => {
            console.log('Retry button clicked!', e);
            e.stopPropagation();
            
            // Initialize audio for iOS on retry
            await initializeAudioForIOS();
            
            this.reset();
        });
        
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
        
        try {
            const cameraReady = await this.cameraController.initialize();
            if (!cameraReady) {
                console.error('Camera initialization failed');
                alert('カメラの初期化に失敗しました。ブラウザでカメラへのアクセスを許可してください。');
                this.startButton.disabled = false;
                return;
            }
            
            const faceApiReady = await this.faceAnalyzer.initialize();
            if (!faceApiReady) {
                console.error('Face API initialization failed');
                alert('顔認識モデルの読み込みに失敗しました。ページを再読み込みしてください。');
                this.startButton.disabled = false;
                return;
            }
            
            this.stressTester.initialize();
            
            this.characterAnimator.updateCharacterState(null, 'ready');
            await this.startSequence();
        } catch (error) {
            console.error('Measurement start error:', error);
            alert('測定の開始中にエラーが発生しました: ' + error.message);
            this.startButton.disabled = false;
        }
    }

    async startSequence() {
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
        await this.stressTester.startBackgroundMusic();
        
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
        
        // Show the circle guide
        const circleGuide = document.getElementById('circleGuide');
        if (circleGuide) {
            circleGuide.style.display = 'block';
        }
        
        const monitorInterval = setInterval(async () => {
            if (this.currentPhase !== 'drawing') {
                clearInterval(monitorInterval);
                this.canvas.style.border = 'none';
                // Hide the circle guide
                const circleGuide = document.getElementById('circleGuide');
                if (circleGuide) {
                    circleGuide.style.display = 'none';
                }
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
        
        // Clear the canvas for a fresh start
        this.drawingAnalyzer.clearCanvas();
        this.drawingAnalyzer.reset();
        this.characterAnimator.reset();
        this.resultsPanel.style.display = 'none';
        this.startButton.disabled = false;
        
        // Hide circle guide
        const circleGuide = document.getElementById('circleGuide');
        if (circleGuide) {
            circleGuide.style.display = 'none';
        }
        
        this.stressTester.stopBackgroundMusic();
        this.stressTester.stopStressTest();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const system = new TakumiMeasurementSystem();
        console.log('Takumi Measurement System initialized');
        
        // Check if button is actually clickable
        const startButton = document.getElementById('startButton');
        if (startButton) {
            console.log('Start button found:', startButton);
            console.log('Start button disabled:', startButton.disabled);
            
            // ボタンの詳細な状態をチェック
            const rect = startButton.getBoundingClientRect();
            const style = window.getComputedStyle(startButton);
            
            console.log('Button position:', {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });
            
            console.log('Button styles:', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                pointerEvents: style.pointerEvents,
                zIndex: style.zIndex,
                position: style.position,
                cursor: style.cursor
            });
            
            // クリック位置の要素を確認
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const elementAtCenter = document.elementFromPoint(centerX, centerY);
            console.log('Element at button center:', elementAtCenter);
            console.log('Is it the button?', elementAtCenter === startButton);
            
            // 親要素のスタイルも確認
            let parent = startButton.parentElement;
            while (parent && parent !== document.body) {
                const parentStyle = window.getComputedStyle(parent);
                if (parentStyle.pointerEvents === 'none' || 
                    parentStyle.display === 'none' || 
                    parentStyle.visibility === 'hidden') {
                    console.warn('Parent element blocking clicks:', parent, {
                        pointerEvents: parentStyle.pointerEvents,
                        display: parentStyle.display,
                        visibility: parentStyle.visibility
                    });
                }
                parent = parent.parentElement;
            }
            
            // テストクリックイベントを追加
            startButton.addEventListener('mouseenter', () => {
                console.log('Mouse entered button');
            });
            
            startButton.addEventListener('mouseleave', () => {
                console.log('Mouse left button');
            });
            
        } else {
            console.error('Start button not found!');
        }
    } catch (error) {
        console.error('Failed to initialize Takumi Measurement System:', error);
    }
});