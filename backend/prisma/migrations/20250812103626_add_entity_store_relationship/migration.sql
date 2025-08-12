-- AddForeignKey
ALTER TABLE "entities" ADD CONSTRAINT "entities_chain_id_store_id_fkey" FOREIGN KEY ("chain_id", "store_id") REFERENCES "stores"("chain_id", "store_id") ON DELETE RESTRICT ON UPDATE CASCADE;
