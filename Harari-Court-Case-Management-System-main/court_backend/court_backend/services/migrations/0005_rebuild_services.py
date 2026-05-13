"""
Migration 0005 — Rebuild services models.

Safe for SQLite. Uses atomic=False so each operation commits independently.
"""
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    atomic = False   # run each operation in its own transaction (SQLite safe)

    dependencies = [
        ("services", "0004_alter_servicerequest_data"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [

        # ── Step 1: Add new columns to ServiceRequest ─────────────────────────
        migrations.AddField(
            model_name="servicerequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("submitted",    "Submitted"),
                    ("under_review", "Under Review"),
                    ("approved",     "Approved"),
                    ("rejected",     "Rejected"),
                    ("completed",    "Completed"),
                ],
                default="submitted",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="servicerequest",
            name="notes",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="servicerequest",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),

        # ── Step 2: Update ordering meta ──────────────────────────────────────
        migrations.AlterModelOptions(
            name="servicerequest",
            options={"ordering": ["-created_at"]},
        ),

        # ── Step 3: Rename user FK related_name services → service_requests ───
        migrations.AlterField(
            model_name="servicerequest",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="service_requests",
                to=settings.AUTH_USER_MODEL,
            ),
        ),

        # ── Step 4: Remove old data column ────────────────────────────────────
        migrations.RemoveField(model_name="servicerequest", name="data"),

        # ── Step 5: Create DocumentSubmission ─────────────────────────────────
        migrations.CreateModel(
            name="DocumentSubmission",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name="ID")),
                ("case_number",     models.CharField(blank=True, max_length=100)),
                ("case_title",      models.CharField(blank=True, max_length=255)),
                ("submission_type", models.CharField(blank=True, max_length=100)),
                ("description",     models.TextField(blank=True)),
                ("service_request", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="document_submission",
                    to="services.servicerequest",
                )),
            ],
        ),

        # ── Step 6: Create ArbitrationFee ─────────────────────────────────────
        migrations.CreateModel(
            name="ArbitrationFee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name="ID")),
                ("case_title",        models.CharField(max_length=255)),
                ("court_cause_type",  models.CharField(max_length=100)),
                ("claim_amount",      models.DecimalField(decimal_places=2, max_digits=15)),
                ("calculated_fee",    models.DecimalField(decimal_places=2, max_digits=15)),
                ("payment_reference", models.CharField(blank=True, max_length=100)),
                ("payment_status",    models.CharField(
                    choices=[("pending", "Pending"), ("paid", "Paid"), ("failed", "Failed")],
                    default="pending",
                    max_length=20,
                )),
                ("service_request", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="arbitration_fee",
                    to="services.servicerequest",
                )),
            ],
        ),

        # ── Step 7: Create Appointment ────────────────────────────────────────
        migrations.CreateModel(
            name="Appointment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name="ID")),
                ("appointment_date", models.DateField()),
                ("appointment_time", models.TimeField()),
                ("purpose",          models.CharField(max_length=255)),
                ("department",       models.CharField(blank=True, max_length=255)),
                ("additional_notes", models.TextField(blank=True)),
                ("service_request",  models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="appointment",
                    to="services.servicerequest",
                )),
            ],
        ),

        # ── Step 8: Create Complaint ──────────────────────────────────────────
        migrations.CreateModel(
            name="Complaint",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name="ID")),
                ("complaint_type", models.CharField(blank=True, max_length=100)),
                ("subject",        models.CharField(max_length=255)),
                ("description",    models.TextField()),
                ("against_whom",   models.CharField(blank=True, max_length=255)),
                ("incident_date",  models.DateField(blank=True, null=True)),
                ("service_request", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="complaint",
                    to="services.servicerequest",
                )),
            ],
        ),

        # ── Step 9: Create Feedback ───────────────────────────────────────────
        migrations.CreateModel(
            name="Feedback",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True,
                                           serialize=False, verbose_name="ID")),
                ("service_rated", models.CharField(max_length=100)),
                ("rating",        models.PositiveSmallIntegerField()),
                ("comment",       models.TextField(blank=True)),
                ("suggestions",   models.TextField(blank=True)),
                ("service_request", models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="feedback",
                    to="services.servicerequest",
                )),
            ],
        ),
    ]
