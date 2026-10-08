from django.db import models

from apps.accounts.models import User


class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="business_profile")
    business_name = models.CharField(max_length=160)
    city = models.CharField(max_length=80, default="Narasaraopet")
    district = models.CharField(max_length=80, default="Palnadu")
    state = models.CharField(max_length=80, default="Andhra Pradesh")
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name


class BusinessCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name
