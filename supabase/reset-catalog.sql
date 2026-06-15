-- Wipes the catalog (opportunities, courses, lessons) so you can re-run seed.sql
-- exactly once. Use this if seed.sql was run more than once and rows are duplicated.
-- Student data referencing courses/lessons (enrollments, progress, certificates)
-- is cascaded away too — safe on a fresh project, not for one with real users.

truncate table lessons, courses, opportunities restart identity cascade;

-- Now run supabase/seed.sql once.
