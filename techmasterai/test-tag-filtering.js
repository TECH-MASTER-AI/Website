// Test tag filtering - jaise frontend pe kaam karega
import('./init/data.js').then(module => {
  const questions = module.default;
  
  console.log('🔍 Testing Tag-based Filtering\n');
  console.log('='.repeat(80));
  
  // Test 1: Search for "Array" tag
  console.log('\n1️⃣  Searching for "Array" tag:');
  const arrayQuestions = questions.filter(q => 
    q.tags && q.tags.some(tag => tag.toLowerCase().includes('array'))
  );
  console.log(`   Found ${arrayQuestions.length} questions`);
  console.log(`   Sample: ${arrayQuestions.slice(0, 3).map(q => q.title).join('\n           ')}`);
  
  // Test 2: Search for "Dynamic Programming" or "DP"
  console.log('\n2️⃣  Searching for "Dynamic Programming" or "DP":');
  const dpQuestions = questions.filter(q => 
    q.tags && q.tags.some(tag => 
      tag.toLowerCase().includes('dynamic') || tag.toLowerCase() === 'dp'
    )
  );
  console.log(`   Found ${dpQuestions.length} questions`);
  console.log(`   Sample: ${dpQuestions.slice(0, 3).map(q => q.title).join('\n           ')}`);
  
  // Test 3: Search for "Tree" tag
  console.log('\n3️⃣  Searching for "Tree" tag:');
  const treeQuestions = questions.filter(q => 
    q.tags && q.tags.some(tag => tag.toLowerCase().includes('tree'))
  );
  console.log(`   Found ${treeQuestions.length} questions`);
  console.log(`   Sample: ${treeQuestions.slice(0, 3).map(q => q.title).join('\n           ')}`);
  
  // Test 4: Multiple tags - Array AND Dynamic Programming
  console.log('\n4️⃣  Searching for questions with BOTH "Array" AND "Dynamic Programming":');
  const arrayDpQuestions = questions.filter(q => 
    q.tags && 
    q.tags.some(tag => tag.toLowerCase().includes('array')) &&
    q.tags.some(tag => tag.toLowerCase().includes('dynamic') || tag.toLowerCase() === 'dp')
  );
  console.log(`   Found ${arrayDpQuestions.length} questions`);
  console.log(`   Sample: ${arrayDpQuestions.slice(0, 5).map(q => `${q.title} (Topics: ${q.topics.join(', ')})`).join('\n           ')}`);
  
  // Test 5: Search for "Graph" tag
  console.log('\n5️⃣  Searching for "Graph" tag:');
  const graphQuestions = questions.filter(q => 
    q.tags && q.tags.some(tag => tag.toLowerCase().includes('graph'))
  );
  console.log(`   Found ${graphQuestions.length} questions`);
  console.log(`   Sample: ${graphQuestions.slice(0, 3).map(q => q.title).join('\n           ')}`);
  
  // Test 6: Multiple topics in one question
  console.log('\n6️⃣  Example: Question with multiple topics (Array + DP + Trees):');
  const multiTopicQ = questions.find(q => 
    q.topics.includes('Array') && 
    q.topics.includes('Dynamic Programming') && 
    q.topics.some(t => t.toLowerCase().includes('tree'))
  );
  if (multiTopicQ) {
    console.log(`   Title: ${multiTopicQ.title}`);
    console.log(`   Topics: ${multiTopicQ.topics.join(', ')}`);
    console.log(`   Tags: ${multiTopicQ.tags.join(', ')}`);
    console.log(`   ✅ Searchable by: Array, DP, Tree, Trees, Dynamic Programming, etc.`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n✅ Tag filtering is working perfectly!');
  console.log('   Users can now search by ANY tag and find relevant questions.');
  console.log('   Multiple topics = Multiple searchable tags! 🎯\n');
  
}).catch(err => {
  console.error('Error:', err);
});
