/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
  entity_id: string;
  entity_type: string;
  name: string;
  foot_traffic: string;
  sales: string;
  avg_dwell_time_min: string;
  area_sqft: string;
  ft_per_sqft: string;
  geolocation: string;
  country: string;
  state_code: string;
  state_name: string;
  city: string;
  postal_code: string;
  formatted_city: string;
  street_address: string;
  sub_category: string;
  dma: string;
  cbsa: string;
  chain_id: string;
  chain_name: string;
  store_id: string;
  date_opened: string;
  date_closed: string;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(csvContent: string): CSVRow[] {
  const lines = csvContent.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    rows.push(row as CSVRow);
  }
  
  return rows;
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../placerAiData.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const data = parseCSV(csvContent);

    console.log(`📊 Found ${data.length} records in CSV file`);

    // Extract unique chains - mapping CSV fields to Chain model
    const uniqueChains = new Map<string, { chainId: string; chainName: string }>();
    data.forEach(row => {
      if (row.chain_id && row.chain_name) {
        uniqueChains.set(row.chain_id, {
          chainId: row.chain_id,
          chainName: row.chain_name
        });
      }
    });

    console.log(`🔗 Found ${uniqueChains.size} unique chains`);

    // Insert chains
    for (const [chainId, chainData] of uniqueChains) {
      try {
        await (prisma as any).chain.upsert({
          where: { chainId },
          update: {},
          create: {
            chainId: chainData.chainId,
            chainName: chainData.chainName
          }
        });
        console.log(`✅ Created/Found chain: ${chainData.chainName}`);
      } catch (error) {
        console.error(`❌ Error creating chain ${chainData.chainName}:`, error);
      }
    }

    // Extract unique stores - mapping CSV fields to Store model
    const uniqueStores = new Map<string, any>();
    data.forEach(row => {
      if (row.chain_id && row.store_id) {
        const storeKey = `${row.chain_id}-${row.store_id}`;
        uniqueStores.set(storeKey, {
          chainId: row.chain_id,
          storeId: row.store_id,
          name: row.name,
          geolocation: row.geolocation || null,
          country: row.country,
          stateCode: row.state_code,
          stateName: row.state_name,
          city: row.city,
          postalCode: row.postal_code || null,
          formattedCity: row.formatted_city || null,
          streetAddress: row.street_address || null,
          subCategory: row.sub_category || null,
          dma: row.dma || null,
          cbsa: row.cbsa || null,
          areaSqft: row.area_sqft ? parseInt(row.area_sqft.replace(/[^\d]/g, '')) : null,
          dateOpened: row.date_opened ? new Date(row.date_opened) : null,
          dateClosed: row.date_closed ? new Date(row.date_closed) : null
        });
      }
    });

    console.log(`🏪 Found ${uniqueStores.size} unique stores`);

    // Insert stores
    for (const [storeKey, storeData] of uniqueStores) {
      try {
        await (prisma as any).store.upsert({
          where: {
            chainId_storeId: {
              chainId: storeData.chainId,
              storeId: storeData.storeId
            }
          },
          update: {},
          create: storeData
        });
        console.log(`✅ Created/Found store: ${storeData.name} (${storeData.storeId})`);
      } catch (error) {
        console.error(`❌ Error creating store ${storeData.name}:`, error);
      }
    }

    // Insert entities - mapping CSV fields to Entity model
    let entityCount = 0;
    for (const row of data) {
      if (!row.entity_id || !row.chain_id || !row.store_id) continue;

      try {
        await (prisma as any).entity.upsert({
          where: { entityId: row.entity_id },
          update: {},
          create: {
            entityId: row.entity_id,
            entityType: row.entity_type,
            footTraffic: parseInt(row.foot_traffic) || 0,
            sales: row.sales ? parseFloat(row.sales.replace(/[^\d.-]/g, '')) : null,
            avgDwellTimeMin: row.avg_dwell_time_min ? Math.round(parseFloat(row.avg_dwell_time_min)) : null,
            ftPerSqft: row.ft_per_sqft ? parseFloat(row.ft_per_sqft) : null,
            chainId: row.chain_id,
            storeId: row.store_id
          }
        });
        entityCount++;
        
        if (entityCount % 100 === 0) {
          console.log(`✅ Processed ${entityCount} entities...`);
        }
      } catch (error) {
        console.error(`❌ Error creating entity ${row.entity_id}:`, error);
      }
    }

    console.log(`✅ Created/Found ${entityCount} entities`);
    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Error reading CSV file:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
