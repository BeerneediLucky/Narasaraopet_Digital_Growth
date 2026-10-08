import json

from django.test import TestCase


class AnalyticsApiTests(TestCase):
    def test_admin_can_fetch_dashboard_summary(self):
        user = self._create_user("admin@example.com", "ADMIN")
        self.client.force_login(user)

        response = self.client.get("/api/analytics/summary/")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertIn("metrics", body["data"])

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
