# 🎂 Birthday RSVP Application

A modern, full-stack birthday event RSVP form with admin dashboard, built with React, TypeScript, Express, and SQLite.

[Figma Design](https://www.figma.com/design/ja21RB6esET9gFDIUOPCO2/Anivers%C3%A1rio-O-Pequeno-Pr%C3%ADncipe) | [Documentation](./DEPLOYMENT.md)

## 📋 Features

- ✅ Beautiful, responsive RSVP form (mobile-first design)
- ✅ Real-time confirmation with participant list
- ✅ Admin dashboard with JWT authentication
- ✅ View all RSVPs and statistics
- ✅ Export data to CSV
- ✅ SQLite database for data persistence
- ✅ Full TypeScript for type safety
- ✅ Docker support for easy deployment
- ✅ Production-ready with security best practices

## 🛠️ Tech Stack

**Frontend:** React 18 • TypeScript • Vite 6 • Tailwind CSS 4 • Radix UI • React Router  
**Backend:** Node.js • Express 4 • SQLite3 • JWT • CORS  
**Infrastructure:** Docker • Docker Compose

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm

### Local Development

```bash
# 1. Install dependencies
npm install
cd server && npm install && cd ..

# 2. Configure environment (optional, defaults provided)
cp server/.env.example server/.env

# 3. Terminal 1: Start frontend (port 5173)
npm run dev

# 4. Terminal 2: Start backend (port 5000)
cd server && npm run dev

# 5. Open http://localhost:5173
# Admin: http://localhost:5173/admin
# Password: pequenoprincipe2025
```

## 📦 Build for Production

```bash
# Frontend
npm run build

# Backend
cd server && npm run build

# Or with Docker
docker-compose up -d
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for cloud deployment on Render.

## 🔐 Security & Testing

```bash
# Run security audit
./security-audit.ps1

# Run unit tests
npx ts-node src/tests.ts

# Run API integration tests (backend must be running)
./test-api.ps1
```

## 📊 API Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/rsvp` | No | Submit RSVP |
| POST | `/api/admin/login` | No | Get JWT token |
| GET | `/api/rsvp` | JWT | List RSVPs |
| GET | `/api/statistics` | JWT | Event stats |
| GET | `/api/admin/export` | JWT | Export CSV |
| DELETE | `/api/admin/rsvp` | JWT | Clear all |
| GET | `/health` | No | Health check |

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── InvitePage.tsx      ← Guest RSVP form
│   │   ├── AdminPanel.tsx      ← Admin dashboard
│   │   └── App.tsx             ← Router setup
│   ├── utils/
│   │   └── api.ts              ← API client
│   └── styles/                 ← CSS files
│
server/
├── src/
│   ├── index.ts                ← Express server
│   ├── database.ts             ← SQLite ops
│   ├── routes.ts               ← API endpoints
│   └── auth.ts                 ← JWT middleware
└── data/
    └── birthday.db             ← SQLite database
```

## 🔧 Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:5000  # Dev
VITE_API_URL=/api                   # Production
```

**Backend (server/.env):**
```
NODE_ENV=development
PORT=5000
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=password123
CORS_ORIGIN=http://localhost:5173
```

## 📝 Scripts

```bash
# Frontend
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview build

# Backend
cd server
npm run dev       # Development server
npm run build     # Compile TypeScript
npm start         # Production server
```

## 🐛 Troubleshooting

**Port already in use:**
```powershell
netstat -ano | findstr :5000  # Check port 5000
```

**Database issues:**
```bash
rm server/data/birthday.db  # Delete and let it recreate
```

**CORS errors:**
- Verify `CORS_ORIGIN` matches your frontend URL
- Check Authorization header format: `Bearer <token>`

## 📄 License

MIT License

## 👤 Author

Built with ❤️ for Aniversário O Pequeno Príncipe

---

**Status:** Production Ready ✅  
**Last Updated:** December 2024
