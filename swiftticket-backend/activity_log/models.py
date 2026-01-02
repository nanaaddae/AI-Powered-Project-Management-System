from django.db import models
from users.models import User
from projects.models import Project
from tickets.models import Ticket


class ActivityLog(models.Model):
    ACTION_TYPES = [
        ('ticket_created', 'Ticket Created'),
        ('ticket_updated', 'Ticket Updated'),
        ('ticket_deleted', 'Ticket Deleted'),
        ('status_changed', 'Status Changed'),
        ('priority_changed', 'Priority Changed'),
        ('assigned', 'Assigned'),
        ('unassigned', 'Unassigned'),
        ('comment_added', 'Comment Added'),
        ('project_created', 'Project Created'),
        ('member_added', 'Member Added'),
        ('member_removed', 'Member Removed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    description = models.TextField()

    # Optional references
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')

    # Store additional data as JSON (e.g., old/new values)
    metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.action_type} - {self.created_at}"