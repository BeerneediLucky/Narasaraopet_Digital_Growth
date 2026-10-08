import json

from django.test import TestCase


class AuthApiTests(TestCase):
    def test_auth_api_allows_frontend_cors_credentials(self):
        response = self.client.options(
            "/api/auth/login/",
            HTTP_ORIGIN="http://localhost:5173",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="POST",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="content-type",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://localhost:5173")
        self.assertEqual(response["Access-Control-Allow-Credentials"], "true")

    def test_register_login_and_me_flow(self):
        payload = {
            "email": "founder@example.com",
            "password": "StrongPass123!",
            "first_name": "Ada",
            "last_name": "Lovelace",
            "company_name": "Newton Labs",
            "role": "BUSINESS",
        }

        register_response = self.client.post(
            "/api/auth/register/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(register_response.status_code, 201)
        body = register_response.json()
        self.assertTrue(body["success"])
        self.assertEqual(body["data"]["user"]["email"], payload["email"])

        login_response = self.client.post(
            "/api/auth/login/",
            data=json.dumps({"email": payload["email"], "password": payload["password"]}),
            content_type="application/json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertTrue(login_response.json()["success"])

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, 200)
        me_body = me_response.json()
        self.assertTrue(me_body["success"])
        self.assertEqual(me_body["data"]["user"]["email"], payload["email"])


class OnboardingApiTests(TestCase):
    def test_business_onboarding_creates_profile(self):
        user = self._create_user("business@example.com", "BUSINESS")
        self.client.force_login(user)

        response = self.client.post(
            "/api/business/onboarding/",
            data=json.dumps({
                "business_name": "Nova Growth Studio",
                "city": "Guntur",
                "state": "Andhra Pradesh",
                "website": "https://novagrowth.example",
                "description": "Growth marketing for D2C brands.",
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["business_name"], "Nova Growth Studio")

    def test_influencer_onboarding_creates_profile(self):
        user = self._create_user("creator@example.com", "INFLUENCER")
        self.client.force_login(user)

        response = self.client.post(
            "/api/influencer/onboarding/",
            data=json.dumps({
                "display_name": "Aarav Vlogs",
                "city": "Vijayawada",
                "bio": "Lifestyle and tech creator.",
                "followers": 250000,
                "engagement_rate": 6.2,
                "average_views": 82000,
            }),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["data"]["display_name"], "Aarav Vlogs")

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
