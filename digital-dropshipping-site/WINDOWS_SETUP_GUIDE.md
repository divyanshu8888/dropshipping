# Local Database Setup for Windows

## 🎯 Quick Overview

You want to set up a local MySQL database. Here are your options:

---

## Option 1: Docker Desktop (Recommended - Easiest) ⭐

### Install Docker Desktop:

1. **Download Docker Desktop for Windows:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - File size: ~500MB

2. **Install Docker Desktop:**
   - Run the installer
   - **Restart your computer** when prompted
   - Docker Desktop will start automatically

3. **Verify Installation:**
   ```powershell
   docker --version
   ```

4. **Start MySQL Container:**
   ```powershell
   docker run -d `
     --name uniti-mysql `
     -e MYSQL_ROOT_PASSWORD=rootpass `
     -e MYSQL_DATABASE=uniti `
     -e MYSQL_USER=uniti `
     -e MYSQL_PASSWORD=unitipass `
     -p 3306:3306 `
     mysql:8.4 `
     --default-authentication-plugin=mysql_native_password
   ```

5. **Verify it's running:**
   ```powershell
   docker ps
   ```

6. **Connect to MySQL:**
   ```powershell
   docker exec -it uniti-mysql mysql -uuniti -punitipass uniti
   ```

**Benefits:**
- ✅ Easy cleanup (just stop container)
- ✅ No Windows service clutter
- ✅ Works exactly like production
- ✅ Easy to reset/recreate

---

## Option 2: MySQL Installer (Native Windows)

### Download and Install:

1. **Download MySQL Installer:**
   - Visit: https://dev.mysql.com/downloads/installer/
   - Choose: **MySQL Installer - Community**
   - Download the "Full" installer (~400MB)

2. **Run Installer:**
   - Select "Developer Default" or "Server only"
   - Click "Execute" to install
   - During configuration:
     - Choose "Standalone MySQL Server"
     - Select "Development Computer"
     - Choose "Use Strong Password Encryption"
     - Set root password: `rootpass` (or your choice)

3. **Install MySQL Workbench (GUI):**
   - Select "MySQL Workbench" in installer
   - Install it

4. **Start MySQL Service:**
   ```powershell
   # Check if MySQL service is running
   Get-Service -Name MySQL*
   
   # If not running, start it:
   Start-Service MySQL*
   ```

5. **Create Database and User:**
   - Open **MySQL Workbench**
   - Connect to `root@localhost` with your root password
   - Run these SQL commands:
   ```sql
   CREATE DATABASE IF NOT EXISTS uniti;
   CREATE USER IF NOT EXISTS 'uniti'@'localhost' IDENTIFIED BY 'unitipass';
   GRANT ALL PRIVILEGES ON uniti.* TO 'uniti'@'localhost';
   FLUSH PRIVILEGES;
   ```

**Benefits:**
- ✅ No Docker needed
- ✅ Runs as Windows service
- ✅ Includes MySQL Workbench GUI
- ✅ Native performance

**Drawbacks:**
- ❌ Harder to remove/cleanup
- ❌ Windows service management

---

## Option 3: XAMPP (All-in-One)

### Install XAMPP:

1. **Download XAMPP:**
   - Visit: https://www.apachefriends.org/download.html
   - Download XAMPP for Windows (~150MB)
   - Includes: MySQL, PHP, Apache, phpMyAdmin

