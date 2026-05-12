-- DevSchool Pro - Verify Supabase Setup
-- Run this in Supabase SQL Editor to check if tables are created

-- ==================== CHECK TABLES ====================
SELECT 
  table_name,
  (SELECT count(*) FROM information_schema.columns 
   WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ==================== EXPECTED OUTPUT ====================
-- Should show 18 tables:
-- admin_logs, certificates, courses, enrollments, lessons, 
-- notifications, progress, profiles, quiz_attempts, quizzes,
-- roadmap_categories, roadmaps, sections, streaks, 
-- transactions, users, wallets, etc.

-- ==================== CHECK SPECIFIC TABLE ====================
SELECT COUNT(*) as courses_count FROM courses;
SELECT COUNT(*) as lessons_count FROM lessons;
SELECT COUNT(*) as quizzes_count FROM quizzes;

-- If all show as tables exist, then run: npm run sync
