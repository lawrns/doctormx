import * as fs from 'fs';
import * as path from 'path';
import { supabase } from './supabase-client';
import { Dentist } from '../../lib/types/dentist';

/**
 * Utility functions for working with scraped dentist data
 */

/**
 * Remove duplicate entries based on phone number or address
 */
export async function removeDuplicates(inputFile: string, outputFile: string): Promise<void> {
  try {
    const dataDir = path.join(__dirname, '../../../data/scraped');
    const inputPath = path.join(dataDir, inputFile);
    const outputPath = path.join(dataDir, outputFile);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      return;
    }
    
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const dentists = JSON.parse(rawData);
    
    console.log(`Processing ${dentists.length} dentists for duplicates...`);
    
    // Track seen phones and addresses
    const seenPhones = new Set<string>();
    const seenAddresses = new Map<string, any>();
    const uniqueDentists = [];
    
    for (const dentist of dentists) {
      let shouldAdd = true;
      
      // Check phone number duplicates (if available)
      if (dentist.phone) {
        // Normalize phone by removing non-digits
        const normalizedPhone = dentist.phone.replace(/\D/g, '');
        if (normalizedPhone.length >= 8 && seenPhones.has(normalizedPhone)) {
          shouldAdd = false;
        } else if (normalizedPhone.length >= 8) {
          seenPhones.add(normalizedPhone);
        }
      }
      
      // Check address duplicates (as fallback)
      if (shouldAdd && dentist.address) {
        // Normalize address by removing spaces and lowercase
        const normalizedAddress = dentist.address.toLowerCase().replace(/\s+/g, '');
        if (normalizedAddress.length >= 10 && seenAddresses.has(normalizedAddress)) {
          const existing = seenAddresses.get(normalizedAddress);
          
          // If the current entry has a phone number but the existing one doesn't,
          // replace the existing one
          if (dentist.phone && !existing.phone) {
            const index = uniqueDentists.indexOf(existing);
            if (index !== -1) {
              uniqueDentists[index] = dentist;
              seenAddresses.set(normalizedAddress, dentist);
            }
          }
          
          shouldAdd = false;
        } else if (normalizedAddress.length >= 10) {
          seenAddresses.set(normalizedAddress, dentist);
        }
      }
      
      if (shouldAdd) {
        uniqueDentists.push(dentist);
      }
    }
    
    console.log(`Reduced to ${uniqueDentists.length} unique dentists`);
    fs.writeFileSync(outputPath, JSON.stringify(uniqueDentists, null, 2), 'utf8');
    console.log(`Saved to ${outputPath}`);
  } catch (error) {
    console.error('Error removing duplicates:', error.message);
  }
}

/**
 * Merge data from multiple sources with priority
 */
