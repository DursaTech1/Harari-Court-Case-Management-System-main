# ⚖️ Harari Region Supreme Court — Case Management System

A full-stack digital court services portal for the Harari Region Supreme Court of Ethiopia. Citizens can register, log in, and submit court service requests online. Court administrators manage all submissions through a rich admin dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Admin Panel](#admin-panel)
- [Environment Notes](#environment-notes)

---

## Overview

The system has two parts:

| Part | Technology | URL |
|---|---|---|
| **Frontend** | React 19 + Vite | `http://localhost:5173` |
| **Backend API** | Django 5 + DRF | `http://localhost:8000/api` |
| **Admin Panel** | Django Admin + Jazzmin | `http://localhost:8000/admin` |

Citizens interact with the React frontend. The Django backend exposes a REST API secured with JWT tokens. Court staff use the Django admin panel to review and manage all submissions.

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Django | 5.2.8 | Web framework |
| djangorestframework | 3.16.0 | REST API |
| djangorestframework-simplejwt | 5.5.0 | JWT authentication |
| django-cors-headers | 4.7.0 | CORS for React frontend |
| django-jazzmin | 3.0.1 | Admin UI theme |
| Pillow | 11.2.1 | Image/file handling |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19.2.0 | UI framework |
| Vite | 7.x (rolldown) | Build tool |
| Axios | 1.13.2 | HTTP client |
| React Router DOM | 7.11.0 | Client-side routing |
| Redux Toolkit | 2.11.2 | State management |

---

## Project Structure

```
Harari-Court-Case-Management-System-main/
│
├── court_backend/                  # Django backend
│   ├── requirements.txt
│   └── court_backend/
│       ├── manage.py
│       ├── db.sqlite3
│       ├── backend/                # Django project settings & URLs
│       │   ├── settings.py
│       │   └── urls.py
│       ├── accounts/               # User auth app
│       │   ├── models.py           # Custom User model
│       │   ├── serializers.py
│       │   ├── views.py            # Register, Login, Profile
│       │   ├── urls.py
│       │   └── admin.py
│       └── services/               # Court services app
│           ├── models.py           # ServiceRequest + 5 specialised models
│           ├── serializers.py
│           ├── views.py            # Full CRUD views
│           ├── urls.py
│           └── admin.py
│
└── court-dashboard/                # React frontend
    ├── package.json
    └── src/
        ├── App.jsx                 # Root component, auth state
        ├── api/
        │   ├── axios.js            # Axios instance with JWT interceptor
        │   ├── api.js              # All API call functions
        │   ├── auth.js             # Auth API helpers
        │   └── services.js        # Services API helpers
        ├── contexts/
        │   └── AuthContext.jsx     # Auth context provider
        └── components/
            ├── LandingPage.jsx     # Public landing page
            ├── Dashboard.jsx       # Authenticated dashboard
            ├── modals/
            │   ├── LoginModal.jsx
            │   ├── RegisterModal.jsx
            │   └── ProfileModal.jsx
            └── sections/
                ├── ServicesSidebar.jsx
                ├── ServiceDetails.jsx  # All 6 service forms
                ├── MySubmissions.jsx   # CRUD table for user submissions
                └── CaseAnalytics.jsx   # Analytics view
```

---

## Features

### Citizen Portal (Frontend)
- **Register & Login** — JWT-based authentication with auto-login after registration
- **6 Court Services** — each with a multi-step form:
  - 📄 Document Submission
  - 💰 Arbitration Fee (auto-calculates court fee by case type and claim amount)
  - 🔍 Search Document (search mock court document database)
  - 📅 Daily Appointment (schedule with date/time/purpose)
  - 📝 Complaint Form
  - 💬 Feedback (star rating + comments)
- **My Submissions** — view, filter, edit notes, and delete past submissions
- **Analytics** — live charts of submission counts by service and status
- **Profile Edit** — update full name and phone number
- **Dashboard Stats** — live counts of active cases, pending payments, upcoming hearings

### Admin Panel (Backend)
- **Jazzmin theme** — dark sidebar, navy navbar, Font Awesome icons
- **User management** — activate/deactivate users, view submission counts
- **Service Requests** — colored status badges, bulk status actions (Under Review / Approved / Completed / Rejected)
- **Arbitration Fees** — ETB-formatted amounts, bulk "Mark Paid" action
- **Appointments** — date hierarchy navigation
- **Complaints** — subject preview, linked status
- **Feedback** — star rating display (★★★☆☆) with color coding
- **Documents** — file download links, image preview

---

## API Endpoints

Base URL: `http://localhost:8000/api`

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/accounts/register/` | No | Register new user |
| POST | `/accounts/login/` | No | Login → returns `{access, refresh, user}` |
| GET | `/accounts/profile/` | JWT | Get profile |
| PUT | `/accounts/profile/` | JWT | Update profile |

### Services
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/services/list/` | No | List available court services |
| GET | `/services/dashboard/stats/` | JWT | Dashboard statistics |
| GET | `/services/requests/` | JWT | List user's submissions |
| POST | `/services/requests/` | JWT | Create new submission |
| GET | `/services/requests/<id>/` | JWT | Get single submission |
| PUT | `/services/requests/<id>/` | JWT | Update submission |
| DELETE | `/services/requests/<id>/` | JWT | Delete submission |
| DELETE | `/services/documents/<id>/` | JWT | Delete uploaded document |
| GET | `/services/appointments/` | JWT | List user's appointments |

---

## Getting Started

### Prerequisites
- Python 3.11+ (tested on 3.14)
- Node.js 18+
- npm 9+

---

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd court_backend

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Navigate to the Django project
cd court_backend

# 4. Apply database migrations
python manage.py migrate

# 5. Create a superuser for the admin panel
python manage.py createsuperuser
# Enter email, full_name, phone, and password when prompted

# 6. Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`  
The admin panel will be available at `http://localhost:8000/admin/`

---

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd court-dashboard

# 2. Install Node dependencies
npm install

# 3. Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## Running the Application

Open **two terminals** and run both servers simultaneously:

**Terminal 1 — Backend:**
```bash
cd court_backend/court_backend
python manage.py runserver
```

**Terminal 2 — Frontend:**
```bash
cd court-dashboard
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## Admin Panel

Access the admin panel at `http://localhost:8000/admin/` using the superuser credentials you created.

**Quick links from the top navigation:**
- **Users** — manage registered citizens
- **Requests** — all service submissions with status management
- **Appointments** — scheduled court appointments
- **Complaints** — filed complaints
- **Feedback** — citizen feedback and ratings

**Bulk actions available:**
- Mark requests as Under Review / Approved / Completed / Rejected
- Activate / Deactivate users
- Mark arbitration fees as Paid

---

## Environment Notes

- The backend uses **SQLite** by default — no database setup required
- `DEBUG = True` and `CORS_ALLOW_ALL_ORIGINS = True` are set for development
- JWT access tokens expire after **1 hour**
- Uploaded files are stored in `court_backend/court_backend/media/`
- The `SECRET_KEY` in `settings.py` must be changed before any production deployment

---

## Data Models

```
User
└── ServiceRequest (one user → many requests)
    ├── ServiceDocument (files attached to a request)
    ├── DocumentSubmission (case number, title, type)
    ├── ArbitrationFee (claim amount, calculated fee, payment status)
    ├── Appointment (date, time, purpose, department)
    ├── Complaint (type, subject, description, incident date)
    └── Feedback (service rated, star rating, comment)
```

---

*Harari Region Supreme Court — Digital Services Portal*  
*"ቀልጣፋና ዉጤታማ ለሆነ የዳኝነት አገልግሎት እንተጋለን!" — We strive for efficient and effective judicial services*
