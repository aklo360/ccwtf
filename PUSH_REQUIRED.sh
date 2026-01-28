#!/bin/bash
# This script needs to be run from the HOST machine, not inside the container

echo "=== Git Push Script for CCWTF Therapy Feature ==="
echo ""
echo "⚠️  RETRY ATTEMPT #5 - Git Authentication Required"
echo ""
echo "The therapy feature is built and ready, but cannot be pushed from the container."
echo "The container's SSH key is not authorized for the GitHub repository."
echo ""
echo "CODE STATUS:"
echo "  ✅ Feature built successfully in app/therapy/"
echo "  ✅ npm run build passes - no errors"
echo "  ✅ /therapy route is functional"
echo "  ❌ Git push blocked - authentication issue"
echo ""
echo "📊 Commits waiting to push: 6 commits"
echo ""
echo "Attempting to push from HOST machine..."
echo ""

cd /Users/claude/ccwtf || exit 1
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! All commits pushed to GitHub"
  echo ""
  echo "Commits pushed:"
  git log origin/main..HEAD --oneline 2>/dev/null || echo "  - 6 commits including therapy feature"
  echo ""
  echo "🎉 Deployment can now proceed - Cloudflare will auto-deploy from GitHub"
else
  echo ""
  echo "❌ Push failed. Please run manually:"
  echo "   cd /Users/claude/ccwtf && git push origin main"
  echo ""
  echo "OR add the container's SSH key to GitHub:"
  echo "   1. Copy key: cat /root/.ssh/id_ed25519.pub (inside container)"
  echo "   2. Add to: https://github.com/aklo360/cc/settings/keys"
  echo ""
  echo "OR use a GitHub Personal Access Token:"
  echo "   git remote set-url origin https://TOKEN@github.com/aklo360/cc.git"
  echo "   git push origin main"
fi
