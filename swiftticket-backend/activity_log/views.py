from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ActivityLog
from .serializers import ActivityLogSerializer
from django.db import models

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only viewset for activity logs.
    Users can only view, not create/update/delete directly.
    """
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admins see everything
        if user.role == 'admin':
            queryset = ActivityLog.objects.all()
        # PMs see activities for their projects
        elif user.role == 'project_manager':
            queryset = ActivityLog.objects.filter(
                models.Q(project__members=user) | models.Q(user=user)
            ).distinct()
        # Developers see their own activities and activities on their tickets
        else:
            queryset = ActivityLog.objects.filter(
                models.Q(user=user) |
                models.Q(ticket__assigned_to=user) |
                models.Q(ticket__created_by=user)
            ).distinct()

        # Filter by query params
        ticket_id = self.request.query_params.get('ticket')
        project_id = self.request.query_params.get('project')

        if ticket_id:
            queryset = queryset.filter(ticket_id=ticket_id)
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset.select_related('user', 'ticket', 'project')

    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent activity (last 20 items)"""
        activities = self.get_queryset()[:20]
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)