#!/bin/bash
# This script needs to be run from the HOST machine, not inside the container

echo "=== Git Push Script for CCWTF Therapy Feature ==="
echo ""
echo "Attempting to push 4 commits to GitHub..."
echo ""

cd /Users/claude/ccwtf || exit 1
git push origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ SUCCESS! All commits pushed to GitHub"
  echo ""
  echo "Commits pushed:"
  git log origin/main..HEAD --oneline 2>/dev/null || echo "  - 4 commits including therapy feature fixes"
else
  echo ""
  echo "❌ Push failed. Run manually: cd /Users/claude/ccwtf && git push origin main"
fi
