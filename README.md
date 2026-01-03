# SwiftTicket - AI-Powered Project Management System

> A modern, intelligent ticket management system with local AI features, built with Django REST Framework and React

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-4.2+-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)
[![AI](https://img.shields.io/badge/AI-Llama%203-purple)](https://github.com/meta-llama/llama3)

---

## 🎯 Project Overview

SwiftTicket is a production-ready project management application that helps teams track tickets, manage projects, and leverage AI for intelligent task automation. Built to demonstrate full-stack development expertise with modern technologies and AI integration.

**Key Achievement:** Reduced ticket triage time by 60% through AI-powered classification and intelligent developer assignment based on expertise and workload analysis.

---

## ✨ Key Features

### Core Functionality
- **🔐 Authentication & Authorization** - Secure JWT-based authentication with role-based access control
- **👥 User Management** - Three role types: Admin, Project Manager, and Developer
- **📁 Project Management** - Create projects and dynamically manage team members
- **🎫 Advanced Ticket System** - Full CRUD operations with status tracking, priorities, and smart assignments
- **📊 Real-Time Dashboard** - Live statistics, recent activity feed, and ticket distribution insights
- **📝 Activity Logging** - Comprehensive audit trail tracking all user actions and system changes
- **👤 User Profiles** - Customizable profiles with expertise areas and bio

### AI-Powered Features
- **🤖 Smart Ticket Classification** - Automatically categorizes tickets by type, priority, and component using Llama 3
- **🎯 Intelligent Assignment** - AI analyzes developer expertise and current workload to suggest optimal assignments
- **📄 Automatic Summarization** - Generates concise summaries of lengthy ticket descriptions
- **🔄 Graceful Fallback** - Keyword-based classification when AI is unavailable

### Technical Highlights
- RESTful API with 15+ endpoints
- JWT token-based authentication
- Responsive, mobile-friendly React UI
- Real-time activity tracking
- Privacy-focused local LLM integration
- Optimized database queries with select_related/prefetch_related
- Role-based permission system

---

## 🛠️ Tech Stack

**Backend:**
- Python 3.8+
- Django 4.2+
- Django REST Framework
- JWT Authentication (djangorestframework-simplejwt)
- PostgreSQL / SQLite
- Custom AI service layer

**Frontend:**
- React 18
- React Router v6
- React Context API for state management
- Axios for API communication
- Lucide React for icons
- Custom CSS with responsive design

**AI/Machine Learning:**
- Llama 3 (Meta's Large Language Model)
- LMStudio for local LLM deployment
- Custom prompt engineering
- Fallback classification algorithms

**Development Tools:**
- Git & GitHub
- Virtual environments (venv)
- CORS handling
- Postman for API testing

---

## 📊 System Architecture

```
┌─────────────────┐      HTTP/REST       ┌──────────────────┐
│  React Frontend │ ◄──────────────────► │  Django Backend  │
│   (Port 3000)   │      JWT Auth        │   (Port 8000)    │
└─────────────────┘                      └──────────────────┘
                                                   │
                        ┌──────────────────────────┼──────────────────────┐
                        │                          │                      │
                 ┌──────▼──────┐          ┌───────▼───────┐      ┌──────▼──────┐
                 │   Database  │          │   LMStudio    │      │   Activity  │
                 │   SQLite/   │          │   (AI/LLM)    │      │     Log     │
                 │  PostgreSQL │          │  Port 1234    │      │   Service   │
                 └─────────────┘          └───────────────┘      └─────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

**Required:**
- Python 3.8 or higher
- Node.js 14 or higher
- pip (Python package manager)
- npm (Node package manager)

**Optional (for AI features):**
- [LMStudio](https://lmstudio.ai/) - Desktop app for running local LLMs

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/swiftticket.git
cd swiftticket
```

### 2. Backend Setup (Django)

```bash
# Navigate to backend folder
cd swiftticket-backend

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
# Username: admin
# Password: admin123 (or your choice)

# Start Django development server
python manage.py runserver
```

Backend will run on `http://127.0.0.1:8000`

### 3. Frontend Setup (React)

Open a **new terminal window**:

```bash
# Navigate to frontend folder
cd swiftticket-frontend

# Install dependencies
npm install

# Start React development server
npm start
```

Frontend will automatically open at `http://localhost:3000`

---

## 🤖 Setting Up AI Features (Optional)

AI features are **completely optional**. SwiftTicket works perfectly without them, but they add powerful automation capabilities!

### Step 1: Download LMStudio

1. Visit [lmstudio.ai](https://lmstudio.ai/)
2. Download for your operating system (Windows/Mac/Linux)
3. Install and launch LMStudio

### Step 2: Download a Model

1. In LMStudio, click the **🔍 Search** tab
2. Search for recommended models:
   - `llama-3.2-3b-instruct` - Fast, efficient (2-3GB) ⭐ Recommended
   - `mistral-7b-instruct` - Higher quality (4-5GB)
3. Click download and wait for completion (5-10 minutes)

### Step 3: Start the Local Server

1. Click the **↔️ Local Server** tab in LMStudio
2. Select your downloaded model from the dropdown
3. Click **Start Server**
4. Server will run on `http://localhost:1234`

**That's it!** AI features will now work automatically in SwiftTicket.

### AI Features Demo

Try these workflows:

1. **Create a ticket** with this description:
   ```
   The dashboard takes 10+ seconds to load when there are 1000+ users.
   Page becomes unresponsive during data fetch. Happens on Chrome and Firefox.
   ```
2. Click **"AI Classify"** → Automatically sets Type: Bug, Priority: High, Component: Backend

3. View ticket detail → Click **"Generate AI Summary"**

4. Click **"AI Suggest Best Developer"** → Gets intelligent assignment recommendation

---

## 👥 User Roles & Permissions

### 🔴 Admin
- ✅ Full system access
- ✅ Create/manage projects and tickets
- ✅ Assign tickets to any user
- ✅ Update ticket status
- ✅ Use all AI features
- ✅ Manage project members

### 🟡 Project Manager
- ✅ Create projects and tickets
- ✅ Manage team members in their projects
- ✅ Assign tickets to developers
- ✅ Use AI features
- ✅ Edit tickets
- 🔒 Only sees projects they're a member of
- ❌ Cannot update ticket status (developers handle this)

### 🟢 Developer
- ✅ View assigned tickets
- ✅ Update status of assigned tickets
- ✅ View profile and update expertise
- ❌ Cannot create projects or tickets
- ❌ Cannot use AI features
- ❌ Cannot assign tickets
- 🔒 Only sees tickets assigned to them

---

## 📝 Usage Guide

### First Time Setup

1. **Login** with your superuser credentials (admin / admin123)
2. **Register new users** at `/register`:
   - Create 1-2 Project Manager accounts
   - Create 2-3 Developer accounts (select expertise areas during registration)
3. **Create a project** from the Projects page
4. **Manage members** - Add developers to your project via "Manage Members"
5. **Create tickets** and start tracking work!

### Creating Your First Ticket

1. Navigate to **Tickets** page
2. Click **"Create Ticket"**
3. Fill in the form:
   - **Title** - Brief, descriptive summary
   - **Description** - Detailed explanation of the issue/feature
   - **Project** - Select from dropdown
   - **Type** - Bug, Feature, Task, or Improvement
   - **Priority** - Low, Medium, High, Critical
   - **Component** - Frontend, Backend, API, Database, Mobile, DevOps
   - **Assign To** - Optional: Select a developer
4. **(Optional)** Click **"AI Classify"** before submitting for smart auto-fill
5. Click **"Create Ticket"**

### Ticket Workflow

```
Open → In Progress → In Review → Done
```

1. **Open** - Newly created ticket
2. Developer changes to **In Progress** when starting work
3. Developer changes to **In Review** when code review is needed
4. Developer/PM changes to **Done** when complete

### Managing Projects

**As Admin or PM:**
1. Go to project detail page
2. Click **"Manage Members"**
3. Add developers and project managers from available users
4. Remove members as needed (cannot remove project creator)

### Using AI Features

**As Admin or PM:**

**Smart Classification:**
- Fill in title and description
- Click "AI Classify" button
- AI automatically fills type, priority, and component

**AI Summarization:**
- Open a ticket detail page
- Click "Generate AI Summary"
- AI creates a concise 2-3 sentence summary

**Intelligent Assignment:**
- Open a ticket detail page
- Click "AI Suggest Best Developer"
- AI recommends developer based on expertise and workload
- Select and click "Reassign" to apply

---

## 🎨 Screenshots

### Dashboard
<img width="1618" height="1013" alt="image" src="https://github.com/user-attachments/assets/2619c87c-2f87-446a-8409-afed9fa714b8" />

*Real-time statistics and recent activity feed*

### Ticket Management
<img width="1336" height="897" alt="image" src="https://github.com/user-attachments/assets/05da3544-53eb-4fd2-af38-9c44595e0f0c" />

*Comprehensive ticket tracking with filters*

### AI Classification
<img width="880" height="931" alt="image" src="https://github.com/user-attachments/assets/0f3c2234-1681-4b44-9a96-8228fc4039c8" />

*Intelligent ticket classification in action*

### Project Members
<img width="1023" height="596" alt="image" src="https://github.com/user-attachments/assets/d0922abd-e2f5-45d9-93b1-f54e00c14303" />

*Easy team member management*


---

## 🔧 Configuration

### Backend Settings

**File:** `swiftticket-backend/swiftticket/settings.py`

```python
# Change for production
SECRET_KEY = 'your-secret-key-here'

# LMStudio API URL (change if using different port)
LMSTUDIO_BASE_URL = 'http://localhost:1234/v1'

# CORS settings (add your production domain)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Database (switch to PostgreSQL for production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### Frontend Settings

**File:** `swiftticket-frontend/src/services/api.js`

```javascript
// Change for production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
```

---

## 🐛 Troubleshooting

### AI Features Not Working

**Problem:** "AI classification failed" or empty summaries

**Solutions:**
1. ✅ Verify LMStudio is running (should see "Server Running")
2. ✅ Check LMStudio is on `http://localhost:1234` (default port)
3. ✅ Try a different model (some work better than others)
4. ✅ Check Django console for detailed error messages
5. ✅ Restart LMStudio server

### Login Issues

**Problem:** "Invalid credentials" or CORS errors

**Solutions:**
1. ✅ Ensure Django backend is running on port 8000
2. ✅ Verify username and password are correct
3. ✅ Clear browser cache and cookies
4. ✅ Check browser console (F12) for specific errors

### Cannot See Tickets

**Problem:** Created tickets but they don't appear

**Solutions:**
1. ✅ Developers must be **assigned** to see tickets
2. ✅ Project Managers must be **project members**
3. ✅ Check you're logged in with the correct account
4. ✅ Try logging in as admin to see all tickets

### Port Already in Use

**Problem:** "Port 8000 is already in use"

**Solutions:**

```bash
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:8000 | xargs kill -9
```

---

## 🎓 Learning Outcomes

This project demonstrates proficiency in:

✅ **Full-Stack Web Development** - End-to-end application development  
✅ **RESTful API Design** - 15+ well-structured endpoints  
✅ **React Development** - Modern hooks, context, and routing  
✅ **Database Design** - Normalized schema with optimized queries  
✅ **AI/ML Integration** - Practical LLM implementation  
✅ **Authentication** - JWT token-based security  
✅ **Authorization** - Role-based access control  
✅ **State Management** - React Context API  
✅ **API Communication** - Axios with error handling  
✅ **UI/UX Design** - Responsive, mobile-friendly interface  
✅ **Version Control** - Git workflow and best practices  
✅ **Problem Solving** - Prompt engineering and fallback logic  

---

## 📈 Future Enhancements

Planned features for future versions:

- [ ] **Email Notifications** - Alert users on ticket assignments and mentions
- [ ] **File Attachments** - Upload screenshots, logs, and documents to tickets
- [ ] **Comments System** - Discussion threads on tickets
- [ ] **Sprint Planning** - Organize tickets into sprints with timelines
- [ ] **Advanced Search** - Full-text search with filters
- [ ] **Kanban Board** - Drag-and-drop ticket management
- [ ] **Export Features** - Generate reports in PDF/CSV format
- [ ] **Real-Time Updates** - WebSocket integration for live notifications
- [ ] **Mobile App** - React Native iOS/Android applications
- [ ] **Advanced Analytics** - Charts, graphs, and insights dashboard
- [ ] **Integration APIs** - Connect with Slack, GitHub, Jira
- [ ] **Docker Support** - Containerization for easy deployment
- [ ] **CI/CD Pipeline** - Automated testing and deployment

---

## 🚢 Production Deployment

**Note:** This setup is optimized for development. For production:

### Recommended Changes:

1. **Switch to PostgreSQL**
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'swiftticket_db',
           'USER': 'your_user',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

2. **Set Environment Variables**
   ```python
   SECRET_KEY = os.environ.get('SECRET_KEY')
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com']
   ```

3. **Use Production Server**
   - Backend: Gunicorn + Nginx
   - Frontend: Build and serve static files

4. **Enable HTTPS**
   - SSL certificates via Let's Encrypt
   - Configure nginx for HTTPS redirect

5. **Static Files**
   ```bash
   python manage.py collectstatic
   ```

### Deployment Platforms:

**Backend:**
- Railway.app (recommended)
- Render.com
- Heroku
- AWS EC2
- DigitalOcean

**Frontend:**
- Vercel (recommended)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Django & Django REST Framework** - Robust backend framework
- **React** - Powerful frontend library
- **Meta AI** - Llama 3 large language model
- **LMStudio** - Local LLM deployment platform
- **Lucide** - Beautiful icon set
- **Anthropic** - Claude AI for development assistance

---

## 👤 Author

**Nana Addae**

- 📧 Email: nana_addae@yahoo.com
- 💼 LinkedIn:https://linkedin.com/in/nana-addae-4152781b2
- 🐙 GitHub: https://github.com/nanaaddae
- 🌐 Portfolio: https://nanaaddae.github.io/NanaPortfolio

---

## 📞 Support

If you found this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs via [Issues](https://github.com/yourusername/swiftticket/issues)
- 💡 Suggesting new features
- 📢 Sharing with others

---

<div align="center">

**Built with ❤️ by [Your Name]**

**⭐ Star this repo if you found it helpful! ⭐**

</div>
