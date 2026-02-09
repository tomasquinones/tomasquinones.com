# Photo-Framer Deployment Guide

## One-Time cPanel Setup

### 1. Create MySQL Database

1. Log in to cPanel
2. Go to **MySQL Databases**
3. Create a new database (e.g., `yourusername_photo_framer`)
4. Create a new database user with a strong password
5. Add the user to the database with **ALL PRIVILEGES**
6. Note down:
   - Database name: `yourusername_photo_framer`
   - Database user: `yourusername_photoframer`
   - Database password: (your password)

### 2. Run Database Schema

1. Go to **phpMyAdmin** in cPanel
2. Select your new database
3. Click the **SQL** tab
4. Copy and paste the contents of `scripts/setup-database.sql`
5. Click **Go** to run

### 3. Create the Photos Directory

1. Go to **File Manager** in cPanel
2. Navigate to your home directory (above public_html)
3. Create a new folder called `photos`
4. Inside `photos`, create:
   - `uploads/originals/`
   - `uploads/thumbnails/`
   - `uploads/temp/`
   - `tmp/` (for Passenger restart)

### 4. Create Production .env File

1. In File Manager, navigate to `~/photos/`
2. Create a new file called `.env`
3. Add the following (replace with your values):

```
NODE_ENV=production
PORT=3001

DB_HOST=localhost
DB_USER=yourusername_photoframer
DB_PASS=your_database_password
DB_NAME=yourusername_photo_framer

IMAGE_TOKEN_SECRET=your_64_byte_hex_secret
ALLOWED_ORIGINS=https://tomasquinones.com
```

Generate the secret with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 5. Set Up Node.js Application

1. Go to **Setup Node.js App** in cPanel
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 20.x (or latest LTS)
   - **Application mode**: Production
   - **Application root**: photos
   - **Application URL**: tomasquinones.com/photos
   - **Application startup file**: app.js
4. Click **Create**
5. Note the command to enter the virtual environment (you'll need this for npm install)

### 6. Install Dependencies (First Time)

1. Go to **Terminal** in cPanel (or SSH in)
2. Enter the Node.js virtual environment (command from step 5)
3. Navigate to the photos directory:
   ```bash
   cd ~/photos
   ```
4. Install dependencies:
   ```bash
   npm install --omit=dev
   ```

### 7. Create Admin User

1. In Terminal (still in virtual environment):
   ```bash
   cd ~/photos
   export ADMIN_EMAIL=your@email.com
   export ADMIN_USERNAME=admin
   export ADMIN_PASSWORD=YourSecurePassword123!
   node seed-admin.js
   ```

### 8. Start the Application

1. Go back to **Setup Node.js App**
2. Find your application and click **Restart**

---

## GitHub Actions Setup

### Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `FTP_HOST` | Your FTP hostname (e.g., `ftp.tomasquinones.com`) |
| `FTP_USER` | Your FTP/cPanel username |
| `FTP_PASS` | Your FTP/cPanel password |
| `SSH_HOST` | Same as FTP_HOST (optional, for app restart) |
| `SSH_USER` | Same as FTP_USER (optional) |
| `SSH_PASS` | Same as FTP_PASS (optional) |

### Triggering Deployment

Deployments happen automatically when:
- You push changes to `main` branch
- Changes are in the `photo-framer/` directory

You can also trigger manually from the Actions tab.

---

## Updating the Application

After initial setup, just push to main. GitHub Actions will:
1. Build the React client
2. Upload files via SFTP
3. Restart the Node.js app (if SSH is configured)

If SSH restart doesn't work, manually restart from cPanel's Node.js App page.

---

## Troubleshooting

### App not starting
- Check the application log in cPanel Node.js App
- Verify .env file exists with correct values
- Ensure all dependencies are installed

### Database connection errors
- Verify database credentials in .env
- Check database user has permissions
- Ensure database name matches exactly (includes username prefix)

### 404 errors on page refresh
- The SPA fallback should handle this
- If issues persist, check .htaccess in public_html/photos/

### Images not loading
- Check uploads directories exist and are writable
- Verify file permissions (755 for directories, 644 for files)
