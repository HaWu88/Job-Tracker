from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count
from .models import JobApplication
from .serializers import JobApplicationSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib.auth import get_user_model


User = get_user_model()

class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    # permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        # For NoAuth demo only
        if not user.is_authenticated:
            user, _ = User.objects.get_or_create(
                username="dev_user", 
                defaults={"email": "dev@example.com", "role": "user"}
            )
            return JobApplication.objects.filter(user=user)
        # If logged in as an admin, show everything
        if hasattr(user, 'role') and user.role == "admin":
            return JobApplication.objects.all()
        # Otherwise, show only the logged-in user's jobs
        return JobApplication.objects.filter(user=user)

    def perform_create(self, serializer):
        user, _ = User.objects.get_or_create(
            username="dev_user", 
            defaults={"email": "dev@example.com", "role": "user"}
        )
        serializer.save(user=user)


@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):
    user = request.user
    if not user.is_authenticated:
        user, _ = User.objects.get_or_create(username="dev_user")
        
    qs = JobApplication.objects.filter(user=user)
    status_counts = qs.values("current_status").annotate(count=Count("id"))
    return Response({
        "status_counts": status_counts,
        "avg_days": [], 
    })
# def dashboard_stats(request):
#     qs = JobApplication.objects.filter(user=request.user)
#     status_counts = qs.values("current_status").annotate(count=Count("id"))
#     return Response({
#         "status_counts": status_counts,
#         "avg_days": [],  # placeholder for next analytics step
#     })
