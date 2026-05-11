from django.urls import path
from .views import DashboardSummaryView

urlpatterns = [
    path("stats/", DashboardSummaryView.as_view(), name="admin-dashboard-stats"),
]
