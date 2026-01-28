from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Count
from .models import JobApplication
from .serializers import JobApplicationSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, date
from .pagination import JobPagination

User = get_user_model()

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    pagination_class = JobPagination
    # permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            user, _ = User.objects.get_or_create(username="dev_user")
        
        queryset = JobApplication.objects.filter(user=user)

        # Filter by Status Category
        status_filter = self.request.query_params.get('status')
        if status_filter == 'needs_followup':
            # Applied > 1 day ago and still in 'applied' status
            three_days_ago = timezone.now().date() - timedelta(days=1)
            queryset = queryset.filter(current_status='applied', applied_date__lte=three_days_ago)
        elif status_filter == 'interview':
            queryset = queryset.filter(current_status__in=['phone_screen', 'on_site', 'remote'])
        elif status_filter and status_filter != 'all':
            queryset = queryset.filter(current_status=status_filter)

        # Filter by Time (This Month)
        time_filter = self.request.query_params.get('time')
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        if time_filter == 'this_month':
            today = timezone.now()
            queryset = queryset.filter(applied_date__month=today.month, applied_date__year=today.year)
        if month and year:
            queryset = queryset.filter(
                applied_date__month=month,
                applied_date__year=year
            )
        return queryset.order_by('-applied_date')

    def perform_create(self, serializer):
        user, _ = User.objects.get_or_create(
            username="dev_user", 
            defaults={"email": "dev@example.com", "role": "user"}
        )
        serializer.save(user=user)

    @action(detail=True, methods=["post"])
    def mark_followup_sent(self, request, pk=None):
        application = self.get_object()
        application.last_contacted_at = timezone.now()
        application.save()
        return Response({"status": "follow-up recorded"})

@api_view(["GET"])
@permission_classes([AllowAny])
def dashboard_stats(request):
    user = request.user
    if not user.is_authenticated:
        user, _ = User.objects.get_or_create(username="dev_user")
        
    qs = JobApplication.objects.filter(user=user)

    status_counts = qs.values("current_status").annotate(count=Count("id"))

    stale_count = qs.filter(
        current_status="applied",
        applied_date__lte=date.today() - timedelta(days=3)
    ).count()

    return Response({
        "status_counts": status_counts,
        "stale_applications": stale_count, 
    })
