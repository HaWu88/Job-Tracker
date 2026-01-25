from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import User, JobApplication, ApplicationStatusAudit

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "role")

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ("company_name", "position", "current_status", "user")
    list_filter = ("current_status",)
    search_fields = ("company_name", "position")

@admin.register(ApplicationStatusAudit)
class ApplicationStatusAuditAdmin(admin.ModelAdmin):
    list_display = ("application", "previous_status", "new_status", "changed_at")
