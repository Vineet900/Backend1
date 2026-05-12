-- DevSchool Pro - Diagnostic Check
-- Run this FIRST to diagnose the problem

-- ==================== DIAGNOSTIC TESTS ====================

-- TEST 1: Can we connect and see any tables?
SELECT COUNT(*) as total_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- TEST 2: Does courses table exist?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'courses'
) as courses_table_exists;

-- TEST 3: Does lessons table exist?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name = 'lessons'
) as lessons_table_exists;

-- TEST 4: List ALL tables that exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ==================== WHAT TO EXPECT ====================
-- TEST 1: Should return a number >= 18
-- TEST 2: Should return TRUE
-- TEST 3: Should return TRUE
-- TEST 4: Should list courses, lessons, quizzes, users, profiles, etc.

-- ==================== IF TABLES DON'T EXIST ====================
-- You MUST run SUPABASE_SETUP.sql first!
-- Instructions:
-- 1. Open Supabase Dashboard
-- 2. Click SQL Editor → New Query
-- 3. Copy ENTIRE SUPABASE_SETUP.sql file
-- 4. Paste into the query editor
-- 5. Click RUN
-- 6. Wait for completion (30-60 seconds)
-- 7. Then run this diagnostic again
