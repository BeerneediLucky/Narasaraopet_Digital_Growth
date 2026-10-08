from django.db import models

from apps.accounts.models import User


class InfluencerProfile(models.Model):
    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("PENDING_REVIEW", "Pending Review"),
        ("VERIFIED", "Verified"),
        ("REJECTED", "Rejected"),
        ("SUSPENDED", "Suspended"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="influencer_profile")
    display_name = models.CharField(max_length=120)
    city = models.CharField(max_length=80, default="Narasaraopet")
    district = models.CharField(max_length=80, default="Palnadu")
    bio = models.TextField(blank=True)
    followers = models.PositiveBigIntegerField(default=0)
    engagement_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    average_views = models.PositiveBigIntegerField(default=0)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default="DRAFT")
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.display_name


class InfluencerCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
