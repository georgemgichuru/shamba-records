"""
Custom DRF permission classes for SmartSeason RBAC.

Usage in any view:
    permission_classes = [IsAuthenticated, IsAdmin]

Roles:
    admin  — Full system access; can manage users, create/delete fields
    agent  — Read own assigned fields; update stage + notes only
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Allow access only to users with role='admin' or superusers."""
    message = 'Access restricted to administrators only.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsAgent(BasePermission):
    """Allow access only to users with role='agent'."""
    message = 'Access restricted to field agents only.'

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'agent'
        )


class IsAdminOrReadOwn(BasePermission):
    """
    Admins get full access.
    Agents can only perform safe (read) methods on their own objects.
    Apply alongside object-level filtering in get_queryset().
    """
    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin' or user.is_superuser:
            return True
        # Agents: safe methods only, and object must belong to them
        if request.method in SAFE_METHODS:
            # Field model has assigned_agent FK
            return getattr(obj, 'assigned_agent_id', None) == user.pk
        return False


class IsSelfOrAdmin(BasePermission):
    """
    Used for user profile endpoints.
    Allows a user to read/edit only their own profile.
    Admins can access any user profile.
    """
    message = 'You can only access your own profile.'

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role == 'admin' or user.is_superuser:
            return True
        return obj.pk == user.pk
