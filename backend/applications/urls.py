from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, dashboard_stats

router = DefaultRouter()
router.register("applications", JobApplicationViewSet, basename="applications")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/", dashboard_stats),

]
