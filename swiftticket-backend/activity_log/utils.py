from .models import ActivityLog


def log_activity(user, action_type, description, ticket=None, project=None, metadata=None):
    """
    Helper function to create activity logs.

    Usage:
        log_activity(
            user=request.user,
            action_type='ticket_created',
            description=f'Created ticket #{ticket.id}: {ticket.title}',
            ticket=ticket,
            project=ticket.project,
            metadata={'priority': ticket.priority}
        )
    """
    return ActivityLog.objects.create(
        user=user,
        action_type=action_type,
        description=description,
        ticket=ticket,
        project=project,
        metadata=metadata or {}
    )