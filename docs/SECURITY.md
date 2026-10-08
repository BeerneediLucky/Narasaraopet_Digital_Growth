# Security Notes

## Authentication and authorization
- Role-based access control enforced on the backend
- CSRF protection enabled for web sessions
- CORS explicitly scoped to trusted frontend origins
- Session handling kept secure and environment-based

## Input and file handling
- Serializer validation for all inbound payloads
- File type and size checks for uploads
- No direct processing of executable files
- SQL injection prevented by ORM usage

## Operational safeguards
- Secrets managed via environment variables
- Production debug disabled by default
- Error responses sanitized for non-admin users
- Audit logs captured for privileged actions
- Payment and webhook verification done server-side
