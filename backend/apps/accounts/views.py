import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.accounts.models import Role, User


def health_check(request):
    return JsonResponse(
        {
            "success": True,
            "data": {
                "status": "ok",
                "service": "digital-growth-platform",
                "environment": "development",
            },
            "message": "Backend is healthy.",
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except ValueError:
        return JsonResponse({"success": False, "error": {"code": "INVALID_JSON", "message": "Request body must be valid JSON."}}, status=400)

    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", "") or "")
    first_name = str(payload.get("first_name", "")).strip()
    last_name = str(payload.get("last_name", "")).strip()
    company_name = str(payload.get("company_name", "")).strip()
    role_name = str(payload.get("role", "BUSINESS")).strip().upper()

    if not email or not password:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Email and password are required."}}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({"success": False, "error": {"code": "EMAIL_EXISTS", "message": "An account with this email already exists."}}, status=400)

    role, _ = Role.objects.get_or_create(code=role_name, defaults={"label": role_name.replace("_", " ")})
    user = User.objects.create_user(
        username=email.split("@")[0] or "user",
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        company_name=company_name,
        role=role,
    )
    return JsonResponse(
        {
            "success": True,
            "data": {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role.code if user.role else None,
                }
            },
            "message": "Account created successfully.",
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["POST"])
def login_user(request):
    try:
        payload = json.loads(request.body.decode("utf-8")) if request.body else {}
    except ValueError:
        return JsonResponse({"success": False, "error": {"code": "INVALID_JSON", "message": "Request body must be valid JSON."}}, status=400)

    email = str(payload.get("email", "")).strip()
    password = str(payload.get("password", "") or "")

    if not email or not password:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Email and password are required."}}, status=400)

    user = User.objects.filter(email=email).first()
    if user is None or not user.check_password(password):
        return JsonResponse({"success": False, "error": {"code": "INVALID_CREDENTIALS", "message": "Incorrect email or password."}}, status=401)

    login(request, user)
    return JsonResponse({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.code if user.role else None,
            }
        },
        "message": "Login successful.",
    })


@csrf_exempt
@require_http_methods(["POST"])
def logout_user(request):
    logout(request)
    return JsonResponse({"success": True, "message": "Successfully logged out."})


@require_http_methods(["GET"])
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    user = request.user
    return JsonResponse({
        "success": True,
        "data": {
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role.code if user.role else None,
            }
        },
    })


def admin_dashboard(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if not request.user.role or request.user.role.code not in {"ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "You do not have access to the admin dashboard."}}, status=403)

    return JsonResponse(
        {
            "success": True,
            "data": {
                "registered_businesses": 0,
                "registered_influencers": 0,
                "pending_verification": 0,
                "active_campaigns": 0,
                "completed_campaigns": 0,
                "revenue": 0,
            },
            "message": "Admin metrics loaded.",
        }
    )
