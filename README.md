# Jira Lite - AI-Powered Project Management

A modern project management tool with AI features powered by local LLM (LMStudio). Built with Django REST Framework and React.


## ✨ Features

### Core Features
- 🎯 **Project Management** - Create and manage multiple projects
- 🎫 **Ticket System** - Full CRUD operations for tickets with status tracking
- 👥 **Role-Based Access Control** - Admin, Project Manager, and Developer roles
- 📊 **Dashboard** - Real-time statistics and recent activity
- 🔍 **Search & Filters** - Advanced filtering by status, priority, project, and assignee
- 🔐 **JWT Authentication** - Secure login/logout system

### AI-Powered Features (Requires LMStudio)
- 🤖 **AI Ticket Classification** - Automatically categorizes tickets by type, priority, and component
- 📝 **AI Summarization** - Generate concise summaries of ticket descriptions
- 👤 **AI Assignee Suggestion** - Smart developer assignment based on expertise and workload

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Python 3.8+
- Node.js 14+
- pip and npm

**Optional (for AI features):**
- [LMStudio](https://lmstudio.ai/) - Desktop app for running local LLMs

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/jira-lite.git
cd jira-lite
```

### 2. Backend Setup (Django)
```bash
# Navigate to backend folder
cd jira-lite-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers pillow requests

# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser
# Enter username: admin
# Enter password: admin123 (or your choice)

# Start Django server
python manage.py runserver
```

Backend will run on `http://127.0.0.1:8000`

### 3. Frontend Setup (React)

Open a **new terminal window**:
```bash
# Navigate to frontend folder
cd jira-lite-frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will open automatically at `http://localhost:3000`

---

## 🤖 Setting Up AI Features (Optional)

AI features are **optional**. The app works perfectly fine without them, but they add powerful automation!

### Step 1: Download LMStudio

1. Go to [lmstudio.ai](https://lmstudio.ai/)
2. Download for your operating system (Windows/Mac/Linux)
3. Install and open LMStudio

### Step 2: Download a Model

1. In LMStudio, click the **🔍 Search** tab
2. Search for: `llama-3.2-3b` (good balance of speed and quality)
3. Click the download button
4. Wait for download to complete (can take 5-10 minutes)

**Recommended models:**
- `llama-3.2-3b-instruct` - Fast, good for most tasks (2-3GB)
- `mistral-7b-instruct` - Better quality, slower (4-5GB)

### Step 3: Start the Local Server

1. In LMStudio, click the **↔️ Local Server** tab
2. Select your downloaded model from the dropdown
3. Click **Start Server**
4. Server will start on `http://localhost:1234`

**That's it!** The AI features will now work in the app.

### AI Features Demo

Once LMStudio is running, try these:

1. **Create a ticket** with a description like:
```
   The dashboard takes 10+ seconds to load when there are many users.
   Page freezes during data fetch. Happens on Chrome and Firefox.
```
2. Click **"AI Classify"** - it will automatically set:
   - Type: Performance
   - Priority: High
   - Component: Backend

3. After creating the ticket, click **"Generate AI Summary"** on the ticket detail page

4. Click **"AI Suggest Best Developer"** to get smart assignment suggestions

---

## 👥 User Roles Explained

### Admin
- ✅ Full access to everything
- ✅ Can create projects and tickets
- ✅ Can assign tickets
- ✅ Can update ticket status
- ✅ Can use all AI features

### Project Manager
- ✅ Can create projects and tickets
- ✅ Can assign tickets to developers
- ✅ Can use AI features
- ❌ Cannot update ticket status (devs do this)
- 🔒 Only sees projects they're a member of

### Developer
- ✅ Can view assigned tickets
- ✅ Can update ticket status
- ❌ Cannot create projects or tickets
- ❌ Cannot use AI features
- 🔒 Only sees tickets assigned to them

---

## 📝 Usage Guide

### First Time Setup

1. **Login** with your superuser credentials (`admin` / `admin123`)
2. **Register users** at `/register`:
   - Create a Project Manager account
   - Create 2-3 Developer accounts
3. **Create a project** from the Projects page
4. **Add members** to the project (via Django admin for now)
5. **Create tickets** and start tracking work!

### Creating Your First Ticket

1. Go to **Tickets** page
2. Click **"Create Ticket"**
3. Fill in:
   - **Title** - Brief description
   - **Description** - Detailed explanation
   - **Project** - Select project
   - **Type** - Bug, Feature, Task, or Improvement
   - **Priority** - Low, Medium, High, Critical
   - **Assign To** - Select a developer (optional)
4. **(Optional)** Click **"AI Classify"** before submitting
5. Click **"Create Ticket"**

### Ticket Workflow

1. **Open** → Developer starts work → **In Progress**
2. **In Progress** → Code review → **In Review**
3. **In Review** → Testing complete → **Done**

---

## 🛠️ Tech Stack

**Backend:**
- Django 4.2+
- Django REST Framework
- JWT Authentication
- SQLite (development)

**Frontend:**
- React 18
- React Router
- Axios
- Lucide React (icons)

**AI Integration:**
- LMStudio (local LLM server)
- Custom AI service layer

---

## 📁 Project Structure
```
jira-lite-project/
├── jira-lite-backend/          # Django REST API
│   ├── manage.py
│   ├── jira_lite/              # Project settings
│   ├── users/                  # User management & auth
│   ├── projects/               # Project CRUD
│   ├── tickets/                # Ticket management
│   └── ai_services/            # AI integration logic
│
└── jira-lite-frontend/         # React frontend
    ├── public/
    └── src/
        ├── components/         # React components
        │   ├── auth/           # Login, Register
        │   ├── dashboard/      # Dashboard view
        │   ├── projects/       # Project list/detail
        │   └── tickets/        # Ticket list/detail
        ├── services/           # API calls
        └── context/            # Global state (Auth)
```

---

## 🔧 Configuration

### Backend Settings

**File:** `jira-lite-backend/jira_lite/settings.py`
```python
# Change this for production
SECRET_KEY = 'your-secret-key-here'

# LMStudio API URL (change if using different port)
LMSTUDIO_BASE_URL = 'http://localhost:1234/v1'

# CORS settings (add your production domain)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### Frontend Settings

**File:** `jira-lite-frontend/src/services/api.js`
```javascript
// Change this for production
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

---

## 🐛 Troubleshooting

### AI Features Not Working

**Problem:** "AI classification failed" or "AI returned empty summary"

**Solutions:**
1. ✅ Check LMStudio is running (should see "Server Running" in LMStudio)
2. ✅ Check LMStudio is on `http://localhost:1234` (default port)
3. ✅ Try a different model (some models work better than others)
4. ✅ Check Django console for error messages

### Login Not Working

**Problem:** "Invalid credentials" or CORS errors

**Solutions:**
1. ✅ Make sure Django backend is running (`python manage.py runserver`)
2. ✅ Check username/password are correct
3. ✅ Clear browser cache and try again
4. ✅ Check browser console (F12) for error messages

### "Not Found" Errors

**Problem:** Getting 404 errors on API calls

**Solutions:**
1. ✅ Check both servers are running (Django on :8000, React on :3000)
2. ✅ Verify API URLs in `src/services/api.js`
3. ✅ Restart both servers

### Tickets Not Showing

**Problem:** Created tickets but can't see them

**Solutions:**
1. ✅ Check you're a **member** of the project (for non-admin users)
2. ✅ If developer, tickets must be **assigned to you**
3. ✅ Try logging in as admin to see all tickets

---

## 🚢 Production Deployment

**Note:** This is currently set up for development. For production, you'll need:

1. Switch from SQLite to PostgreSQL
2. Set `DEBUG = False` in Django settings
3. Configure proper CORS settings
4. Use environment variables for secrets
5. Set up static file serving
6. Use a production server (gunicorn, nginx)

*(Production deployment guide coming soon!)*

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - feel free to use this project for learning or your portfolio!

---

## 🙏 Acknowledgments

- Built with Django and React
- AI powered by LMStudio
- Icons by Lucide

---



---

**Enjoy using Jira Lite!** 🎉
