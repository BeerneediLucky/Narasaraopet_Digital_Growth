import json

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

from apps.businesses.models import BusinessProfile
from apps.campaigns.models import Campaign, CampaignDelivery, CampaignInvitation
from apps.influencers.models import InfluencerProfile
from apps.payments.models import Payment


def _load_payload(request):
    if request.body:
        try:
            return json.loads(request.body.decode("utf-8"))
        except ValueError:
            return {}
    return dict(request.POST)


def _serialize_campaign(campaign):
    return {
        "id": campaign.id,
        "business_id": campaign.business_id,
        "name": campaign.name,
        "objective": campaign.objective,
        "target_location": campaign.target_location,
        "target_audience": campaign.target_audience,
        "budget": float(campaign.budget),
        "status": campaign.status,
        "start_date": campaign.start_date.isoformat() if campaign.start_date else None,
        "end_date": campaign.end_date.isoformat() if campaign.end_date else None,
        "created_at": campaign.created_at.isoformat(),
        "updated_at": campaign.updated_at.isoformat(),
    }


def _serialize_invitation(invitation):
    return {
        "id": invitation.id,
        "campaign_id": invitation.campaign_id,
        "influencer_id": invitation.influencer_id,
        "status": invitation.status,
        "campaign_name": invitation.campaign.name,
        "influencer_name": invitation.influencer.display_name,
        "created_at": invitation.created_at.isoformat(),
    }


def _serialize_delivery(delivery):
    return {
        "id": delivery.id,
        "campaign_id": delivery.campaign_id,
        "influencer_id": delivery.influencer_id,
        "campaign_name": delivery.campaign.name,
        "influencer_name": delivery.influencer.display_name,
        "content_url": delivery.content_url,
        "notes": delivery.notes,
        "status": delivery.status,
        "payment_record_id": delivery.payment_record_id,
        "created_at": delivery.created_at.isoformat(),
        "updated_at": delivery.updated_at.isoformat(),
    }


@require_http_methods(["GET", "POST"])
def campaign_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None
    if role_code not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can manage campaigns."}}, status=403)

    if request.method == "GET":
        business_profile = getattr(request.user, "business_profile", None)
        if business_profile is None:
            return JsonResponse({"success": True, "data": []})
        campaigns = Campaign.objects.filter(business=business_profile).order_by("-created_at")
        return JsonResponse({"success": True, "data": [_serialize_campaign(item) for item in campaigns]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    name = str(payload.get("name") or "").strip()
    if not name:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Campaign name is required."}}, status=400)

    business_profile, _ = BusinessProfile.objects.get_or_create(user=request.user, defaults={"business_name": request.user.company_name or "Business Account"})
    campaign = Campaign.objects.create(
        business=business_profile,
        name=name,
        objective=str(payload.get("objective") or "").strip(),
        target_location=str(payload.get("target_location") or "Narasaraopet").strip(),
        target_audience=str(payload.get("target_audience") or "").strip(),
        budget=payload.get("budget", 0) or 0,
        status=str(payload.get("status") or "DRAFT").upper(),
        start_date=payload.get("start_date"),
        end_date=payload.get("end_date"),
    )
    return JsonResponse({"success": True, "data": _serialize_campaign(campaign), "message": "Campaign created."})


@require_http_methods(["GET", "POST"])
def campaign_invitation_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None

    if request.method == "GET":
        if role_code == "BUSINESS":
            invitations = CampaignInvitation.objects.filter(campaign__business__user=request.user).select_related("campaign", "influencer")
        elif role_code == "INFLUENCER":
            influencer_profile = getattr(request.user, "influencer_profile", None)
            if not influencer_profile:
                return JsonResponse({"success": True, "data": []})
            invitations = CampaignInvitation.objects.filter(influencer=influencer_profile).select_related("campaign", "influencer")
        elif role_code in {"ADMIN", "SUPER_ADMIN"}:
            invitations = CampaignInvitation.objects.select_related("campaign", "influencer").all()
        else:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "This role cannot view campaign invitations."}}, status=403)

        return JsonResponse({"success": True, "data": [_serialize_invitation(item) for item in invitations.order_by("-created_at")]})

    if role_code not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can issue invitations."}}, status=403)

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    campaign_id = payload.get("campaign_id")
    influencer_id = payload.get("influencer_id")
    if not campaign_id or not influencer_id:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Campaign and influencer IDs are required."}}, status=400)

    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Campaign not found."}}, status=404)

    try:
        influencer = InfluencerProfile.objects.get(id=influencer_id)
    except InfluencerProfile.DoesNotExist:
        return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Influencer not found."}}, status=404)

    if role_code in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        if role_code == "BUSINESS" and campaign.business.user_id != request.user.id:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "You can only invite creators to your own campaigns."}}, status=403)

    invitation, _ = CampaignInvitation.objects.get_or_create(campaign=campaign, influencer=influencer)
    invitation.status = str(payload.get("status") or invitation.status or "PENDING").upper()
    invitation.save(update_fields=["status"])
    return JsonResponse({"success": True, "data": _serialize_invitation(invitation), "message": "Invitation saved."})


