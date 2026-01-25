from rest_framework import serializers
from .models import JobApplication, ApplicationStatusAudit

class ApplicationStatusAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationStatusAudit
        fields = "__all__"

class JobApplicationSerializer(serializers.ModelSerializer):
    audits = ApplicationStatusAuditSerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = "__all__"
        read_only_fields = ("user",)

    