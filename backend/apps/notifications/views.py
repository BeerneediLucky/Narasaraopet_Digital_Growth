import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.notifications.models import Notification


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_notification(item):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "type": item.type,
        "title": item.title,
        "message": item.message,
        "is_read": item.is_read,
        "created_at": item.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def notification_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if request.method == "GET":
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")[:20]
        return JsonResponse({"success": True, "data": [_serialize_notification(item) for item in notifications]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    title = str(payload.get("title") or "").strip()
    message = str(payload.get("message") or "").strip()
    notification_type = str(payload.get("type") or "SYSTEM").upper()
    if not title or not message:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Title and message are required."}}, status=400)

    notification = Notification.objects.create(
        user=request.user,
        type=notification_type,
        title=title,
        message=message,
    )
    return JsonResponse({"success": True, "data": _serialize_notification(notification), "message": "Notification created."})
