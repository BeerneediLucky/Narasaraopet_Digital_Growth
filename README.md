# Digital Growth Platform

A production-ready local digital growth platform for businesses and influencers in Narasaraopet, Palnadu district, Andhra Pradesh.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Django + Django REST Framework
- Database: PostgreSQL (configured for production with SQLite fallback for local verification)
- Storage: S3-compatible object storage via configurable backend
- Auth: Django authentication with role-based permissions

## Project structure

```text
digital-growth-platform/
├── backend/
│   ├── apps/
│   ├── common/
│   ├── config/
│   ├── media/
│   ├── tests/
│   ├── manage.py
│   └── requirements/
├── frontend/
│   └── src/
├── docs/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── LICENSE
```

## Quick start

1. Create a Python virtual environment.
2. Install backend requirements.
3. Copy `.env.example` to `.env` and configure values.
4. Install frontend dependencies with `npm install`.
5. Run the backend and frontend locally.

### Local backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements/base.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Local frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

### Docker workflow

```bash
docker compose up --build
```

This starts PostgreSQL, the Django API, and the Vite frontend together using the project container configuration.

## Production deployment notes

- Use a managed PostgreSQL instance instead of the local container database for production workloads.
- Set `DEBUG=False` and provide secure `SECRET_KEY`, `ALLOWED_HOSTS`, and CORS origins in the environment.
- Run Django behind a production WSGI server such as Gunicorn in front of a reverse proxy or managed platform.
- Build the frontend bundle with `npm run build` and serve the generated assets through the chosen deployment target.

## Architecture summary

- Public website for services, packages, influencer discovery, contact, and local SEO content.
- Business onboarding and dashboard for service requests, campaigns, and payments.
- Influencer onboarding and marketplace with profile verification and campaign invitations.
- Admin dashboard for commerce, services, campaigns, reviews, and settings.
- Secure API and permission boundaries enforced server-side.

## Notes

This project is intentionally structured to be extended incrementally. The initial implementation focuses on robust architecture, production-ready patterns, and a working local MVP foundation.
