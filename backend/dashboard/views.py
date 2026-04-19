from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from fields.models import Field

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role == 'admin' or user.is_superuser:
            fields = Field.objects.all()
        else:
            fields = Field.objects.filter(assigned_agent=user)

        total_fields = fields.count()
        status_breakdown = {'Active': 0, 'At Risk': 0, 'Completed': 0}

        for field in fields:
            s = field.computed_status
            if s in status_breakdown:
                status_breakdown[s] += 1

        stage_breakdown = {
            stage: fields.filter(current_stage=stage).count()
            for stage, _ in Field.STAGE_CHOICES
        }

        # Recent activity: last 5 harvested
        recently_harvested = fields.filter(current_stage='Harvested').count()
        at_risk_fields = [f.id for f in fields if f.computed_status == 'At Risk']

        return Response({
            'total_fields': total_fields,
            'status_breakdown': status_breakdown,
            'stage_breakdown': stage_breakdown,
            'recently_harvested': recently_harvested,
            'at_risk_count': len(at_risk_fields),
        })
