class CharacterAnimator {
    constructor() {
        this.character = document.getElementById('characterCat');
        this.messageBox = document.getElementById('characterMessage');
        this.currentState = 'idle';
        this.animationTimer = null;
    }

    updateCharacterState(score, phase) {
        this.setMessage(this.getPhaseMessage(phase, score));
        this.animateCharacter(phase, score);
    }

    getPhaseMessage(phase, score) {
        const messages = {
            ready: "こんにちは！匠度測定を始めましょう。リラックスしてくださいね。",
            calibration: "まず深呼吸を5回してください。私も一緒にやりますよ。",
            drawing: "円を描いてください。焦らず、ゆっくりで大丈夫です。",
            stress: "少し難しくなりますが、落ち着いて続けてください！",
            recovery: "もう少しです！深呼吸をして、リラックスしましょう。",
            complete: this.getCompletionMessage(score)
        };
        
        return messages[phase] || "頑張ってください！";
    }

    getCompletionMessage(score) {
        if (!score) return "測定完了！結果を計算中...";
        
        if (score >= 96) {
            return "信じられない！あなたは真の匠です！SSS級の才能をお持ちです！";
        } else if (score >= 86) {
            return "素晴らしい！S級の実力者ですね。プロレベルに近いです！";
        } else if (score >= 71) {
            return "とても良いですね！A級の腕前です。さらに磨きをかけましょう！";
        } else if (score >= 41) {
            return "良い結果です！B級の実力があります。練習で更に向上できますよ！";
        } else {
            return "お疲れ様でした！まだ伸びしろがたくさんありますね。一緒に頑張りましょう！";
        }
    }

    setMessage(message) {
        this.messageBox.textContent = message;
        this.messageBox.style.animation = 'none';
        setTimeout(() => {
            this.messageBox.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }

    animateCharacter(phase, score) {
        clearInterval(this.animationTimer);
        
        switch(phase) {
            case 'ready':
                this.setIdleAnimation();
                break;
            case 'calibration':
                this.setBreathingAnimation();
                break;
            case 'drawing':
                this.setEncouragingAnimation();
                break;
            case 'stress':
                this.setWorryAnimation();
                break;
            case 'recovery':
                this.setCalmingAnimation();
                break;
            case 'complete':
                this.setCelebrationAnimation(score);
                break;
        }
    }

    setIdleAnimation() {
        this.character.style.animation = 'bounce 2s infinite';
        this.animationTimer = setInterval(() => {
            const random = Math.random();
            if (random < 0.3) {
                this.character.style.transform = 'scaleX(-1)';
            } else if (random < 0.6) {
                this.character.style.transform = 'scaleX(1)';
            }
        }, 3000);
    }

    setBreathingAnimation() {
        this.character.style.animation = 'breathe 4s infinite';
    }

    setEncouragingAnimation() {
        this.character.style.animation = 'nod 1s infinite';
        this.animationTimer = setInterval(() => {
            this.character.style.transform = `rotate(${Math.sin(Date.now() / 1000) * 5}deg)`;
        }, 100);
    }

    setWorryAnimation() {
        this.character.style.animation = 'shake 0.5s infinite';
    }

    setCalmingAnimation() {
        this.character.style.animation = 'breathe 3s infinite';
    }

    setCelebrationAnimation(score) {
        if (score >= 86) {
            this.character.style.animation = 'jump 0.5s infinite';
        } else if (score >= 71) {
            this.character.style.animation = 'bounce 1s infinite';
        } else {
            this.character.style.animation = 'nod 1.5s infinite';
        }
    }

    addCustomAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
            
            @keyframes breathe {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes nod {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-10deg); }
                75% { transform: rotate(10deg); }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            @keyframes jump {
                0%, 100% { transform: translateY(0) scaleY(1); }
                40% { transform: translateY(-30px) scaleY(1); }
                50% { transform: translateY(-30px) scaleY(0.8); }
                60% { transform: translateY(0) scaleY(1.2); }
                80% { transform: translateY(0) scaleY(0.9); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    reset() {
        clearInterval(this.animationTimer);
        this.character.style.animation = '';
        this.character.style.transform = '';
        this.messageBox.textContent = '';
        this.currentState = 'idle';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const animator = new CharacterAnimator();
    animator.addCustomAnimations();
});