# 🎂 Birthday RSVP Application

A modern, full-stack online form for birthday event RSVPs with admin dashboard. Built with React, TypeScript, Express, and SQLite.

**Use Case:** Lightweight online form to collect guest confirmations and participant information for events (up to ~1000 RSVPs).

[Figma Design](https://www.figma.com/design/ja21RB6esET9gFDIUOPCO2/Anivers%C3%A1rio-O-Pequeno-Pr%C3%ADncipe)

## 📋 Features

- ✅ Responsive guest RSVP form (mobile-first design)
- ✅ Real-time confirmation with participant details
- ✅ Password-protected admin dashboard
- ✅ View all RSVPs with statistics and analytics
- ✅ Export collected data to CSV
- ✅ SQLite database (suitable for up to ~1000 records)
- ✅ Full TypeScript for type safety
- ✅ Production-ready security implementation

## 🛠️ Tech Stack

**Frontend:** React 18 • TypeScript • Vite 6 • Tailwind CSS 4 • Radix UI • React Router  
**Backend:** Node.js • Express 4 • SQLite3 • JWT Authentication • CORS  
**Database:** SQLite (lightweight, file-based, suitable for small to medium datasets)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd birthdaypage

# 2. Install dependencies
npm install
cd server && npm install && cd ..

# 3. Create environment configuration
# Create server/.env with your own secure values (see Security section below)

# 4. Terminal 1: Start frontend (port 5173)
npm run dev

# 5. Terminal 2: Start backend (port 5000)
cd server && npm run dev

# 6. Open http://localhost:5173 in your browser
```

## 🔐 Security Configuration

### Required Environment Variables

Create a `server/.env` file with the following variables:

```bash
NODE_ENV=production
PORT=5000
DATABASE_PATH=./data/birthday.db
ADMIN_PASSWORD=<your-secure-password>
JWT_SECRET=<your-64-character-random-secret>
CORS_ORIGIN=https://yourdomain.com
MAX_REQUEST_SIZE=10kb
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=5
```

### Security Best Practices

⚠️ **Critical Settings:**

1. **Never expose credentials:** Keep `.env` file private - it's in `.gitignore`
2. **Use strong passwords:** Minimum 12 characters with uppercase, lowercase, numbers, and special characters
3. **Generate random JWT_SECRET:** Use a cryptographically secure random generator for a 64-character secret (minimum 32 chars recommended)
4. **HTTPS only:** Always enable HTTPS in production - never use HTTP
5. **Change all defaults:** Every deployment must have unique security values
6. **Keep dependencies updated:** Run `npm audit` regularly and update packages

### Implemented Security Measures

✅ **JWT Authentication:** 24-hour expiring tokens for admin access  
✅ **Rate Limiting:** Maximum 5 login attempts per 15 minutes per IP  
✅ **Timing Attack Protection:** Constant-time password comparison  
✅ **Input Validation:** Request size limited to 10KB, name length capped at 200 chars, max 50 participants per RSVP  
✅ **Content-Type Enforcement:** All POST/PUT requests must be application/json  
✅ **CORS Protection:** Restricted to specified origins only  
✅ **Error Handling:** Production mode hides internal error details  
✅ **SQL Injection Prevention:** Parameterized queries throughout  

## 📊 API Endpoints

All endpoints use HTTP/HTTPS. Admin endpoints require JWT authentication.

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/rsvp` | No | Submit guest RSVP |
| POST | `/api/admin/login` | No* | Get JWT authentication token |
| GET | `/api/rsvp` | JWT | Retrieve all RSVPs |
| GET | `/api/statistics` | JWT | Get event statistics |
| GET | `/api/admin/export` | JWT | Export RSVPs as CSV |
| DELETE | `/api/admin/rsvp` | JWT | Clear all RSVPs |
| GET | `/health` | No | Server health check |

*Login has rate limiting: max 5 attempts per 15 minutes

## 📁 Project Structure

```
src/                               # Frontend React application
├── app/
│   ├── components/
│   │   ├── InvitePage.tsx        # Guest RSVP form UI
│   │   ├── AdminPanel.tsx        # Admin dashboard
│   │   └── App.tsx               # Main router
│   ├── utils/
│   │   └── api.ts                # API client functions
│   └── styles/                   # CSS files
│
server/                            # Backend Express application
├── src/
│   ├── index.ts                  # Express server & middleware setup
│   ├── database.ts               # SQLite database operations
│   ├── routes.ts                 # API endpoint definitions
│   ├── auth.ts                   # JWT authentication logic
│   └── .env                      # Configuration (NOT in git)
├── dist/                          # Compiled JavaScript
└── data/
    └── birthday.db               # SQLite database file
```

## 📝 Development Scripts

```bash
# Frontend
npm run dev       # Start development server with hot reload
npm run build     # Create optimized production build
npm run preview   # Preview production build locally

# Backend
cd server
npm run dev       # Start with ts-node (development)
npm run build     # Compile TypeScript to JavaScript
npm start         # Run compiled production server
```

## 🗄️ Database

- **Type:** SQLite 3 (file-based, no external dependencies)
- **Capacity:** Designed for up to ~1000 RSVP records
- **Location:** `server/data/birthday.db`
- **Auto-creation:** Database and tables created automatically on first run

**Resetting the database:**
```bash
# Delete the database file to start fresh
rm server/data/birthday.db
# Restart the backend server to recreate
```

**Exporting data:**
- Use the Admin Dashboard UI: Click "Export to CSV"
- Or call the API: `GET /api/admin/export` with valid JWT token

## 📦 Building for Production

### Frontend Build
```bash
npm run build
# Output in: dist/
```

### Backend Build
```bash
cd server
npm run build
npm start
```

### Deployment Platforms

For free/affordable deployment:
- **Frontend:** Vercel, Netlify, GitHub Pages
- **Backend:** Render, Railway, Fly.io, Heroku
- **Database:** SQLite file backed up regularly

⚠️ **Important:** Set environment variables in your platform's dashboard, never hardcode them.

## 🐛 Troubleshooting

**Port conflicts:**
```bash
# Windows
netstat -ano | find ":5000"
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

**CORS errors:**
- Verify `CORS_ORIGIN` in `.env` matches your frontend domain
- Check Authorization header: `Bearer <valid-jwt-token>`
- Ensure all requests use `Content-Type: application/json`

**Database errors:**
- Check `server/data/` directory has write permissions
- Verify `DATABASE_PATH` in `.env` is correct
- Restart backend server after fixing

**Login fails:**
- Verify credentials match `.env` configuration
- Check rate limit isn't active (wait 15 minutes if locked out)
- Ensure JWT_SECRET is set correctly in `.env`

## 📄 License

MIT License - Feel free to use this project for your event.

## 👤 Author

Built with ❤️ for event RSVPs.

---

**Last Updated:** February 2026  
**Status:** Production Ready ✅
