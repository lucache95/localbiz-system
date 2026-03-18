#!/bin/bash
# LocalBiz System — Install Script
# Creates symlinks from ~/.claude/ into this repo so edits here apply everywhere.

set -e

SYSTEM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing LocalBiz system from: $SYSTEM_DIR"

# Remove existing (symlinks or directories)
if [ -e ~/.claude/commands/localbiz ]; then
  rm -rf ~/.claude/commands/localbiz
  echo "Removed existing ~/.claude/commands/localbiz"
fi

if [ -e ~/.claude/localbiz ]; then
  rm -rf ~/.claude/localbiz
  echo "Removed existing ~/.claude/localbiz"
fi

# Create symlinks
ln -s "$SYSTEM_DIR/commands" ~/.claude/commands/localbiz
ln -s "$SYSTEM_DIR/resources" ~/.claude/localbiz

echo ""
echo "✓ Installed"
echo "  ~/.claude/commands/localbiz → $SYSTEM_DIR/commands"
echo "  ~/.claude/localbiz          → $SYSTEM_DIR/resources"
echo ""
echo "Commands available:"
echo "  /localbiz:intake"
echo "  /localbiz:parse-form"
echo "  /localbiz:analyze-site"
echo "  /localbiz:generate-spec"
echo "  /localbiz:build-site"
echo "  /localbiz:revise"
echo ""
echo "See QUICKSTART.md for usage."
