const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8446;

// Add explicit routes for model files
app.get('/models/:file', (req, res) => {
    const filePath = path.join(__dirname, '..', 'models', req.params.file);
    if (req.params.file.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json');
    } else {
        res.setHeader('Content-Type', 'application/octet-stream');
    }
    res.sendFile(filePath);
});

// Serve static files with proper MIME types for face-api models
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        } else if (filePath.includes('shard')) {
            res.setHeader('Content-Type', 'application/octet-stream');
        }
    }
}));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.redirect('/favicon.svg');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

try {
    const serverOptions = {
        key: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server.key')),
        cert: fs.readFileSync(path.join(__dirname, '..', 'certs', 'server.crt'))
    };

    https.createServer(serverOptions, app).listen(PORT, () => {
        console.log(`Takumi Measurement System running at https://localhost:${PORT}`);
        console.log('If you see a certificate warning, proceed to the site anyway (this is expected with self-signed certificates)');
    });
} catch (error) {
    console.error('Failed to start HTTPS server. Make sure SSL certificates are generated.');
    console.error('Run: openssl req -x509 -newkey rsa:2048 -keyout certs/server.key -out certs/server.crt -days 365 -nodes');
    process.exit(1);
}