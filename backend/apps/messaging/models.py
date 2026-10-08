from django.db import models

from apps.accounts.models import User


class Conversation(models.Model):
    CONVERSATION_TYPES = (
        ("BUSINESS_INFLUENCER", "Business to Influencer"),
        ("BUSINESS_ADMIN", "Business to Admin"),
        ("CAMPAIGN", "Campaign"),
        ("SUPPORT", "Support"),
    )

    type = models.CharField(max_length=30, choices=CONVERSATION_TYPES)
    title = models.CharField(max_length=180, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title or self.type


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name="messages", on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.email}: {self.text[:40]}"
