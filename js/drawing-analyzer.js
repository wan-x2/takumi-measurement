class DrawingAnalyzer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isDrawing = false;
        this.points = [];
        this.targetCenter = { x: 300, y: 300 };
        this.targetRadius = 100;
        this.startTime = null;
        this.lastPoint = null;
        this.initializeCanvas();
    }

    initializeCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = '#4ecdc4';
        
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseleave', this.stopDrawing.bind(this));
    }

    reset() {
        this.points = [];
        this.startTime = null;
        this.lastPoint = null;
        this.clearCanvas();
        this.drawTargetCircle();
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTargetCircle() {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(this.targetCenter.x, this.targetCenter.y, this.targetRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
    }

    startDrawing(e) {
        if (!this.startTime) {
            this.startTime = Date.now();
        }
        
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            timestamp: Date.now()
        };
        
        this.lastPoint = point;
        this.points.push(point);
        
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const point = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            timestamp: Date.now()
        };
        
        this.points.push(point);
        
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();
        
        const speed = this.calculateSpeed(this.lastPoint, point);
        point.speed = speed;
        
        this.lastPoint = point;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    calculateSpeed(point1, point2) {
        if (!point1 || !point2) return 0;
        
        const distance = Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + 
            Math.pow(point2.y - point1.y, 2)
        );
        const timeDiff = point2.timestamp - point1.timestamp;
        
        return timeDiff > 0 ? distance / timeDiff : 0;
    }

    analyzeCircleAccuracy() {
        if (this.points.length < 10) return { accuracy: 0, completeness: 0 };
        
        let totalDeviation = 0;
        let maxDeviation = 0;
        
        this.points.forEach(point => {
            const distance = Math.sqrt(
                Math.pow(point.x - this.targetCenter.x, 2) + 
                Math.pow(point.y - this.targetCenter.y, 2)
            );
            const deviation = Math.abs(distance - this.targetRadius);
            totalDeviation += deviation;
            maxDeviation = Math.max(maxDeviation, deviation);
        });
        
        const avgDeviation = totalDeviation / this.points.length;
        const accuracy = Math.max(0, 1 - (avgDeviation / this.targetRadius));
        
        const startAngle = Math.atan2(
            this.points[0].y - this.targetCenter.y,
            this.points[0].x - this.targetCenter.x
        );
        const endAngle = Math.atan2(
            this.points[this.points.length - 1].y - this.targetCenter.y,
            this.points[this.points.length - 1].x - this.targetCenter.x
        );
        
        let angleDiff = Math.abs(endAngle - startAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        const completeness = angleDiff / (2 * Math.PI);
        
        return {
            accuracy,
            completeness,
            avgDeviation,
            maxDeviation,
            pointCount: this.points.length
        };
    }

    analyzeSmoothness() {
        if (this.points.length < 3) return 1;
        
        let totalAngleChange = 0;
        
        for (let i = 1; i < this.points.length - 1; i++) {
            const angle1 = Math.atan2(
                this.points[i].y - this.points[i - 1].y,
                this.points[i].x - this.points[i - 1].x
            );
            const angle2 = Math.atan2(
                this.points[i + 1].y - this.points[i].y,
                this.points[i + 1].x - this.points[i].x
            );
            
            let angleDiff = Math.abs(angle2 - angle1);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            totalAngleChange += angleDiff;
        }
        
        const avgAngleChange = totalAngleChange / (this.points.length - 2);
        const smoothness = Math.max(0, 1 - (avgAngleChange / Math.PI));
        
        return smoothness;
    }

    detectHandTremor() {
        if (this.points.length < 10) return 0;
        
        const speeds = this.points.filter(p => p.speed !== undefined).map(p => p.speed);
        if (speeds.length < 5) return 0;
        
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const speedVariance = speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / speeds.length;
        
        const tremor = Math.min(1, speedVariance / (avgSpeed * avgSpeed));
        return tremor;
    }

    analyzeSpeedConsistency() {
        const speeds = this.points.filter(p => p.speed !== undefined).map(p => p.speed);
        if (speeds.length < 5) return 0;
        
        const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
        const variance = speeds.reduce((a, b) => a + Math.pow(b - avgSpeed, 2), 0) / speeds.length;
        const stdDev = Math.sqrt(variance);
        
        const consistency = Math.max(0, 1 - (stdDev / avgSpeed));
        return consistency;
    }

    getDrawingDuration() {
        if (!this.startTime || this.points.length === 0) return 0;
        return (this.points[this.points.length - 1].timestamp - this.startTime) / 1000;
    }
}