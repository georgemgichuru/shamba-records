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
        
        at_risk_fields = []

        for field in fields:
            s = field.computed_status
            if 'Completed' in s:
                status_breakdown['Completed'] += 1
            elif 'Risk' in s or 'Urgent' in s or 'Warning' in s:
                status_breakdown['At Risk'] += 1
                at_risk_fields.append(field.id)
            else:
                status_breakdown['Active'] += 1

        stage_breakdown = {
            stage: fields.filter(current_stage=stage).count()
            for stage, _ in Field.STAGE_CHOICES
        }

        # Recent activity: last 5 harvested
        recently_harvested = fields.filter(current_stage='Harvested').count()

        return Response({
            'total_fields': total_fields,
            'status_breakdown': status_breakdown,
            'stage_breakdown': stage_breakdown,
            'recently_harvested': recently_harvested,
            'at_risk_count': len(at_risk_fields),
        })