@require_http_methods(["GET", "POST"])
def campaign_delivery_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({"success": False, "error": {"code": "UNAUTHENTICATED", "message": "Authentication required."}}, status=401)

    role_code = request.user.role.code if request.user.role else None

    if request.method == "GET":
        if role_code == "BUSINESS":
            deliveries = CampaignDelivery.objects.filter(campaign__business__user=request.user).select_related("campaign", "influencer")
        elif role_code == "INFLUENCER":
            influencer_profile = getattr(request.user, "influencer_profile", None)
            if not influencer_profile:
                return JsonResponse({"success": True, "data": []})
            deliveries = CampaignDelivery.objects.filter(influencer=influencer_profile).select_related("campaign", "influencer")
        elif role_code in {"ADMIN", "SUPER_ADMIN"}:
            deliveries = CampaignDelivery.objects.select_related("campaign", "influencer").all()
        else:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "This role cannot view campaign deliveries."}}, status=403)

        return JsonResponse({"success": True, "data": [_serialize_delivery(item) for item in deliveries.order_by("-created_at")]})

    payload = _load_payload(request)
    if not isinstance(payload, dict):
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Request payload must be an object."}}, status=400)

    delivery_id = payload.get("delivery_id")
    if delivery_id is not None:
        if role_code not in {"BUSINESS", "ADMIN", "SUPER_ADMIN"}:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Only business accounts can approve deliveries."}}, status=403)

        try:
            delivery = CampaignDelivery.objects.select_related("campaign", "influencer", "influencer__user", "payment_record").get(id=delivery_id)
        except CampaignDelivery.DoesNotExist:
            return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Delivery not found."}}, status=404)

        status = str(payload.get("status") or delivery.status or "PENDING").upper()
        if role_code == "BUSINESS" and delivery.campaign.business.user_id != request.user.id:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "You can only approve deliveries for your campaigns."}}, status=403)

        delivery.status = status
        delivery.notes = str(payload.get("notes") or delivery.notes or "").strip() or delivery.notes
        delivery.save(update_fields=["status", "notes", "updated_at"])

        if status == "APPROVED":
            if delivery.payment_record is None:
                payment = Payment.objects.create(
                    user=delivery.influencer.user,
                    amount=delivery.campaign.budget,
                    currency="INR",
                    status="PAID",
                    provider_reference=f"CAMPAIGN-{delivery.id}",
                )
                delivery.payment_record = payment
                delivery.status = "APPROVED"
                delivery.save(update_fields=["payment_record", "status", "updated_at"])
            else:
                delivery.payment_record.status = "PAID"
                delivery.payment_record.save(update_fields=["status"])
                delivery.status = "APPROVED"
                delivery.save(update_fields=["status", "updated_at"])
            delivery.campaign.status = "APPROVED"
            delivery.campaign.save(update_fields=["status", "updated_at"])

        return JsonResponse({"success": True, "data": _serialize_delivery(delivery), "message": "Delivery status updated."})

    if role_code not in {"INFLUENCER", "BUSINESS", "ADMIN", "SUPER_ADMIN"}:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "This role cannot submit campaign delivery."}}, status=403)

    campaign_id = payload.get("campaign_id")
    if not campaign_id:
        return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Campaign ID is required."}}, status=400)

    try:
        campaign = Campaign.objects.get(id=campaign_id)
    except Campaign.DoesNotExist:
        return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Campaign not found."}}, status=404)

    influencer_profile = getattr(request.user, "influencer_profile", None)
    if role_code == "BUSINESS":
        if campaign.business.user_id != request.user.id:
            return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "You can only submit delivery for your own campaign."}}, status=403)
        influencer_id = payload.get("influencer_id")
        if not influencer_id:
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Influencer ID is required."}}, status=400)
        try:
            influencer_profile = InfluencerProfile.objects.get(id=influencer_id)
        except InfluencerProfile.DoesNotExist:
            return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Influencer not found."}}, status=404)
    elif role_code in {"ADMIN", "SUPER_ADMIN"}:
        influencer_id = payload.get("influencer_id")
        if not influencer_id:
            return JsonResponse({"success": False, "error": {"code": "INVALID_INPUT", "message": "Influencer ID is required."}}, status=400)
        try:
            influencer_profile = InfluencerProfile.objects.get(id=influencer_id)
        except InfluencerProfile.DoesNotExist:
            return JsonResponse({"success": False, "error": {"code": "NOT_FOUND", "message": "Influencer not found."}}, status=404)
    elif not influencer_profile:
        return JsonResponse({"success": False, "error": {"code": "FORBIDDEN", "message": "Influencer profile not found."}}, status=403)

    if role_code == "INFLUENCER":
        delivery, created = CampaignDelivery.objects.get_or_create(campaign=campaign, influencer=influencer_profile)
    else:
        delivery, created = CampaignDelivery.objects.get_or_create(campaign=campaign, influencer=influencer_profile)

    delivery.content_url = str(payload.get("content_url") or delivery.content_url or "").strip()
    delivery.notes = str(payload.get("notes") or delivery.notes or "").strip()
    status = str(payload.get("status") or "SUBMITTED").upper()
    delivery.status = status if status in {"PENDING", "SUBMITTED", "APPROVED", "REJECTED", "PAID"} else "SUBMITTED"
    delivery.save(update_fields=["content_url", "notes", "status", "updated_at"])
    if delivery.status == "SUBMITTED":
        delivery.campaign.status = "CONTENT_SUBMITTED"
        delivery.campaign.save(update_fields=["status", "updated_at"])
    return JsonResponse({"success": True, "data": _serialize_delivery(delivery), "message": "Delivery saved."})
