from django.db import models

from apps.accounts.models import User
from apps.businesses.models import BusinessProfile


class Campaign(models.Model):
    STATUS_CHOICES = (
        ("DRAFT", "Draft"),
        ("PUBLISHED", "Published"),
        ("INVITED", "Invited"),
        ("NEGOTIATING", "Negotiating"),
        ("ACCEPTED", "Accepted"),
        ("FUNDED", "Funded"),
        ("CONTENT_IN_PROGRESS", "Content in Progress"),
        ("CONTENT_SUBMITTED", "Content Submitted"),
        ("APPROVED", "Approved"),
        ("COMPLETED", "Completed"),
    )

    business = models.ForeignKey(BusinessProfile, on_delete=models.CASCADE, related_name="campaigns")
    name = models.CharField(max_length=180)
    objective = models.TextField(blank=True)
    target_location = models.CharField(max_length=120, default="Narasaraopet")
    target_audience = models.CharField(max_length=120, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="DRAFT")
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class CampaignInvitation(models.Model):
    campaign = models.ForeignKey(Campaign, related_name="invitations", on_delete=models.CASCADE)
    influencer = models.ForeignKey("influencers.InfluencerProfile", on_delete=models.CASCADE, related_name="campaign_invitations")
    status = models.CharField(max_length=24, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.campaign.name} -> {self.influencer.display_name}"


class CampaignDelivery(models.Model):
    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("SUBMITTED", "Submitted"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
        ("PAID", "Paid"),
    )

    campaign = models.ForeignKey(Campaign, related_name="deliveries", on_delete=models.CASCADE)
    influencer = models.ForeignKey("influencers.InfluencerProfile", on_delete=models.CASCADE, related_name="campaign_deliveries")
    content_url = models.URLField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=STATUS_CHOICES, default="PENDING")
    payment_record = models.ForeignKey("payments.Payment", on_delete=models.SET_NULL, null=True, blank=True, related_name="campaign_deliveries")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.campaign.name} -> {self.influencer.display_name} [{self.status}]"
