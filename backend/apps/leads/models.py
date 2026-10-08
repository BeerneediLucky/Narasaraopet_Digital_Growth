from django.db import models

from apps.accounts.models import User


class Lead(models.Model):
    STATUS_CHOICES = (
        ("NEW", "New"),
        ("CONTACTED", "Contacted"),
        ("QUALIFIED", "Qualified"),
        ("PROPOSAL", "Proposal"),
        ("WON", "Won"),
        ("LOST", "Lost"),
    )

    name = models.CharField(max_length=140)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    business_name = models.CharField(max_length=160, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="NEW")
    assigned_to = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL, related_name="assigned_leads")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
