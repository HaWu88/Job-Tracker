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

    def update(self, instance, validated_data):
        new_status = validated_data.get("current_status", instance.current_status)

        if instance.current_status != new_status:
            ApplicationStatusAudit.objects.create(
                application=instance,
                previous_status=instance.current_status,
                new_status=new_status,
            )

        return super().update(instance, validated_data)
