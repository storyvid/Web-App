#!/bin/bash

echo "🧹 Clearing all React and Firebase caches..."

# Clear node_modules cache
echo "Clearing node_modules cache..."
rm -rf node_modules/.cache

# Clear React build cache
echo "Clearing React build cache..."
rm -rf build

# Clear any temporary files
echo "Clearing temporary files..."
rm -rf .cache
rm -rf dist

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Clear any Firebase emulator data
echo "Clearing Firebase emulator data..."
rm -rf .firebase

echo "✅ All caches cleared successfully!"
echo ""
echo "⚠️  IMPORTANT: Now you need to:"
echo "1. Restart your development server: npm start"
echo "2. Clear your browser cache/storage:"
echo "   - Open DevTools (F12)"
echo "   - Go to Application tab"
echo "   - Click 'Clear site data'"
echo "   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"