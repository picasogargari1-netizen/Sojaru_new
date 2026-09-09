#!/bin/bash
# ─── Sojaru Frontend Build Script ────────────────────────────────────────────
# Run this locally, then upload the generated 'frontend/build' folder to
# Hostinger's public_html directory

echo "Installing frontend dependencies..."
cd frontend
yarn install

echo "Building React frontend..."
yarn build

echo ""
echo "Done! Upload the 'frontend/build/' folder to Hostinger's public_html/"
