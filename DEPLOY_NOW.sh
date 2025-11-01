#!/bin/bash

echo "🚀 Supplement Safety Bible - Production Deployment"
echo "=================================================="
echo ""

# Check if we're in a git repo
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git config user.email "deploy@supplementsafetybible.com"
    git config user.name "Production Deploy"
fi

# Add all files
echo "📦 Adding files..."
git add .

# Commit
echo "💾 Creating commit..."
git commit -m "Production deployment - $(date +%Y%m%d-%H%M%S)" || echo "No changes to commit"

# Set branch to main
git branch -M main

# Add remote if not exists
if ! git remote | grep -q "origin"; then
    echo "🔗 Adding GitHub remote..."
    git remote add origin https://github.com/StStroh/supplement-safety-bible.git
fi

echo ""
echo "✅ Ready to push!"
echo ""
echo "Now run: git push -u origin main --force"
echo ""
echo "Or if you need authentication:"
echo "git push https://YOUR_TOKEN@github.com/StStroh/supplement-safety-bible.git main --force"
echo ""
echo "After pushing, Netlify will auto-deploy in ~30 seconds! 🎉"
