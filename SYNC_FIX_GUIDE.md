# 🚀 Quick Fix Guide - Sync Script Error

## Error You're Getting

```
❌ Course error: Could not find the table 'public.courses' in the schema
```

## Root Cause

The Supabase database doesn't have the required tables yet. The sync script can't find `courses`, `lessons`, and `quizzes` tables.

---

## ⚡ 3-Step Fix (5 minutes)

### Step 1️⃣: Run SQL Setup (2 min)

1. Open [Supabase Console](https://app.supabase.com/)
2. Select your project
3. Click **SQL Editor** on left sidebar
4. Click **New Query**
5. Open file: `devschoolpro/SUPABASE_SETUP.sql`
6. Copy ALL content
7. Paste into Supabase query editor
8. Click **RUN** button
9. Wait for green checkmark ✅

**Screenshot Guide:**

```
Supabase Dashboard
└── SQL Editor
    └── New Query
        └── Paste SUPABASE_SETUP.sql
            └── Click RUN
```

### Step 2️⃣: Verify Tables Created (1 min)

Run this query in Supabase to confirm:

```sql
SELECT COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
```

Should return: **18 tables**

### Step 3️⃣: Sync Course Content (2 min)

```bash
cd backend
npm run sync
```

Expected output:

```
🚀 Starting DevSchool Pro content sync...

📦 New-format course files: 4
📂 [NEW FORMAT] Syncing course: React (9 lessons)
  ✅ Course upserted: React
  ✅ Lesson synced: Understanding JSX
  ✅ Lesson synced: Component Lifecycle
  ...
  ✅ Lesson synced: State Management
  ✅ Lesson synced: React Hooks Deep Dive

📦 Old-format modules: html, css, javascript
📂 [OLD FORMAT] Syncing module: HTML
  ✅ Course upserted: HTML
  ✅ Lesson synced: HTML Basics
  ...

✅ All content synced successfully!
```

---

## 🔍 Troubleshooting

### Still getting "table not found" error?

1. **Verify SQL ran successfully**

   ```sql
   \d  -- List all tables in Supabase
   ```

2. **Check specific tables**

   ```sql
   SELECT * FROM courses LIMIT 1;
   SELECT * FROM lessons LIMIT 1;
   SELECT * FROM quizzes LIMIT 1;
   ```

3. **Restart sync**
   ```bash
   npm run sync -- --force
   ```

### Getting permission denied error?

Make sure you're using the correct credentials:

- `.env` must have: `SUPABASE_SERVICE_ROLE_KEY` (not the anon key)
- Get from: Supabase Dashboard → Settings → API → Keys

---

## 📊 What Gets Created

After running SUPABASE_SETUP.sql:

### Tables (18 total)

- ✅ users
- ✅ profiles
- ✅ courses
- ✅ lessons
- ✅ sections
- ✅ quizzes
- ✅ enrollments
- ✅ progress
- ✅ quiz_attempts
- ✅ wallets
- ✅ transactions
- ✅ streaks
- ✅ notifications
- ✅ certificates
- ✅ admin_logs
- ✅ roadmap_categories
- ✅ roadmaps
- ✅ (+ more...)

### Sample Data

- 4 courses: HTML, CSS, JavaScript, React
- 5 roadmap categories
- RPC functions for rewards

### Indexes

- 11 performance indexes on key columns

---

## ✅ Verify Everything Works

After sync, test the backend:

```bash
# Test 1: Health check
curl http://localhost:4000/health

# Test 2: Get all courses
curl http://localhost:4000/api/courses

# Test 3: Get specific course
curl http://localhost:4000/api/courses/1
```

Expected responses:

```json
// Health
{"status":"UP","timestamp":"2026-05-12T..."}

// Courses
{
  "success": true,
  "count": 4,
  "data": [
    {
      "id": "...",
      "title": "HTML",
      "status": "Published"
    },
    ...
  ]
}
```

---

## 📁 File Locations

| File                                    | Purpose              |
| --------------------------------------- | -------------------- |
| `SUPABASE_SETUP.sql`                    | Complete SQL schema  |
| `backend/.env`                          | Database credentials |
| `backend/src/scripts/syncToSupabase.js` | Content sync script  |
| `BACKEND_ANALYSIS.md`                   | Full documentation   |

---

## 🎯 Next: Frontend Integration

Once backend sync works:

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
cd frontend
npm run dev

# Terminal 3 (optional - admin)
cd admin
npm run dev
```

Then visit:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Admin: http://localhost:5174

---

**Status:** Backend ready ✅ | Sync ready ✅ | Frontend ready ✅

Generated: May 12, 2026