export async function mergeData(files: string[], outputFile: string): Promise<void> {
  try {
    const dataDir = path.join(__dirname, '../../../data/scraped');
    const outputPath = path.join(dataDir, outputFile);
    
    let allDentists = [];
    
    // Load all files
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, skipping: ${filePath}`);
        continue;
      }
      
      const rawData = fs.readFileSync(filePath, 'utf8');
      const dentists = JSON.parse(rawData);
      console.log(`Loaded ${dentists.length} dentists from ${file}`);
      
      allDentists = [...allDentists, ...dentists];
    }
    
    console.log(`Total dentists before deduplication: ${allDentists.length}`);
    
    // Identify duplicates and merge data
    const merged = new Map<string, any>();
    
    for (const dentist of allDentists) {
      let key = null;
      
      // Try to identify by phone first
      if (dentist.phone) {
        const normalizedPhone = dentist.phone.replace(/\D/g, '');
        if (normalizedPhone.length >= 8) {
          key = `phone:${normalizedPhone}`;
        }
      }
      
      // Fall back to address if no phone
      if (!key && dentist.address) {
        const normalizedAddress = dentist.address.toLowerCase().replace(/\s+/g, '');
        if (normalizedAddress.length >= 10) {
          key = `addr:${normalizedAddress}`;
        }
      }
      
      // If we can't identify the dentist, generate a random key
      if (!key) {
        key = `random:${Math.random().toString(36).substring(2, 15)}`;
      }
      
      if (merged.has(key)) {
        // Merge with existing entry
        const existing = merged.get(key);
        
        merged.set(key, {
          ...existing,
          // Prioritize non-null values
          clinic_name: existing.clinic_name || dentist.clinic_name,
          address: existing.address || dentist.address,
          phone: existing.phone || dentist.phone,
          website: existing.website || dentist.website,
          email: existing.email || dentist.email,
          // Take the most detailed description
          description: (existing.description && existing.description.length > (dentist.description?.length || 0))
            ? existing.description
            : dentist.description,
          // Prefer verified data
          is_verified: existing.is_verified || dentist.is_verified,
          // Prefer premium status
          is_premium: existing.is_premium || dentist.is_premium,
          // Take review data if available
          has_review: existing.has_review || dentist.has_review,
          review_rating: existing.review_rating || dentist.review_rating,
          review_quote: existing.review_quote || dentist.review_quote,
          review_text: existing.review_text || dentist.review_text,
          review_person: existing.review_person || dentist.review_person,
        });
      } else {
        // Add new entry
        merged.set(key, dentist);
      }
    }
    
    const mergedDentists = Array.from(merged.values());
    console.log(`Total dentists after merging: ${mergedDentists.length}`);
    
    fs.writeFileSync(outputPath, JSON.stringify(mergedDentists, null, 2), 'utf8');
    console.log(`Saved to ${outputPath}`);
  } catch (error) {
    console.error('Error merging data:', error.message);
  }
}

/**
 * Upload merged data to database, handling duplicates
 */
export async function uploadToDatabaseWithDuplicateCheck(inputFile: string): Promise<void> {
  try {
    const dataDir = path.join(__dirname, '../../../data/scraped');
    const inputPath = path.join(dataDir, inputFile);
    
    if (!fs.existsSync(inputPath)) {
      console.error(`Input file not found: ${inputPath}`);
      return;
    }
    
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const dentists = JSON.parse(rawData);
    
    console.log(`Uploading ${dentists.length} dentists to database...`);
    
    // Insert in batches to avoid request size limits
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < dentists.length; i += batchSize) {
      const batch = dentists.slice(i, i + batchSize);
      
      // For each dentist in the batch, check if it already exists in the DB
      for (const dentist of batch) {
        let exists = false;
        
        // Check by phone if available
        if (dentist.phone) {
          const { data: phoneMatches } = await supabase
            .from('dentists')
            .select('id')
            .eq('phone', dentist.phone)
            .limit(1);
            
          if (phoneMatches && phoneMatches.length > 0) {
            exists = true;
            
            // Update the existing record with any new information
            const { error: updateError } = await supabase
              .from('dentists')
              .update({
                clinic_name: dentist.clinic_name || null,
                address: dentist.address || null,
                website: dentist.website || null,
                email: dentist.email || null,
                description: dentist.description || null,
                is_verified: dentist.is_verified || false,
                is_premium: dentist.is_premium || false,
                has_review: dentist.has_review || false,
                review_rating: dentist.review_rating || null,
                review_quote: dentist.review_quote || null,
                review_text: dentist.review_text || null,
                review_person: dentist.review_person || null
              })
              .eq('id', phoneMatches[0].id);
              
            if (updateError) {
              console.error(`Error updating dentist with phone ${dentist.phone}:`, updateError);
              errorCount++;
            } else {
              successCount++;
            }
          }
        }
        
        // If no match by phone, check by address
        if (!exists && dentist.address) {
          const { data: addressMatches } = await supabase
            .from('dentists')
            .select('id')
            .eq('address', dentist.address)
            .limit(1);
            
          if (addressMatches && addressMatches.length > 0) {
            exists = true;
            
            // Update the existing record with any new information
            const { error: updateError } = await supabase
              .from('dentists')
              .update({
                clinic_name: dentist.clinic_name || null,
                phone: dentist.phone || null,
                website: dentist.website || null,
                email: dentist.email || null,
                description: dentist.description || null,
                is_verified: dentist.is_verified || false,
                is_premium: dentist.is_premium || false,
                has_review: dentist.has_review || false,
                review_rating: dentist.review_rating || null,
                review_quote: dentist.review_quote || null,
                review_text: dentist.review_text || null,
                review_person: dentist.review_person || null
              })
              .eq('id', addressMatches[0].id);
              
            if (updateError) {
              console.error(`Error updating dentist with address ${dentist.address}:`, updateError);
              errorCount++;
            } else {
              successCount++;
            }
          }
        }
        
        // If no match found, insert as new record
        if (!exists) {
          const { error: insertError } = await supabase
            .from('dentists')
            .insert({
              clinic_name: dentist.clinic_name,
              address: dentist.address,
              phone: dentist.phone,
              website: dentist.website,
              email: dentist.email,
              description: dentist.description,
              location: dentist.location,
              is_verified: dentist.is_verified || false,
              is_premium: dentist.is_premium || false,
              has_review: dentist.has_review || false,
              review_rating: dentist.review_rating,
              review_quote: dentist.review_quote,
              review_text: dentist.review_text,
              review_person: dentist.review_person
            });
            
          if (insertError) {
            console.error('Error inserting dentist:', insertError);
            errorCount++;
          } else {
            successCount++;
          }
        }
      }
      
      console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dentists.length / batchSize)}`);
      
      // Pause between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`Upload complete: ${successCount} successful, ${errorCount} errors`);
  } catch (error) {
    console.error('Error uploading to database:', error.message);
  }
}
