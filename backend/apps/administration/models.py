from django.db import models

from apps.accounts.models import User


class AdminSetting(models.Model):
    key = models.CharField(max_length=120, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key


class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, related_name="audit_logs", null=True, blank=True)
    action = models.CharField(max_length=180)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.action
