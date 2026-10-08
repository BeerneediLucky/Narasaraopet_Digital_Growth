import json

from django.test import TestCase


class ReviewsApiTests(TestCase):
    def test_user_can_create_review(self):
        reviewer = self._create_user("reviewer@example.com", "BUSINESS")
        target = self._create_user("target@example.com", "INFLUENCER")
        self.client.force_login(reviewer)

        response = self.client.post(
            "/api/reviews/",
            data=json.dumps({
                "target_user_id": target.id,
                "overall_rating": 5,
                "comment": "Great collaborator and reliable delivery.",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["overall_rating"], 5)

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
