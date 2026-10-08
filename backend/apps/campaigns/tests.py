import json

from django.test import TestCase

from apps.accounts.models import Role, User
from apps.businesses.models import BusinessProfile
from apps.campaigns.models import Campaign, CampaignDelivery, CampaignInvitation
from apps.influencers.models import InfluencerProfile


class CampaignApiTests(TestCase):
    def test_business_can_create_campaign(self):
        user = self._create_user("brand@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/campaigns/",
            data=json.dumps({
                "name": "Creator Launch Sprint",
                "objective": "Drive awareness and qualified leads.",
                "target_location": "Vijayawada",
                "target_audience": "Gen Z lifestyle buyers",
                "budget": 4000,
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["name"], "Creator Launch Sprint")

    def test_business_can_create_campaign_invitation(self):
        business_user = self._create_user("brand-invite@example.com", "BUSINESS")
        influencer_user = self._create_influencer_user("creator-invite@example.com")
        self.client.force_login(business_user)

        campaign = Campaign.objects.create(
            business=BusinessProfile.objects.get(user=business_user),
            name="Creator Sprint",
            objective="Drive product awareness.",
            target_location="Guntur",
            target_audience="Food lovers",
            budget=12000,
            status="PUBLISHED",
        )

        response = self.client.post(
            "/api/campaigns/invitations/",
            data=json.dumps({
                "campaign_id": campaign.id,
                "influencer_id": influencer_user.influencer_profile.id,
                "status": "PENDING",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        self.assertEqual(CampaignInvitation.objects.count(), 1)

    def test_influencer_can_list_campaign_invitations(self):
        business_user = self._create_user("brand-list@example.com", "BUSINESS")
        influencer_user = self._create_influencer_user("creator-list@example.com")
        business_profile = BusinessProfile.objects.get(user=business_user)
        campaign = Campaign.objects.create(
            business=business_profile,
            name="Launch Week",
            objective="Build creator buzz.",
            target_location="Rajahmundry",
            target_audience="Local shoppers",
            budget=18000,
            status="PUBLISHED",
        )
        CampaignInvitation.objects.create(
            campaign=campaign,
            influencer=influencer_user.influencer_profile,
            status="PENDING",
        )

        self.client.force_login(influencer_user)
        response = self.client.get("/api/campaigns/invitations/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(len(payload["data"]), 1)

    def test_influencer_can_submit_campaign_delivery_and_business_can_approve_it(self):
        business_user = self._create_user("brand-delivery@example.com", "BUSINESS")
        influencer_user = self._create_influencer_user("creator-delivery@example.com")
        business_profile = BusinessProfile.objects.get(user=business_user)
        campaign = Campaign.objects.create(
            business=business_profile,
            name="Summer Creator Push",
            objective="Launch a product video series.",
            target_location="Kakinada",
            target_audience="Young shoppers",
            budget=25000,
            status="ACCEPTED",
        )
        CampaignInvitation.objects.create(
            campaign=campaign,
            influencer=influencer_user.influencer_profile,
            status="ACCEPTED",
        )

        self.client.force_login(influencer_user)
        submit_response = self.client.post(
            "/api/campaigns/deliveries/",
            data=json.dumps({
                "campaign_id": campaign.id,
                "content_url": "https://cdn.example.com/creator/video.mp4",
                "notes": "Posted the reel with product feature callouts.",
                "status": "SUBMITTED",
            }),
            content_type="application/json",
        )

        self.assertEqual(submit_response.status_code, 200)
        self.assertTrue(submit_response.json()["success"])
        self.assertEqual(CampaignDelivery.objects.count(), 1)

        delivery = CampaignDelivery.objects.get(campaign=campaign, influencer=influencer_user.influencer_profile)
        self.client.force_login(business_user)
        approve_response = self.client.post(
            "/api/campaigns/deliveries/",
            data=json.dumps({
                "delivery_id": delivery.id,
                "status": "APPROVED",
                "notes": "Approved for payout.",
            }),
            content_type="application/json",
        )

        self.assertEqual(approve_response.status_code, 200)
        delivery.refresh_from_db()
        self.assertEqual(delivery.status, "APPROVED")
        self.assertTrue(delivery.payment_record is not None)

    def _create_user(self, email, role_code):
        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        user = User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
        BusinessProfile.objects.get_or_create(
            user=user,
            defaults={"business_name": "Demo Brand"},
        )
        return user

    def _create_influencer_user(self, email):
        role, _ = Role.objects.get_or_create(code="INFLUENCER", defaults={"label": "Influencer"})
        user = User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
        profile, _ = InfluencerProfile.objects.get_or_create(
            user=user,
            defaults={
                "display_name": "Creator Profile",
                "city": "Narasaraopet",
                "district": "Palnadu",
                "followers": 20000,
                "engagement_rate": 5.0,
                "average_views": 80000,
                "status": "VERIFIED",
                "is_verified": True,
            },
        )
        user.influencer_profile = profile
        return user
