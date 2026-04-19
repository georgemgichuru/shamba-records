"""
Serializers for the fields app.

FieldSerializer:
  - Exposes all model fields plus computed properties.
  - assigned_agent_details: nested read-only representation of the assigned user.
  - status: computed_status property surfaced as a read-only string.
  - days_since_planting: computed number of days since planting date.

FieldAssignSerializer:
  - Lightweight serializer used ONLY for the agent assignment endpoint.
  - Accepts `assigned_agent` (PK) and validates the user has role='agent'.
"""
from rest_framework import serializers
from .models import Field
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class FieldSerializer(serializers.ModelSerializer):
    # Computed from @property
    status             = serializers.ReadOnlyField(source='computed_status')
    days_since_planting = serializers.ReadOnlyField()

    # Nested agent details (read-only)
    assigned_agent_details = UserSerializer(source='assigned_agent', read_only=True)

    class Meta:
        model  = Field
        fields = [
            'id',
            'name',
            'crop_type',
            'planting_date',
            'expected_harvest_date',
            'current_stage',
            'location',
            'area_hectares',
            'assigned_agent',
            'assigned_agent_details',
            'notes',
            'status',
            'days_since_planting',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FieldAssignSerializer(serializers.Serializer):
    """
    Used exclusively by AssignAgentView (PATCH /api/fields/<id>/assign/).
    Validates that the target user exists and has role='agent'.
    Pass null/empty string to unassign.
    """
    assigned_agent = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='agent'),
        allow_null=True,
        required=True,
    )

    def update(self, instance, validated_data):
        instance.assigned_agent = validated_data.get('assigned_agent')
        instance.save(update_fields=['assigned_agent', 'updated_at'])
        return instance
