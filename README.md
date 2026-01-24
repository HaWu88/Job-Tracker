# Job Tracker Application

A full-stack web application for tracking job applications, built using **React** and **Django REST Framework**.  
The app allows users to create, manage, and monitor job applications while maintaining a clean separation between frontend and backend responsibilities.

---

## 🚀 Features

- Create, update, and delete job applications
- Track application status (Applied, Interview, Offer, Rejected)
- User-specific data access
- RESTful API architecture
- Modern React frontend with protected routes
- Scalable authentication-ready backend

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios

### Backend
- Django
- Django REST Framework
- SQLite (development)
- PostgreSQL (production-ready configuration)
- JWT-ready authentication setup

---

## 📁 Project Structure

job-tracker/
|----- backend/
|  |-- job_tracker/
|  |--- applications/
|  |--- manage.py
|  |--- requirements.txt
|------ frontend/
|  |--- src/
|  |--- components/
|  |--- services/
|  |___ package.json
|______ README.md


---

## ⚙️ Local Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
cd frontend
npm install
npm run dev
-m 