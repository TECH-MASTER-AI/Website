/**
 * Test Python Execution
 * Quick test to verify Python code execution works
 */

import fetch from 'node-fetch';

const TEST_CODE = `
def twoSum(nums, target):
    """
    Find two numbers that add up to target
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test locally
if __name__ == "__main__":
    result = twoSum([2, 7, 11, 15], 9)
    print(result)
`;

const TEST_CASES = [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
    { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
];

async function testPythonExecution() {
    console.log('🐍 Testing Python Code Execution...\n');
    console.log('Code to test:');
    console.log(TEST_CODE);
    console.log('\n' + '='.repeat(60) + '\n');

    try {
        const response = await fetch('http://localhost:3001/api/execute/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: TEST_CODE,
                language: 'python',
                testCases: TEST_CASES,
                entryPoint: {
                    functionName: 'twoSum',
                    paramOrder: ['nums', 'target']
                }
            })
        });

        const result = await response.json();
        
        console.log('📊 Execution Results:\n');
        console.log(`Status: ${result.status}`);
        console.log(`Runtime: ${result.metrics?.runtime}ms`);
        console.log(`Memory: ${result.metrics?.memory}MB\n`);

        if (result.testCases) {
            console.log('Test Cases:');
            result.testCases.forEach((tc, idx) => {
                const status = tc.passed ? '✅ PASSED' : '❌ FAILED';
                console.log(`\nTest ${idx + 1}: ${status}`);
                console.log(`  Input: ${JSON.stringify(tc.input)}`);
                console.log(`  Expected: ${tc.expectedOutput}`);
                console.log(`  Got: ${tc.userOutput}`);
                console.log(`  Time: ${tc.executionTime}ms`);
                if (tc.error) {
                    console.log(`  Error: ${tc.error}`);
                }
            });
        }

        const allPassed = result.testCases?.every(tc => tc.passed);
        console.log('\n' + '='.repeat(60));
        if (allPassed) {
            console.log('🎉 SUCCESS! Python execution is working perfectly!');
        } else {
            console.log('⚠️  Some tests failed. Check the output above.');
        }
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Error testing Python execution:');
        console.error(error.message);
        console.error('\n💡 Make sure the backend server is running on port 3001');
        console.error('   Run: npm run dev (or node server.js)');
    }
}

// Run the test
testPythonExecution();
