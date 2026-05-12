# 🔧 Troubleshooting: "Could not find the table 'public.courses'"

## Problem

```
❌ Course error: Could not find the table 'public.courses' in the schema cache
```

## Root Cause

The database tables don't exist or are not accessible. This usually means the SQL setup script hasn't been run successfully.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Tables Exist

1. Open [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Click **SQL Editor**
4. Click **New Query**
5. Copy content from `VERIFY_SETUP.sql`
6. Click **RUN**

**Expected output:**

```
table_name          | column_count
--------------------|-------------
admin_logs          | 4
certificates        | 5
courses             | 9
lessons             | 15
...
(18 rows total)
```

**If NO tables show:**

- The SQL setup hasn't been run yet → Go to Step 2

---

### Step 2: Run Complete Setup

1. Open **SQL Editor** → **New Query**
2. Copy **ENTIRE** content from `SUPABASE_SETUP.sql`
3. Paste into SQL Editor
4. Click **RUN**
5. Wait for green checkmark ✅

**Important:**

- This may take 30-60 seconds
- You'll see multiple queries execute
- Look for "SETUP COMPLETE" at the end
- Don't close or refresh the page

---

### Step 3: Verify Again

Run `VERIFY_SETUP.sql` again to confirm all 18 tables exist.

---

### Step 4: Run Sync

```bash
cd backend
npm run sync
```

**Expected output:**

```
🚀 Starting DevSchool Pro content sync...
📂 [NEW FORMAT] Syncing course: React (9 lessons)
  ✅ Course upserted: React
  ✅ Lesson synced: Understanding JSX
  ...
📂 [OLD FORMAT] Syncing module: HTML
  ✅ Course upserted: HTML
  ✅ Lesson synced: HTML Basics
  ...
✅ All content synced successfully!
```

---

## 🆘 Still Getting Errors?

### Error: "type user_role already exists"

- Delete `DROP TYPE IF EXISTS` lines from SQL?
- **Fix:** Already fixed in the script

### Error: "permission denied"

- Using wrong key (anon instead of service role)
- **Fix:** Check `.env` has `SUPABASE_SERVICE_ROLE_KEY` not `SUPABASE_ANON_KEY`

### Error: "Failed to create connection"

- Wrong Supabase URL
- **Fix:** Get from Supabase Dashboard → Settings → API → Project URL

### Tables exist but sync still fails

- Clear npm cache and reinstall:
  ```bash
  cd backend
  rm -rf node_modules package-lock.json
  npm install
  npm run sync
  ```

---

## 📋 Checklist

- [ ] Opened Supabase Dashboard
- [ ] Selected correct project
- [ ] Ran `SUPABASE_SETUP.sql` completely
- [ ] Waited for green checkmark
- [ ] Ran `VERIFY_SETUP.sql` and saw 18 tables
- [ ] `.env` has correct `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Ran `npm run sync` successfully

---

## 🚀 Success Indicators

After sync completes:

```bash
# Terminal 1
cd backend
npm start

# Terminal 2
curl http://localhost:4000/api/courses
```

Should return:

```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "title": "HTML",
      "status": "Published",
      "author": "DevSchool AI"
    },
    {
      "title": "CSS",
      ...
    },
    ...
  ]
}
```

---

## 📞 Key Files

| File                                    | Purpose                 |
| --------------------------------------- | ----------------------- |
| `SUPABASE_SETUP.sql`                    | Complete database setup |
| `VERIFY_SETUP.sql`                      | Check if setup worked   |
| `backend/.env`                          | Database credentials    |
| `backend/src/scripts/syncToSupabase.js` | Content sync script     |

---

## 🔑 Environment Check

Verify your `.env` file has:

```env
SUPABASE_URL=https://xxx.supabase.co              # ✅ Project URL
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...              # ✅ Service role key (long)
SUPABASE_JWT_SECRET=eyJhbGc...                    # ✅ JWT secret
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173
```

**Get these from:**

- Supabase Dashboard → Settings → API
- Copy exact values (no spaces or extra characters)

---

Generated: May 12, 2026
