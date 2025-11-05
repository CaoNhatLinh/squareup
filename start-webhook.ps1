# 🚀 Stripe Webhook Test Setup

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                                                        ║" -ForegroundColor Blue
Write-Host "║          🚀 STRIPE WEBHOOK TEST SETUP 🚀              ║" -ForegroundColor Blue
Write-Host "║                                                        ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Check if Stripe CLI is installed
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripeInstalled) {
    Write-Host "❌ Stripe CLI not found!" -ForegroundColor Red
    Write-Host "📥 Install it from: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Stripe CLI found" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend not running!" -ForegroundColor Red
    Write-Host "📝 Start it with: cd server; npm start" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check if frontend is running
Write-Host "🔍 Checking if frontend is running..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Frontend is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Frontend not running" -ForegroundColor Yellow
    Write-Host "📝 Start it with: cd Client; npm run dev" -ForegroundColor Yellow
}
Write-Host ""

# Start Stripe webhook forwarding
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                                                        ║" -ForegroundColor Blue
Write-Host "║     🎧 Starting Stripe Webhook Listener...            ║" -ForegroundColor Blue
Write-Host "║                                                        ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "📡 Forwarding webhooks to: http://localhost:5000/api/checkout/webhook" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  KEEP THIS TERMINAL OPEN!" -ForegroundColor Yellow
Write-Host "   Webhooks will stop if you close this window." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# Start listening
stripe listen --forward-to localhost:5000/api/checkout/webhook
