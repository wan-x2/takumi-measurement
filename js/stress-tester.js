class StressTester {
    constructor() {
        this.bgMusic = document.getElementById('bgMusic');
        this.stressContainer = document.getElementById('stressContainer');
        this.stressImages = [
            document.getElementById('stressImage1'),
            document.getElementById('stressImage2'),
            document.getElementById('stressImage3')
        ];
        this.originalTempo = 1.0;
        this.originalVolume = 0.3;
        this.stressLevel = 0;
        this.isActive = false;
        this.audioContext = null;
        this.gainNode = null;
    }

    initialize() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaElementSource(this.bgMusic);
            this.gainNode = this.audioContext.createGain();
            
            source.connect(this.gainNode);
            this.gainNode.connect(this.audioContext.destination);
            
            this.bgMusic.volume = this.originalVolume;
            this.gainNode.gain.value = 1;
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
            return false;
        }
    }

    startBackgroundMusic() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        this.bgMusic.playbackRate = this.originalTempo;
        this.bgMusic.volume = this.originalVolume;
        this.bgMusic.play().catch(error => {
            console.error('Failed to start background music:', error);
        });
    }

    stopBackgroundMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }

    startStressTest() {
        this.isActive = true;
        this.stressLevel = 0;
        this.stressContainer.style.display = 'grid';
        
        this.animateStressElements();
        this.escalateAudioStress();
    }

    stopStressTest() {
        this.isActive = false;
        this.stressContainer.style.display = 'none';
        
        this.stressImages.forEach(img => {
            img.style.opacity = '0';
            img.style.animation = 'none';
        });
        
        this.resetAudio();
    }

    animateStressElements() {
        if (!this.isActive) return;
        
        this.stressImages.forEach((img, index) => {
            setTimeout(() => {
                if (!this.isActive) return;
                
                img.style.opacity = '1';
                img.style.animation = `flicker ${0.3 + Math.random() * 0.2}s infinite`;
                
                setInterval(() => {
                    if (!this.isActive) return;
                    
                    const randomX = (Math.random() - 0.5) * 20;
                    const randomY = (Math.random() - 0.5) * 20;
                    const randomRotate = (Math.random() - 0.5) * 10;
                    
                    img.style.transform = `translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
                }, 100);
            }, index * 500);
        });
    }

    escalateAudioStress() {
        if (!this.isActive) return;
        
        const stressInterval = setInterval(() => {
            if (!this.isActive) {
                clearInterval(stressInterval);
                return;
            }
            
            this.stressLevel = Math.min(1, this.stressLevel + 0.05);
            
            const newTempo = this.originalTempo + (this.stressLevel * 0.5);
            const newVolume = this.originalVolume + (this.stressLevel * 0.4);
            
            this.bgMusic.playbackRate = newTempo;
            this.bgMusic.volume = Math.min(1, newVolume);
            
            if (this.gainNode) {
                const distortion = 1 + (this.stressLevel * 0.3);
                this.gainNode.gain.value = distortion;
            }
            
            if (Math.random() < this.stressLevel * 0.3) {
                this.glitchAudio();
            }
        }, 1000);
    }

    glitchAudio() {
        const originalRate = this.bgMusic.playbackRate;
        this.bgMusic.playbackRate = 0.5 + Math.random() * 2;
        
        setTimeout(() => {
            if (this.isActive) {
                this.bgMusic.playbackRate = originalRate;
            }
        }, 100 + Math.random() * 200);
    }

    resetAudio() {
        const resetInterval = setInterval(() => {
            if (this.stressLevel <= 0) {
                clearInterval(resetInterval);
                this.bgMusic.playbackRate = this.originalTempo;
                this.bgMusic.volume = this.originalVolume;
                if (this.gainNode) {
                    this.gainNode.gain.value = 1;
                }
                return;
            }
            
            this.stressLevel = Math.max(0, this.stressLevel - 0.1);
            
            const currentTempo = this.originalTempo + (this.stressLevel * 0.5);
            const currentVolume = this.originalVolume + (this.stressLevel * 0.4);
            
            this.bgMusic.playbackRate = currentTempo;
            this.bgMusic.volume = currentVolume;
            
            if (this.gainNode) {
                const distortion = 1 + (this.stressLevel * 0.3);
                this.gainNode.gain.value = distortion;
            }
        }, 200);
    }

    getRecoveryMetrics() {
        const startStress = this.stressLevel;
        const startTime = Date.now();
        
        return new Promise((resolve) => {
            const checkRecovery = setInterval(() => {
                if (this.stressLevel <= 0.1) {
                    clearInterval(checkRecovery);
                    const recoveryTime = (Date.now() - startTime) / 1000;
                    resolve({
                        recoveryTime,
                        startStress,
                        recoveryRate: startStress / recoveryTime
                    });
                }
            }, 100);
        });
    }
}