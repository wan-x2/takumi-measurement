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

# Create placeholder assets if they don't exist
echo "Creating placeholder assets..."
mkdir -p image sound

# Create placeholder images if they don't exist
if [ ! -f "image/c.png" ]; then
    echo "Creating placeholder cat image..."
    # Create a simple SVG cat and convert to PNG using ImageMagick if available
    if command -v convert &> /dev/null; then
        cat > image/c.svg << 'EOF'
<svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <circle cx="75" cy="75" r="40" fill="#FFB6C1" stroke="#000" stroke-width="2"/>
  <circle cx="60" cy="65" r="5" fill="#000"/>
  <circle cx="90" cy="65" r="5" fill="#000"/>
  <path d="M 75 80 Q 65 90 55 85" fill="none" stroke="#000" stroke-width="2"/>
  <path d="M 75 80 Q 85 90 95 85" fill="none" stroke="#000" stroke-width="2"/>
  <path d="M 35 40 L 45 60 L 55 50 Z" fill="#FFB6C1" stroke="#000" stroke-width="2"/>
  <path d="M 115 40 L 105 60 L 95 50 Z" fill="#FFB6C1" stroke="#000" stroke-width="2"/>
</svg>
EOF
        convert image/c.svg image/c.png
        rm image/c.svg
    else
        echo "Note: ImageMagick not found. Please add a cat image at image/c.png"
    fi
fi

# Create placeholder irritating images
for i in 1 2 3; do
    if [ ! -f "image/irritating$i.png" ]; then
        echo "Creating placeholder irritating image $i..."
        if command -v convert &> /dev/null; then
            # Create random noise pattern
            convert -size 200x200 xc: +noise Random "image/irritating$i.png"
        else
            echo "Note: Please add irritating images at image/irritating$i.png"
        fi
    fi
done

# Create placeholder background music if it doesn't exist
if [ ! -f "sound/backmusic.mp3" ]; then
    echo "Note: Please add background music at sound/backmusic.mp3"
    echo "The system will work without it, but the experience will be limited."
fi

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