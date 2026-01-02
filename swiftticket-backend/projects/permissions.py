from rest_framework import permissions

class IsAdminOrProjectManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'project_manager']

class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(id=request.user.id).exists()

class CanManageProject(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return obj.created_by == request.user