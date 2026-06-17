-- CreateEnum
CREATE TYPE "WebpageRenderMode" AS ENUM (
  'frame',
  'reader',
  'favicon'
);

-- AlterTable
ALTER TABLE "Item"
ADD COLUMN "renderMode" "WebpageRenderMode";
