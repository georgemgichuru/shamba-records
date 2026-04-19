"""
Fields API views with clean RBAC enforcement.

Role behaviour:
  admin  — Full CRUD on all fields; can assign/unassign agents.
  agent  — Read only their assigned fields; may PATCH current_stage and notes.

Endpoints:
  FieldViewSet          GET/POST/PATCH/DELETE /api/fields/
  AssignAgentView       PATCH  /api/fields/<pk>/assign/
  FieldAgentsListView   GET    /api/fields/agents/
"""
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import get_object_or_404

from .models import Field
from .serializers import FieldSerializer, FieldAssignSerializer
from accounts.permissions import IsAdmin
from accounts.serializers import UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Fields that a field agent is allowed to update via PATCH
AGENT_WRITABLE_FIELDS = {'current_stage', 'notes'}


class FieldViewSet(viewsets.ModelViewSet):
    """
    Provides CRUD operations on Field objects.

    Scoping:
      - Admin sees ALL fields.
      - Agent sees ONLY fields assigned to them.

    Write restrictions:
      - create / destroy / full update (PUT): admin only.
      - partial_update (PATCH): admin any field; agent only AGENT_WRITABLE_FIELDS.
    """
    serializer_class  = FieldSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Field.objects.select_related('assigned_agent')
        if user.is_admin:
            return qs.all()
        return qs.filter(assigned_agent=user)

    # ── Write guards ──────────────────────────────────────────────────────────

    def create(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Only admins can create fields.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response(
                {'detail': 'Only admins can delete fields.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().destroy(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Full PUT — admin only."""
        if not request.user.is_admin:
            return Response(
                {'detail': 'Full updates are restricted to admins.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        """
        PATCH — agents are limited to AGENT_WRITABLE_FIELDS.
        """
        user = request.user
        if not user.is_admin:
            disallowed = set(request.data.keys()) - AGENT_WRITABLE_FIELDS
            if disallowed:
                return Response(
                    {
                        'detail': (
                            f'Field agents may only update: '
                            f'{", ".join(sorted(AGENT_WRITABLE_FIELDS))}. '
                            f'Disallowed: {", ".join(sorted(disallowed))}'
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class AssignAgentView(APIView):
    """
    PATCH /api/fields/<pk>/assign/

    Admin-only endpoint to assign (or unassign) a field agent.
    Body: { "assigned_agent": <user_pk> }   (null to unassign)
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def patch(self, request, pk):
        field = get_object_or_404(Field, pk=pk)
        serializer = FieldAssignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.update(field, serializer.validated_data)
            return Response(FieldSerializer(field).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FieldAgentsListView(APIView):
    """
    GET /api/fields/agents/

    Returns all users with role='agent'.
    Admin only (used to populate assignment dropdowns in the frontend).
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        agents = User.objects.filter(role='agent').order_by('first_name', 'username')
        serializer = UserSerializer(agents, many=True)
        return Response(serializer.data)
