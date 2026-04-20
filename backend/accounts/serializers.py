"""
Serializers for the accounts app.

Key additions vs the original:
- CustomTokenObtainPairSerializer: embeds role, username, full_name in JWT claims
  so the frontend can decode the token and know the user's role immediately,
  without a separate profile API call.
- RegisterSerializer: validates password (client handles confirmation).
- UserSerializer: `role` is read-only for agents (enforced in the view layer via
  IsSelfOrAdmin + partial=True; changing role requires admin PATCH).
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


# ---------------------------------------------------------------------------
# JWT serializer — adds custom claims to the token payload
# ---------------------------------------------------------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extends the default simplejwt serializer to embed user role
    and display info directly inside the JWT access token.
    This means the frontend can decode the token and immediately
    know the role without an extra /profile/ round-trip.
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims embedded in the JWT payload
        token['role'] = user.role
        token['username'] = user.username
        token['full_name'] = f"{user.first_name} {user.last_name}".strip() or user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Also include user info in the login *response body*
        # so the frontend can use it without decoding the JWT.
        data['role'] = self.user.role
        data['username'] = self.user.username
        data['full_name'] = f"{self.user.first_name} {self.user.last_name}".strip() or self.user.username
        data['email'] = self.user.email
        return data


# ---------------------------------------------------------------------------
# User read serializer
# ---------------------------------------------------------------------------
class UserSerializer(serializers.ModelSerializer):
    """
    Used for reading/updating user profiles.
    `role` is included but should only be writable by admins —
    enforce this in the view by controlling which fields are accepted.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number']
        read_only_fields = ['id']


# ---------------------------------------------------------------------------
# Registration serializer
# ---------------------------------------------------------------------------
class RegisterSerializer(serializers.ModelSerializer):
    """
    Used by:
    1. The public /register/ endpoint — role is forced to 'agent'.
    2. The admin UserManagement panel — role can be set freely.

    The view is responsible for enforcing who can set role='admin'.
    Password confirmation handled client-side; optional server check if sent.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default='agent')

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password',
            'first_name', 'last_name', 'role', 'phone_number',
        ]

    def validate(self, attrs):
        if 'password_confirm' in attrs and attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ---------------------------------------------------------------------------
# Admin user update serializer (allows role changes)
# ---------------------------------------------------------------------------
class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """
    Used exclusively by admins to update any user's fields,
    including changing their role.
    """
    password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role', 'phone_number', 'password']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

