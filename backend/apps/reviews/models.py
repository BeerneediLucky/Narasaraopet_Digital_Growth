from django.db import models

from apps.accounts.models import User


class Review(models.Model):
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_written")
    target_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_received")
    overall_rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("reviewer", "target_user")

    def __str__(self):
        return f"{self.reviewer.email} -> {self.target_user.email}"
