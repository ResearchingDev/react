from django.db import models
# Create your models here.
class Wage(models.Model):
    email = models.CharField(max_length=50)
    password = models.CharField(max_length=15)

    def __str__(self):
        return f'{self.email}: {self.password}'
