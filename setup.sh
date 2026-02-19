#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Birthday RSVP - Local Development Setup${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js is not installed${NC}"
  echo "Please install Node.js from https://nodejs.org/"
  exit 1
fi

echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
if command -v pnpm &> /dev/null; then
  pnpm install
else
  npm install -g pnpm
  pnpm install
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd server
npm install
cd ..

echo -e "${GREEN}✓ All dependencies installed${NC}"

# Create .env files if they don't exist
if [ ! -f .env.development ]; then
  echo -e "${YELLOW}Creating .env.development...${NC}"
  echo "VITE_API_URL=http://localhost:5000" > .env.development
fi

if [ ! -f server/.env ]; then
  echo -e "${YELLOW}Creating server/.env...${NC}"
  cp server/.env.example server/.env
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}To start development:${NC}"
echo "1. In one terminal: ${GREEN}npm run dev${NC} (frontend)"
echo "2. In another terminal: ${GREEN}cd server && npm run dev${NC} (backend)"
echo ""
echo -e "${YELLOW}Admin Panel: ${GREEN}http://localhost:5173/admin${NC}"
echo ""
