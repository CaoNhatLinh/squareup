#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}║          🚀 STRIPE WEBHOOK TEST SETUP 🚀              ║${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${RED}❌ Stripe CLI not found!${NC}"
    echo -e "${YELLOW}📥 Install it from: https://stripe.com/docs/stripe-cli${NC}"
    echo -e "${YELLOW}   Or run: brew install stripe/stripe-cli/stripe${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Stripe CLI found${NC}"
echo ""

# Check if backend is running
echo -e "${BLUE}🔍 Checking if backend is running...${NC}"
if curl -s http://localhost:5000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 5000${NC}"
else
    echo -e "${RED}❌ Backend not running!${NC}"
    echo -e "${YELLOW}📝 Start it with: cd server && npm run dev${NC}"
    exit 1
fi
echo ""

# Check if frontend is running
echo -e "${BLUE}🔍 Checking if frontend is running...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 5173${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend not running${NC}"
    echo -e "${YELLOW}📝 Start it with: cd Client && npm run dev${NC}"
fi
echo ""

# Start Stripe webhook forwarding
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}║     🎧 Starting Stripe Webhook Listener...            ║${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📡 Forwarding webhooks to: http://localhost:5000/api/checkout/webhook${NC}"
echo ""
echo -e "${YELLOW}⚠️  KEEP THIS TERMINAL OPEN!${NC}"
echo -e "${YELLOW}   Webhooks will stop if you close this window.${NC}"
echo ""
echo -e "${CYAN}🔑 Copy the webhook signing secret (whsec_...) to your .env file:${NC}"
echo -e "${CYAN}   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Start listening
stripe listen --forward-to localhost:5000/api/checkout/webhook
