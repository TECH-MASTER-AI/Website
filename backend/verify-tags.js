// Verify tags have been added
import('./init/data.js').then(module => {
  const questions = module.default;
  
  console.log('📊 Verification Report\n');
  console.log(`Total questions: ${questions.length}\n`);
  
  // Check sample questions
  console.log('Sample questions with tags:\n');
  console.log('='.repeat(80));
  
  [0, 10, 50, 100, 500, 1000].forEach(i => {
    if (questions[i]) {
      const q = questions[i];
      console.log(`\nID ${q.id}: ${q.title}`);
      console.log(`Topics: ${q.topics.join(', ')}`);
      console.log(`Tags (${q.tags.length}): ${q.tags.join(', ')}`);
      console.log('-'.repeat(80));
    }
  });
  
  // Check if any question is missing tags
  const missingTags = questions.filter(q => !q.tags || q.tags.length === 0);
  console.log(`\n\n❌ Questions missing tags: ${missingTags.length}`);
  
  // Count questions by number of tags
  const tagCounts = {};
  questions.forEach(q => {
    const count = q.tags?.length || 0;
    tagCounts[count] = (tagCounts[count] || 0) + 1;
  });
  
  console.log('\n📈 Distribution of tags per question:');
  Object.keys(tagCounts).sort((a, b) => a - b).forEach(count => {
    console.log(`  ${count} tags: ${tagCounts[count]} questions`);
  });
  
  // Show all unique tags
  const allTags = new Set();
  questions.forEach(q => {
    if (q.tags) {
      q.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  console.log(`\n🏷️  All unique tags (${allTags.size}):`);
  const sortedTags = Array.from(allTags).sort();
  sortedTags.forEach((tag, i) => {
    if (i % 5 === 0) process.stdout.write('\n  ');
    process.stdout.write(tag.padEnd(25));
  });
  console.log('\n');
  
}).catch(err => {
  console.error('Error:', err);
});
