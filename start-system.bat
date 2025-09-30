@echo off
echo 🚀 Starting Employee QR Attendance System...
echo.

echo 🔄 Cleaning up existing processes...
taskkill /f /im node.exe 2>nul
echo ✅ Cleaned up existing processes
echo.

echo 🔧 Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "npm start"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🔧 Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd client && npm start"

echo ⏳ Waiting for React to start...
timeout /t 10 /nobreak >nul

echo.
echo 🎉 System Status:
echo    ✅ Backend API: http://localhost:5000
echo    ✅ React Frontend: http://localhost:3000
echo.
echo 📱 Access Points:
echo    • Employee Scanner: http://localhost:3000
echo    • Admin Panel: http://localhost:3000/admin/login
echo.
echo 🔑 Admin Login:
echo    Username: admin
echo    Password: admin123
echo.
echo 🌐 Opening browser...
start http://localhost:3000

pause
