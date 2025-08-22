# AttendAI – Integrated Monorepo

This project integrates:
- **Backend** (Node.js/Express + MongoDB)
- **AI Service** (FastAPI + DeepFace) with two endpoints:
  - `POST /api/v1/verify-face` (form-data: `employee_id`, `file`)
  - `POST /api/v1/verify-pair` (JSON: `{ imageA, imageB }`) – **added for compatibility**
- **Frontend** (React + Vite)

## Quick Start (Docker)
```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:2000/api
- AI Service: http://localhost:8000 (health at `/`)
- MongoDB: mongodb://localhost:27017

The backend now calls the AI service via `DS_API_URL=http://ai-service:8000/api/v1/verify-pair` (set in `.env` / docker-compose). It posts JSON `{ imageA, imageB }` which the AI service converts to temporary images and validates with DeepFace, returning `{ match, score }`.

## Local (without Docker)
- **MongoDB**: run locally on port 27017
- **AI Service**:
  ```bash
  cd ai-service
  pip install -r requirements.txt
  uvicorn api:app --host 0.0.0.0 --port 8000
  ```
- **Backend**:
  ```bash
  cd backend/backend
  cp .env .env.local   # edit DS_API_URL and MONGO_URI as needed
  npm ci
  npm start
  ```
- **Frontend**:
  ```bash
  cd frontend/frontend
  cp .env.example .env
  # set VITE_API_URL=http://localhost:2000/api
  npm ci
  npm run dev
  ```

## Notes
- Threshold configurable via `FACE_MATCH_THRESHOLD` env in backend.
- CORS: AI service allows `*` by default; backend uses `cors()`.
- Uploaded temp files are cleaned by AI service; backend has a daily cleanup cron (2 AM).

## Structure
```
AttendAI-Integrated/
  ai-service/
  backend/backend/
  frontend/frontend/
  docker-compose.yml
  README.md
  docs/
```
