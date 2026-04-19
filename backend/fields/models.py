"""
Field model — enhanced schema for SmartSeason field management.

Schema decisions:
  - Flowering added as an intermediate lifecycle stage.
  - location: free-text GPS/address string (flexible for field agents on mobile).
  - area_hectares: DecimalField for precision (Decimal avoids float rounding).
  - expected_harvest_date: optional target harvest date for risk calculation.
  - created_at / updated_at: audit timestamps, set automatically.
  - computed_status: a @property that derives Active / At Risk / Completed
    from current_stage and optional expected_harvest_date.
"""
from django.db import models
from django.utils import timezone
import datetime
from django.contrib.auth import get_user_model

User = get_user_model()


class Field(models.Model):
    STAGE_CHOICES = (
        ('Planted',    'Planted'),
        ('Growing',    'Growing'),
        ('Flowering',  'Flowering'),
        ('Ready',      'Ready for Harvest'),
        ('Harvested',  'Harvested'),
    )

    # ── Core identifiers ──────────────────────────────────────────────────────
    name        = models.CharField(max_length=255, help_text="Field name or identifier")
    crop_type   = models.CharField(max_length=100, help_text="Type of crop e.g. Maize, Wheat")

    # ── Lifecycle dates ───────────────────────────────────────────────────────
    planting_date          = models.DateField(help_text="Date the crop was planted")
    expected_harvest_date  = models.DateField(
        null=True, blank=True,
        help_text="Target harvest date (used for risk calculations)"
    )

    # ── Stage ─────────────────────────────────────────────────────────────────
    current_stage = models.CharField(
        max_length=20, choices=STAGE_CHOICES, default='Planted'
    )

    # ── Location & size ────────────────────────────────────────────────────────
    location      = models.CharField(
        max_length=255, blank=True, default='',
        help_text="GPS coordinates or descriptive location (e.g. 'North Paddock, Nakuru')"
    )
    area_hectares = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True,
        help_text="Field area in hectares"
    )

    # ── Assignment ─────────────────────────────────────────────────────────────
    assigned_agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='assigned_fields',
        limit_choices_to={'role': 'agent'},
    )

    # ── Notes ─────────────────────────────────────────────────────────────────
    notes = models.TextField(blank=True, default='', help_text="Field observations and notes")

    # ── Audit timestamps ──────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Field'
        verbose_name_plural = 'Fields'

    @property
    def computed_status(self):
        """
        Derives a status indicating the health or state of the field based on the current stage and timeline.
        """
        if self.current_stage == 'Harvested':
            return 'Completed'

        today = datetime.date.today()
        days_since = (today - self.planting_date).days

        # Dynamic risk calculation based on stage progression
        if self.current_stage == 'Planted' and days_since > 30:
            return 'At Risk (Delayed Growth)'

        if self.current_stage == 'Growing' and days_since > 90:
            return 'At Risk (Prolonged Growth)'

        if self.expected_harvest_date:
            if today > self.expected_harvest_date:
                if self.current_stage != 'Ready':
                    return 'At Risk (Delayed Maturity)'
                return 'Urgent (Harvest Overdue)'

            if (self.expected_harvest_date - today).days <= 7:
                if self.current_stage != 'Ready':
                    return 'Warning (Approaching Harvest, not Ready)'

        # Generic age-based risk (120+ days and not harvested/ready)
        if days_since > 120 and self.current_stage not in ['Ready', 'Harvested']:
            return 'At Risk (Past Typical Lifecycle)'

        # Default active states
        if self.current_stage == 'Ready':
            return 'Action Required (Ready to Harvest)'

        return 'Active / On Track'

    @property
    def days_since_planting(self):
        return (datetime.date.today() - self.planting_date).days

    def __str__(self):
        return f"{self.name} — {self.crop_type} ({self.current_stage})"
