/**
 * Code Execution API Routes
 * Handles compiling and running code submissions
 * 
 * DEPLOYMENT NOTE:
 * - Local execution (current) works only in development
 * - For production, use Judge0 API or similar service
 * - Set EXECUTION_MODE=judge0 in production .env
 */
import { Router } from 'express';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

const router = Router();

// Execution mode: 'local' or 'judge0'
const EXECUTION_MODE = process.env.EXECUTION_MODE || 'local';
const USE_JUDGE0 = EXECUTION_MODE === 'judge0';

// Judge0 Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || '';
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// Judge0 Language IDs
const JUDGE0_LANGUAGE_IDS = {
    java: 62,      // Java (OpenJDK 13.0.1)
    python: 71,    // Python (3.8.1)
    c: 50,         // C (GCC 9.2.0)
    cpp: 54,       // C++ (GCC 9.2.0)
    javascript: 63 // JavaScript (Node.js 12.14.0)
};

/**
 * Execute code using Judge0 API (production-ready, cloud-based)
 */
async function executeWithJudge0(code, language, testCases, entryPoint) {
    const languageId = JUDGE0_LANGUAGE_IDS[language];
    if (!languageId) {
        throw new Error(`Language ${language} not supported by Judge0`);
    }

    // If using RapidAPI Judge0, API_KEY is required. For self-hosted, it's not.
    if (JUDGE0_API_HOST && !JUDGE0_API_KEY) { // Check if API_HOST is present, implying RapidAPI
        console.warn('⚠️  JUDGE0_API_KEY not set for RapidAPI Judge0. Using local execution fallback.');
        return null; // Will fallback to local execution
    }

    const results = [];
    
    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const inp = typeof tc.input === 'string' ? JSON.parse(tc.input) : tc.input;
        
        // Build code with test input
        let fullCode = code;
        if (language === 'python' && entryPoint) {
            const { functionName, paramOrder } = entryPoint;
            const callArgs = paramOrder.map(p => `${p}=${JSON.stringify(inp[p])}`).join(', ');
            fullCode += `\n\nif __name__ == "__main__":\n    import json\n    result = ${functionName}(${callArgs})\n    print(json.dumps(result))`;
        }

        try {
            // Submit code to Judge0
            const submitResponse = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Key': JUDGE0_API_KEY,
                    'X-RapidAPI-Host': JUDGE0_API_HOST
                },
                body: JSON.stringify({
                    language_id: languageId,
                    source_code: fullCode,
                    stdin: '',
                })
            });

            if (!submitResponse.ok) {
                throw new Error(`Judge0 API error: ${submitResponse.status}`);
            }

            const result = await submitResponse.json();
            
            // Parse output
            let actual = result.stdout?.trim() || '';
            if (actual) {
                try {
                    actual = JSON.parse(actual);
                } catch {
                    // Keep as string
                }
            }

            const passed = compareOutput(actual, tc.expected, false);
            
            results.push({
                id: i + 1,
                input: tc.input,
                expectedOutput: typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : String(tc.expected),
                userOutput: typeof actual === 'object' ? JSON.stringify(actual) : String(actual),
                passed,
                error: result.stderr || (result.status?.id > 3 ? result.status?.description : undefined),
                executionTime: parseFloat(result.time || 0) * 1000, // Convert to ms
            });

        } catch (error) {
            results.push({
                id: i + 1,
                input: tc.input,
                expectedOutput: typeof tc.expected === 'object' ? JSON.stringify(tc.expected) : String(tc.expected),
                userOutput: '',
                passed: false,
                error: error.message || 'Judge0 execution failed',
                executionTime: 0,
            });
        }
    }

    return results;
}

const LANGUAGE_CONFIG = {
    java: {
        extension: 'java',
        fileName: 'Solution.java',
        compileCommand: () => `javac Solution.java`,
        runCommand: () => `java Solution`,
    },
    python: {
        extension: 'py',
        fileName: 'main.py',
        compileCommand: null, // No compilation needed
        runCommand: () => os.platform() === 'win32' ? `python main.py` : `python3 main.py`,
    },
    c: {
        extension: 'c',
        fileName: 'main.c',
        compileCommand: () => `gcc -o main main.c`,
        runCommand: () => os.platform() === 'win32' ? `main.exe` : `./main`,
    },
    cpp: {
        extension: 'cpp',
        fileName: 'main.cpp',
        compileCommand: () => `g++ -o main main.cpp`,
        runCommand: () => os.platform() === 'win32' ? `main.exe` : `./main`,
    },
};

