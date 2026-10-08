# API Design

## Public APIs
- GET /api/public/services/
- GET /api/public/packages/
- GET /api/public/influencers/
- GET /api/public/blog/
- GET /api/public/faqs/
- GET /api/public/portfolio/

## Authentication
- POST /api/auth/register/
- POST /api/auth/login/
- POST /api/auth/logout/
- POST /api/auth/password-reset/
- POST /api/auth/password-change/
- POST /api/auth/verify-email/

## Business APIs
- GET /api/business/dashboard/
- POST /api/business/profile/
- GET /api/business/campaigns/
- POST /api/business/campaigns/
- POST /api/business/influencer-invite/

## Influencer APIs
- GET /api/influencer/profile/
- PATCH /api/influencer/profile/
- GET /api/influencer/campaigns/
- POST /api/influencer/application/

## Admin APIs
- GET /api/admin/dashboard/
- GET /api/admin/businesses/
- GET /api/admin/influencers/
- GET /api/admin/payments/
- PATCH /api/admin/settings/

## Response conventions

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error responses use stable error codes and safe messages:

```json
{
  "success": false,
  "error": {
    "code": "CAMPAIGN_INVALID_STATE",
    "message": "This campaign cannot be accepted in its current state."
  }
}
```
