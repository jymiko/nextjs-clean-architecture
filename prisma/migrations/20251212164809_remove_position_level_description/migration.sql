-- Migration to remove level and description from positions table
ALTER TABLE "positions" DROP COLUMN IF EXISTS "level";
ALTER TABLE "positions" DROP COLUMN IF EXISTS "description";
