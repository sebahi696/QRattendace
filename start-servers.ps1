Write-Host "🚀 Starting Employee QR Attendance System..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes on ports 5000 and 3000
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*5000*" -or $_.MainWindowTitle -like "*3000*" } | Stop-Process -Force
    Write-Host "✅ Cleaned up existing processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  No existing processes to clean up" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔧 Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "npm start" -WindowStyle Minimized

# Wait a moment for backend to start
Start-Sleep -Seconds 3

Write-Host "🔧 Starting React Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd client && npm start" -WindowStyle Minimized

Write-Host ""
Write-Host "⏳ Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🎉 System Status:" -ForegroundColor Green
Write-Host "   ✅ Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "   ✅ React Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 Access Points:" -ForegroundColor Yellow
Write-Host "   • Employee Scanner: http://localhost:3000" -ForegroundColor White
Write-Host "   • Admin Panel: http://localhost:3000/admin/login" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Admin Login:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:3000"
