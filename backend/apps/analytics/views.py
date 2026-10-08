from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.accounts.models import User
from apps.businesses.models import BusinessProfile
from apps.campaigns.models import Campaign
from apps.influencers.models import InfluencerProfile
from apps.leads.models import Lead
from apps.payments.models import Payment


@require_http_methods(["GET"])
def analytics_summary(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Admin access required."}}, status=403)

    metrics = {
        "businesses": BusinessProfile.objects.count(),
        "influencers": InfluencerProfile.objects.count(),
        "campaigns": Campaign.objects.count(),
        "leads": Lead.objects.count(),
        "payments": Payment.objects.filter(status="PAID").count(),
        "users": User.objects.count(),
    }

    return JsonResponse({
        "success": True,
        "data": {
            "metrics": metrics,
            "generated_at": __import__("django.utils.timezone").utils.timezone.now().isoformat(),
        },
    })
