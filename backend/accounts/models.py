from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin (Coordinator)'),
        ('agent', 'Field Agent'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='agent')
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    @property
    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"
