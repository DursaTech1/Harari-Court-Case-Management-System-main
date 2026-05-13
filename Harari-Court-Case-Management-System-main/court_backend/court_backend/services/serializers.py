from rest_framework import serializers
from .models import (
    ServiceRequest, ServiceDocument,
    DocumentSubmission, ArbitrationFee,
    Appointment, Complaint, Feedback,
)


class ServiceDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ServiceDocument
        fields = ["id", "file", "file_url", "document_type", "uploaded_at"]
        read_only_fields = ["uploaded_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None


# ── Specialised detail serializers ───────────────────────────────────────────

class DocumentSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentSubmission
        fields = ["id", "case_number", "case_title", "submission_type", "description"]


class ArbitrationFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArbitrationFee
        fields = [
            "id", "case_title", "court_cause_type",
            "claim_amount", "calculated_fee",
            "payment_reference", "payment_status",
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = [
            "id", "appointment_date", "appointment_time",
            "purpose", "department", "additional_notes",
        ]


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = [
            "id", "complaint_type", "subject",
            "description", "against_whom", "incident_date",
        ]


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "service_rated", "rating", "comment", "suggestions"]


# ── Main ServiceRequest serializer ───────────────────────────────────────────

class ServiceRequestSerializer(serializers.ModelSerializer):
    documents = ServiceDocumentSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    # Nested detail (read-only, present only when the relation exists)
    document_submission = DocumentSubmissionSerializer(read_only=True)
    arbitration_fee = ArbitrationFeeSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
    complaint = ComplaintSerializer(read_only=True)
    feedback = FeedbackSerializer(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            "id", "user_email", "user_name",
            "service_name", "status", "notes",
            "created_at", "updated_at",
            "documents",
            "document_submission",
            "arbitration_fee",
            "appointment",
            "complaint",
            "feedback",
        ]
        read_only_fields = ["user_email", "user_name", "created_at", "updated_at"]


class ServiceRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ServiceRequest
        fields = ["id", "user_name", "service_name", "status", "created_at", "updated_at"]
