from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.db.models import Count
from .models import JobApplication, User
from .serializers import JobApplicationSerializer
from .permissions import IsOwnerOrAdmin
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, date
from .pagination import JobPagination
from django.conf import settings

User = get_user_model()

class GoogleLoginAPIView(APIView):
    permission_classes = []  # allow anyone
    
    def post(self, request):
        token = request.data.get("access_token")
        if not token:
            return Response({"error": "Missing access_token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verify Google ID token
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,  # must match frontend client_id
            )
            email = idinfo["email"]
            first_name = idinfo.get("given_name", "")
            last_name = idinfo.get("family_name", "")

            # Get or create user
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "first_name": first_name,
                    "last_name": last_name,
                }
            )

            # Issue JWT tokens
            refresh = RefreshToken.for_user(user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        except ValueError as e:
            return Response({"error": "Invalid token", "details": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = JobPagination
    
    def get_queryset(self):
        
        queryset = JobApplication.objects.filter(user=self.request.user)

        # Filter by Status Category
        status_filter = self.request.query_params.get('status')
        if status_filter == 'needs_followup':
            # Applied > 1 day ago and still in 'applied' status
            three_days_ago = timezone.now().date() - timedelta(days=3)
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
        serializer.save(user=self.request.user)

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
