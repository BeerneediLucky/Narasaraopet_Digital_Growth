import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.influencers.models import InfluencerProfile


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_influencer(profile):
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "city": profile.city,
        "district": profile.district,
        "bio": profile.bio,
        "followers": profile.followers,
        "engagement_rate": float(profile.engagement_rate),
        "average_views": profile.average_views,
        "status": profile.status,
        "is_verified": profile.is_verified,
        "created_at": profile.created_at.isoformat(),
        "updated_at": profile.updated_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def influencer_onboarding(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"INFLUENCER", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only influencer accounts can complete onboarding."}}, status=403)

    profile, _ = InfluencerProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        return JsonResponse({"success": True, "data": _serialize_influencer(profile)})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    profile.display_name = str(payload.get("display_name") or profile.display_name or request.user.get_full_name() or request.user.email).strip()
    profile.city = str(payload.get("city") or profile.city).strip() or profile.city
    profile.district = str(payload.get("district") or profile.district).strip() or profile.district
    profile.bio = str(payload.get("bio") or profile.bio or "").strip()
    profile.followers = int(payload.get("followers") or profile.followers or 0)
    profile.engagement_rate = float(payload.get("engagement_rate") or profile.engagement_rate or 0)
    profile.average_views = int(payload.get("average_views") or profile.average_views or 0)

    if payload.get("status"):
        profile.status = str(payload["status"]).upper()

    if payload.get("is_verified") is not None:
        profile.is_verified = bool(payload.get("is_verified"))

    profile.save()
    return JsonResponse({"success": True, "data": _serialize_influencer(profile), "message": "Influencer onboarding saved."})
