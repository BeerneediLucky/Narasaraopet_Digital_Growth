import json

from django.http import JsonResponse
from django.utils.text import slugify
from django.views.decorators.http import require_http_methods

from apps.influencers.models import InfluencerProfile
from apps.services.models import Package, Service, ServiceCategory


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_service(item):
    return {
        "id": item.id,
        "name": item.name,
        "slug": item.slug,
        "description": item.description,
        "category": item.category.name,
        "price": float(item.price),
        "featured": item.is_featured,
        "archived": item.is_archived,
    }


def _serialize_package(item):
    return {
        "id": item.id,
        "name": item.name,
        "slug": item.slug,
        "description": item.description,
        "price": float(item.price),
        "active": item.is_active,
    }


@require_http_methods(["GET", "POST"])
def service_list(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)
        if (request.user.role.code if request.user.role else None) not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can create services."}}, status=403)

        payload = _load_payload(request)
        if not isinstance(payload, dict):
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

        name = str(payload.get("name") or "").strip()
        description = str(payload.get("description") or "").strip()
        category_name = str(payload.get("category") or "General").strip() or "General"
        price = payload.get("price", 0)

        if not name:
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Service name is required."}}, status=400)

        category, _ = ServiceCategory.objects.get_or_create(
            name=category_name,
            defaults={"slug": slugify(category_name) or "general"},
        )
        if not category.slug:
            category.slug = slugify(category_name) or "general"
            category.save(update_fields=["slug"])

        service = Service.objects.create(
            name=name,
            slug=slugify(name) or "service",
            description=description,
            category=category,
            price=price,
            is_featured=bool(payload.get("is_featured", False)),
            is_archived=bool(payload.get("is_archived", False)),
        )
        return JsonResponse({"success": True, "data": _serialize_service(service), "message": "Service created."})

    services = Service.objects.select_related("category").order_by("name")[:20]
    return JsonResponse({
        "success": True,
        "data": [_serialize_service(item) for item in services],
    })


@require_http_methods(["GET", "POST"])
def package_list(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)
        if (request.user.role.code if request.user.role else None) not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can create packages."}}, status=403)

        payload = _load_payload(request)
        if not isinstance(payload, dict):
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

        name = str(payload.get("name") or "").strip()
        description = str(payload.get("description") or "").strip()
        price = payload.get("price", 0)
        if not name:
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Package name is required."}}, status=400)

        package = Package.objects.create(
            name=name,
            slug=slugify(name) or "package",
            description=description,
            price=price,
            is_active=bool(payload.get("is_active", True)),
        )
        return JsonResponse({"success": True, "data": _serialize_package(package), "message": "Package created."})

    packages = Package.objects.order_by("name")[:20]
    return JsonResponse({
        "success": True,
        "data": [_serialize_package(item) for item in packages],
    })


def influencer_list(request):
    influencers = InfluencerProfile.objects.order_by("-followers")[:20]
    return JsonResponse({
        "success": True,
        "data": [
            {
                "id": item.id,
                "name": item.display_name,
                "city": item.city,
                "followers": item.followers,
                "engagement_rate": float(item.engagement_rate),
                "status": item.status,
            }
            for item in influencers
        ],
    })
