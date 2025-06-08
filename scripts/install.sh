#!/bin/bash

echo "Takumi Measurement System Installer"
echo "==================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 16 or higher."
    exit 1
fi

echo "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm."
    exit 1
fi

echo "npm version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if OpenSSL is installed
if ! command -v openssl &> /dev/null; then
    echo "Error: OpenSSL is not installed. Please install OpenSSL."
    exit 1
fi

# Generate SSL certificates if they don't exist
if [ ! -f "certs/server.key" ] || [ ! -f "certs/server.crt" ]; then
    echo "Generating SSL certificates..."
    mkdir -p certs
    openssl req -x509 -newkey rsa:2048 \
        -keyout certs/server.key \
        -out certs/server.crt \
        -days 365 -nodes \
        -subj "/C=JP/ST=Tokyo/L=Tokyo/O=Takumi/CN=localhost"
    echo "SSL certificates generated successfully."
else
    echo "SSL certificates already exist."
fi

# Download face-api.js models
echo "Downloading face-api.js models..."
mkdir -p models

MODEL_URL="https://github.com/justadudewhohacks/face-api.js-models/raw/master"
MODELS=(
    "tiny_face_detector_model-weights_manifest.json"
    "tiny_face_detector_model-shard1"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1"
    "face_expression_model-weights_manifest.json"
    "face_expression_model-shard1"
)

for model in "${MODELS[@]}"; do
    if [ ! -f "models/$model" ]; then
        echo "Downloading $model..."
        curl -L -o "models/$model" "$MODEL_URL/$model"
    else
        echo "$model already exists."
    fi
done

echo ""
echo "Installation complete!"
echo ""
echo "To start the server, run:"
echo "  node js/setup-https.js"
echo ""
echo "Then open your browser and navigate to:"
echo "  https://localhost:8443"
echo ""
echo "Note: You will see a certificate warning. This is normal for self-signed certificates."
echo "Click 'Advanced' and 'Proceed to localhost' to continue."