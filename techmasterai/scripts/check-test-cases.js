// Check what test cases look like in the database
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTestCases() {
  console.log('🔍 Checking test cases in database...\n');
  
  // Get a sample problem
  const { data: problem } = await supabase
    .from('dsa_questions')
    .select('id, slug, title')
    .eq('slug', 'find-pair-with-given-sum')
    .single();
  
  if (!problem) {
    console.log('❌ Problem not found');
    return;
  }
  
  console.log(`📝 Problem: ${problem.title} (ID: ${problem.id})\n`);
  
  // Get test cases for this problem
  const { data: testCases } = await supabase
    .from('dsa_test_cases')
    .select('*')
    .eq('question_id', problem.id)
    .order('id', { ascending: true });
  
  if (!testCases || testCases.length === 0) {
    console.log('❌ No test cases found');
    return;
  }
  
  console.log(`📊 Total test cases: ${testCases.length}\n`);
  
  // Show visible test cases
  const visibleCases = testCases.filter(tc => !tc.is_hidden);
  console.log(`👁️  VISIBLE TEST CASES (${visibleCases.length}):`);
  console.log('='.repeat(80));
  visibleCases.forEach((tc, i) => {
    console.log(`\nTest Case ${i + 1}:`);
    console.log(`  Input: ${JSON.stringify(tc.input_data)}`);
    console.log(`  Expected Output: ${JSON.stringify(tc.expected_output)}`);
    console.log(`  Description: ${tc.description}`);
  });
  
  // Show hidden test cases summary
  const hiddenCases = testCases.filter(tc => tc.is_hidden);
  console.log(`\n\n🔒 HIDDEN TEST CASES (${hiddenCases.length}):`);
  console.log('='.repeat(80));
  console.log(`  Edge cases: ${hiddenCases.filter(tc => tc.category === 'edge').length}`);
  console.log(`  Performance tests: ${hiddenCases.filter(tc => tc.category === 'performance').length}`);
  console.log(`  Stress tests: ${hiddenCases.filter(tc => tc.category === 'stress').length}`);
  
  // Show first 3 hidden test cases as examples
  console.log(`\n  Sample hidden test cases:`);
  hiddenCases.slice(0, 3).forEach((tc, i) => {
    console.log(`\n  Hidden Test ${i + 1}:`);
    console.log(`    Input: ${JSON.stringify(tc.input_data)}`);
    console.log(`    Expected Output: ${tc.expected_output === null ? 'NULL (to be validated)' : JSON.stringify(tc.expected_output)}`);
    console.log(`    Category: ${tc.category}`);
    console.log(`    Description: ${tc.description}`);
  });
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ The 3 visible test cases are LEGIT (from problem examples)');
  console.log('⚠️  The 77 hidden test cases are PLACEHOLDERS (expected_output = null)');
  console.log('💡 Hidden test cases need actual input/output pairs to be useful\n');
}

checkTestCases().catch(console.error);
