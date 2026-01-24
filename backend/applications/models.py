from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ("user", "User"),
        ("admin", "Admin"),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="custom_user_set",
        blank=True,
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="custom_user_permissions_set",
        blank=True,
    )

STATUS_CHOICES = (
    ("applied", "Applied"),
    ("phone_screen", "Phone Screen"),
    ("on_site", "On Site Interview"),
    ("remote", "Remote Interview"),
    ("offer", "Offer"),
    ("accepted", "Accepted"),
    ("rejected", "Rejected"),
)

class JobApplication(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    applied_date = models.DateField(null=True, blank=True)
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.company_name} - {self.position}"

class ApplicationStatusAudit(models.Model):
    application = models.ForeignKey(
        JobApplication,
        related_name="audits",
        on_delete=models.CASCADE,
    )
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_at = models.DateTimeField(auto_now_add=True)
