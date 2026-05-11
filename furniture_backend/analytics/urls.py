from django.urls import path
from .views import DashboardSummaryView, SalesTrendView, RecentActivityView

urlpatterns = [
    path("summary/", DashboardSummaryView.as_view(), name="analytics-summary"),
    path("sales-trend/", SalesTrendView.as_view(), name="analytics-trend"),
    path("recent-activity/", RecentActivityView.as_view(), name="analytics-activity"),
]
