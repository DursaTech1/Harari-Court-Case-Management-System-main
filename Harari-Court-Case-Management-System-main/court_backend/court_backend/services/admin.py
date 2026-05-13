from django.contrib import admin
from django.utils.html import format_html, mark_safe
from django.db.models import Count, Q
from .models import (
    ServiceRequest, ServiceDocument,
    DocumentSubmission, ArbitrationFee,
    Appointment, Complaint, Feedback,
)


# ── Colour palettes ───────────────────────────────────────────────────────────

STATUS_COLORS = {
    "submitted":    ("#dbeafe", "#1e40af"),
    "under_review": ("#fef9c3", "#854d0e"),
    "approved":     ("#dcfce7", "#166534"),
    "rejected":     ("#fee2e2", "#991b1b"),
    "completed":    ("#f3f4f6", "#374151"),
}

PAYMENT_COLORS = {
    "pending": ("#fef9c3", "#854d0e"),
    "paid":    ("#dcfce7", "#166534"),
    "failed":  ("#fee2e2", "#991b1b"),
}

RATING_STARS = {1: "★☆☆☆☆", 2: "★★☆☆☆", 3: "★★★☆☆", 4: "★★★★☆", 5: "★★★★★"}
RATING_COLORS = {1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#84cc16", 5: "#22c55e"}

SERVICE_ICONS = {
    "Document Submission": "📄",
    "Arbitration Fee":     "💰",
    "Search Document":     "🔍",
    "Daily Appointment":   "📅",
    "Complaint Form":      "📝",
    "FeedBack":            "💬",
}


def _badge(text, bg, color):
    return format_html(
        '<span style="background:{};color:{};padding:3px 10px;'
        'border-radius:12px;font-size:12px;font-weight:600;white-space:nowrap;">'
        '{}</span>',
        bg, color, text,
    )


# ── Custom actions ────────────────────────────────────────────────────────────

@admin.action(description="🔍  Mark selected requests as Under Review")
def mark_under_review(modeladmin, request, queryset):
    updated = queryset.update(status="under_review")
    modeladmin.message_user(request, f"{updated} request(s) marked as Under Review.")


@admin.action(description="✅  Mark selected requests as Approved")
def mark_approved(modeladmin, request, queryset):
    updated = queryset.update(status="approved")
    modeladmin.message_user(request, f"{updated} request(s) approved.")


@admin.action(description="🏁  Mark selected requests as Completed")
def mark_completed(modeladmin, request, queryset):
    updated = queryset.update(status="completed")
    modeladmin.message_user(request, f"{updated} request(s) completed.")


@admin.action(description="❌  Mark selected requests as Rejected")
def mark_rejected(modeladmin, request, queryset):
    updated = queryset.update(status="rejected")
    modeladmin.message_user(request, f"{updated} request(s) rejected.")


@admin.action(description="💳  Mark selected fees as Paid")
def mark_paid(modeladmin, request, queryset):
    updated = queryset.update(payment_status="paid")
    modeladmin.message_user(request, f"{updated} fee(s) marked as Paid.")


# ── Inlines ───────────────────────────────────────────────────────────────────

class ServiceDocumentInline(admin.TabularInline):
    model = ServiceDocument
    extra = 0
    readonly_fields = ("file_preview", "document_type", "uploaded_at")
    fields = ("file_preview", "document_type", "uploaded_at")
    can_delete = True
    verbose_name = "Uploaded Document"
    verbose_name_plural = "Uploaded Documents"

    def file_preview(self, obj):
        if not obj.file:
            return "—"
        name = obj.file.name.split("/")[-1]
        return format_html(
            '<a href="{}" target="_blank" style="color:#1a365d;font-weight:500;">'
            '📎 {}</a>',
            obj.file.url, name,
        )
    file_preview.short_description = "File"


class DocumentSubmissionInline(admin.StackedInline):
    model = DocumentSubmission
    extra = 0
    can_delete = False
    verbose_name = "Document Submission Details"
    fieldsets = (
        (None, {"fields": (("case_number", "case_title"), "submission_type", "description")}),
    )


class ArbitrationFeeInline(admin.StackedInline):
    model = ArbitrationFee
    extra = 0
    can_delete = False
    verbose_name = "Arbitration Fee Details"
    fieldsets = (
        (None, {"fields": (
            "case_title",
            ("court_cause_type", "payment_status"),
            ("claim_amount", "calculated_fee"),
            "payment_reference",
        )}),
    )


class AppointmentInline(admin.StackedInline):
    model = Appointment
    extra = 0
    can_delete = False
    verbose_name = "Appointment Details"
    fieldsets = (
        (None, {"fields": (
            ("appointment_date", "appointment_time"),
            ("purpose", "department"),
            "additional_notes",
        )}),
    )


class ComplaintInline(admin.StackedInline):
    model = Complaint
    extra = 0
    can_delete = False
    verbose_name = "Complaint Details"
    fieldsets = (
        (None, {"fields": (
            ("complaint_type", "incident_date"),
            "subject",
            "against_whom",
            "description",
        )}),
    )


class FeedbackInline(admin.StackedInline):
    model = Feedback
    extra = 0
    can_delete = False
    verbose_name = "Feedback Details"
    fieldsets = (
        (None, {"fields": (
            ("service_rated", "rating"),
            "comment",
            "suggestions",
        )}),
    )


# ── ServiceRequest ────────────────────────────────────────────────────────────

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display  = (
        "id_badge", "service_icon_name", "user_link",
        "status_colored", "doc_count", "created_display", "updated_display",
    )
    list_display_links = ("id_badge", "service_icon_name")
    list_filter   = ("service_name", "status", "created_at")
    search_fields = ("user__email", "user__full_name", "service_name", "notes")
    ordering      = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 20
    actions       = [mark_under_review, mark_approved, mark_completed, mark_rejected]
    readonly_fields = ("created_at", "updated_at", "user_detail_card")

    fieldsets = (
        ("Request Info", {
            "fields": ("user_detail_card", "service_name", "status", "notes"),
        }),
        ("Timestamps", {
            "classes": ("collapse",),
            "fields": (("created_at", "updated_at"),),
        }),
    )

    inlines = [
        ServiceDocumentInline,
        DocumentSubmissionInline,
        ArbitrationFeeInline,
        AppointmentInline,
        ComplaintInline,
        FeedbackInline,
    ]

    # ── Custom columns ─────────────────────────────────────────────────────────

    @admin.display(description="#", ordering="id")
    def id_badge(self, obj):
        return format_html(
            '<span style="background:#edf2f7;color:#4a5568;padding:2px 8px;'
            'border-radius:6px;font-size:12px;font-weight:700;">#{}</span>',
            obj.id,
        )

    @admin.display(description="Service", ordering="service_name")
    def service_icon_name(self, obj):
        icon = SERVICE_ICONS.get(obj.service_name, "⚖️")
        return format_html(
            '<span style="font-size:16px;">{}</span> '
            '<strong style="color:#1a365d;">{}</strong>',
            icon, obj.service_name,
        )

    @admin.display(description="User", ordering="user__email")
    def user_link(self, obj):
        return format_html(
            '<a href="/admin/accounts/user/{}/change/" style="color:#1a365d;font-weight:500;">'
            '{}</a><br>'
            '<span style="color:#718096;font-size:12px;">{}</span>',
            obj.user_id, obj.user.full_name, obj.user.email,
        )

    @admin.display(description="Status", ordering="status")
    def status_colored(self, obj):
        bg, color = STATUS_COLORS.get(obj.status, ("#f3f4f6", "#374151"))
        return _badge(obj.get_status_display(), bg, color)

    @admin.display(description="Docs")
    def doc_count(self, obj):
        n = obj.documents.count()
        if n == 0:
            return mark_safe('<span style="color:#aaa;">—</span>')
        return format_html(
            '<span style="background:#e0f2fe;color:#0369a1;padding:2px 8px;'
            'border-radius:10px;font-size:12px;font-weight:600;">📎 {}</span>',
            n,
        )

    @admin.display(description="Submitted", ordering="created_at")
    def created_display(self, obj):
        return format_html(
            '<span style="color:#374151;font-size:13px;">{}</span>',
            obj.created_at.strftime("%d %b %Y %H:%M"),
        )

    @admin.display(description="Updated", ordering="updated_at")
    def updated_display(self, obj):
        return format_html(
            '<span style="color:#718096;font-size:12px;">{}</span>',
            obj.updated_at.strftime("%d %b %Y %H:%M"),
        )

    @admin.display(description="User Details")
    def user_detail_card(self, obj):
        u = obj.user
        return format_html(
            '<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;'
            'padding:12px 16px;display:inline-block;">'
            '<strong style="color:#1a365d;">{}</strong><br>'
            '<span style="color:#718096;font-size:13px;">📧 {}</span><br>'
            '<span style="color:#718096;font-size:13px;">📞 {}</span>'
            '</div>',
            u.full_name, u.email, u.phone or "—",
        )

    def get_queryset(self, request):
        return (
            super().get_queryset(request)
            .select_related("user")
            .prefetch_related("documents")
        )


# ── DocumentSubmission ────────────────────────────────────────────────────────

@admin.register(DocumentSubmission)
class DocumentSubmissionAdmin(admin.ModelAdmin):
    list_display  = ("id", "case_number_link", "case_title", "submission_type", "user_email", "request_status")
    list_filter   = ("submission_type",)
    search_fields = ("case_number", "case_title", "service_request__user__email")
    list_per_page = 20
    readonly_fields = ("service_request",)

    fieldsets = (
        ("Case Details", {
            "fields": (("case_number", "case_title"), "submission_type", "description"),
        }),
        ("Linked Request", {
            "fields": ("service_request",),
        }),
    )

    @admin.display(description="Case #", ordering="case_number")
    def case_number_link(self, obj):
        return format_html(
            '<strong style="color:#1a365d;">{}</strong>',
            obj.case_number or "—",
        )

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    @admin.display(description="Status")
    def request_status(self, obj):
        bg, color = STATUS_COLORS.get(obj.service_request.status, ("#f3f4f6", "#374151"))
        return _badge(obj.service_request.get_status_display(), bg, color)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")


# ── ArbitrationFee ────────────────────────────────────────────────────────────

@admin.register(ArbitrationFee)
class ArbitrationFeeAdmin(admin.ModelAdmin):
    list_display  = (
        "id", "case_title", "court_cause_type",
        "claim_amount_fmt", "fee_amount_fmt",
        "payment_badge", "user_email",
    )
    list_filter   = ("payment_status", "court_cause_type")
    search_fields = ("case_title", "service_request__user__email", "payment_reference")
    list_per_page = 20
    actions       = [mark_paid]
    readonly_fields = ("service_request",)

    fieldsets = (
        ("Case & Fee", {
            "fields": (
                "case_title",
                ("court_cause_type", "payment_status"),
                ("claim_amount", "calculated_fee"),
                "payment_reference",
            ),
        }),
        ("Linked Request", {"fields": ("service_request",)}),
    )

    @admin.display(description="Claim Amount", ordering="claim_amount")
    def claim_amount_fmt(self, obj):
        return format_html(
            '<span style="font-weight:600;color:#374151;">ETB {:,.2f}</span>',
            obj.claim_amount,
        )

    @admin.display(description="Court Fee", ordering="calculated_fee")
    def fee_amount_fmt(self, obj):
        return format_html(
            '<span style="font-weight:700;color:#1a365d;">ETB {:,.2f}</span>',
            obj.calculated_fee,
        )

    @admin.display(description="Payment", ordering="payment_status")
    def payment_badge(self, obj):
        bg, color = PAYMENT_COLORS.get(obj.payment_status, ("#f3f4f6", "#374151"))
        return _badge(obj.payment_status.title(), bg, color)

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")


# ── Appointment ───────────────────────────────────────────────────────────────

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display  = (
        "id", "date_time_display", "purpose", "department",
        "user_email", "request_status",
    )
    list_filter   = ("appointment_date", "department")
    search_fields = ("purpose", "department", "service_request__user__email")
    date_hierarchy = "appointment_date"
    ordering      = ("appointment_date", "appointment_time")
    list_per_page = 20
    readonly_fields = ("service_request",)

    fieldsets = (
        ("Schedule", {
            "fields": (("appointment_date", "appointment_time"), ("purpose", "department"), "additional_notes"),
        }),
        ("Linked Request", {"fields": ("service_request",)}),
    )

    @admin.display(description="Date & Time", ordering="appointment_date")
    def date_time_display(self, obj):
        return format_html(
            '<strong style="color:#1a365d;">{}</strong> '
            '<span style="color:#718096;font-size:13px;">at {}</span>',
            obj.appointment_date.strftime("%d %b %Y"),
            obj.appointment_time.strftime("%H:%M"),
        )

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    @admin.display(description="Status")
    def request_status(self, obj):
        bg, color = STATUS_COLORS.get(obj.service_request.status, ("#f3f4f6", "#374151"))
        return _badge(obj.service_request.get_status_display(), bg, color)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")


# ── Complaint ─────────────────────────────────────────────────────────────────

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display  = (
        "id", "subject_truncated", "complaint_type",
        "against_whom", "incident_date", "user_email", "request_status",
    )
    list_filter   = ("complaint_type", "incident_date")
    search_fields = ("subject", "against_whom", "service_request__user__email")
    list_per_page = 20
    readonly_fields = ("service_request",)

    fieldsets = (
        ("Complaint Details", {
            "fields": (
                ("complaint_type", "incident_date"),
                "subject",
                "against_whom",
                "description",
            ),
        }),
        ("Linked Request", {"fields": ("service_request",)}),
    )

    @admin.display(description="Subject", ordering="subject")
    def subject_truncated(self, obj):
        s = obj.subject
        if len(s) > 50:
            s = s[:47] + "…"
        return format_html('<strong style="color:#1a365d;">{}</strong>', s)

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    @admin.display(description="Status")
    def request_status(self, obj):
        bg, color = STATUS_COLORS.get(obj.service_request.status, ("#f3f4f6", "#374151"))
        return _badge(obj.service_request.get_status_display(), bg, color)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")


# ── Feedback ──────────────────────────────────────────────────────────────────

@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display  = (
        "id", "service_rated", "star_rating",
        "comment_preview", "user_email",
    )
    list_filter   = ("rating", "service_rated")
    search_fields = ("service_rated", "comment", "service_request__user__email")
    list_per_page = 20
    readonly_fields = ("service_request",)

    fieldsets = (
        ("Feedback", {
            "fields": (("service_rated", "rating"), "comment", "suggestions"),
        }),
        ("Linked Request", {"fields": ("service_request",)}),
    )

    @admin.display(description="Rating", ordering="rating")
    def star_rating(self, obj):
        stars = RATING_STARS.get(obj.rating, "?")
        color = RATING_COLORS.get(obj.rating, "#718096")
        return format_html(
            '<span style="color:{};font-size:16px;letter-spacing:1px;">{}</span>',
            color, stars,
        )

    @admin.display(description="Comment")
    def comment_preview(self, obj):
        if not obj.comment:
            return mark_safe('<span style="color:#aaa;">—</span>')
        text = obj.comment[:60] + ("…" if len(obj.comment) > 60 else "")
        return format_html('<span style="color:#374151;">{}</span>', text)

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")


# ── ServiceDocument (standalone) ─────────────────────────────────────────────

@admin.register(ServiceDocument)
class ServiceDocumentAdmin(admin.ModelAdmin):
    list_display  = ("id", "file_link", "document_type", "request_link", "user_email", "uploaded_at")
    list_filter   = ("document_type", "uploaded_at")
    search_fields = ("document_type", "service_request__user__email")
    readonly_fields = ("uploaded_at", "file_preview_large")
    list_per_page = 25

    fieldsets = (
        ("Document", {
            "fields": ("file_preview_large", "file", "document_type", "uploaded_at"),
        }),
        ("Linked Request", {
            "fields": ("service_request",),
        }),
    )

    @admin.display(description="File", ordering="file")
    def file_link(self, obj):
        if not obj.file:
            return "—"
        name = obj.file.name.split("/")[-1]
        return format_html(
            '<a href="{}" target="_blank" style="color:#1a365d;font-weight:500;">'
            '📎 {}</a>',
            obj.file.url, name,
        )

    @admin.display(description="Request")
    def request_link(self, obj):
        sr = obj.service_request
        return format_html(
            '<a href="/admin/services/servicerequest/{}/change/" '
            'style="color:#1a365d;">#{} — {}</a>',
            sr.id, sr.id, sr.service_name,
        )

    @admin.display(description="User")
    def user_email(self, obj):
        return obj.service_request.user.email

    @admin.display(description="Preview")
    def file_preview_large(self, obj):
        if not obj.file:
            return "No file uploaded."
        name = obj.file.name.split("/")[-1]
        ext  = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if ext in ("jpg", "jpeg", "png", "gif", "webp"):
            return format_html(
                '<img src="{}" style="max-width:300px;max-height:200px;'
                'border-radius:8px;border:1px solid #e2e8f0;" />',
                obj.file.url,
            )
        return format_html(
            '<a href="{}" target="_blank" class="button">⬇ Download {}</a>',
            obj.file.url, name,
        )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("service_request__user")
