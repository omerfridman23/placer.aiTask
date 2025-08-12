/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "chains" (
    "chain_id" TEXT NOT NULL,
    "chain_name" TEXT NOT NULL,

    CONSTRAINT "chains_pkey" PRIMARY KEY ("chain_id")
);

-- CreateTable
CREATE TABLE "stores" (
    "chain_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "geolocation" TEXT,
    "country" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postal_code" TEXT,
    "formatted_city" TEXT,
    "street_address" TEXT,
    "sub_category" TEXT,
    "dma" TEXT,
    "cbsa" TEXT,
    "area_sqft" INTEGER,
    "date_opened" TIMESTAMP(3),
    "date_closed" TIMESTAMP(3),

    CONSTRAINT "stores_pkey" PRIMARY KEY ("chain_id","store_id")
);

-- CreateTable
CREATE TABLE "entities" (
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "foot_traffic" INTEGER NOT NULL,
    "sales" DECIMAL(18,2),
    "avg_dwell_time_min" INTEGER,
    "ft_per_sqft" DECIMAL(18,4),
    "chain_id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,

    CONSTRAINT "entities_pkey" PRIMARY KEY ("entity_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chains_chain_name_key" ON "chains"("chain_name");

-- CreateIndex
CREATE INDEX "chains_chain_name_idx" ON "chains"("chain_name");

-- CreateIndex
CREATE INDEX "stores_sub_category_idx" ON "stores"("sub_category");

-- CreateIndex
CREATE INDEX "stores_dma_idx" ON "stores"("dma");

-- CreateIndex
CREATE INDEX "stores_state_code_city_idx" ON "stores"("state_code", "city");

-- CreateIndex
CREATE INDEX "stores_date_closed_idx" ON "stores"("date_closed");

-- CreateIndex
CREATE INDEX "entities_chain_id_idx" ON "entities"("chain_id");

-- AddForeignKey
ALTER TABLE "stores" ADD CONSTRAINT "stores_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("chain_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_chain_id_store_id_fkey" FOREIGN KEY ("chain_id", "store_id") REFERENCES "stores"("chain_id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;
