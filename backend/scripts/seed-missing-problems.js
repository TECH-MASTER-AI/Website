// Seed the 18 missing DSA problems (IDs 1113-1130)
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import dsaProblems from '../init/data.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedMissingProblems() {
  console.log('🚀 Seeding missing DSA problems...\n');
  
  // Filter problems with IDs >= 1113
  const missingProblems = dsaProblems.filter(p => p.id >= 1113);
  
  console.log(`📊 Found ${missingProblems.length} missing problems (IDs 1113-1130)\n`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const problem of missingProblems) {
    try {
      // Prepare problem data for insertion matching dsa_questions schema
      const problemData = {
        id: problem.id,
        title: problem.title,
        slug: problem.slug,
        description: problem.description,
        difficulty: problem.difficulty,
        example_1_input: problem.examples?.[0]?.input || null,
        example_1_output: problem.examples?.[0]?.output || null,
        example_2_input: problem.examples?.[1]?.input || null,
        example_2_output: problem.examples?.[1]?.output || null,
        example_3_input: problem.examples?.[2]?.input || null,
        example_3_output: problem.examples?.[2]?.output || null,
        constraints: problem.constraints?.join('\n') || null,
        topics: problem.topics?.join(', ') || null,
        total_examples: problem.examples?.length || 0
      };

      const { error } = await supabase
        .from('dsa_questions')
        .insert(problemData);
      
      if (error) {
        console.error(`❌ ${problem.slug} (ID: ${problem.id}): ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ ${problem.slug} (ID: ${problem.id})`);
        successCount++;
      }

    } catch (error) {
      console.error(`❌ ${problem.slug} (ID: ${problem.id}): ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seeding completed!');
  console.log(`✅ Successfully inserted: ${successCount} problems`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(60));
}

seedMissingProblems().catch(console.error);
