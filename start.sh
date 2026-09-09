#!/bin/bash
# ─── Sojaru Backend Startup Script ───────────────────────────────────────────
# Run this on your Hostinger VPS to start the backend

echo "Installing Python dependencies..."
cd backend
pip install -r requirements.txt

echo "Starting Sojaru API server..."
python server.py
