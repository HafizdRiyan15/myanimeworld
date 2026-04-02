# MyAnimeWorld

Full-stack anime streaming platform built with Next.js + Express.

## Quick Start (Local)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # edit as needed
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev            # runs on http://localhost:3000
```

### Docker (both at once)
```bash
docker-compose up --build
```

---

## Demo Accounts

| Role  | Email                | Password    |
|-------|----------------------|-------------|
| Admin | alice@example.com    | password123 |
| User  | bob@example.com      | password123 |

---

## API Endpoints

| Method | Endpoint                          | Auth     | Description                  |
|--------|-----------------------------------|----------|------------------------------|
| POST   | /api/auth/register                | —        | Register                     |
| POST   | /api/auth/login                   | —        | Login                        |
| GET    | /api/auth/me                      | ✓        | Current user                 |
| GET    | /api/anime                        | —        | Browse anime (filters/sort)  |
| GET    | /api/anime/search/suggestions     | —        | Autocomplete search          |
| GET    | /api/anime/:id                    | —        | Anime detail + episodes      |
| POST   | /api/anime                        | Admin    | Create anime                 |
| PUT    | /api/anime/:id                    | Admin    | Update anime                 |
| DELETE | /api/anime/:id                    | Admin    | Delete anime                 |
| GET    | /api/episodes/:id                 | ✓        | Get episode + stream URL     |
| POST   | /api/episodes                     | Admin    | Add episode                  |
| GET    | /api/reviews?animeId=             | —        | Get reviews                  |
| POST   | /api/reviews                      | ✓        | Post review                  |
| GET    | /api/watchlist                    | ✓        | Get watchlist/favorites      |
| POST   | /api/watchlist/add                | ✓        | Add to watchlist             |
| POST   | /api/watchlist/favorite           | ✓        | Add to favorites             |
| POST   | /api/watchlist/progress           | ✓        | Track watched episode        |
| GET    | /api/recommendations              | ✓        | Personalized recommendations |
| GET    | /api/recommendations/similar/:id  | —        | Similar anime                |
| GET    | /api/subscription/plans           | —        | Get plans                    |
| POST   | /api/subscription/checkout        | ✓        | Create Stripe checkout       |
| GET    | /api/admin/stats                  | Admin    | Analytics dashboard          |
| GET    | /api/admin/users                  | Admin    | All users                    |

---

## Tech Stack

- Frontend: Next.js 13 + TailwindCSS
- Backend: Node.js + Express
- Auth: JWT (bcryptjs)
- Streaming: HLS via hls.js (adaptive bitrate)
- Realtime: Socket.io
- Payments: Stripe (mock-ready)
- Data: In-memory mock (swap for PostgreSQL/MongoDB in production)

## Production Notes

- Replace in-memory `mockData.js` with a real database (PostgreSQL + Prisma recommended)
- Add Google/Facebook OAuth via Passport.js or NextAuth
- Store videos on AWS S3 or Cloudinary, serve via CloudFront CDN
- Deploy frontend to Vercel, backend to Railway/Render
- Set real `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` for payments
