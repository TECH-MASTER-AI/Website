import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import questionsData from './init/data.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedQuestions() {
  console.log('🌱 Starting to update questions with tags in dsa_questions table...');
  console.log(`📊 Total questions to update: ${questionsData.length}`);

  try {
    // Don't delete - we'll update existing questions
    console.log('✅ Updating existing questions with tags...');

    // Track used slugs to ensure uniqueness
    const usedSlugs = new Set();
    
    // Transform data to match dsa_questions schema
    const transformedData = questionsData.map((q, index) => {
      let slug = q.slug;
      
      // If slug already used, append a number to make it unique
      if (usedSlugs.has(slug)) {
        let counter = 2;
        while (usedSlugs.has(`${slug}-${counter}`)) {
          counter++;
        }
        slug = `${slug}-${counter}`;
        console.log(`⚠️  Duplicate slug detected: ${q.slug} -> ${slug}`);
      }
      
      usedSlugs.add(slug);
      
      return {
        id: index + 1,
        slug: slug,
        tags: q.tags?.join(', ') || null // Only tags field for update
      };
    });

    // Update questions in batches using UPSERT
    const batchSize = 50;
    let updated = 0;

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('dsa_questions')
        .upsert(batch, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`❌ Error updating batch ${i / batchSize + 1}:`, error);
      } else {
        updated += batch.length;
        console.log(`✅ Updated batch ${i / batchSize + 1} (${updated}/${transformedData.length})`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} questions with tags!`);
    
    // Verify the data
    const { count, error: countError } = await supabase
      .from('dsa_questions')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`📈 Total questions in database: ${count}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedQuestions();
