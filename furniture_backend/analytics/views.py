from rest_framework import views, permissions, status
from rest_framework.response import Response
from .utils import get_dashboard_kpis, get_sales_trend, get_recent_activity
from .serializers import DashboardSummarySerializer, SalesTrendSerializer, RecentActivitySerializer

class DashboardSummaryView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        stats = get_dashboard_kpis()
        serializer = DashboardSummarySerializer(stats)
        return Response(serializer.data)

class SalesTrendView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        trend = get_sales_trend(days)
        serializer = SalesTrendSerializer(trend, many=True)
        return Response(serializer.data)

class RecentActivityView(views.APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        limit = int(request.query_params.get("limit", 10))
        activity = get_recent_activity(limit)
        serializer = RecentActivitySerializer(activity, many=True)
        return Response(serializer.data)
