from pathlib import Path
from datetime import timedelta
import os
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = 'django-insecure-3g44bbh^hvp@-6_f$a_1_g$j2hxlwyy95bo^h2&vpv64!mjju$'

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# -------------------------------------------------------------------
# APPLICATIONS
# -------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    # Local
    "applications",

    # For Testing purpose
    "django_extensions",
]

SITE_ID = 1

# -------------------------------------------------------------------
# AUTH / USER
# -------------------------------------------------------------------

AUTH_USER_MODEL = "applications.User"

ACCOUNT_EMAIL_VERIFICATION = "none"

# -------------------------------------------------------------------
# MIDDLEWARE
# -------------------------------------------------------------------

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

# -------------------------------------------------------------------
# CORS (Frontend)
# -------------------------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = True

# -------------------------------------------------------------------
# TEMPLATES
# -------------------------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# -------------------------------------------------------------------
# URLS / WSGI
# -------------------------------------------------------------------

ROOT_URLCONF = "job_tracker.urls"

WSGI_APPLICATION = "job_tracker.wsgi.application"

# -------------------------------------------------------------------
# DATABASE
# -------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# -------------------------------------------------------------------
# PASSWORD VALIDATION
# -------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------------------------------------------------
# REST FRAMEWORK
# -------------------------------------------------------------------

# REST_FRAMEWORK = {
#     "DEFAULT_AUTHENTICATION_CLASSES": (
#         "rest_framework_simplejwt.authentication.JWTAuthentication",
#     ),
#     "DEFAULT_PERMISSION_CLASSES": (
#         "rest_framework.permissions.IsAuthenticated",
#     ),
# }

# see data without auth to stabilize app
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
}

# -------------------------------------------------------------------
# JWT
# -------------------------------------------------------------------

from datetime import timedelta

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# -------------------------------------------------------------------
# dj-rest-auth
# -------------------------------------------------------------------

REST_USE_JWT = True
JWT_AUTH_COOKIE = "access"
JWT_AUTH_REFRESH_COOKIE = "refresh"


# -------------------------------------------------------------------
# INTERNATIONALIZATION
# -------------------------------------------------------------------

LANGUAGE_CODE = "en-us"

# Change TIME_ZONE to your current time
TIME_ZONE = "America/Los_Angeles"

USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------------
# STATIC FILES
# -------------------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# -------------------------------------------------------------------
# DEFAULT AUTO FIELD
# -------------------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"




# # Change from default to PostgreSQL
# # Replace the DATABASES section with this:
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": "job_tracker",
#         "USER": "jobtracker_user",
#         "PASSWORD": "strongpassword",
#         "HOST": "localhost",
#         "PORT": "5432",
#     }
# }
# Create the DB and user in Postgres:
# CREATE DATABASE job_tracker;
# CREATE USER jobtracker_user WITH PASSWORD 'strongpassword';
# ALTER ROLE jobtracker_user SET client_encoding TO 'utf8';
# ALTER ROLE jobtracker_user SET default_transaction_isolation TO 'read committed';
# ALTER ROLE jobtracker_user SET timezone TO 'UTC';
# GRANT ALL PRIVILEGES ON DATABASE job_tracker TO jobtracker_user;
