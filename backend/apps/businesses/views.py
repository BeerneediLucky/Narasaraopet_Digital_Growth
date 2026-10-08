import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.businesses.models import BusinessProfile


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_business(profile):
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "business_name": profile.business_name,
        "city": profile.city,
        "district": profile.district,
        "state": profile.state,
        "website": profile.website,
        "description": profile.description,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def business_onboarding(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can complete onboarding."}}, status=403)

    profile, _ = BusinessProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse({"success": True, "data": _serialize_business(profile)})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    profile.business_name = str(payload.get("business_name") or profile.business_name or request.user.company_name or "").strip()
    profile.city = str(payload.get("city") or profile.city).strip() or profile.city
    profile.district = str(payload.get("district") or profile.district).strip() or profile.district
    profile.state = str(payload.get("state") or profile.state).strip() or profile.state
    profile.website = str(payload.get("website") or profile.website or "").strip() or None
    profile.description = str(payload.get("description") or profile.description or "").strip()

    if profile.business_name:
        request.user.company_name = profile.business_name
        request.user.save(update_fields=["company_name"])

    profile.save()
    return JsonResponse({"success": True, "data": _serialize_business(profile), "message": "Business onboarding saved."})
