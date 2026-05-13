# services/signals.py
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import ServiceRequest
import logging

logger = logging.getLogger(__name__)

@receiver(pre_save, sender=ServiceRequest)
def generate_reference_id(sender, instance, **kwargs):
    """
    Generate reference ID for service request if not already set
    """
    if not instance.reference_id:
        # Create prefix from service name initials
        prefix = ''.join([word[0].upper() for word in instance.service_name.split()])
        # Generate unique reference
        import uuid
        import datetime
        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M')
        instance.reference_id = f"{prefix}-{timestamp}-{uuid.uuid4().hex[:4].upper()}"

@receiver(post_save, sender=ServiceRequest)
def log_service_request_creation(sender, instance, created, **kwargs):
    """
    Log when a new service request is created
    """
    if created:
        logger.info(f"New service request created: {instance.reference_id} - {instance.service_name} by {instance.user.username}")