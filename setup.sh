#!/bin/bash

# Webcafe AI - Quick Setup Script
# Run this after cloning the repository

echo "🚀 Setting up Webcafe AI..."
echo ""

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install functions dependencies
echo "📦 Installing functions dependencies..."
cd functions
npm install
cd ..

echo ""
echo "✅ Dependencies installed!"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "⚠️  Firebase CLI not found. Installing globally..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI ready"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Firebase configuration"
fi

# Check for Firebase project
if [ ! -f .firebaserc ]; then
    echo "⚠️  .firebaserc not configured"
else
    PROJECT_ID=$(grep -o '"default": "[^"]*"' .firebaserc | cut -d'"' -f4)
    if [ "$PROJECT_ID" = "YOUR_PROJECT_ID" ]; then
        echo "⚠️  Please update .firebaserc with your Firebase project ID"
    else
        echo "✅ Firebase project: $PROJECT_ID"
    fi
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Firebase configuration"
echo "2. Update .firebaserc with your Firebase project ID"
echo "3. Set OpenAI API key: firebase functions:config:set openai.key=\"YOUR_KEY\""
echo "4. Start emulators: npm run emulators"
echo "5. In another terminal, start dev server: npm run dev"
echo ""
echo "📚 Read README.md for detailed setup instructions"
echo "🔒 Read SECURITY.md for security best practices"
echo "🚀 Read DEPLOYMENT.md before deploying to production"
echo ""
