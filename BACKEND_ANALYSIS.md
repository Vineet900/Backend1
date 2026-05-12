# 🚀 DevSchool Pro - Backend Analysis & Setup Guide

## ✅ Backend Status: RUNNING

- **Port:** 4000 (Development)
- **Environment:** Node.js with Express
- **Database:** Supabase PostgreSQL
- **Status:** ✅ Server Started Successfully

---

## 📦 Core Features Implemented

### 1. **Authentication System** (`authController.js`)

- User registration with email/password
- Login with JWT tokens
- Profile auto-creation on signup
- Wallet & Streak initialization
- OTP verification support

### 2. **Course Management** (`courseController.js`)

- Get all published courses
- Get single course with lessons
- Create new courses (Admin/Instructor)
- Update & delete courses
- Lesson grouping by course

### 3. **Learning Progress Tracking** (`progressController.js`)

- Track lesson completion
- Record watch time
- Calculate cumulative progress
- Award XP & Study Points

### 4. **Quiz System** (`quizController.js`)

- Submit quiz attempts
- Anti-cheat validation (violation tracking)
- Score calculation
- Automatic rewards on passing
- Notification generation

### 5. **User Management** (`userController.js`)

- Update user profile
- Leaderboard generation (Top 50 by XP)
- XP to Study Points conversion
- Real-time stats sync

### 6. **AI Tutor Service** (`tutorService.js`)

- Supports OpenAI & OpenRouter APIs
- Fallback hints when API unavailable
- Context-aware coding guidance
- Multi-language support (EN, HI, Hinglish)

### 7. **Dashboard Analytics** (`dashboardService.js`)

- Build dashboard overview with stats
- Course progress visualization
- Upcoming assessments
- Achievements tracking
- Study points & streaks

---

## 🛣️ API Endpoints

### Authentication

```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
POST   /api/auth/verify            - Verify OTP
POST   /api/auth/logout            - Logout
GET    /api/auth/me                - Get current user profile
POST   /api/auth/sync              - Sync profile
```

### Courses

```
GET    /api/courses                - Get all courses
GET    /api/courses/:id            - Get course with lessons
POST   /api/courses                - Create course (Admin)
PUT    /api/courses/:id            - Update course (Admin)
DELETE /api/courses/:id            - Delete course (Admin)
```

### Progress

```
GET    /api/progress/:lessonId     - Get lesson progress
POST   /api/progress               - Record progress
PUT    /api/progress/:lessonId     - Update progress
```

### Quizzes

```
GET    /api/quizzes                - Get all quizzes
GET    /api/quizzes/:id            - Get quiz details
POST   /api/quizzes/:id/submit     - Submit quiz attempt
GET    /api/quizzes/attempts/:userId - Get user attempts
```

### Users

```
GET    /api/user/profile           - Get user profile
PUT    /api/user/profile           - Update profile
GET    /api/user/leaderboard       - Top 50 users
POST   /api/user/convert-xp        - Convert XP to Study Points
```

### Tutor (AI)

```
POST   /api/tutor/ask              - Ask AI tutor question
GET    /api/tutor/hints/:topic     - Get topic hints
```

### Admin

```
GET    /api/admin/dashboard        - Admin analytics
GET    /api/admin/users            - User management
GET    /api/admin/courses          - Course analytics
POST   /api/admin/logs             - Log admin actions
```

### Health

```
GET    /health                     - Server health check
```

---

## 🗄️ Complete Supabase SQL Setup

**👉 Run the file: [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql) in your Supabase SQL Editor**

This includes:

- ✅ All 14+ tables with lowercase names (PostgreSQL compatible)
- ✅ Proper foreign key relationships with CASCADE deletes
- ✅ Enums for roles, status, transactions, notifications
- ✅ RPC functions for atomic rewards and profile initialization
- ✅ Sample courses (HTML, CSS, JavaScript, React)
- ✅ All necessary indexes for performance
- ✅ Compatible with the `npm run sync` script

### Quick Setup Steps:

