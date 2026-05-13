import json
from django.db import models
from django.conf import settings


class ServiceRequest(models.Model):
    """Base record for every service submission."""

    STATUS_CHOICES = [
        ("submitted", "Submitted"),
        ("under_review", "Under Review"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="service_requests",
    )
    service_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="submitted")
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} — {self.service_name} [{self.status}]"


class ServiceDocument(models.Model):
    service_request = models.ForeignKey(
        ServiceRequest, related_name="documents", on_delete=models.CASCADE
    )
    file = models.FileField(upload_to="service_documents/%Y/%m/%d/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    document_type = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.document_type} — {self.file.name}"


# ── Specialised service models ────────────────────────────────────────────────

class DocumentSubmission(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest, on_delete=models.CASCADE, related_name="document_submission"
    )
    case_number = models.CharField(max_length=100, blank=True)
    case_title = models.CharField(max_length=255, blank=True)
    submission_type = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"DocSubmission — {self.case_number}"


class ArbitrationFee(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest, on_delete=models.CASCADE, related_name="arbitration_fee"
    )
    case_title = models.CharField(max_length=255)
    court_cause_type = models.CharField(max_length=100)
    claim_amount = models.DecimalField(max_digits=15, decimal_places=2)
    calculated_fee = models.DecimalField(max_digits=15, decimal_places=2)
    payment_reference = models.CharField(max_length=100, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed")],
        default="pending",
    )

    def __str__(self):
        return f"Fee — {self.case_title} ({self.court_cause_type})"


class Appointment(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest, on_delete=models.CASCADE, related_name="appointment"
    )
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    purpose = models.CharField(max_length=255)
    department = models.CharField(max_length=255, blank=True)
    additional_notes = models.TextField(blank=True)

    def __str__(self):
        return f"Appointment — {self.appointment_date} {self.appointment_time}"


class Complaint(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest, on_delete=models.CASCADE, related_name="complaint"
    )
    complaint_type = models.CharField(max_length=100, blank=True)
    subject = models.CharField(max_length=255)
    description = models.TextField()
    against_whom = models.CharField(max_length=255, blank=True)
    incident_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Complaint — {self.subject}"


class Feedback(models.Model):
    service_request = models.OneToOneField(
        ServiceRequest, on_delete=models.CASCADE, related_name="feedback"
    )
    service_rated = models.CharField(max_length=100)
    rating = models.PositiveSmallIntegerField()          # 1–5
    comment = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)

    def __str__(self):
        return f"Feedback — {self.service_rated} ({self.rating}★)"
