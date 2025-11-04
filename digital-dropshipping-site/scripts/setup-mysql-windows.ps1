# MySQL Setup Guide for Windows (Without Docker)
# This script provides instructions for installing MySQL directly on Windows

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MySQL Setup Guide for Windows" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📥 Option 1: Install MySQL Installer (Recommended)" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Download MySQL Installer:" -ForegroundColor White
Write-Host "   https://dev.mysql.com/downloads/installer/" -ForegroundColor Green
Write-Host ""
Write-Host "2. Choose: MySQL Installer - Community (Full)" -ForegroundColor White
Write-Host "   - File size: ~400MB" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run installer and select:" -ForegroundColor White
Write-Host "   ✓ MySQL Server" -ForegroundColor Green
Write-Host "   ✓ MySQL Workbench (GUI tool)" -ForegroundColor Green
Write-Host "   ✓ MySQL Shell (Command line)" -ForegroundColor Green
Write-Host ""
Write-Host "4. During setup, set root password: 'rootpass'" -ForegroundColor White
Write-Host "   (or your preferred password)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Create database and user:" -ForegroundColor White
Write-Host "   Database: uniti" -ForegroundColor Green
Write-Host "   User: uniti" -ForegroundColor Green
Write-Host "   Password: unitipass" -ForegroundColor Green
Write-Host ""

Write-Host "📦 Option 2: Use Chocolatey (Package Manager)" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you have Chocolatey installed, run:" -ForegroundColor White
Write-Host "  choco install mysql" -ForegroundColor Green
Write-Host ""

Write-Host "🔧 After Installation:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Connection Details:" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor Green
Write-Host "  Port: 3306" -ForegroundColor Green
Write-Host "  Database: uniti" -ForegroundColor Green
Write-Host "  User: root" -ForegroundColor Green
Write-Host "  Password: <your root password>" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Create Database and User:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Open MySQL Workbench or MySQL Command Line Client" -ForegroundColor White
Write-Host "and run these commands:" -ForegroundColor White
Write-Host ""
Write-Host "CREATE DATABASE IF NOT EXISTS uniti;" -ForegroundColor Cyan
Write-Host "CREATE USER IF NOT EXISTS 'uniti'@'localhost' IDENTIFIED BY 'unitipass';" -ForegroundColor Cyan
Write-Host "GRANT ALL PRIVILEGES ON uniti.* TO 'uniti'@'localhost';" -ForegroundColor Cyan
Write-Host "FLUSH PRIVILEGES;" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Test Connection:" -ForegroundColor Yellow
Write-Host ""
Write-Host "In MySQL Workbench, create new connection:" -ForegroundColor White
Write-Host "  Connection Name: Uniti Local" -ForegroundColor Green
Write-Host "  Hostname: localhost" -ForegroundColor Green
Write-Host "  Port: 3306" -ForegroundColor Green
Write-Host "  Username: uniti" -ForegroundColor Green
Write-Host "  Password: unitipass" -ForegroundColor Green
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Update your .env.local file:" -ForegroundColor White
Write-Host "   DB_HOST=localhost" -ForegroundColor Gray
Write-Host "   DB_PORT=3306" -ForegroundColor Gray
Write-Host "   DB_NAME=uniti" -ForegroundColor Gray
Write-Host "   DB_USER=uniti" -ForegroundColor Gray
Write-Host "   DB_PASSWORD=unitipass" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Install MySQL driver for Node.js:" -ForegroundColor White
Write-Host "   npm install mysql2" -ForegroundColor Green
Write-Host ""
Write-Host "3. Run your SQL migrations using MySQL Workbench" -ForegroundColor White
Write-Host "   or convert PostgreSQL SQL to MySQL syntax" -ForegroundColor Gray
Write-Host ""