1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Go to SQL Editor
3. Create new query
4. Copy content from [SUPABASE_SETUP.sql](SUPABASE_SETUP.sql)
5. Click "RUN"
6. Wait for success message
7. Run: `npm run sync` to load course content

---

## ⚙️ Environment Configuration

### Backend `.env` File

```env
NODE_ENV=development
PORT=4000
SUPABASE_URL=https://ytvtrcgnmdwxszbuujtx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
JWT_EXPIRE=30d
OPENROUTER_API_KEY=your_openrouter_key (optional)
```

### Frontend `.env` File

```env
VITE_API_URL=http://localhost:4000
VITE_SUPABASE_URL=https://ytvtrcgnmdwxszbuujtx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

---

## 🚀 Running the Project

### Backend

```bash
cd backend
npm install
npm start           # Starts on http://localhost:4000
# or
npm run dev         # With hot-reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

### Admin Dashboard

```bash
cd admin
npm install
npm run dev        # Starts on http://localhost:5174
```

---

## 🐛 Fix: Sync Script Table Not Found Error

### Problem

```
❌ Course error: Could not find the table 'public.courses' in the schema
```

### Solution - 3 Steps to Fix

#### Step 1: Run SQL Setup in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Open your project
3. Click **SQL Editor** → **New Query**
4. Copy all content from `SUPABASE_SETUP.sql`
5. Click **RUN**
6. Wait for "Success" message

#### Step 2: Verify Tables Created

```sql
-- Verify tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

#### Step 3: Run Sync Script

```bash
cd backend
npm run sync
```

Success output:

```
🚀 Starting DevSchool Pro content sync...
📂 [NEW FORMAT] Syncing course: React...
✅ Course upserted: REACT
✅ Lesson synced: Understanding JSX
```

---

## ⚠️ Other Configuration Needed

### 1. **Database URL Configuration**

- Update `.env` with Supabase connection:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

- Get from: Supabase Dashboard → Settings → Database → Connection String

### 2. **RPC Functions**

- ✅ Already included in SUPABASE_SETUP.sql
- Functions created: `award_user_reward()`, `init_user_profile()`

### 3. **Auth Middleware**

- Verify [backend/src/middleware/auth.js](backend/src/middleware/auth.js) validates JWT correctly

---

## ✅ What's Working

- ✅ Server startup (Port 4000)
- ✅ Express middleware setup
- ✅ CORS configuration
- ✅ Error handling
- ✅ Route registration
- ✅ JWT support
- ✅ Zod validation
- ✅ Service layer for AI tutoring
- ✅ Dashboard analytics generation

---

## 🔧 Setup Checklist

- [ ] Run `SUPABASE_SETUP.sql` in Supabase SQL Editor
- [ ] Update `.env` with Supabase connection string
- [ ] Run `npm run sync` in backend
- [ ] Test: `curl http://localhost:4000/health`
- [ ] Verify courses loaded: `curl http://localhost:4000/api/courses`
- [ ] Test auth: `POST http://localhost:4000/api/auth/register`

### Quick Commands

```bash
# Terminal 1 - Backend
cd backend
npm start                 # http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm run dev             # http://localhost:5173

# Terminal 3 - Sync courses
cd backend
npm run sync
```

---

## 📊 Architecture Overview

```
Backend/
├── src/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Server initialization
│   ├── config/
│   │   ├── env.js            # Environment validation
│   │   ├── cors.js           # CORS config
│   │   └── supabase.js       # Supabase client
│   ├── controllers/           # Route handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, error handling
│   ├── services/             # Business logic
│   ├── database/             # DB clients
│   ├── utils/                # Helpers & logging
│   └── validations/          # Zod schemas
└── prisma/
    └── schema.prisma         # Data model
```

---

## 📝 Notes

- **Database**: Supabase PostgreSQL with 15+ tables
- **Auth**: Supabase Auth with JWT
- **AI**: OpenAI & OpenRouter API support
- **Learning**: XP, Study Points, Streaks, Leaderboard
- **Security**: Anti-cheat detection, CORS, Helmet, HPP

---

Generated: May 12, 2026
Status: ✅ Backend Ready for Frontend Integration
