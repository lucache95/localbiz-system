#!/bin/bash
# LocalBiz System — Install Script
# Creates symlinks from ~/.claude/ into this repo so edits here apply everywhere.
# Run once after cloning. Re-run to update.

set -e

SYSTEM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "LocalBiz System — Install"
echo "Repo: $SYSTEM_DIR"
echo ""

# ── Ask for projects directory ───────────────────────────────────────────────
DEFAULT_PROJECTS_DIR="$HOME/localbiz-projects"

# If already configured, read the existing value as the default
EXISTING_CONFIG="$HOME/.claude/localbiz/config.json"
if [ -f "$EXISTING_CONFIG" ]; then
  EXISTING_DIR=$(python3 -c "import json,sys; d=json.load(open('$EXISTING_CONFIG')); print(d.get('projectsDir',''))" 2>/dev/null || echo "")
  if [ -n "$EXISTING_DIR" ]; then
    DEFAULT_PROJECTS_DIR="$EXISTING_DIR"
  fi
fi

echo "Where should client website projects be created?"
echo "Press Enter to use the default, or type a different path."
echo ""
printf "Projects directory [%s]: " "$DEFAULT_PROJECTS_DIR"
read -r USER_PROJECTS_DIR

PROJECTS_DIR="${USER_PROJECTS_DIR:-$DEFAULT_PROJECTS_DIR}"
# Expand ~ manually
PROJECTS_DIR="${PROJECTS_DIR/#\~/$HOME}"

echo ""
echo "Using: $PROJECTS_DIR"
mkdir -p "$PROJECTS_DIR"

# ── Install symlinks ─────────────────────────────────────────────────────────
if [ -e ~/.claude/commands/localbiz ]; then
  rm -rf ~/.claude/commands/localbiz
fi

if [ -e ~/.claude/localbiz ]; then
  rm -rf ~/.claude/localbiz
fi

ln -s "$SYSTEM_DIR/commands" ~/.claude/commands/localbiz
ln -s "$SYSTEM_DIR/resources" ~/.claude/localbiz

# ── Write config ─────────────────────────────────────────────────────────────
cat > ~/.claude/localbiz/config.json <<EOF
{
  "projectsDir": "$PROJECTS_DIR",
  "systemDir": "$SYSTEM_DIR"
}
EOF

echo ""
echo "✓ Installed"
echo "  ~/.claude/commands/localbiz  →  $SYSTEM_DIR/commands"
echo "  ~/.claude/localbiz           →  $SYSTEM_DIR/resources"
echo "  Projects directory:             $PROJECTS_DIR"
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
