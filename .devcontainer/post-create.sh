#!/bin/bash
WORKSPACE=$(pwd)

echo "===================="
cd "$WORKSPACE"
echo "Installing node modules..."
pnpm install
