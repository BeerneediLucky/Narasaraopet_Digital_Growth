# Deployment Architecture

## Production flow

```text
Client
  -> Frontend hosting
  -> Django API
  -> PostgreSQL
  -> Object storage
  -> Email provider
  -> Payment provider
```

## Operational requirements

- HTTPS enabled in production
- Strong environment configuration
- Managed PostgreSQL database
- Media stored in a proper object storage service
- Logs centrally collected and monitored
- Health endpoint available at /api/health/
- Regular automated backups configured

## Recommended deployment stack

- Frontend: Vercel, Netlify, or static hosting with CDN
- API: Render, Railway, Azure App Service, or containerized deployment
- Database: managed PostgreSQL such as Supabase, Neon, or Azure Database
- Storage: S3-compatible provider such as AWS S3 or MinIO

## Production run commands

```bash
export DJANGO_SETTINGS_MODULE=config.production
python manage.py migrate
python manage.py collectstatic --noinput
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
```

## Required environment values

```env
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:password@host:5432/database
FRONTEND_URL=https://your-frontend-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com
```

## Hosting examples

- Render: set the backend service to run Gunicorn and attach a Postgres database.
- Railway: use the default Node/Python environment, attach Postgres, and set `PORT` for Gunicorn.
- Azure App Service: deploy the backend container and configure environment variables for Django and Postgres.
