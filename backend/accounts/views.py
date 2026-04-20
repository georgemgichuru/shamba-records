"""
Authentication & User management views.

RBAC enforcement strategy:
- RegisterView:   Public endpoint, but role='admin' requires an authenticated admin caller.
- UserProfileView: Any authenticated user — returns their own profile.
- UserListView:   Admin only — list all users.
- UserDetailView: Admin only — update any user.
- UserDeleteView: Admin only — delete a user (cannot delete yourself).
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import User
from .serializers import RegisterSerializer, UserSerializer, AdminUserUpdateSerializer
from .permissions import IsAdmin, IsSelfOrAdmin


class RegisterView(APIView):
    """
    Public registration endpoint.

    Rules:
    - Unauthenticated requests → role is FORCED to 'agent' regardless of payload.
    - Authenticated admin requests → any role is allowed (used by UserManagement panel).
    - Authenticated non-admin requests → role is forced to 'agent'.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data.copy()

        # Determine if the caller is an authenticated admin
        caller_is_admin = (
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser)
        )

        # Non-admin callers (including anonymous) can only register as 'agent'
        if not caller_is_admin:
            if data.get('role') != 'agent':
                 data['role'] = 'agent'

        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {
                    'message': 'User registered successfully.',
                    'user': UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    GET  /api/auth/profile/  — Returns the authenticated user's profile.
    PATCH /api/auth/profile/ — Lets a user update their own non-role fields.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # Users can update their own profile, but NOT their role
        data = request.data.copy()
        data.pop('role', None)  # Ignore any role change attempts from this endpoint
        serializer = UserSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(APIView):
    """
    GET  /api/auth/users/  — Admin only: list all users.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by('id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class UserDetailView(APIView):
    """
    GET   /api/auth/users/<pk>/  — Admin only: retrieve a single user.
    PATCH /api/auth/users/<pk>/  — Admin only: update any user field including role.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UserSerializer(user).data)

    def patch(self, request, pk):
        user = self._get_user(pk)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AdminUserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDeleteView(APIView):
    """
    DELETE /api/auth/users/<pk>/delete/  — Admin only.
    Prevents admins from deleting their own account.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def delete(self, request, pk):
        if request.user.pk == pk:
            return Response(
                {'detail': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({'message': 'User deleted successfully.'}, status=status.HTTP_200_OK)
