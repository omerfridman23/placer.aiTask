-- DropForeignKey
ALTER TABLE "entities" DROP CONSTRAINT "entities_chain_id_store_id_fkey";

-- AlterTable
ALTER TABLE "entities" ADD COLUMN     "city" TEXT,
ADD COLUMN     "dma" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "state_code" TEXT,
ADD COLUMN     "state_name" TEXT,
ADD COLUMN     "sub_category" TEXT;

-- CreateIndex
CREATE INDEX "entities_store_id_idx" ON "entities"("store_id");
