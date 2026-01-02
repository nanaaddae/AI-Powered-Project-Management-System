from django.db import models

# Create your models here.
# tickets/models.py
from django.db import models
from users.models import User
from projects.models import Project


class Ticket(models.Model):
    TYPE_CHOICES = [
        ('bug', 'Bug'),
        ('feature', 'Feature Request'),
        ('performance', 'Performance Issue'),
        ('security', 'Security Concern'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('needs_review', 'Needs Review'),
        ('done', 'Done'),
    ]

    COMPONENT_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('api', 'API'),
        ('database', 'Database'),
        ('mobile', 'Mobile'),
        ('devops', 'DevOps'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    summary = models.TextField(blank=True)  # AI-generated
    ticket_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='bug')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    component = models.CharField(max_length=20, choices=COMPONENT_CHOICES, default='backend')

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tickets')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='assigned_tickets')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    attachment = models.FileField(upload_to='attachments/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'comments'
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.ticket.title}"