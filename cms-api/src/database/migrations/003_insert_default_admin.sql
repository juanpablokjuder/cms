-- Migration: 003_insert_default_admin
-- Purpose: Insert a default admin user for initial setup.
-- Credentials:
--   email   : admin@cms.com
--   password: Admin123!   ← CHANGE THIS via PATCH /api/v1/users/:uuid after first login
-- INSERT IGNORE prevents failure if the migration runs more than once.

INSERT IGNORE INTO users (uuid, name, email, password_hash, role, is_active)
VALUES (
  'db517653-3aa3-4b8f-9657-eb87cb55b37b',
  'Admin',
  'admin@cms.com',
  '$2a$12$hiIv99lSsNs33Z2B2HGUZevunTPFCRPHDeEMFH.92ADTXuZAnnaKy',
  'admin',
  1
);
