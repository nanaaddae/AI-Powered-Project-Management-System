from rest_framework import serializers
from .models import ActivityLog
from users.serializers import UserSerializer


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    ticket_title = serializers.CharField(source='ticket.title', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'action_type', 'description',
            'ticket', 'ticket_title', 'project', 'project_name',
            'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']