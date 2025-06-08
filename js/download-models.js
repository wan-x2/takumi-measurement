const https = require('https');
const fs = require('fs');
const path = require('path');

const modelBaseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
];

const modelsDir = path.join(__dirname, '..', 'models');

function downloadFile(filename) {
    return new Promise((resolve, reject) => {
        const url = `${modelBaseUrl}/${filename}`;
        const filePath = path.join(modelsDir, filename);
        const file = fs.createWriteStream(filePath);

        console.log(`Downloading ${filename}...`);

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filePath, () => {});
            reject(err);
        });
    });
}

async function downloadAllModels() {
    console.log('Starting model download...');
    console.log(`Models directory: ${modelsDir}`);

    if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
        console.log('Created models directory');
    }

    try {
        for (const model of models) {
            await downloadFile(model);
        }
        console.log('\n✓ All models downloaded successfully!');
        console.log('You can now run the application.');
    } catch (error) {
        console.error('\n✗ Error downloading models:', error.message);
        console.error('Please check your internet connection and try again.');
        process.exit(1);
    }
}

downloadAllModels();