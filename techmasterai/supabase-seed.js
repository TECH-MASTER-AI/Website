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
  console.log('🌱 Starting to seed questions to dsa_questions table...');
  console.log(`📊 Total questions to insert: ${questionsData.length}`);

  try {
    // Delete existing questions
    console.log('⚠️  Deleting all existing questions...');
    const { error: deleteError } = await supabase
      .from('dsa_questions')
      .delete()
      .neq('id', 0); // Delete all rows

    if (deleteError) {
      console.error('❌ Error deleting existing questions:', deleteError);
    } else {
      console.log('🗑️  All questions deleted');
    }

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
        title: q.title,
        slug: slug,
        description: q.description,
        difficulty: q.difficulty,
        example_1_input: q.examples?.[0]?.input || null,
        example_1_output: q.examples?.[0]?.output || null,
        example_2_input: q.examples?.[1]?.input || null,
        example_2_output: q.examples?.[1]?.output || null,
        example_3_input: q.examples?.[2]?.input || null,
        example_3_output: q.examples?.[2]?.output || null,
        constraints: q.constraints?.join('\n') || null,
        topics: q.topics?.join(', ') || null,
        total_examples: q.examples?.length || 0
      };
    });

    // Insert questions in batches
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < transformedData.length; i += batchSize) {
      const batch = transformedData.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('dsa_questions')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        inserted += batch.length;
        console.log(`✅ Inserted batch ${i / batchSize + 1} (${inserted}/${transformedData.length})`);
      }
    }

    console.log(`\n🎉 Successfully seeded ${inserted} questions!`);
    
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
