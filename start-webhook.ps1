# Stripe Webhook Test Setup

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "         STRIPE WEBHOOK TEST SETUP            " -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Check if Stripe CLI is installed
$stripeInstalled = Get-Command stripe -ErrorAction SilentlyContinue
if (-not $stripeInstalled) {
    Write-Host "ERROR: Stripe CLI not found!" -ForegroundColor Red
    Write-Host "Install it from: https://stripe.com/docs/stripe-cli" -ForegroundColor Yellow
    Write-Host "Or run: scoop install stripe" -ForegroundColor Yellow
    exit 1
}

Write-Host "OK: Stripe CLI found" -ForegroundColor Green
Write-Host ""

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "OK: Backend is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend not running!" -ForegroundColor Red
    Write-Host "Start it with: cd server; npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Check if frontend is running
Write-Host "Checking if frontend is running..." -ForegroundColor Blue
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "OK: Frontend is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Frontend not running" -ForegroundColor Yellow
    Write-Host "Start it with: cd Client; npm run dev" -ForegroundColor Yellow
}
Write-Host ""

# Start Stripe webhook forwarding
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "     Starting Stripe Webhook Listener...      " -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "Forwarding webhooks to: http://localhost:5000/api/checkout/webhook" -ForegroundColor Green
Write-Host ""
Write-Host "WARNING: KEEP THIS TERMINAL OPEN!" -ForegroundColor Yellow
Write-Host "Webhooks will stop if you close this window." -ForegroundColor Yellow
Write-Host ""
Write-Host "Copy the webhook signing secret (whsec_...) to your .env file:" -ForegroundColor Cyan
Write-Host "STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Cyan
Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Start listening
stripe listen --forward-to localhost:5000/api/checkout/webhook
