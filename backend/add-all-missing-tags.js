// Comprehensive script to add/update tags for ALL questions based on topics
import fs from 'fs';

console.log('🔄 Starting comprehensive tag update...\n');

// Import the questions
import('./init/data.js').then(module => {
  const questions = module.default;
  
  console.log(`📊 Total questions found: ${questions.length}\n`);
  
  // Topic to Tags mapping - comprehensive mapping
  const topicToTags = {
    // Data Structures
    'Array': ['Array', 'Arrays'],
    'String': ['String', 'Strings'],
    'Linked List': ['Linked List', 'LinkedList'],
    'Stack': ['Stack'],
    'Queue': ['Queue'],
    'Tree': ['Tree', 'Trees'],
    'Binary Tree': ['Binary Tree', 'Tree', 'Trees'],
    'Binary Search Tree': ['BST', 'Binary Search Tree', 'Tree', 'Trees'],
    'Heap': ['Heap', 'Priority Queue'],
    'Hash Table': ['Hash Table', 'Hashing', 'HashMap'],
    'Graph': ['Graph', 'Graphs'],
    'Trie': ['Trie'],
    'Matrix': ['Matrix', '2D Array'],
    
    // Algorithms
    'Sorting': ['Sorting', 'Sort'],
    'Searching': ['Searching', 'Search'],
    'Binary Search': ['Binary Search', 'Search'],
    'Two Pointers': ['Two Pointers', 'Two Pointer'],
    'Sliding Window': ['Sliding Window'],
    'Greedy': ['Greedy'],
    'Divide and Conquer': ['Divide and Conquer'],
    'Backtracking': ['Backtracking'],
    'Recursion': ['Recursion', 'Recursive'],
    
    // Advanced Techniques
    'Dynamic Programming': ['Dynamic Programming', 'DP'],
    'Bit Manipulation': ['Bit Manipulation', 'Bitwise', 'XOR'],
    'Math': ['Math', 'Mathematics'],
    'Geometry': ['Geometry'],
    
    // Problem Types
    'Prefix Sum': ['Prefix Sum'],
    'Suffix Array': ['Suffix Array'],
    'Union Find': ['Union Find', 'Disjoint Set'],
    'Topological Sort': ['Topological Sort', 'Graph'],
    'Shortest Path': ['Shortest Path', 'Graph'],
    'Minimum Spanning Tree': ['MST', 'Minimum Spanning Tree', 'Graph'],
    'Network Flow': ['Network Flow', 'Graph'],
    
    // Specialized
    'DFS': ['DFS', 'Depth First Search', 'Graph', 'Tree'],
    'BFS': ['BFS', 'Breadth First Search', 'Graph', 'Tree'],
    'Merge Sort': ['Merge Sort', 'Sorting'],
    'Quick Sort': ['Quick Sort', 'Sorting'],
    'Kadane\'s Algorithm': ['Kadane', 'Dynamic Programming'],
    'Boyer-Moore': ['Boyer-Moore', 'String'],
    'KMP': ['KMP', 'String', 'Pattern Matching'],
    'Knapsack': ['Knapsack', 'Dynamic Programming'],
    'Subset Sum': ['Subset Sum', 'Dynamic Programming'],
    'Coin Change': ['Coin Change', 'Dynamic Programming'],
    'LCS': ['LCS', 'Longest Common Subsequence', 'Dynamic Programming'],
    'LIS': ['LIS', 'Longest Increasing Subsequence', 'Dynamic Programming'],
    'Dijkstra': ['Dijkstra', 'Shortest Path', 'Graph'],
    'Floyd-Warshall': ['Floyd-Warshall', 'Shortest Path', 'Graph'],
    'Bellman-Ford': ['Bellman-Ford', 'Shortest Path', 'Graph'],
    'Prim': ['Prim', 'MST', 'Graph'],
    'Kruskal': ['Kruskal', 'MST', 'Graph'],
    'Tarjan': ['Tarjan', 'Graph'],
    'Kosaraju': ['Kosaraju', 'Graph'],
    
    // Additional mappings
    'Optimization': ['Optimization'],
    'Partition': ['Partition'],
    'Iteration': ['Iteration', 'Loop'],
    'XOR': ['XOR', 'Bit Manipulation'],
    'Constraint Satisfaction': ['Constraint Satisfaction'],
    'Lookup Table': ['Lookup Table', 'Memoization'],
    'Custom Comparator': ['Custom Comparator', 'Sorting'],
    'Rotated Array': ['Rotated Array', 'Array'],
    'Subsequence': ['Subsequence'],
    'Combination': ['Combination', 'Combinatorics'],
    'Permutation': ['Permutation', 'Combinatorics'],
    'Combinatorics': ['Combinatorics', 'Math'],
    'Arithmetic Progression': ['Arithmetic Progression', 'Math'],
    'Subarray': ['Subarray', 'Array'],
    'Subset': ['Subset'],
    'Chess': ['Chess', 'Backtracking'],
    'Hamiltonian Path': ['Hamiltonian Path', 'Graph'],
    'Graph Coloring': ['Graph Coloring', 'Graph'],
    'Puzzle': ['Puzzle'],
    'Expression Evaluation': ['Expression Evaluation', 'Stack'],
    'Pattern Matching': ['Pattern Matching', 'String'],
    'Character Manipulation': ['Character Manipulation', 'String'],
    'Multiplication': ['Multiplication', 'Math'],
    'Compression': ['Compression'],
    'Memory Management': ['Memory Management'],
    'Frequency Count': ['Frequency Count', 'Hashing'],
    'Binary Indexed Tree': ['Binary Indexed Tree', 'BIT', 'Fenwick Tree'],
    'Partitioning': ['Partitioning'],
    'Ternary Search': ['Ternary Search', 'Search'],
    'Interpolation Search': ['Interpolation Search', 'Search'],
    'Exponential Search': ['Exponential Search', 'Search'],
    'Modified Binary Search': ['Modified Binary Search', 'Binary Search'],
    'Quickselect': ['Quickselect', 'Selection'],
    'Priority Queue': ['Priority Queue', 'Heap'],
    'Hybrid Algorithm': ['Hybrid Algorithm'],
    'Three-way Partitioning': ['Three-way Partitioning', 'Partition'],
    'Dutch National Flag': ['Dutch National Flag', 'Partition'],
    'External Memory': ['External Memory'],
    'File I/O': ['File I/O'],
    'Algorithm Analysis': ['Algorithm Analysis'],
    'Random': ['Random', 'Randomization'],
    'Randomization': ['Randomization', 'Random'],
    'Prefix Product': ['Prefix Product'],
    'Counting': ['Counting'],
    'Design': ['Design'],
    'Simulation': ['Simulation'],
    'Implementation': ['Implementation'],
    'Data Stream': ['Data Stream'],
    'Iterator': ['Iterator'],
    'Database': ['Database'],
    'Concurrency': ['Concurrency'],
    'System Design': ['System Design'],
    'Interactive': ['Interactive'],
    'Brainteaser': ['Brainteaser'],
    'Shell': ['Shell'],
    'Probability and Statistics': ['Probability', 'Statistics'],
    'Tricks': ['Tricks']
  };
  
  let questionsUpdated = 0;
  let questionsWithoutTopics = 0;
  
  // Process each question
  questions.forEach((question, index) => {
    if (!question.topics || question.topics.length === 0) {
      questionsWithoutTopics++;
      console.log(`⚠️  Question ${question.id} has no topics: "${question.title}"`);
      return;
    }
    
    // Generate tags from topics
    const tagsSet = new Set();
    
    question.topics.forEach(topic => {
      // Add the topic itself
      tagsSet.add(topic);
      
      // Add mapped tags
      if (topicToTags[topic]) {
        topicToTags[topic].forEach(tag => tagsSet.add(tag));
      }
    });
    
    // Convert to array
    const newTags = Array.from(tagsSet);
    
    // Update tags
    question.tags = newTags;
    questionsUpdated++;
    
    // Log progress every 100 questions
    if ((index + 1) % 100 === 0) {
      console.log(`✓ Processed ${index + 1}/${questions.length} questions...`);
    }
  });
  
  console.log(`\n✅ Processing complete!`);
  console.log(`� Questions updated: ${questionsUpdated}`);
  console.log(`⚠️  Questions without topics: ${questionsWithoutTopics}`);
  
  // Write back to file
  const output = `let questions=[\n${questions.map(q => '  ' + JSON.stringify(q)).join(',\n')}\n];\n\nexport default questions;`;
  
  fs.writeFileSync('./init/data.js', output, 'utf8');
  
  console.log(`\n💾 File updated: ./init/data.js`);
  console.log(`\n🎉 All tags have been added successfully!`);
  
  // Show some statistics
  const allTags = new Set();
  questions.forEach(q => {
    if (q.tags) {
      q.tags.forEach(tag => allTags.add(tag));
    }
  });
  
  console.log(`\n📈 Statistics:`);
  console.log(`   Total unique tags: ${allTags.size}`);
  console.log(`   Average tags per question: ${(questions.reduce((sum, q) => sum + (q.tags?.length || 0), 0) / questions.length).toFixed(2)}`);
  
}).catch(err => {
  console.error('❌ Error:', err);
});
