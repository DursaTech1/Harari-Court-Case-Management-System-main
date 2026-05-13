"""
Django settings for backend project.
"""

from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-4#rano^pl(d$(_8w!#6t=nb5v@auu!rv33o15y)pl!5&3eqgm5'

DEBUG = True

ALLOWED_HOSTS = ["*"]


# ── Installed apps ────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    # Jazzmin MUST come before django.contrib.admin
    "jazzmin",

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",

    "accounts",
    "services",
]


# ── Middleware ────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
}

AUTH_USER_MODEL = "accounts.User"


# ── Jazzmin admin theme ───────────────────────────────────────────────────────
JAZZMIN_SETTINGS = {
    # ── Branding ──────────────────────────────────────────────────────────────
    "site_title": "Harari Court Admin",
    "site_header": "Harari Court",
    "site_brand": "⚖️ Harari Court",
    "site_logo": None,
    "welcome_sign": "Welcome to the Harari Region Supreme Court Administration Panel",
    "copyright": "Harari Region Supreme Court © 2024",

    # ── Top navigation ────────────────────────────────────────────────────────
    "topmenu_links": [
        {"name": "Home",        "url": "admin:index",          "permissions": ["auth.view_user"]},
        {"name": "Users",       "url": "admin:accounts_user_changelist"},
        {"name": "Requests",    "url": "admin:services_servicerequest_changelist"},
        {"name": "Appointments","url": "admin:services_appointment_changelist"},
        {"name": "Complaints",  "url": "admin:services_complaint_changelist"},
        {"name": "Feedback",    "url": "admin:services_feedback_changelist"},
        {"name": "View Site",   "url": "/",                    "new_window": True},
    ],

    # ── User menu (top-right) ─────────────────────────────────────────────────
    "usermenu_links": [
        {"name": "View Site", "url": "/", "new_window": True},
    ],

    # ── Sidebar ───────────────────────────────────────────────────────────────
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],

    "order_with_respect_to": [
        "accounts",
        "accounts.user",
        "services",
        "services.servicerequest",
        "services.servicedocument",
        "services.documentsubmission",
        "services.arbitrationfee",
        "services.appointment",
        "services.complaint",
        "services.feedback",
    ],

    # ── Icons (Font Awesome 5) ────────────────────────────────────────────────
    "icons": {
        "auth":                          "fas fa-users-cog",
        "auth.user":                     "fas fa-user",
        "auth.Group":                    "fas fa-users",
        "accounts.user":                 "fas fa-user-tie",
        "services.servicerequest":       "fas fa-file-alt",
        "services.servicedocument":      "fas fa-paperclip",
        "services.documentsubmission":   "fas fa-file-upload",
        "services.arbitrationfee":       "fas fa-money-bill-wave",
        "services.appointment":          "fas fa-calendar-check",
        "services.complaint":            "fas fa-exclamation-circle",
        "services.feedback":             "fas fa-star",
    },
    "default_icon_parents": "fas fa-folder",
    "default_icon_children": "fas fa-circle",

    # ── UI tweaks ─────────────────────────────────────────────────────────────
    "related_modal_active": True,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user":  "collapsible",
        "auth.group": "vertical_tabs",
    },
    "language_chooser": False,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": True,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary":   "btn-primary",
        "secondary": "btn-secondary",
        "info":      "btn-info",
        "warning":   "btn-warning",
        "danger":    "btn-danger",
        "success":   "btn-success",
    },
}