2. **Install XAMPP:**
   - Run installer
   - Install to `C:\xampp` (default)
   - **Uncheck** antivirus warnings (it's safe)

3. **Start MySQL:**
   - Open **XAMPP Control Panel**
   - Click "Start" next to MySQL
   - Click "Admin" to open phpMyAdmin

4. **Create Database:**
   - In phpMyAdmin:
   - Click "New" in left sidebar
   - Database name: `uniti`
   - Click "Create"

5. **Create User:**
   - Click "Users accounts" tab
   - Click "Add user account"
   - Username: `uniti`
   - Password: `unitipass`
   - Host: `localhost`
   - Click "Create user"

**Benefits:**
- ✅ Includes phpMyAdmin (web-based GUI)
- ✅ Also includes Apache, PHP
- ✅ Easy to use

**Drawbacks:**
- ❌ Includes extra software you might not need

---

## 🔧 Connection Details (All Options)

Once installed, use these connection details:

```
Host: localhost
Port: 3306
Database: uniti
Username: uniti
Password: unitipass
Root Password: rootpass
```

---

## 📝 Update Your Application

### For Next.js/Node.js:

1. **Install MySQL driver:**
   ```powershell
   npm install mysql2
   ```

2. **Create connection file** `src/lib/mysql.ts`:
   ```typescript
   import mysql from 'mysql2/promise';

   const pool = mysql.createPool({
     host: process.env.DB_HOST || 'localhost',
     port: parseInt(process.env.DB_PORT || '3306'),
     database: process.env.DB_NAME || 'uniti',
     user: process.env.DB_USER || 'uniti',
     password: process.env.DB_PASSWORD || 'unitipass',
     waitForConnections: true,
     connectionLimit: 10,
   });

   export default pool;
   ```

3. **Update `.env.local`:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=uniti
   DB_USER=uniti
   DB_PASSWORD=unitipass
   ```

---

## 🛠️ Database Management Tools

### MySQL Workbench (Included with MySQL Installer)
- **Best for**: MySQL-specific features
- **Download**: Included with MySQL Installer

### phpMyAdmin (Included with XAMPP)
- **Best for**: Web-based management
- **URL**: http://localhost/phpmyadmin

### DBeaver (Recommended) ⭐
- **Best for**: Universal database tool
- **Download**: https://dbeaver.io/download/
- **Free and open-source**

### VS Code Extensions
- **MySQL** extension
- **SQLTools** extension

---

## 🚀 Quick Commands

### Docker (Option 1):
```powershell
# Start MySQL
docker start uniti-mysql

# Stop MySQL
docker stop uniti-mysql

# View logs
docker logs uniti-mysql

# Connect to MySQL
docker exec -it uniti-mysql mysql -uuniti -punitipass uniti

# Remove container
docker stop uniti-mysql
docker rm uniti-mysql
```

### Native MySQL (Option 2):
```powershell
# Start MySQL service
Start-Service MySQL*

# Stop MySQL service
Stop-Service MySQL*

# Connect via command line (if MySQL is in PATH)
mysql -uuniti -punitipass uniti
```

### XAMPP (Option 3):
- Use XAMPP Control Panel to start/stop
- Access phpMyAdmin at: http://localhost/phpmyadmin

---

## ⚠️ Converting PostgreSQL to MySQL

**Important:** Your SQL files are written for PostgreSQL. MySQL has some differences:

### Key Differences:
1. **UUID**: MySQL doesn't have `gen_random_uuid()` - use `UUID()` instead
2. **Auto-increment**: MySQL uses `AUTO_INCREMENT` instead of `SERIAL`
3. **Data types**: Some type differences
4. **Functions**: Some function name differences

### Quick Fix Script:
I can help you convert your PostgreSQL SQL to MySQL if needed!

---

## 🎯 My Recommendation

**For Windows Development:**

1. **Best Option: Docker Desktop** ⭐
   - Clean, isolated environment
   - Easy to reset
   - Production-like setup
   - **Install Docker Desktop first!**

2. **Alternative: XAMPP**
   - If you don't want Docker
   - Includes everything
   - Easy GUI (phpMyAdmin)

3. **Native MySQL Installer**
   - If you want official MySQL
   - More setup steps
   - Includes MySQL Workbench

---

## 📚 Next Steps

1. **Choose an option above**
2. **Install it**
3. **Create database and user**
4. **Connect using DBeaver or MySQL Workbench**
5. **Run your SQL migrations**

Need help with any step? Let me know!
