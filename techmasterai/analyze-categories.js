// Script to analyze all categories/topics in DSA problems
import fs from 'fs';
import path from 'path';

// Read the data.js file
const dataPath = './init/data.js';
const content = fs.readFileSync(dataPath, 'utf8');

// Extract all topics arrays using regex
const topicsRegex = /"topics":\s*\[([^\]]+)\]/g;
const allTopics = new Set();
const topicCounts = new Map();
const problemsByTopic = new Map();

let match;
let problemCount = 0;

// Extract problem titles and their topics
const problemRegex = /"id":\s*(\d+),[\s\S]*?"title":\s*"([^"]+)"[\s\S]*?"topics":\s*\[([^\]]+)\]/g;

let problemMatch;
while ((problemMatch = problemRegex.exec(content)) !== null) {
  const id = problemMatch[1];
  const title = problemMatch[2];
  const topicsStr = problemMatch[3];
  
  // Parse topics
  const topics = topicsStr.split(',').map(t => t.trim().replace(/"/g, ''));
  
  topics.forEach(topic => {
    allTopics.add(topic);
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    
    if (!problemsByTopic.has(topic)) {
      problemsByTopic.set(topic, []);
    }
    problemsByTopic.get(topic).push({ id, title });
  });
  
  problemCount++;
}

// Sort topics by frequency
const sortedTopics = Array.from(topicCounts.entries())
  .sort((a, b) => b[1] - a[1]);

console.log(`\n📊 DSA PROBLEMS ANALYSIS`);
console.log(`========================`);
console.log(`Total Problems: ${problemCount}`);
console.log(`Total Unique Topics: ${allTopics.size}`);

console.log(`\n🏷️  ALL CATEGORIES/TOPICS (sorted by frequency):`);
console.log(`================================================`);

sortedTopics.forEach(([topic, count], index) => {
  const percentage = ((count / problemCount) * 100).toFixed(1);
  console.log(`${index + 1}. ${topic} - ${count} problems (${percentage}%)`);
});

console.log(`\n📋 DETAILED BREAKDOWN:`);
console.log(`=====================`);

// Group by major categories
const majorCategories = {
  'Data Structures': ['Array', 'String', 'Linked List', 'Stack', 'Queue', 'Tree', 'Binary Tree', 'Binary Search Tree', 'Heap', 'Hash Table', 'Graph', 'Trie', 'Matrix'],
  'Algorithms': ['Sorting', 'Searching', 'Binary Search', 'Two Pointers', 'Sliding Window', 'Greedy', 'Divide and Conquer', 'Backtracking', 'Recursion'],
  'Advanced Techniques': ['Dynamic Programming', 'Graph Algorithms', 'Tree Algorithms', 'String Algorithms', 'Bit Manipulation', 'Math', 'Geometry'],
  'Problem Types': ['Prefix Sum', 'Suffix Array', 'Union Find', 'Topological Sort', 'Shortest Path', 'Minimum Spanning Tree', 'Network Flow'],
  'Design & Implementation': ['Design', 'Simulation', 'Implementation', 'Data Stream', 'Iterator', 'Randomization'],
  'Specialized': ['Database', 'Concurrency', 'System Design', 'Interactive', 'Brainteaser', 'Shell', 'Probability and Statistics']
};

Object.entries(majorCategories).forEach(([category, topics]) => {
  console.log(`\n${category}:`);
  topics.forEach(topic => {
    const count = topicCounts.get(topic) || 0;
    if (count > 0) {
      console.log(`  - ${topic}: ${count} problems`);
    }
  });
});

// Find topics not in major categories
const allMajorTopics = new Set(Object.values(majorCategories).flat());
const uncategorized = Array.from(allTopics).filter(topic => !allMajorTopics.has(topic));

if (uncategorized.length > 0) {
  console.log(`\n🔍 Other Topics:`);
  uncategorized.forEach(topic => {
    const count = topicCounts.get(topic) || 0;
    console.log(`  - ${topic}: ${count} problems`);
  });
}