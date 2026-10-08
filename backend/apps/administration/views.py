from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.administration.models import AdminSetting


@require_http_methods(["GET", "POST"])
def admin_settings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Admin access required."}}, status=403)

    if request.method == "POST":
        payload = request.POST or {}
        key = str(payload.get("key") or "").strip()
        value = str(payload.get("value") or "").strip()
        description = str(payload.get("description") or "").strip()
        if not key or not value:
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Setting key and value are required."}}, status=400)

        setting, _ = AdminSetting.objects.get_or_create(key=key)
        setting.value = value
        setting.description = description
        setting.save()
        return JsonResponse({"success": True, "data": {"key": setting.key, "value": setting.value, "description": setting.description}, "message": "Setting saved."})

    settings = AdminSetting.objects.order_by("key")
    return JsonResponse({
        "success": True,
        "data": {
            "settings": [
                {"key": item.key, "value": item.value, "description": item.description, "updated_at": item.updated_at.isoformat()}
                for item in settings
            ]
        },
    })
