"""
URL patterns for the accounts (auth) API.

Endpoint summary:
  POST   /api/auth/login/          — Obtain JWT (access + refresh), includes role in response
  POST   /api/auth/refresh/        — Refresh access token (rotates refresh token)
  POST   /api/auth/logout/         — Blacklist the refresh token (logout)
  POST   /api/auth/register/       — Public registration (role forced to 'agent')
  GET    /api/auth/profile/        — Get own profile
  PATCH  /api/auth/profile/        — Update own profile (no role change)
  GET    /api/auth/users/          — Admin: list all users
  GET    /api/auth/users/<pk>/     — Admin: get a user
  PATCH  /api/auth/users/<pk>/     — Admin: update a user (incl. role)
  DELETE /api/auth/users/<pk>/delete/ — Admin: delete a user
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import CustomTokenObtainPairSerializer
from .views import (
    RegisterView,
    UserProfileView,
    UserListView,
    UserDetailView,
    UserDeleteView,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    # Authentication
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # Registration & profile
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('profile/', UserProfileView.as_view(), name='auth_profile'),

    # Admin — user management
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/delete/', UserDeleteView.as_view(), name='user_delete'),
]
