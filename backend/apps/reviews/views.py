import json

from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.accounts.models import User
from apps.reviews.models import Review


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_review(review):
    return {
        "id": review.id,
        "reviewer_id": review.reviewer_id,
        "target_user_id": review.target_user_id,
        "overall_rating": review.overall_rating,
        "comment": review.comment,
        "created_at": review.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def review_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if request.method == "GET":
        reviews = Review.objects.order_by("-created_at")[:50]
        return JsonResponse({"success": True, "data": [_serialize_review(item) for item in reviews]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    target_user_id = payload.get("target_user_id")
    rating = int(payload.get("overall_rating") or 5)
    comment = str(payload.get("comment") or "").strip()

    if not target_user_id:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "target_user_id is required."}}, status=400)

    try:
        target_user = User.objects.get(id=target_user_id)
    except User.DoesNotExist:
        return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Target user not found."}}, status=404)

    with transaction.atomic():
        review, created = Review.objects.get_or_create(
            reviewer=request.user,
            target_user=target_user,
            defaults={"overall_rating": rating, "comment": comment},
        )
        if not created:
            review.overall_rating = rating
            review.comment = comment
            review.save(update_fields=["overall_rating", "comment"])

    return JsonResponse({"success": True, "data": _serialize_review(review), "message": "Review saved."})
