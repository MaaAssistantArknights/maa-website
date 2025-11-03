#!/bin/bash
WORKSPACE=$(pwd)

echo "===================="
cd "$WORKSPACE"
echo "Installing node modules..."
npm install -g pnpm
pnpm install --recursive --frozen-lockfile
