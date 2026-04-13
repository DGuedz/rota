#!/bin/bash

# ==============================================================================
# ROTA: Routing Onchain Transactions for Agents
# Hackathon Local Demo Startup Script
# ==============================================================================

echo "====================================================="
echo "🚀 Starting ROTA Hybrid Agentic Economy (Local Demo)"
echo "====================================================="

# 1. Start Infrastructure (PostgreSQL + Redis)
echo "\n[1/4] Starting Database and Redis Queue via Docker Compose..."
if ! command -v docker-compose &> /dev/null
then
    echo "❌ Error: docker-compose could not be found. Please install Docker."
    exit 1
fi
docker-compose up -d
sleep 3

# 2. Build and Migrate DB
echo "\n[2/4] Setting up Database Schema and Prisma Client..."
cd apps/api
npm install
npx prisma generate
npx prisma migrate dev --name init_demo || echo "⚠️ Migration already applied or skipped."

# 3. Build Soroban Contracts (Optional / Verification)
echo "\n[3/4] Verifying Soroban Smart Contracts (VSC Rules Applied)..."
cd ../../contracts/soroban/escrow-interface
cargo check
cd ../../../apps/api

# 4. Start Fastify API & Agent Workforce
echo "\n[4/4] Booting ROTA Event Bus (BullMQ) and Agent Dispatcher..."
echo "The API will be available at http://localhost:8080"
echo "Press Ctrl+C to stop."
echo "====================================================="

npm run dev
