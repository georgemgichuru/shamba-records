from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FieldViewSet, AssignAgentView, FieldAgentsListView

router = DefaultRouter()
router.register(r'', FieldViewSet, basename='field')

urlpatterns = [
    # Specific named endpoints BEFORE the router wildcard
    path('agents/',        FieldAgentsListView.as_view(), name='field-agents'),
    path('<int:pk>/assign/', AssignAgentView.as_view(),   name='field-assign'),

    # ViewSet router (handles list, detail, create, update, delete)
    path('', include(router.urls)),
]
