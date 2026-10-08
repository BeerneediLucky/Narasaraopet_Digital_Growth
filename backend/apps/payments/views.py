import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.payments.models import Payment


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_payment(item):
    return {
        "id": item.id,
        "user_id": item.user_id,
        "amount": float(item.amount),
        "currency": item.currency,
        "status": item.status,
        "provider_reference": item.provider_reference,
        "created_at": item.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def payment_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if request.method == "GET":
        payments = Payment.objects.filter(user=request.user).order_by("-created_at")[:20]
        return JsonResponse({"success": True, "data": [_serialize_payment(item) for item in payments]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    amount = payload.get("amount")
    if amount is None:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Amount is required."}}, status=400)

    payment = Payment.objects.create(
        user=request.user,
        amount=amount,
        currency=str(payload.get("currency") or "INR").upper(),
        status=str(payload.get("status") or "PENDING").upper(),
        provider_reference=str(payload.get("provider_reference") or "").strip(),
    )
    return JsonResponse({"success": True, "data": _serialize_payment(payment), "message": "Payment recorded."})
