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

  console.log(`📝 CSV Headers: ${headers.join(', ')}`);
  console.log(`📊 Total lines in CSV: ${lines.length} (including header)`);

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      console.log(`⚠️  Skipping empty line at ${i + 1}`);
      continue;
    }

    const values = parseCSVLine(line);
    if (values.length !== headers.length) {
      console.log(`⚠️  Line ${i + 1} has ${values.length} values but expected ${headers.length}. Skipping.`);
      continue;
    }

    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    
    rows.push(row as CSVRow);
  }
  
  console.log(`✅ Successfully parsed ${rows.length} valid data rows`);
  return rows;
}

function parseDate(dateString: string): Date | null {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    // Handle UTC format: "2017-01-01 00:00:00.000000 UTC"
    const cleanDate = dateString.replace(' UTC', '').replace('.000000', '');
    const date = new Date(cleanDate);
    
    if (isNaN(date.getTime())) {
      console.log(`⚠️  Invalid date format: ${dateString}`);
      return null;
    }
    
    return date;
  } catch (error) {
    console.log(`⚠️  Error parsing date "${dateString}":`, error);
    return null;
  }
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

function parseInt(value: string): number | null {
  if (!value || value.trim() === '') return null;
  
  const cleaned = value.replace(/[^\d]/g, '');
  const parsed = Number(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

async function main() {
  console.log('🌱 Starting database seeding...');
  console.log('🗄️  Current database counts:');
  
  try {
    const currentCounts = await Promise.all([
      prisma.chain.count(),
      prisma.store.count(),
      prisma.entity.count()
    ]);
    
    console.log(`   Chains: ${currentCounts[0]}`);
    console.log(`   Stores: ${currentCounts[1]}`);
    console.log(`   Entities: ${currentCounts[2]}`);
  } catch (error) {
    console.log('⚠️  Could not get current counts:', error);
  }

  try {
    // Read the CSV file
    const csvPath = path.join(__dirname, '../placerAiData.csv');
    console.log(`📂 Reading CSV from: ${csvPath}`);
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at ${csvPath}`);
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const data = parseCSV(csvContent);

    if (data.length === 0) {
      throw new Error('No valid data found in CSV file');
    }

    // Validate required fields
    const validData = data.filter((row, index) => {
      const hasRequiredFields = row.entity_id && row.chain_id; // storeId is now optional
      if (!hasRequiredFields) {
        console.log(`⚠️  Row ${index + 2} missing required fields:`, {
          entity_id: !!row.entity_id,
          chain_id: !!row.chain_id,
          store_id: !!row.store_id
        });
      }
      return hasRequiredFields;
    });

    console.log(`✅ ${validData.length} out of ${data.length} rows have all required fields`);

    // Extract unique chains
    const uniqueChains = new Map<string, { chainId: string; chainName: string }>();
    validData.forEach(row => {
      if (row.chain_id && row.chain_name) {
        uniqueChains.set(row.chain_id, {
          chainId: row.chain_id,
          chainName: row.chain_name
        });
      }
    });

    console.log(`🔗 Found ${uniqueChains.size} unique chains`);

    // Insert chains with better error handling
    let chainCount = 0;
    for (const [chainId, chainData] of uniqueChains) {
      try {
        await prisma.chain.upsert({
          where: { chainId },
          update: {},
          create: {
            chainId: chainData.chainId,
            chainName: chainData.chainName
          }
        });
        chainCount++;
      } catch (error) {
        console.error(`❌ Error creating chain ${chainData.chainName}:`, error);
      }
    }
    console.log(`✅ Processed ${chainCount} chains`);

    // Extract unique stores (only for entities that have store_id)
    const uniqueStores = new Map<string, any>();
    validData.forEach(row => {
      if (row.chain_id && row.store_id) { // Only process entities with store_id
        const storeKey = `${row.chain_id}-${row.store_id}`;
        uniqueStores.set(storeKey, {
          chainId: row.chain_id,
          storeId: row.store_id,
          name: row.name || 'Unknown',
          geolocation: row.geolocation || null,
          country: row.country || 'Unknown',
          stateCode: row.state_code || 'Unknown',
          stateName: row.state_name || 'Unknown',
          city: row.city || 'Unknown',
          postalCode: row.postal_code || null,
          formattedCity: row.formatted_city || null,
          streetAddress: row.street_address || null,
          subCategory: row.sub_category || null,
          dma: row.dma || null,
          cbsa: row.cbsa || null,
          areaSqft: parseInt(row.area_sqft),
          dateOpened: parseDate(row.date_opened),
          dateClosed: parseDate(row.date_closed)
        });
      }
    });

    console.log(`🏪 Found ${uniqueStores.size} unique stores`);

    // Insert stores with better error handling
    let storeCount = 0;
    for (const [storeKey, storeData] of uniqueStores) {
      try {
        await prisma.store.upsert({
          where: {
            chainId_storeId: {
              chainId: storeData.chainId,
              storeId: storeData.storeId
            }
          },
          update: {},
          create: storeData
        });
        storeCount++;
        
        if (storeCount % 100 === 0) {
          console.log(`✅ Processed ${storeCount} stores...`);
        }
      } catch (error) {
        console.error(`❌ Error creating store ${storeData.name} (${storeKey}):`, error);
      }
    }
    console.log(`✅ Processed ${storeCount} stores`);

    // Insert entities with better error handling and validation
    let entityCount = 0;
    let skippedEntities = 0;
    let entitiesWithoutStore = 0;
    
    for (const [index, row] of validData.entries()) {
      try {
        const entityData = {
          entityId: row.entity_id,
          entityType: row.entity_type || 'venue',
          footTraffic: parseNumber(row.foot_traffic) || 0,
          sales: parseNumber(row.sales),
          avgDwellTimeMin: parseNumber(row.avg_dwell_time_min) ? Math.round(parseNumber(row.avg_dwell_time_min)!) : null,
          ftPerSqft: parseNumber(row.ft_per_sqft),
          chainId: row.chain_id,
          storeId: row.store_id || null, // Now optional
          // Additional fields for entities without stores
          name: !row.store_id ? row.name : null,
          city: !row.store_id ? row.city : null,
          stateCode: !row.store_id ? row.state_code : null,
          stateName: !row.store_id ? row.state_name : null,
          subCategory: !row.store_id ? row.sub_category : null,
          dma: !row.store_id ? row.dma : null
        };

        await prisma.entity.upsert({
          where: { entityId: row.entity_id },
          update: {},
          create: entityData
        });
        
        entityCount++;
        
        if (!row.store_id) {
          entitiesWithoutStore++;
        }
        
        if (entityCount % 100 === 0) {
          console.log(`✅ Processed ${entityCount}/${validData.length} entities...`);
        }
        
      } catch (error) {
        skippedEntities++;
        console.error(`❌ Error creating entity ${row.entity_id} (row ${index + 2}):`, error);
        
        // Log the problematic row data for debugging
        if (skippedEntities <= 5) { // Only log first 5 errors to avoid spam
          console.log('   Problematic row data:', {
            entity_id: row.entity_id,
            chain_id: row.chain_id,
            store_id: row.store_id,
            foot_traffic: row.foot_traffic
          });
        }
      }
    }

    console.log(`\n📊 Final Results:`);
    console.log(`   ✅ Entities successfully processed: ${entityCount}`);
    console.log(`   🏪 Entities with store data: ${entityCount - entitiesWithoutStore}`);
    console.log(`   📍 Entities without store data: ${entitiesWithoutStore}`);
    console.log(`   ❌ Entities skipped due to errors: ${skippedEntities}`);
    console.log(`   📄 Total data rows in CSV: ${validData.length}`);
    
    if (skippedEntities > 0) {
      console.log(`\n⚠️  ${skippedEntities} entities were skipped due to errors. Check the logs above for details.`);
    }

    // Final count verification
    try {
      const finalCounts = await Promise.all([
        prisma.chain.count(),
        prisma.store.count(),
        prisma.entity.count()
      ]);
      
      console.log(`\n🗄️  Final database counts:`);
      console.log(`   Chains: ${finalCounts[0]}`);
      console.log(`   Stores: ${finalCounts[1]}`);
      console.log(`   Entities: ${finalCounts[2]}`);
      
      if (finalCounts[2] === validData.length) {
        console.log(`🎉 Perfect! All ${validData.length} entities successfully seeded!`);
      } else {
        console.log(`⚠️  Expected ${validData.length} entities but got ${finalCounts[2]}`);
      }
      
    } catch (error) {
      console.log('⚠️  Could not get final counts:', error);
    }

    console.log('🎉 Database seeding completed!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
