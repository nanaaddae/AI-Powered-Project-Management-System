from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectMember, CanManageProject
from users.models import User


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsProjectMember]

    def get_queryset(self):
        """Filter queryset based on user role"""
        if self.request.user.role == 'admin':
            return Project.objects.all()
        return Project.objects.filter(members=self.request.user)

    def get_permissions(self):
        """Different permissions for create/update/delete actions"""
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'add_member', 'remove_member']:
            self.permission_classes = [CanManageProject]
        return super().get_permissions()

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get ticket statistics for a project"""
        project = self.get_object()
        from tickets.models import Ticket

        stats = {
            'total_tickets': Ticket.objects.filter(project=project).count(),
            'open_tickets': Ticket.objects.filter(project=project, status='open').count(),
            'in_progress_tickets': Ticket.objects.filter(project=project, status='in_progress').count(),
            'completed_tickets': Ticket.objects.filter(project=project, status='done').count(),
        }
        return Response(stats)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)
            if user in project.members.all():
                return Response(
                    {'error': 'User is already a member'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            project.members.add(user)
            return Response({
                'message': f'{user.first_name} {user.last_name} added to project',
                'project': ProjectSerializer(project).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')

        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(id=user_id)

            # Don't allow removing the project creator
            if user == project.created_by:
                return Response(
                    {'error': 'Cannot remove project creator'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if user not in project.members.all():
                return Response(
                    {'error': 'User is not a member'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            project.members.remove(user)
            return Response({
                'message': f'{user.first_name} {user.last_name} removed from project',
                'project': ProjectSerializer(project).data
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def available_users(self, request):
        """Get all users that can be added to projects (developers and PMs)"""
        users = User.objects.filter(role__in=['developer', 'project_manager'])
        from users.serializers import UserSerializer
        return Response(UserSerializer(users, many=True).data)