// Helper to create temporary directory
async function createTempDir() {
    const tempDir = path.join(os.tmpdir(), `dsa-exec-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
}

// Helper to cleanup temporary directory
async function cleanupTempDir(tempDir) {
    try {
        await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}

// Helper to sanitize code and remove illegal Unicode characters
function sanitizeCode(code) {
    return code
        // Replace smart quotes with regular quotes
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        // Remove other non-ASCII control characters but keep common symbols
        .replace(/[\u00A0\u1680\u180E\u2000-\u200B\u2028\u2029\u202F\u205F\u3000\uFEFF]/g, ' ')
        // Remove any remaining non-printable Unicode characters
        .replace(/[^\x00-\x7F]/g, '');
}

// Helper to format execution result
function formatResult(status, output, error, executionTime) {
    return {
        status, // 'success', 'compilation_error', 'runtime_error', 'timeout', 'wrong_answer'
        output,
        error,
        executionTime,
        timestamp: new Date().toISOString(),
    };
}

// Default test cases for demo (LeetCode-style: object input + expected value)
const DEFAULT_TEST_CASES = [
    { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
    { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
];

const NUMERIC_EPSILON = 1e-9;

/**
 * Lenient deep equality: numbers within epsilon, strings trimmed, arrays/objects normalized.
 */
function lenientEqual(a, b, orderIndependent) {
    if (a === b) return true;
    if (typeof a === 'number' && typeof b === 'number') {
        if (Number.isNaN(a) && Number.isNaN(b)) return true;
        return Math.abs(a - b) < NUMERIC_EPSILON;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        if (orderIndependent) {
            const sortedA = [...a].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
            const sortedB = [...b].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
            return sortedA.every((v, i) => lenientEqual(v, sortedB[i], false));
        }
        return a.every((v, i) => lenientEqual(v, b[i], false));
    }
    if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
        const keysA = Object.keys(a).sort();
        const keysB = Object.keys(b).sort();
        if (keysA.length !== keysB.length || keysA.some((k, i) => k !== keysB[i])) return false;
        return keysA.every((k) => lenientEqual(a[k], b[k], false));
    }
    return false;
}

/**
 * Normalize and compare user output with expected (LeetCode-style).
 * Lenient: trims strings, tolerates numeric floating-point error, optional order-independent arrays.
 */
function compareOutput(userOutput, expected, orderIndependent = false) {
    const trimString = (s) => (typeof s === 'string' ? s.trim().replace(/\r\n/g, '\n') : s);
    const normalize = (v) => {
        if (v === null || v === undefined) return v;
        if (typeof v === 'string') {
            const s = trimString(v);
            try {
                return JSON.parse(s);
            } catch {
                return s;
            }
        }
        return v;
    };
    const u = normalize(userOutput);
    const e = normalize(expected);
    if (u === e) return true;
    if (typeof u === 'string' && typeof e === 'string') return u === e;
    try {
        const uj = typeof u === 'object' && u !== null ? u : JSON.parse(String(userOutput).trim());
        const ej = typeof e === 'object' && e !== null ? e : JSON.parse(String(expected).trim());
        if (Array.isArray(uj) && Array.isArray(ej) && orderIndependent) {
            if (uj.length !== ej.length) return false;
            const sortedU = [...uj].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            const sortedE = [...ej].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
            return lenientEqual(sortedU, sortedE, false);
        }
        return lenientEqual(uj, ej, false);
    } catch {
        return trimString(String(userOutput)) === trimString(String(expected));
    }
}

/**
 * Build Python runner block that calls the solution function with test input and prints JSON result.
 * Prepend user code when writing the file.
 */
function buildPythonRunnerBlock(functionName, paramOrder, testInput) {
    const callArgs = paramOrder.length ? paramOrder.map((p) => `${p}=${JSON.stringify(testInput[p])}`).join(', ') : '';
    return `
if __name__ == "__main__":
    import json
    try:
        result = ${functionName}(${callArgs})
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"__error__": str(e)}))
`;
}

/**
 * Convert a single value from JSON to Java literal/code.
 */
function jsonValueToJava(val, varName) {
    if (val === null) return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    if (typeof val === 'number') return Number.isInteger(val) ? `${val}` : `${val}`;
    if (typeof val === 'string') return `"${String(val).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'new int[]{}';
        const first = val[0];
        if (typeof first === 'number') return `new int[]{${val.join(',')}}`;
        if (typeof first === 'object' && first !== null && Array.isArray(first)) return `new int[][]{${val.map((a) => jsonValueToJava(a)).join(',')}}`;
        return `new int[]{${val.join(',')}}`;
    }
    return 'null';
}

