from rest_framework import permissions


class IsAdminOrProjectManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'project_manager']


class IsTicketParticipant(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.role == 'admin':
            return True

        # Project Manager can manage tickets in their projects
        if request.user.role == 'project_manager':
            return obj.project.members.filter(id=request.user.id).exists()

        # Developer can only work on assigned tickets
        if request.user.role == 'developer':
            return obj.assigned_to == request.user or obj.created_by == request.user

        return False


class CanCreateTicket(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.role in ['admin', 'project_manager']:
            return True
        return False


class CanAssignTicket(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'project_manager']