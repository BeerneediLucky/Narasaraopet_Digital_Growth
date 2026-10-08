from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.Model):
    ROLE_CHOICES = (
        ("SUPER_ADMIN", "Super Admin"),
        ("ADMIN", "Admin"),
        ("BUSINESS", "Business"),
        ("INFLUENCER", "Influencer"),
    )

    code = models.CharField(max_length=32, choices=ROLE_CHOICES, unique=True)
    label = models.CharField(max_length=80)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.label


class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    company_name = models.CharField(max_length=150, blank=True)
    role = models.ForeignKey(
        "Role",
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )
    is_suspended = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.email
