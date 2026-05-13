from django.urls import path
from .views import (
    CourtServicesListView,
    DashboardStatsView,
    ServiceRequestListCreateView,
    ServiceRequestDetailView,
    ServiceDocumentDeleteView,
    AppointmentListView,
)

urlpatterns = [
    # Public
    path("list/", CourtServicesListView.as_view(), name="services-list"),

    # Dashboard
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),

    # Service Requests — CRUD
    path("requests/", ServiceRequestListCreateView.as_view(), name="service-requests"),
    path("requests/<int:pk>/", ServiceRequestDetailView.as_view(), name="service-request-detail"),

    # Documents
    path("documents/<int:pk>/", ServiceDocumentDeleteView.as_view(), name="document-delete"),

    # Appointments
    path("appointments/", AppointmentListView.as_view(), name="appointments"),

    # Legacy aliases (keep old URLs working)
    path("submit/", ServiceRequestListCreateView.as_view(), name="service-submit"),
    path("my-requests/", ServiceRequestListCreateView.as_view(), name="my-requests"),
]
