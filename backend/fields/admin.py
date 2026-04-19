from django.contrib import admin
from .models import Field


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display  = ('name', 'crop_type', 'current_stage', 'assigned_agent', 'planting_date', 'computed_status')
    list_filter   = ('current_stage', 'crop_type')
    search_fields = ('name', 'crop_type', 'location', 'notes')
    readonly_fields = ('created_at', 'updated_at', 'computed_status', 'days_since_planting')
    fieldsets = (
        ('Field Info', {
            'fields': ('name', 'crop_type', 'location', 'area_hectares')
        }),
        ('Lifecycle', {
            'fields': ('planting_date', 'expected_harvest_date', 'current_stage', 'computed_status', 'days_since_planting')
        }),
        ('Assignment & Notes', {
            'fields': ('assigned_agent', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
