// Script to ONLY update tags column in existing questions
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import questionsData from './init/data.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTagsOnly() {
  console.log('🏷️  Starting to update ONLY tags column...');
  console.log(`📊 Total questions to update: ${questionsData.length}\n`);

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < questionsData.length; i++) {
    const q = questionsData[i];
    const tags = q.tags?.join(', ') || null;
    
    // Update only the tags column for this question ID
    const { error } = await supabase
      .from('dsa_questions')
      .update({ tags: tags })
      .eq('id', i + 1);

    if (error) {
      console.error(`❌ Error updating question ${i + 1}:`, error.message);
      errors++;
    } else {
      updated++;
      if ((i + 1) % 100 === 0) {
        console.log(`✅ Updated ${i + 1}/${questionsData.length} questions...`);
      }
    }
  }

  console.log(`\n🎉 Update complete!`);
  console.log(`✅ Successfully updated: ${updated} questions`);
  console.log(`❌ Errors: ${errors} questions`);
  
  // Verify
  const { data, error } = await supabase
    .from('dsa_questions')
    .select('id, title, tags')
    .not('tags', 'is', null)
    .limit(5);

  if (!error && data) {
    console.log(`\n📋 Sample questions with tags:`);
    data.forEach(q => {
      console.log(`  ${q.id}. ${q.title}`);
      console.log(`     Tags: ${q.tags}\n`);
    });
  }
}

updateTagsOnly().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
