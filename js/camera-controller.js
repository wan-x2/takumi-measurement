class CameraController {
    constructor() {
        this.video = document.getElementById('userVideo');
        this.stream = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });

            this.isInitialized = true;
            console.log('Camera initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize camera:', error);
            alert('カメラへのアクセスが必要です。ブラウザの設定でカメラの使用を許可してください。');
            return false;
        }
    }

    getVideoElement() {
        return this.video;
    }

    isReady() {
        return this.isInitialized && this.video.readyState === 4;
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
            this.isInitialized = false;
        }
    }

    async captureFrame() {
        if (!this.isReady()) return null;

        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);
        
        return canvas;
    }
}