import json
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    ServiceRequest, ServiceDocument,
    DocumentSubmission, ArbitrationFee,
    Appointment, Complaint, Feedback,
)
from .serializers import (
    ServiceRequestSerializer, ServiceRequestListSerializer,
    DocumentSubmissionSerializer, ArbitrationFeeSerializer,
    AppointmentSerializer, ComplaintSerializer, FeedbackSerializer,
    ServiceDocumentSerializer,
)

# ── Static court-services catalogue ──────────────────────────────────────────

COURT_SERVICES = [
    {
        "id": 1, "name": "Document Submission", "icon": "📄",
        "description": "Submit legal documents electronically",
        "tags": ["Digital", "Official"], "duration": "15-30 mins",
        "requirements": ["Valid ID", "Case Documents", "Cover Letter (optional)"],
    },
    {
        "id": 2, "name": "Arbitration Fee", "icon": "💰",
        "description": "Pay arbitration and court fees online",
        "tags": ["Payment", "Required"], "duration": "10-15 mins",
        "requirements": ["Case Number", "Payment Amount"],
    },
    {
        "id": 3, "name": "Search Document", "icon": "🔍",
        "description": "Search and retrieve court documents",
        "tags": ["Search", "Records"], "duration": "5-20 mins",
        "requirements": ["Case Number or Keywords"],
    },
    {
        "id": 4, "name": "Daily Appointment", "icon": "📅",
        "description": "Schedule appointments with court officials",
        "tags": ["Booking", "Schedule"], "duration": "10-20 mins",
        "requirements": ["Preferred Date", "Purpose"],
    },
    {
        "id": 5, "name": "Complaint Form", "icon": "📝",
        "description": "File official complaints or grievances",
        "tags": ["Form", "Legal"], "duration": "20-40 mins",
        "requirements": ["Complaint Statement", "Supporting Evidence (optional)"],
    },
    {
        "id": 6, "name": "FeedBack", "icon": "💬",
        "description": "Provide feedback on court services",
        "tags": ["Feedback", "Review"], "duration": "5-15 mins",
        "requirements": [],
    },
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _attach_documents(service_request, files, document_type="general"):
    for f in files:
        ServiceDocument.objects.create(
            service_request=service_request,
            file=f,
            document_type=document_type,
        )


def _create_detail(service_request, data):
    """Create the specialised child record based on service_name."""
    name = service_request.service_name

    if name == "Document Submission":
        DocumentSubmission.objects.create(
            service_request=service_request,
            case_number=data.get("case_number", ""),
            case_title=data.get("case_title", ""),
            submission_type=data.get("submission_type", ""),
            description=data.get("description", ""),
        )

    elif name == "Arbitration Fee":
        try:
            claim = float(str(data.get("claim_amount", "0")).replace(",", ""))
        except ValueError:
            claim = 0.0
        try:
            fee = float(str(data.get("calculated_fee", "0")).replace(",", ""))
        except ValueError:
            fee = 0.0
        ArbitrationFee.objects.create(
            service_request=service_request,
            case_title=data.get("case_title", ""),
            court_cause_type=data.get("court_cause_type", data.get("courtCauseType", "")),
            claim_amount=claim,
            calculated_fee=fee,
            payment_reference=data.get("payment_reference", ""),
            payment_status="pending",
        )

    elif name == "Daily Appointment":
        Appointment.objects.create(
            service_request=service_request,
            appointment_date=data.get("appointment_date", data.get("appointmentDate", "2000-01-01")),
            appointment_time=data.get("appointment_time", data.get("appointmentTime", "00:00")),
            purpose=data.get("purpose", ""),
            department=data.get("department", ""),
            additional_notes=data.get("additional_notes", data.get("additionalNotes", "")),
        )

    elif name == "Complaint Form":
        Complaint.objects.create(
            service_request=service_request,
            complaint_type=data.get("complaint_type", data.get("complaintType", "")),
            subject=data.get("subject", data.get("complaintSubject", "")),
            description=data.get("description", data.get("complaintDescription", "")),
            against_whom=data.get("against_whom", data.get("againstWhom", "")),
            incident_date=data.get("incident_date", data.get("incidentDate")) or None,
        )

    elif name == "FeedBack":
        try:
            rating = int(data.get("rating", 0))
        except (ValueError, TypeError):
            rating = 0
        Feedback.objects.create(
            service_request=service_request,
            service_rated=data.get("service_rated", data.get("serviceRated", "")),
            rating=rating,
            comment=data.get("comment", ""),
            suggestions=data.get("suggestions", ""),
        )


# ── Public endpoints ──────────────────────────────────────────────────────────

class CourtServicesListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(COURT_SERVICES)


# ── Dashboard stats ───────────────────────────────────────────────────────────

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = ServiceRequest.objects.filter(user=request.user)

        recent = qs.order_by("-created_at")[:5]
        recent_data = [
            {
                "id": r.id,
                "service_name": r.service_name,
                "status": r.status,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M"),
            }
            for r in recent
        ]

        stats = {
            "active_cases": qs.filter(
                service_name__in=["Document Submission", "Complaint Form"],
                status__in=["submitted", "under_review"],
            ).count(),
            "pending_payments": qs.filter(
                service_name="Arbitration Fee",
                status__in=["submitted", "under_review"],
            ).count(),
            "upcoming_hearings": qs.filter(
                service_name="Daily Appointment",
                status__in=["submitted", "approved"],
            ).count(),
            "unread_messages": 0,
            "completed_services": qs.filter(status="completed").count(),
            "total_submissions": qs.count(),
            "recent_activity": recent_data,
        }
        return Response(stats)


# ── Service Requests — list + create ─────────────────────────────────────────

class ServiceRequestListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all service requests for the logged-in user."""
        service_name = request.query_params.get("service_name")
        qs = ServiceRequest.objects.filter(user=request.user)
        if service_name:
            qs = qs.filter(service_name=service_name)
        serializer = ServiceRequestSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        """Create a new service request with its specialised child record."""
        files = request.FILES.getlist("documents[]")

        # Collect all non-file fields into a plain dict
        data = {k: v for k, v in request.data.items() if k not in ("documents[]", "documents")}

        service_name = data.get("service_name", "")
        if not service_name:
            return Response({"error": "service_name is required"}, status=400)

        sr = ServiceRequest.objects.create(
            user=request.user,
            service_name=service_name,
            notes=data.get("notes", ""),
        )

        _attach_documents(sr, files, data.get("document_type", "general"))
        _create_detail(sr, data)

        serializer = ServiceRequestSerializer(sr, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ── Service Request — retrieve + update + delete ──────────────────────────────

class ServiceRequestDetailView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [IsAuthenticated]

    def _get_object(self, pk, user):
        try:
            return ServiceRequest.objects.get(pk=pk, user=user)
        except ServiceRequest.DoesNotExist:
            return None

    def get(self, request, pk):
        sr = self._get_object(pk, request.user)
        if not sr:
            return Response({"error": "Not found"}, status=404)
        serializer = ServiceRequestSerializer(sr, context={"request": request})
        return Response(serializer.data)

    def put(self, request, pk):
        sr = self._get_object(pk, request.user)
        if not sr:
            return Response({"error": "Not found"}, status=404)

        data = {k: v for k, v in request.data.items() if k not in ("documents[]", "documents")}

        # Update base fields
        if "notes" in data:
            sr.notes = data["notes"]
        if "status" in data:
            sr.status = data["status"]
        sr.save()

        # Update specialised child if it exists
        name = sr.service_name
        if name == "Document Submission" and hasattr(sr, "document_submission"):
            ds = sr.document_submission
            for field in ("case_number", "case_title", "submission_type", "description"):
                if field in data:
                    setattr(ds, field, data[field])
            ds.save()

        elif name == "Arbitration Fee" and hasattr(sr, "arbitration_fee"):
            af = sr.arbitration_fee
            for field in ("case_title", "payment_reference", "payment_status"):
                if field in data:
                    setattr(af, field, data[field])
            af.save()

        elif name == "Daily Appointment" and hasattr(sr, "appointment"):
            apt = sr.appointment
            for field in ("appointment_date", "appointment_time", "purpose", "department", "additional_notes"):
                if field in data:
                    setattr(apt, field, data[field])
            apt.save()

        elif name == "Complaint Form" and hasattr(sr, "complaint"):
            c = sr.complaint
            for field in ("complaint_type", "subject", "description", "against_whom", "incident_date"):
                if field in data:
                    setattr(c, field, data[field])
            c.save()

        elif name == "FeedBack" and hasattr(sr, "feedback"):
            fb = sr.feedback
            for field in ("service_rated", "rating", "comment", "suggestions"):
                if field in data:
                    setattr(fb, field, data[field])
            fb.save()

        # Append new files if any
        files = request.FILES.getlist("documents[]")
        _attach_documents(sr, files, data.get("document_type", "general"))

        serializer = ServiceRequestSerializer(sr, context={"request": request})
        return Response(serializer.data)

    def delete(self, request, pk):
        sr = self._get_object(pk, request.user)
        if not sr:
            return Response({"error": "Not found"}, status=404)
        sr.delete()
        return Response({"message": "Deleted successfully"}, status=204)


# ── Document CRUD ─────────────────────────────────────────────────────────────

class ServiceDocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            doc = ServiceDocument.objects.get(pk=pk, service_request__user=request.user)
        except ServiceDocument.DoesNotExist:
            return Response({"error": "Not found"}, status=404)
        doc.file.delete(save=False)
        doc.delete()
        return Response({"message": "Document deleted"}, status=204)


# ── Appointment list (public schedule view) ───────────────────────────────────

class AppointmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return all appointments for the logged-in user."""
        appointments = Appointment.objects.filter(
            service_request__user=request.user
        ).select_related("service_request").order_by("appointment_date", "appointment_time")

        data = [
            {
                "id": a.id,
                "service_request_id": a.service_request_id,
                "appointment_date": str(a.appointment_date),
                "appointment_time": str(a.appointment_time),
                "purpose": a.purpose,
                "department": a.department,
                "additional_notes": a.additional_notes,
                "status": a.service_request.status,
            }
            for a in appointments
        ]
        return Response(data)
