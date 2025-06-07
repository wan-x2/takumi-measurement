# Takumi Measurement System - 匠度測定システム

[日本語版 README はこちら](README_ja.md)

A 60-second precision measurement system that evaluates your "Takumi-do" (craftsman level) through mouse drawing tasks, facial analysis, and stress response.

## Features

- **60-second comprehensive test** measuring precision, calmness, and dexterity
- **Real-time facial analysis** using face-api.js for breathing and expression monitoring
- **Circle drawing task** to measure hand precision and steadiness
- **Stress testing phase** with visual and audio stimuli
- **Recovery evaluation** to assess stress resilience
- **Takumi score calculation** with ranks from C to SSS
- **Driving aptitude assessment** based on overall performance
- **Cute cat character** providing guidance and encouragement

## Installation

1. Clone the repository
2. Run the installation script:
   ```bash
   cd takumi-measurement
   ./scripts/install.sh
   ```

3. Add required assets:
   - Background music: `sound/backmusic.mp3`
   - (Optional) Replace placeholder images in `image/` directory

## Running the System

```bash
node js/setup-https.js
```

Then open your browser and navigate to: https://localhost:8443

**Note:** You will see a certificate warning. This is normal for self-signed certificates. Click 'Advanced' and 'Proceed to localhost' to continue.

## Test Sequence

1. **0-10s: Initial Calibration**
   - Camera and microphone initialization
   - 5 breathing cycles for baseline
   - Facial expression baseline capture

2. **10-25s: Circle Drawing**
   - Draw a circle following the guide
   - Measures precision, smoothness, and hand steadiness

3. **25-45s: Stress Test**
   - Irritating visual stimuli appear
   - Background music tempo and volume increase
   - Continue drawing while under stress

4. **45-60s: Recovery Evaluation**
   - Stress stimuli removed
   - Measures recovery speed
   - Final score calculation

## Scoring System

- **Precision (40%)**: Circle accuracy, smoothness, completeness
- **Calmness (30%)**: Breathing stability, facial calmness, stress resistance
- **Dexterity (30%)**: Speed consistency, hand steadiness, recovery speed

### Ranks
- **SSS**: 96-100 (Legendary Craftsman)
- **S**: 86-95 (Master Level)
- **A**: 71-85 (Excellent)
- **B**: 41-70 (Good)
- **C**: 0-40 (Needs Practice)

## Requirements

- Node.js 16 or higher
- Modern browser with WebRTC support
- Webcam and microphone permissions
- HTTPS connection (provided by self-signed certificate)

## Troubleshooting

- **Camera not working**: Ensure HTTPS access and camera permissions are granted
- **No sound**: Click anywhere on the page to enable audio playback
- **face-api errors**: Run install script to download model files
- **Certificate errors**: Accept the self-signed certificate in your browser

## License

This project is for demonstration and educational purposes.