from rest_framework import serializers
from .models import JobApplication, ApplicationStatusAudit
from datetime import date, timedelta

class ApplicationStatusAuditSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ApplicationStatusAudit
        fields = "__all__"

class JobApplicationSerializer(serializers.ModelSerializer):
    audits = ApplicationStatusAuditSerializer(many=True, read_only=True)
    needs_followup = serializers.SerializerMethodField()

    contact_email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    contact_name = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True
    )

    class Meta:
        model = JobApplication
        fields = "__all__"
        read_only_fields = ("user",)

    def get_needs_followup(self, obj):
        if obj.current_status != "applied":
            return False
        if not obj.applied_date:
            return False
        last_action_date = (
            obj.last_contacted_at.date()
            if obj.last_contacted_at
            else obj.applied_date
        )
        return last_action_date <= date.today() - timedelta(days=3)

    