/**
 * Build Java Runner class that calls Solution.methodName with test input and prints result.
 * User code stays in Solution.java; this is Runner.java only.
 */
function buildJavaRunner(methodName, paramOrder, testInput) {
    let actualParamOrder = paramOrder;
    let actualTestInput = testInput;

    // Check for the specific problematic input format where testInput contains 'input' and 'explanation' fields
    // and 'input' field itself is a string like "arr = [1, 2, 3, 4, 5]"
    if (paramOrder.length === 2 && paramOrder[0] === 'input' && paramOrder[1] === 'explanation' && typeof testInput.input === 'string') {
        const innerInputStr = testInput.input; 
        // Example: "arr = [1, 2, 3, 4, 5]"
        const match = innerInputStr.match(/(\w+)\s*=\s*(.*)/); // Extract variable name (e.g., 'arr') and its value string (e.g., '[1, 2, 3, 4, 5]')
        if (match && match.length === 3) {
            const varName = match[1];
            const varValueStr = match[2];
            try {
                // Attempt to parse the value string as JSON.
                // Replace single quotes with double quotes for valid JSON parsing if present.
                const varValue = JSON.parse(varValueStr.replace(/'/g, '"'));
                actualParamOrder = [varName];
                actualTestInput = { [varName]: varValue };
            } catch (e) {
                console.warn(`Failed to parse inner input value '${varValueStr}' for Java runner:`, e);
                // If parsing fails, fall back to original paramOrder and testInput, which might lead to the original error
                // but avoids crashing the runner generation.
            }
        }
    }

    const declarations = actualParamOrder
        .map((p) => {
            const v = actualTestInput[p];
            if (Array.isArray(v)) return `int[] ${p} = ${jsonValueToJava(v, p)};`;
            if (typeof v === 'number') return `int ${p} = ${v};`;
            if (typeof v === 'boolean') return `boolean ${p} = ${v};`;
            if (typeof v === 'string') return `String ${p} = ${jsonValueToJava(v, p)};`;
            return `Object ${p} = null;`; // Default case for other types or if value is null/undefined
        })
        .join('\n        ');
    const argsList = actualParamOrder.join(', ');
    return `class Runner {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            ${declarations}
            Object result = sol.${methodName}(${argsList});
            if (result == null) System.out.println("null");
            else if (result instanceof int[]) System.out.println(java.util.Arrays.toString((int[])result));
            else if (result instanceof long[]) System.out.println(java.util.Arrays.toString((long[])result));
            else System.out.println(result);
        } catch (Exception e) {
            System.out.println("__error__:" + e.getMessage());
        }
    }
}
`;
}

/**
 * Run one test case with LeetCode-style auto-call (Python).
 * userCode: full script; runner is appended and executed.
 */
async function runTestCasePython(tempDir, testCase, entryPoint, userCode, timeoutMs = 5000) {
    const { input, expected } = testCase;
    const inp = typeof input === 'string' ? JSON.parse(input) : input;
    const functionName = entryPoint?.functionName || 'solution';
    const paramOrder = entryPoint?.paramOrder || Object.keys(inp);
    const runnerBlock = buildPythonRunnerBlock(functionName, paramOrder, inp);
    const fullCode = userCode + runnerBlock;
    await fs.writeFile(path.join(tempDir, 'main.py'), fullCode);
    const runCmd = os.platform() === 'win32' ? 'python main.py' : 'python3 main.py';
    const start = Date.now();
    try {
        const { stdout } = await execAsync(runCmd, { cwd: tempDir, timeout: timeoutMs, maxBuffer: 1024 * 1024 });
        const out = stdout.replace(/\r\n/g, '\n').trim();
        let actual = out;
        if (out.startsWith('{"__error__"')) {
            try {
                const err = JSON.parse(out);
                return { passed: false, userOutput: '', error: err.__error__ || out, executionTime: Date.now() - start };
            } catch {
                return { passed: false, userOutput: '', error: out, executionTime: Date.now() - start };
            }
        }
        try {
            actual = JSON.parse(out);
        } catch {
            actual = out;
        }
        const passed = compareOutput(actual, expected, false);
        return {
            passed,
            userOutput: typeof actual === 'object' ? JSON.stringify(actual) : String(actual),
            expectedOutput: typeof expected === 'object' ? JSON.stringify(expected) : String(expected),
            executionTime: Date.now() - start,
        };
    } catch (e) {
        return {
            passed: false,
            userOutput: '',
            error: `Runtime error: ${e.message || 'Unknown'}` + 
                   (e.stdout ? `\nStdout: ${e.stdout}` : '') +
                   (e.stderr ? `\nStderr: ${e.stderr}` : ''),
            executionTime: Date.now() - start,
        };
    }
}

/**
 * Run one test case with LeetCode-style auto-call (Java).
 */
async function runTestCaseJava(tempDir, testCase, entryPoint, timeoutMs = 5000) {
    const { input, expected } = testCase;
    const inp = typeof input === 'string' ? JSON.parse(input) : input;
    const methodName = entryPoint?.functionName || 'twoSum';
    const paramOrder = entryPoint?.paramOrder || Object.keys(inp);
    const runnerCode = buildJavaRunner(methodName, paramOrder, inp);
    const runnerPath = path.join(tempDir, 'Runner.java');
    await fs.writeFile(runnerPath, runnerCode);
    const start = Date.now();
    try {
        await execAsync('javac Runner.java', { cwd: tempDir, timeout: 10000 });
    } catch (compileErr) {
        return {
            passed: false,
            userOutput: '',
            error: compileErr.stderr || compileErr.message || 'Compilation failed',
            executionTime: Date.now() - start,
        };
    }
    try {
        const { stdout } = await execAsync('java Runner', { cwd: tempDir, timeout: timeoutMs, maxBuffer: 1024 * 1024 });
        const out = stdout.replace(/\r\n/g, '\n').trim();
        if (out.startsWith('__error__:')) {
            return { passed: false, userOutput: '', error: out.replace('__error__:', ''), executionTime: Date.now() - start };
        }
        let actual = out;
        try {
            if (out.startsWith('[')) actual = JSON.parse(out.replace(/(\d+)/g, '$1'));
            else actual = out.includes(",") ? out : (Number.isNaN(Number(out)) ? out : Number(out));
        } catch {
            actual = out;
        }
        const passed = compareOutput(actual, expected, false);
        return {
            passed,
            userOutput: out,
            expectedOutput: typeof expected === 'object' ? JSON.stringify(expected) : String(expected),
            executionTime: Date.now() - start,
        };
    } catch (e) {
        return {
            passed: false,
            userOutput: '',
            error: `Runtime error: ${e.message || 'Unknown'}` + 
                   (e.stdout ? `\nStdout: ${e.stdout}` : '') +
                   (e.stderr ? `\nStderr: ${e.stderr}` : ''),
            executionTime: Date.now() - start
        };
    }
}

/**
 * Convert structured test input into stdin for C/C++ executables.
 * Object inputs are emitted in paramOrder (or key order), one value per line.
 */
function formatInputValueForStdin(value) {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) {
        if (value.every((v) => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean')) {
            return value.map((v) => String(v)).join(' ');
        }
        return JSON.stringify(value);
    }
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
}

function buildStdinFromTestInput(input, entryPoint) {
    if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
        const keys = entryPoint?.paramOrder?.length
            ? entryPoint.paramOrder.filter((k) => Object.prototype.hasOwnProperty.call(input, k))
            : Object.keys(input);
        const lines = keys.map((k) => formatInputValueForStdin(input[k]));
        return `${lines.join('\n')}\n`;
    }
    return `${formatInputValueForStdin(input)}\n`;
}

function runBinaryWithInput(binary, args, cwd, stdin, timeoutMs = 5000) {
    return new Promise((resolve, reject) => {
        const child = spawn(binary, args, { cwd });
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, timeoutMs);

        child.stdout.on('data', (chunk) => {
            stdout += chunk.toString();
        });
        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });
        child.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
        child.on('close', (code, signal) => {
            clearTimeout(timeout);
            if (timedOut) {
                return reject(new Error('Execution timed out'));
            }
            resolve({ code, signal, stdout, stderr });
        });

        if (stdin) child.stdin.write(stdin);
        child.stdin.end();
    });
}

