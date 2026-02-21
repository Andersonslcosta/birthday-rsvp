# 🚀 Deployment Guide - Replit

## Step 1: Import Project from GitHub to Replit

1. Go to [Replit](https://replit.com) and login/create account
2. Click **"Create"** button
3. Select **"Import from GitHub"**
4. Paste this URL:
   ```
   https://github.com/Andersonslcosta/birthday-rsvp
   ```
5. Click **"Import from GitHub"**
6. Name it (e.g., `birthday-rsvp`) and select **Node.js** as language
7. Click **"Create Repl"** and wait for it to import

## Step 2: Configure Environment Variables

1. In Replit, click on **"Secrets"** (lock icon on the left sidebar)
2. Add the following environment variables:

```
NODE_ENV = production
PORT = 5000
DATABASE_PATH = ./data/birthday.db
ADMIN_PASSWORD = <your-secure-password>
JWT_SECRET = <your-64-character-random-secret>
CORS_ORIGIN = https://<your-replit-url>.replit.dev
MAX_REQUEST_SIZE = 10kb
RATE_LIMIT_WINDOW = 15m
RATE_LIMIT_MAX_REQUESTS = 5
```

**Important:** Replace:
- `<your-secure-password>` - with a strong password (min 12 chars with uppercase, numbers, special chars)
- `<your-64-character-random-secret>` - with a random 64-character string
- `<your-replit-url>` - with your actual Replit project URL

**Generate JWT_SECRET:**
Open browser console and run:
```javascript
Array.from(crypto.getRandomValues(new Uint8Array(32)))
  .map(x => x.toString(16).padStart(2, '0'))
  .join('')
  .substring(0, 64)
```

## Step 3: Create .replit File Configuration

Create a `.replit` file in the root directory with:

```
run = "npm install && npm run build && cd server && npm install && npm run build && npm start"
```

Or manually run in the Replit console:
```bash
npm install
npm run build
cd server
npm install
npm run build
npm start
```

## Step 4: Set Startup Script

In Replit:
1. Click **"Run"** button at the top
2. Or create a startup script by editing `.replit`:

```
[build]
build = "npm install && npm run build && cd server && npm install && npm run build"

[run]
run = "node server/dist/index.js"
```

## Step 5: Access Your Application

After deployment:

- **Frontend URL:** `https://<your-replit-url>.replit.dev`
- **API URL:** `https://<your-replit-url>.replit.dev/api`
- **Admin Panel:** `https://<your-replit-url>.replit.dev/#/admin`

## Step 6: Initial Setup

1. Open your Replit app URL in browser
2. Go to `/admin` path
3. Login with your password
4. Test the export CSV functionality - should now work properly!

## Troubleshooting

### If CSV Export Still Fails

1. Check browser console (F12) for errors
2. Check Replit console for backend logs
3. Verify `CORS_ORIGIN` environment variable is set correctly
4. Make sure `NODE_ENV=production` is set

### Database Issues

The SQLite database will be created automatically in `server/data/birthday.db`. 

If you need to reset:
- In Replit file explorer, navigate to `server/data/`
- Delete `birthday.db` file
- Restart the application

### Port Issues on Replit

Replit automatically handles port mapping. Always use port `5000` in code, Replit will expose it.

## Security Checklist Before Going Live

- ✅ Strong password set in `ADMIN_PASSWORD`
- ✅ Unique `JWT_SECRET` generated (64 chars minimum)
- ✅ `NODE_ENV=production` configured
- ✅ `CORS_ORIGIN` set to your actual Replit domain
- ✅ All environment variables set in Secrets
- ✅ Database is backing up automatically (Replit persistent storage)

## Monitor Your App

In Replit, you can:
- View logs in the console
- Restart with the "Run" button
- Edit code and changes auto-refresh
- Monitor resource usage

## Backup Data

To backup your RSVPs data:
1. Download the CSV export from admin panel
2. Or manually backup `server/data/birthday.db` file

## Next Steps

After deployment:
1. Share the URL with guests
2. Guests submit RSVPs via the form
3. You access admin panel to view/export data
4. Use CSV exports for analysis

---

**Your Replit App URL:** https://git-import--andersonslcosta.replit.app/

For more help, check:
- [Replit Documentation](https://docs.replit.com)
- Project README.md
- SECURITY_AUDIT.md for security details
