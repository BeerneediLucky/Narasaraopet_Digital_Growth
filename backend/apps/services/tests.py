import json

from django.test import TestCase


class ServicesApiTests(TestCase):
    def test_business_can_create_service(self):
        user = self._create_user("brand@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/services/",
            data=json.dumps({
                "name": "Short-form video campaign",
                "description": "Three reels and a creator strategy sprint.",
                "category": "Performance Marketing",
                "price": 1200,
                "is_featured": True,
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["name"], "Short-form video campaign")
        self.assertEqual(body["data"]["category"], "Performance Marketing")

    def test_business_can_create_package(self):
        user = self._create_user("brand2@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/packages/",
            data=json.dumps({
                "name": "Creator Launch Sprint",
                "description": "Audit, creator outreach, and content planning.",
                "price": 2500,
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["name"], "Creator Launch Sprint")

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