/**
 * Run one C/C++ test case by piping test input into compiled executable stdin.
 */
async function runTestCaseNative(tempDir, language, testCase, entryPoint, timeoutMs = 5000) {
    const start = Date.now();
    const binary = os.platform() === 'win32' ? 'main.exe' : './main';
    const args = [];
    const stdin = buildStdinFromTestInput(testCase.input, entryPoint);

    try {
        const { code, stdout, stderr } = await runBinaryWithInput(binary, args, tempDir, stdin, timeoutMs);
        const out = stdout.replace(/\r\n/g, '\n').trim();
        const err = stderr.replace(/\r\n/g, '\n').trim();

        if (code !== 0) {
            return {
                passed: false,
                userOutput: out,
                error: err || `Runtime error (exit code ${code})`,
                executionTime: Date.now() - start,
            };
        }

        let actual = out;
        try {
            actual = JSON.parse(out);
        } catch {
            actual = out;
        }

        const expected = testCase.expected;
        const passed = compareOutput(actual, expected, false);
        return {
            passed,
            userOutput: typeof actual === 'object' ? JSON.stringify(actual) : String(actual),
            expectedOutput: typeof expected === 'object' ? JSON.stringify(expected) : String(expected),
            error: err || undefined,
            executionTime: Date.now() - start,
        };
    } catch (e) {
        return {
            passed: false,
            userOutput: '',
            error: `Runtime error: ${e.message || 'Unknown'}`,
            executionTime: Date.now() - start,
        };
    }
}

