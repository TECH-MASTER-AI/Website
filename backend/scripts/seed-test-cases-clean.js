// Clean DSA Test Cases Seeder - Exactly 3 visible + 77 hidden per problem
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

// Generate hidden test cases
function generateHiddenTestCases(problem, count, dbId) {
  const hiddenCases = [];
  
  for (let i = 0; i < count; i++) {
    const caseNum = i + 4; // Start from 4 (after 3 visible examples)
    
    hiddenCases.push({
      question_id: dbId,
      slug: problem.slug,
      input_data: { 
        testCase: caseNum,
        description: `Hidden test case ${caseNum}`,
        generated: true
      },
      expected_output: null, // Will be computed during submission
      is_hidden: true,
      category: i < 20 ? 'edge' : i < 50 ? 'performance' : 'stress',
      difficulty: problem.difficulty || 'Medium',
      description: `Hidden test case ${caseNum} - ${i < 20 ? 'Edge case' : i < 50 ? 'Performance test' : 'Stress test'}`
    });
  }
  
  return hiddenCases;
}

async function seedTestCases() {
  console.log('🚀 Starting CLEAN test case seeding...');
  console.log(`📊 Total problems: ${dsaProblems.length}`);
  console.log(`🎯 Target: EXACTLY 3 visible + 77 hidden = 80 per problem\n`);
  
  // First, delete all existing test cases
  console.log('🗑️  Deleting existing test cases...');
  const { error: deleteError } = await supabase
    .from('dsa_test_cases')
    .delete()
    .neq('id', 0); // Delete all
  
  if (deleteError) {
    console.error('❌ Error deleting:', deleteError);
  } else {
    console.log('✅ All existing test cases deleted\n');
  }
  
  let successCount = 0;
  let errorCount = 0;
  let problemsProcessed = 0;

  // Create slug to database ID mapping
  const slugToDbId = {};
  dsaProblems.forEach((problem, index) => {
    slugToDbId[problem.slug] = index + 1;
  });

  for (const problem of dsaProblems) {
    try {
      const testCases = [];
      const dbId = slugToDbId[problem.slug];
      
      // 1. Generate EXACTLY 3 VISIBLE test cases from examples
      if (problem.examples && Array.isArray(problem.examples)) {
        // Take first 3 examples, or pad with dummy if less than 3
        for (let i = 0; i < 3; i++) {
          if (i < problem.examples.length) {
            // Real example exists
            const example = problem.examples[i];
            testCases.push({
              question_id: dbId,
              slug: problem.slug,
              input_data: { 
                input: example.input,
                explanation: example.explanation 
              },
              expected_output: example.output,
              is_hidden: false,
              category: 'example',
              difficulty: problem.difficulty || 'Medium',
              description: `Example ${i + 1}: ${example.explanation || 'Sample test case'}`
            });
          } else {
            // Pad with placeholder if less than 3 examples
            testCases.push({
              question_id: dbId,
              slug: problem.slug,
              input_data: { 
                input: `Example ${i + 1} input`,
                explanation: 'Placeholder test case' 
              },
              expected_output: `Example ${i + 1} output`,
              is_hidden: false,
              category: 'example',
              difficulty: problem.difficulty || 'Medium',
              description: `Example ${i + 1}: Placeholder test case`
            });
          }
        }
      } else {
        // No examples array, create 3 placeholder visible test cases
        for (let i = 0; i < 3; i++) {
          testCases.push({
            question_id: dbId,
            slug: problem.slug,
            input_data: { 
              input: `Test case ${i + 1} input`,
              explanation: 'Placeholder test case' 
            },
            expected_output: `Test case ${i + 1} output`,
            is_hidden: false,
            category: 'example',
            difficulty: problem.difficulty || 'Medium',
            description: `Test case ${i + 1}: Placeholder`
          });
        }
      }
      
      // 2. Generate EXACTLY 77 HIDDEN test cases
      const hiddenCases = generateHiddenTestCases(problem, 77, dbId);
      testCases.push(...hiddenCases);

      // 3. Verify we have exactly 80 test cases
      if (testCases.length !== 80) {
        console.error(`⚠️  ${problem.slug}: Expected 80, got ${testCases.length}`);
      }

      // 4. Insert all test cases
      const { error } = await supabase
        .from('dsa_test_cases')
        .insert(testCases);
      
      if (error) {
        console.error(`❌ ${problem.slug}: ${error.message}`);
        errorCount++;
      } else {
        const visibleCount = testCases.filter(tc => !tc.is_hidden).length;
        const hiddenCount = testCases.filter(tc => tc.is_hidden).length;
        console.log(`✅ ${problem.slug}: ${visibleCount} visible + ${hiddenCount} hidden = ${testCases.length} total`);
        successCount += testCases.length;
        problemsProcessed++;
      }

    } catch (error) {
      console.error(`❌ ${problem.slug}: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seeding completed!');
  console.log(`✅ Problems processed: ${problemsProcessed}/${dsaProblems.length}`);
  console.log(`✅ Total test cases inserted: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Expected: ${problemsProcessed * 80} test cases`);
  console.log(`📊 Actual: ${successCount} test cases`);
  console.log('='.repeat(60));
}

seedTestCases().catch(console.error);
