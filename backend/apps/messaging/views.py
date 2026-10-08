import json

from django.db import transaction
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.messaging.models import Conversation, Message


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_conversation(conversation):
    return {
        "id": conversation.id,
        "type": conversation.type,
        "title": conversation.title,
        "created_at": conversation.created_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def conversation_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if request.method == "GET":
        conversations = Conversation.objects.order_by("-created_at")[:50]
        return JsonResponse({"success": True, "data": [_serialize_conversation(item) for item in conversations]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    conversation_type = str(payload.get("type") or "SUPPORT").upper()
    title = str(payload.get("title") or "").strip()
    participants = payload.get("participants") or []

    conversation = Conversation.objects.create(type=conversation_type, title=title or conversation_type.replace("_", " ").title())
    message_text = str(payload.get("message") or "").strip()
    if message_text:
        Message.objects.create(conversation=conversation, sender=request.user, text=message_text)
    return JsonResponse({"success": True, "data": _serialize_conversation(conversation), "message": "Conversation created."})


@require_http_methods(["GET", "POST"])
def message_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    if request.method == "GET":
        messages = Message.objects.order_by("-created_at")[:50]
        return JsonResponse({"success": True, "data": [{"id": item.id, "conversation_id": item.conversation_id, "sender_id": item.sender_id, "text": item.text, "created_at": item.created_at.isoformat()} for item in messages]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    conversation_id = payload.get("conversation_id")
    text = str(payload.get("text") or "").strip()
    if not conversation_id or not text:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Conversation and text are required."}}, status=400)

    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Conversation not found."}}, status=404)

    with transaction.atomic():
        message = Message.objects.create(conversation=conversation, sender=request.user, text=text)

    return JsonResponse({"success": True, "data": {"id": message.id, "conversation_id": conversation.id, "sender_id": request.user.id, "text": message.text, "created_at": message.created_at.isoformat()}, "message": "Message sent."})
