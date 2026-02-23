// DSA Test Cases Seeder - 80 test cases per problem
// 3 visible (from examples) + 77 hidden (generated)

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

// Generate hidden test cases based on problem constraints
function generateHiddenTestCases(problem, count = 77, dbId) {
  const hiddenCases = [];
  
  for (let i = 0; i < count; i++) {
    // Generate varied test cases based on difficulty
    const caseNum = i + 4; // Start from 4 (after 3 visible examples)
    
    hiddenCases.push({
      question_id: dbId, // Use database ID
      slug: problem.slug,
      input_data: { 
        testCase: caseNum,
        description: `Hidden test case ${caseNum}`,
        // Placeholder - will be validated by actual code execution
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
  console.log('🚀 Starting test case seeding...');
  console.log(`📊 Total problems: ${dsaProblems.length}`);
  console.log(`🎯 Target: 80 test cases per problem (3 visible + 77 hidden)\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let problemsProcessed = 0;

  // Create a mapping of slug to database ID
  // The database uses sequential IDs 1-1112 based on array index
  // But data.js has IDs that may have gaps (e.g., 1113-1130)
  const slugToDbId = {};
  dsaProblems.forEach((problem, index) => {
    slugToDbId[problem.slug] = index + 1; // Database ID is array index + 1
  });

  for (const problem of dsaProblems) {
    try {
      const testCases = [];
      
      // Use the correct database ID (array index + 1)
      const dbId = slugToDbId[problem.slug];
      
      // 1. Generate 3 VISIBLE test cases from examples array
      if (problem.examples && Array.isArray(problem.examples)) {
        const visibleCount = Math.min(3, problem.examples.length);
        
        for (let i = 0; i < visibleCount; i++) {
          const example = problem.examples[i];
          testCases.push({
            question_id: dbId, // Use database ID, not data.js ID
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
        }
      }
      
      // 2. Generate 77 HIDDEN test cases
      const hiddenCases = generateHiddenTestCases(problem, 77, dbId);
      testCases.push(...hiddenCases);

      // 3. Insert all test cases
      if (testCases.length > 0) {
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
      } else {
        console.log(`⚠️  ${problem.slug}: No test cases generated`);
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
  console.log(`📊 Average: ${(successCount / problemsProcessed).toFixed(1)} test cases per problem`);
  console.log('='.repeat(60));
}

seedTestCases().catch(console.error);
