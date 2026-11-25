-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high');

-- AlterTable
ALTER TABLE "todos" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'medium';
