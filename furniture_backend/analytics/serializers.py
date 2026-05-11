from rest_framework import serializers

class DashboardSummarySerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    total_orders = serializers.IntegerField()
    active_orders = serializers.IntegerField()
    total_users = serializers.IntegerField()
    total_products = serializers.IntegerField()

class SalesTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    revenue = serializers.FloatField()

class RecentActivitySerializer(serializers.Serializer):
    type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    timestamp = serializers.DateTimeField()
    status = serializers.CharField()
