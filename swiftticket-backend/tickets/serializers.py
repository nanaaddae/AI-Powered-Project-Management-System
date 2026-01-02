from rest_framework import serializers
from .models import Ticket, Comment
from users.serializers import UserSerializer
from projects.serializers import ProjectSerializer


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'user', 'content', 'attachment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class TicketSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    project = ProjectSerializer(read_only=True)
    project_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)  # ← Add this
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'summary', 'ticket_type', 'priority',
            'status', 'component', 'project', 'project_id', 'created_by',
            'assigned_to', 'assigned_to_id', 'comments', 'created_at', 'updated_at'  # ← Add 'assigned_to_id'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at', 'summary']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['title', 'description', 'ticket_type', 'priority', 'status', 'component', 'assigned_to']