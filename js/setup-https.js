const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8443;

app.use(express.static(path.join(__dirname, '..')));

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    next();
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