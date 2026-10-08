# System Architecture

## 1. Overview

This application is a modular monolith built around a Django REST API and a React + TypeScript frontend. The product is designed for a regional digital growth business operating from Narasaraopet and expanding to Palnadu and Andhra Pradesh.

## 2. Core principles

- Domain-based backend modules rather than a single giant app
- Clear server-side authorization and business rules
- Database-backed marketplace and campaign workflows
- Public website plus protected business, influencer, and admin dashboards
- Secure integration points for email, object storage, and payments

## 3. System components

### Public website
- Marketing pages for services, portfolio, blog, FAQ, about, and contact
- SEO-friendly metadata and structured pages
- Local geographic positioning for Narasaraopet and surrounding districts

### Business platform
- Business onboarding and profile management
- Service requests and packages
- Campaign creation and influencer outreach
- Payment and review flows

### Influencer platform
- Influencer registration and verification workflow
- Social account and pricing information
- Marketplace profile visibility and shortlist matching
- Campaign invite management and earnings tracking

### Admin platform
- Dashboard metrics, content moderation, settings, and audit logging
- Services, packages, campaigns, leads, disputes, and payouts management

## 4. Backend architecture

```text
backend/
├── config/              # Django settings, URLs, ASGI/WSGI
├── apps/
│   ├── accounts/
│   ├── businesses/
│   ├── influencers/
│   ├── services/
│   ├── campaigns/
│   ├── messaging/
│   ├── payments/
│   ├── reviews/
│   ├── notifications/
│   ├── leads/
│   ├── analytics/
│   └── administration/
├── common/
├── media/
├── tests/
├── requirements/
├── manage.py
└── .env
```

## 5. Frontend architecture

```text
frontend/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── marketplace/
│   │   ├── campaigns/
│   │   └── layout/
│   ├── features/
│   │   ├── auth/
│   │   ├── businesses/
│   │   ├── influencers/
│   │   ├── campaigns/
│   │   ├── messages/
│   │   ├── payments/
│   │   └── admin/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── routes/
```

## 6. Data flow

1. User interacts with frontend pages and dashboard flows.
2. React queries call the Django REST API.
3. DRF serializers validate payloads and enforce permission rules.
4. Services execute business logic such as matching, payments, and campaign state transitions.
5. PostgreSQL persists canonical data.
6. Object storage handles media attachments and content files.

## 7. Security model

- Strong password hashing via Django auth
- Role-based access control for business, influencer, admin, and super-admin roles
- Permission checks enforced at API layer
- CSRF and CORS controls configured through environment settings
- File validation and size limits on uploads
- Secure environment variable handling

## 8. Deployment model

- Frontend hosted on a static hosting platform or Node SSR-ready deployment target
- Backend deployed as an application service behind HTTPS
- PostgreSQL in managed infrastructure
- Object storage for media files
- External services for payments, email, and notifications

## 9. Development phases

### Phase 1
- Architecture and data model
- Authentication and authorization
- Business and influencer onboarding
- Service and package catalog
- Admin foundation

### Phase 2
- Influencer marketplace and matching
- Campaign creation and lifecycle
- Messaging and notifications
- Review engine

### Phase 3
- Payments, payout logic, and commission rules
- Disputes and invoices
- Advanced dashboard analytics

### Phase 4
- AI matching refinements and business automation
- Additional localization and performance tuning
