from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html, mark_safe
from django.utils.translation import gettext_lazy as _
from .models import User


# ── Custom actions ────────────────────────────────────────────────────────────

@admin.action(description="✅  Activate selected users")
def activate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f"{updated} user(s) activated.")


@admin.action(description="🚫  Deactivate selected users")
def deactivate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f"{updated} user(s) deactivated.")


# ── User admin ────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display       = ("avatar_badge", "email", "full_name", "phone",
                          "status_badge", "is_staff_badge", "total_submissions")
    list_display_links = ("avatar_badge", "email")
    list_filter        = ("is_active", "is_staff", "is_superuser")
    search_fields      = ("email", "full_name", "phone")
    ordering           = ("-id",)
    list_per_page      = 25
    actions            = [activate_users, deactivate_users]

    fieldsets = (
        (_("Account"), {"fields": ("email", "password")}),
        (_("Personal Information"), {"fields": ("full_name", "phone")}),
        (_("Permissions"), {
            "classes": ("collapse",),
            "fields": ("is_active", "is_staff", "is_superuser",
                       "groups", "user_permissions"),
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "phone", "password1", "password2"),
        }),
    )

    readonly_fields = ("last_login",)

    # ── Custom columns ─────────────────────────────────────────────────────────

    @admin.display(description="")
    def avatar_badge(self, obj):
        initial = (obj.full_name or obj.email)[0].upper()
        return format_html(
            '<span style="display:inline-flex;align-items:center;justify-content:center;'
            'width:32px;height:32px;border-radius:50%;'
            'background:#1a365d;color:#fff;font-weight:700;font-size:14px;">{}</span>',
            initial,
        )

    @admin.display(description="Status", ordering="is_active")
    def status_badge(self, obj):
        if obj.is_active:
            return mark_safe(
                '<span style="background:#d4edda;color:#155724;padding:3px 10px;'
                'border-radius:12px;font-size:12px;font-weight:600;">Active</span>'
            )
        return mark_safe(
            '<span style="background:#f8d7da;color:#721c24;padding:3px 10px;'
            'border-radius:12px;font-size:12px;font-weight:600;">Inactive</span>'
        )

    @admin.display(description="Staff", ordering="is_staff")
    def is_staff_badge(self, obj):
        if obj.is_staff:
            return mark_safe(
                '<span style="background:#cce5ff;color:#004085;padding:3px 10px;'
                'border-radius:12px;font-size:12px;font-weight:600;">Staff</span>'
            )
        return mark_safe('<span style="color:#aaa;font-size:12px;">—</span>')

    @admin.display(description="Submissions")
    def total_submissions(self, obj):
        count = obj.service_requests.count()
        if count == 0:
            return mark_safe('<span style="color:#aaa;">0</span>')
        return format_html(
            '<a href="/admin/services/servicerequest/?user__id__exact={}"'
            ' style="font-weight:600;color:#1a365d;">{}</a>',
            obj.pk, count,
        )

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("service_requests")
