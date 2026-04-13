#!/usr/bin/env bash
set -euo pipefail

echo "====================================================="
echo "Starting ROTA demo..."
echo "====================================================="

if ! docker info >/dev/null 2>&1; then
  echo "ERRO: Docker não está rodando."
  exit 1
fi

if [ ! -f .env ]; then
  echo "ERRO: arquivo .env não encontrado. Copie de .env.example"
  exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
  echo "ERRO: DATABASE_URL ausente no .env."
  exit 1
fi

docker compose up -d

# Check if apps/api folder exists to know where we are
cd apps/api || exit 1
npm install
npx prisma generate
npx prisma db push

cd ../../contracts/soroban/escrow-interface
cargo build
cd ../../..

export PORT="${PORT:-8080}"
cd apps/api && npm run dev
