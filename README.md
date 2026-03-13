# FileStreamBot URL Shortener (Monorepo)

Production-oriented URL shortener + content stack for FileStreamBot.

## Stack
- **Frontend:** Next.js `16.1.6` + TypeScript
- **Backend API:** Python (FastAPI)
- **Datastores:** PostgreSQL + Redis

## Apps
- `apps/api` → `api.example.com` (Python backend)
- `apps/admin` → `admin.example.com` (admin dashboard)
- `apps/web` → **single app / single port** serving:
  - `exa.com` (short URL + verify flow)
  - `adsexample.com` (content/blog, no verify flow)

## Key behavior
- Short URL users (`exa.com/{code}`) can have configurable verify flow (Step 1/2/3 + timers).
- Direct content visitors (`adsexample.com`) do **not** see verify/wait/continue flow.
- Admin can configure:
  - Step count (1-3)
  - Step timer per step
- Content supports categories + Markdown body.
- Default admin login:
  - `admin@changeme.com` / `changeme`
  - first login requires credential change.

## Categories (aligned with FileStreamBot)
- Movies
- TV-Series
- Music
- Games
- Software
- Courses
- Books
- Anime
- Sports
- Other

## API quick endpoints
- Auth:
  - `POST /v1/auth/login`
  - `GET /v1/auth/me`
  - `POST /v1/auth/change-credentials`
- Settings:
  - `GET /v1/settings/verification`
  - `PUT /v1/settings/verification`
- Links:
  - `POST /v1/short-links`
  - `GET /v1/short-links`
  - `GET /v1/resolve/{code}`
- Content:
  - `POST /v1/content`
  - `GET /v1/content`
  - `GET /v1/content/{slug}`
- Analytics:
  - `GET /v1/analytics/overview`

## Local run
```bash
# infra
cd infra
docker compose up -d postgres redis

# api
cd ../apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# admin
cd ../admin
npm install
npm run dev

# web (exa + adsexample served by same app)
cd ../web
npm install
npm run dev
```

## Env notes
Set these in `.env` / deploy env:
- `PUBLIC_WEB_HOST=exa.com`
- `PUBLIC_CONTENT_HOST=adsexample.com`
- `PUBLIC_ADMIN_HOST=admin.example.com`
- `PUBLIC_API_HOST=api.example.com`
- `DATABASE_URL=...`
- `REDIS_URL=...`
