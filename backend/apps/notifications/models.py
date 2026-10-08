from django.db import models

from apps.accounts.models import User


class Notification(models.Model):
    TYPE_CHOICES = (
        ("ACCOUNT", "Account"),
        ("CAMPAIGN", "Campaign"),
        ("MESSAGE", "Message"),
        ("PAYMENT", "Payment"),
        ("VERIFICATION", "Verification"),
        ("SYSTEM", "System"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    title = models.CharField(max_length=180)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
