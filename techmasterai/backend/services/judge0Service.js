/**
 * Judge0 API Integration for Safe Code Execution
 * Judge0 provides sandboxed code execution for multiple languages
 * Free tier: 50 requests/day
 * Docs: https://ce.judge0.com/
 */

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ''; // Get from RapidAPI

// Language IDs for Judge0
const LANGUAGE_IDS = {
    java: 62,      // Java (OpenJDK 13.0.1)
    python: 71,    // Python (3.8.1)
    c: 50,         // C (GCC 9.2.0)
    cpp: 54,       // C++ (GCC 9.2.0)
    javascript: 63 // JavaScript (Node.js 12.14.0)
};

/**
 * Submit code to Judge0 for execution
 */
export async function executeCodeWithJudge0(code, language, input = '') {
    const languageId = LANGUAGE_IDS[language];
    
    if (!languageId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    try {
        // Step 1: Create submission
        const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            body: JSON.stringify({
                source_code: code,
                language_id: languageId,
                stdin: input,
                cpu_time_limit: 2,
                memory_limit: 128000 // 128 MB
            })
        });

        if (!submissionResponse.ok) {
            throw new Error(`Judge0 API error: ${submissionResponse.status}`);
        }

        const result = await submissionResponse.json();

        // Parse result
        return {
            status: getStatusFromJudge0(result.status.id),
            output: result.stdout || '',
            error: result.stderr || result.compile_output || result.message || '',
            executionTime: result.time ? parseFloat(result.time) * 1000 : 0, // Convert to ms
            memory: result.memory || 0
        };

    } catch (error) {
        console.error('Judge0 execution error:', error);
        throw error;
    }
}

/**
 * Execute code against multiple test cases
 */
export async function executeTestCases(code, language, testCases) {
    const results = [];
    
    for (const testCase of testCases) {
        try {
            const input = typeof testCase.input === 'object' 
                ? JSON.stringify(testCase.input) 
                : String(testCase.input);
            
            const result = await executeCodeWithJudge0(code, language, input);
            
            const userOutput = result.output.trim();
            const expectedOutput = typeof testCase.expected === 'object'
                ? JSON.stringify(testCase.expected)
                : String(testCase.expected).trim();
            
            results.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: userOutput,
                passed: userOutput === expectedOutput,
                executionTime: result.executionTime,
                error: result.error,
                status: result.status
            });
        } catch (error) {
            results.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: '',
                passed: false,
                executionTime: 0,
                error: error.message,
                status: 'error'
            });
        }
    }
    
    return results;
}

/**
 * Map Judge0 status codes to our status
 */
function getStatusFromJudge0(statusId) {
    const statusMap = {
        1: 'running',           // In Queue
        2: 'running',           // Processing
        3: 'success',           // Accepted
        4: 'wrong_answer',      // Wrong Answer
        5: 'tle',               // Time Limit Exceeded
        6: 'compilation_error', // Compilation Error
        7: 'runtime_error',     // Runtime Error (SIGSEGV)
        8: 'runtime_error',     // Runtime Error (SIGXFSZ)
        9: 'runtime_error',     // Runtime Error (SIGFPE)
        10: 'runtime_error',    // Runtime Error (SIGABRT)
        11: 'runtime_error',    // Runtime Error (NZEC)
        12: 'runtime_error',    // Runtime Error (Other)
        13: 'error',            // Internal Error
        14: 'error'             // Exec Format Error
    };
    
    return statusMap[statusId] || 'error';
}
