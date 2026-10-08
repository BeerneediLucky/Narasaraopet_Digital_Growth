import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.leads.models import Lead


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_lead(lead):
    return {
        "id": lead.id,
        "name": lead.name,
        "email": lead.email,
        "phone": lead.phone,
        "business_name": lead.business_name,
        "status": lead.status,
        "assigned_to": lead.assigned_to_id,
        "created_at": lead.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def lead_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can manage leads."}}, status=403)

    if request.method == "GET":
        leads = Lead.objects.order_by("-created_at")[:50]
        return JsonResponse({"success": True, "data": [_serialize_lead(item) for item in leads]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    name = str(payload.get("name") or "").strip()
    email = str(payload.get("email") or "").strip()
    if not name or not email:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Name and email are required."}}, status=400)

    lead = Lead.objects.create(
        name=name,
        email=email,
        phone=str(payload.get("phone") or "").strip(),
        business_name=str(payload.get("business_name") or "").strip(),
        status=str(payload.get("status") or "NEW").upper(),
        assigned_to=request.user if payload.get("assigned_to") else None,
    )
    return JsonResponse({"success": True, "data": _serialize_lead(lead), "message": "Lead created."})