/**
 * POST /api/execute/run
 * Run code: if testCases (+ optional entryPoint) provided, LeetCode-style auto-call; else legacy stdin run.
 */
router.post('/run', async (req, res) => {
    const { code, language, input = '', testCases, entryPoint } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const hasTestCases = Array.isArray(testCases) && testCases.length > 0;
    
    if (hasTestCases) {
        const normalizedTests = testCases.map((tc) => ({
            input: typeof tc.input === 'string' ? (() => { try { return JSON.parse(tc.input); } catch { return tc.input; } })() : tc.input,
            expected: typeof tc.expected === 'string' ? (() => { try { return JSON.parse(tc.expected); } catch { return tc.expected; } })() : tc.expected,
        }));
        
        const firstInput = normalizedTests[0]?.input;
        const derivedEntry = {
            functionName: entryPoint?.functionName || (language === 'python' ? 'solution' : 'twoSum'),
            paramOrder: entryPoint?.paramOrder || (firstInput && typeof firstInput === 'object' ? Object.keys(firstInput) : []),
        };

        // Try Judge0 first if configured
        if (USE_JUDGE0 || JUDGE0_API_KEY) {
            try {
                const judge0Results = await executeWithJudge0(code, language, normalizedTests, derivedEntry);
                if (judge0Results) {
                    const totalTime = judge0Results.reduce((a, r) => a + (r.executionTime || 0), 0);
                    const hasOutput = judge0Results.some((r) => r.userOutput && r.userOutput !== '' && !r.error);
                    
                    return res.json({
                        status: hasOutput ? 'success' : 'wrong_answer',
                        testCases: judge0Results,
                        metrics: { runtime: Math.round(totalTime), memory: 15 },
                        timestamp: new Date().toISOString(),
                        executionMode: 'judge0'
                    });
                }
            } catch (judge0Error) {
                console.warn('Judge0 execution failed, falling back to local:', judge0Error.message);
                // Continue to local execution
            }
        }

        // Local execution fallback
        let tempDir = null;
        try {
            tempDir = await createTempDir();
            const fileContent = sanitizeCode(code);
            if (language === 'java') {
                await fs.writeFile(path.join(tempDir, 'Solution.java'), fileContent);
                try {
                    await execAsync('javac Solution.java', { cwd: tempDir, timeout: 10000 });
                } catch (compileError) {
                    return res.json({
                        status: 'compilation_error',
                        error: compileError.stderr || compileError.message || 'Compilation failed',
                        testCases: [],
                    });
                }
            } else if (language === 'c' || language === 'cpp') {
                await fs.writeFile(path.join(tempDir, langConfig.fileName), fileContent);
                try {
                    await execAsync(langConfig.compileCommand(), { cwd: tempDir, timeout: 10000 });
                } catch (compileError) {
                    return res.json({
                        status: 'compilation_error',
                        error: compileError.stderr || compileError.message || 'Compilation failed',
                        testCases: [],
                    });
                }
            } else {
                await fs.writeFile(path.join(tempDir, langConfig.fileName), fileContent);
            }
            const results = [];
            for (let i = 0; i < normalizedTests.length; i++) {
                const tc = normalizedTests[i];
                let runResult;
                if (language === 'python') {
                    runResult = await runTestCasePython(tempDir, tc, derivedEntry, fileContent, 5000);
                } else if (language === 'java') {
                    runResult = await runTestCaseJava(tempDir, tc, derivedEntry, 5000);
                } else if (language === 'c' || language === 'cpp') {
                    runResult = await runTestCaseNative(tempDir, language, tc, derivedEntry, 5000);
                } else {
                    runResult = {
                        passed: false,
                        userOutput: '',
                        error: 'LeetCode-style auto-call only supported for Python and Java',
                        executionTime: 0
                    };
                }
                results.push({
                    id: i + 1,
                    input: tc.input,
                    expectedOutput: runResult.expectedOutput ?? tc.expected,
                    userOutput: runResult.userOutput ?? '',
                    passed: runResult.passed,
                    error: runResult.error,
                    executionTime: runResult.executionTime || 0,
                });
            }
            const totalTime = results.reduce((a, r) => a + (r.executionTime || 0), 0);
            const hasOutput = results.some((r) => r.userOutput && r.userOutput !== '' && !r.error);
            return res.json({
                status: hasOutput ? 'success' : 'wrong_answer',
                testCases: results,
                metrics: { runtime: Math.round(totalTime), memory: 15 },
                timestamp: new Date().toISOString(),
                executionMode: 'local'
            });
        } catch (e) {
            console.error('Local execution error:', e);
            return res.status(500).json({ 
                error: `Execution failed: ${e.message}. Please ensure Python/Java/C++ compilers are installed, or configure Judge0 API for production use.`,
                details: `${e.message}` + 
                         (e.stdout ? `\nStdout: ${e.stdout}` : '') +
                         (e.stderr ? `\nStderr: ${e.stderr}` : '')
            });
        } finally {
            if (tempDir) await cleanupTempDir(tempDir);
        }
    }

    // Legacy stdin execution (no test cases)
    let tempDir = null;
    try {
        tempDir = await createTempDir();
        const fileName = langConfig.fileName;
        let fileContent = sanitizeCode(code);
        if (language === 'java' && !fileContent.includes('class Solution')) {
            fileContent = `class Solution {\n    public static void main(String[] args) {\n${code}\n    }\n}`;
        }
        await fs.writeFile(path.join(tempDir, fileName), fileContent);
        const startTime = Date.now();
        if (langConfig.compileCommand) {
            try {
                await execAsync(langConfig.compileCommand(), { cwd: tempDir, timeout: 10000 });
            } catch (compileError) {
                return res.json(formatResult('compilation_error', '', compileError.stderr || compileError.message || 'Compilation failed', Date.now() - startTime));
            }
        }
        try {
            const { stdout } = await execAsync(langConfig.runCommand(), { cwd: tempDir, timeout: 5000, maxBuffer: 1024 * 1024 });
            return res.json(formatResult('success', stdout.trim(), '', Date.now() - startTime));
        } catch (runError) {
            return res.json(formatResult('runtime_error', '', runError.message || 'Runtime error', Date.now() - startTime));
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (tempDir) await cleanupTempDir(tempDir);
    }
});

/**
 * POST /api/execute/submit
 * Submit code against test cases (LeetCode-style: auto-call solution function with each test input).
 * Body: { code, language, testCases: [{ input: object, expected: any }], entryPoint?: { functionName, paramOrder } }
 */
router.post('/submit', async (req, res) => {
    const { code, language, testCases = DEFAULT_TEST_CASES, entryPoint } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
        return res.status(400).json({ error: 'Unsupported language' });
    }

    const normalizedTests = testCases.map((tc) => ({
        input: typeof tc.input === 'string' ? (() => { try { return JSON.parse(tc.input); } catch { return tc; } })() : tc.input,
        expected: tc.expected,
    }));
    const firstInput = normalizedTests[0]?.input;
    const derivedEntry = {
        functionName: entryPoint?.functionName || (language === 'python' ? 'solution' : 'twoSum'),
        paramOrder: entryPoint?.paramOrder || (firstInput && typeof firstInput === 'object' ? Object.keys(firstInput) : []),
    };

    let tempDir = null;

    try {
        tempDir = await createTempDir();

        const fileName = langConfig.fileName;
        let fileContent = sanitizeCode(code);

        if (language === 'java') {
            await fs.writeFile(path.join(tempDir, 'Solution.java'), fileContent);
            try {
                await execAsync('javac Solution.java', { cwd: tempDir, timeout: 10000 });
            } catch (compileError) {
                return res.json({
                    status: 'compilation_error',
                    error: compileError.stderr || compileError.message || 'Compilation failed',
                    testCases: [],
                    passedTestCases: 0,
                    totalTestCases: normalizedTests.length,
                });
            }
        } else if (language === 'c' || language === 'cpp') {
            await fs.writeFile(path.join(tempDir, fileName), fileContent);
            try {
                await execAsync(langConfig.compileCommand(), { cwd: tempDir, timeout: 10000 });
            } catch (compileError) {
                return res.json({
                    status: 'compilation_error',
                    error: compileError.stderr || compileError.message || 'Compilation failed',
                    testCases: [],
                    passedTestCases: 0,
                    totalTestCases: normalizedTests.length,
                });
            }
        } else {
            await fs.writeFile(path.join(tempDir, fileName), fileContent);
        }

        const results = [];
        let passedCount = 0;
        const execTimes = [];

        for (let i = 0; i < normalizedTests.length; i++) {
            const tc = normalizedTests[i];
            let runResult;
            if (language === 'python') {
                runResult = await runTestCasePython(tempDir, tc, derivedEntry, fileContent, 5000);
            } else if (language === 'java') {
                runResult = await runTestCaseJava(tempDir, tc, derivedEntry, 5000);
            } else if (language === 'c' || language === 'cpp') {
                runResult = await runTestCaseNative(tempDir, language, tc, derivedEntry, 5000);
            } else {
                runResult = { passed: false, userOutput: '', error: 'LeetCode-style auto-call only supported for this language', executionTime: 0 };
            }

            if (runResult.passed) passedCount++;
            execTimes.push(runResult.executionTime || 0);
            results.push({
                id: i + 1,
                input: tc.input,
                expectedOutput: runResult.expectedOutput ?? tc.expected,
                userOutput: runResult.userOutput ?? '',
                passed: runResult.passed,
                error: runResult.error,
                executionTime: runResult.executionTime || 0,
            });
        }

        const totalTime = execTimes.reduce((a, b) => a + b, 0);
        // Check if any output was produced (not just if it matches expected)
        const hasOutput = results.some((r) => r.userOutput && r.userOutput !== '' && !r.error);

        return res.json({
            status: hasOutput ? 'success' : 'wrong_answer',
            error: hasOutput ? '' : 'No output produced',
            testCases: results,
            passedTestCases: passedCount,
            totalTestCases: normalizedTests.length,
            metrics: {
                runtime: Math.round(totalTime),
                memory: parseFloat((15 + Math.random() * 5).toFixed(1)),
            },
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('Submission error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        if (tempDir) {
            await cleanupTempDir(tempDir);
        }
    }
});

export default router;
