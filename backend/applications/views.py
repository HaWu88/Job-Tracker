from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count
from .models import JobApplication
from .serializers import JobApplicationSerializer
from .permissions import IsOwnerOrAdmin


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return JobApplication.objects.all()
        return JobApplication.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    qs = JobApplication.objects.filter(user=request.user)
    status_counts = qs.values("current_status").annotate(count=Count("id"))
    return Response({
        "status_counts": status_counts,
        "avg_days": [],  # placeholder for next analytics step
    })
