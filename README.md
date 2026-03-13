# FileStreamBot URL Shortener (Monorepo)

Production-oriented URL shortener + content stack for FileStreamBot.

## Stack
- **Frontend:** Next.js `16.1.6` + TypeScript
- **Backend API:** Python (FastAPI)
- **Datastores:** PostgreSQL + Redis

## Apps
- `apps/api` → `api.example.com` (Python backend)
- `apps/admin` → `admin.example.com` (admin dashboard)
- `apps/web` → `exa.com` (short URL landing + verify flow)
- `apps/content` → `adsexample.com` (blog/content site)

## Key product behavior
- Short URL users (`exa.com/{code}`) can use configurable verify flow (Step 1/2/3 + timers).
- Direct content visitors (`adsexample.com`) do **not** see verify/wait flow.
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

## Run (local)
```bash
# infra
cd infra
docker compose up -d postgres redis

# api
cd ../apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# web/admin/content (in separate terminals)
cd ../admin && npm install && npm run dev
cd ../web && npm install && npm run dev
cd ../content && npm install && npm run dev
```
