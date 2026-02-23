// Check visible test cases in database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVisibleTestCases() {
  console.log('🔍 Checking visible test cases in database...\n');
  
  // Get total count
  const { count: totalCount } = await supabase
    .from('dsa_test_cases')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total test cases in database: ${totalCount}\n`);
  
  // Get visible test cases count
  const { count: visibleCount } = await supabase
    .from('dsa_test_cases')
    .select('*', { count: 'exact', head: true })
    .eq('is_hidden', false);
  
  console.log(`👁️  Visible test cases (is_hidden = false): ${visibleCount}\n`);
  
  // Get hidden test cases count
  const { count: hiddenCount } = await supabase
    .from('dsa_test_cases')
    .select('*', { count: 'exact', head: true })
    .eq('is_hidden', true);
  
  console.log(`🔒 Hidden test cases (is_hidden = true): ${hiddenCount}\n`);
  
  // Sample 5 random problems and show their test case breakdown
  console.log('📋 Sample breakdown for 5 random problems:\n');
  
  const { data: sampleProblems } = await supabase
    .from('dsa_questions')
    .select('id, slug, title')
    .limit(5);
  
  for (const problem of sampleProblems) {
    const { data: testCases } = await supabase
      .from('dsa_test_cases')
      .select('id, is_hidden, category, input_data, expected_output')
      .eq('question_id', problem.id)
      .order('id', { ascending: true });
    
    const visible = testCases.filter(tc => !tc.is_hidden);
    const hidden = testCases.filter(tc => tc.is_hidden);
    
    console.log(`\n${problem.id}. ${problem.title} (${problem.slug})`);
    console.log(`   Total: ${testCases.length} | Visible: ${visible.length} | Hidden: ${hidden.length}`);
    
    // Show visible test cases
    console.log(`   Visible test cases:`);
    visible.forEach((tc, idx) => {
      const hasOutput = tc.expected_output !== null && tc.expected_output !== undefined;
      console.log(`      ${idx + 1}. Category: ${tc.category}, Has Output: ${hasOutput ? '✅' : '❌'}`);
      if (hasOutput) {
        const outputStr = typeof tc.expected_output === 'object' 
          ? JSON.stringify(tc.expected_output).substring(0, 50) 
          : String(tc.expected_output).substring(0, 50);
        console.log(`         Output: ${outputStr}...`);
      }
    });
    
    // Check if hidden test cases have expected_output
    const hiddenWithOutput = hidden.filter(tc => tc.expected_output !== null);
    console.log(`   Hidden test cases with output: ${hiddenWithOutput.length}/${hidden.length}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`Total test cases: ${totalCount}`);
  console.log(`Visible (should show on screen): ${visibleCount}`);
  console.log(`Hidden (for submission): ${hiddenCount}`);
  console.log(`Expected visible per problem: 3`);
  console.log(`Expected hidden per problem: 77`);
  console.log('='.repeat(60));
}

checkVisibleTestCases().catch(console.error);
