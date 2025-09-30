Write-Host "🧪 Testing Employee QR Attendance System..." -ForegroundColor Green
Write-Host ""

# Test 1: Check if backend server is running
Write-Host "1. Testing backend server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard/stats" -Method GET
    Write-Host "✅ Backend server is running on port 5000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend server is not running. Please start with: npm start" -ForegroundColor Red
    exit
}

# Test 2: Check if React server is running
Write-Host ""
Write-Host "2. Testing React server connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ React server is running on port 3000" -ForegroundColor Green
} catch {
    Write-Host "⚠️  React server is not running. Starting it now..." -ForegroundColor Yellow
    Write-Host "   Please run: cd client && npm start" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🎉 System Status:" -ForegroundColor Green
Write-Host "   - Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   - React Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Employee Scanner: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - Admin Panel: http://localhost:3000/admin/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Admin credentials:" -ForegroundColor Yellow
Write-Host "   - Username: admin" -ForegroundColor White
Write-Host "   - Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📱 How to use:" -ForegroundColor Green
Write-Host "   1. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host "   2. Enter Employee ID and Name" -ForegroundColor White
Write-Host "   3. Click 'Check In' or 'Check Out'" -ForegroundColor White
Write-Host "   4. For admin features, go to /admin/login" -ForegroundColor White
