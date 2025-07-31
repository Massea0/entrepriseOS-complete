Write-Host "🚀 Starting Enterprise OS Development Server..." -ForegroundColor Cyan
Write-Host ""

# Set environment variable
$env:NODE_ENV = "development"

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created. Please update it with your Supabase credentials." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create a .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Start the development server
Write-Host "🔧 Starting server on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Use npx to ensure tsx is found
npx tsx --env-file=.env server/index.ts