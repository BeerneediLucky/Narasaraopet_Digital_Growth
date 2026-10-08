from django.db import models


class AnalyticsSnapshot(models.Model):
    label = models.CharField(max_length=120)
    value = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.label
