import json

from django.test import TestCase


class NotificationApiTests(TestCase):
    def test_user_can_create_notification(self):
        user = self._create_user("alert@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/notifications/",
            data=json.dumps({
                "type": "CAMPAIGN",
                "title": "Campaign published",
                "message": "Your campaign has gone live.",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["title"], "Campaign published")

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
