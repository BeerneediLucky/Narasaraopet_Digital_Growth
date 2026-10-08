import json

from django.test import TestCase


class MessagingApiTests(TestCase):
    def test_user_can_start_conversation_and_send_message(self):
        sender = self._create_user("sender@example.com", "BUSINESS")
        receiver = self._create_user("receiver@example.com", "INFLUENCER")
        self.client.force_login(sender)

        conversation_response = self.client.post(
            "/api/messages/conversations/",
            data=json.dumps({
                "type": "BUSINESS_INFLUENCER",
                "title": "Creator discovery",
                "participants": [receiver.id],
            }),
            content_type="application/json",
        )

        self.assertEqual(conversation_response.status_code, 200)
        conversation_data = conversation_response.json()
        self.assertTrue(conversation_data["success"])
        conversation_id = conversation_data["data"]["id"]

        message_response = self.client.post(
            "/api/messages/",
            data=json.dumps({
                "conversation_id": conversation_id,
                "text": "Hi! We’d love to collaborate.",
            }),
            content_type="application/json",
        )

        self.assertEqual(message_response.status_code, 200)
        self.assertTrue(message_response.json()["success"])

    def _create_user(self, email, role_code):
        from apps.accounts.models import Role, User

        role, _ = Role.objects.get_or_create(code=role_code, defaults={"label": role_code.replace("_", " ")})
        return User.objects.create_user(
            username=email.split("@")[0],
            email=email,
            password="StrongPass123!",
            role=role,
        )
