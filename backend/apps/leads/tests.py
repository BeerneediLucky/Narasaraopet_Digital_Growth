import json

from django.test import TestCase


class LeadApiTests(TestCase):
    def test_business_can_create_lead(self):
        user = self._create_user("brand@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/leads/",
            data=json.dumps({
                "name": "Amit Varma",
                "email": "amit@example.com",
                "phone": "+91 98765 43210",
                "business_name": "Apex Studios",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["name"], "Amit Varma")

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User
        from apps.businesses.models import BusinessProfile

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        user = User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
        BusinessProfile.objects.get_or_create(
            user=user,
            defaults={"business_name": "Test Brand"},
        )
        return user
