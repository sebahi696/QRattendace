#!/bin/bash

# Build script for Railway deployment
echo "🚀 Starting build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Build the React app
echo "🔨 Building React application..."
cd client
npm run build
cd ..

echo "✅ Build completed successfully!"
