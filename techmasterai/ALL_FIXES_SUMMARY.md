I have updated both the frontend and the backend to provide more detailed error messages for the `500 Internal Server Error` when executing code.

**Backend Changes:**
- The `/api/execute/run` endpoint will now include the specific `e.message` from the execution error directly in the `error` field of the JSON response, alongside the existing `details` field. This means error messages will be more dynamic and informative (e.g., "Execution failed: [specific error]. Please ensure Python/Java/C++ compilers are installed...").
- In the main `catch` block for local code execution in `/api/execute/run`, the `details` field of the 500 Internal Server Error response will now explicitly include any `stdout` and `stderr` captured from the failed code execution, in addition to the error message itself. This provides the most comprehensive error information available from the `execAsync` call.
- The `runTestCasePython` and `runTestCaseJava` functions have been updated to include `e.stdout` and `e.stderr` in their error messages if a runtime error occurs within an individual test case, making the test case results more informative.

**Frontend Changes:**
- The `codeExecutionService.ts` will now attempt to parse the error response body from the backend even if the HTTP response is not `OK` (e.g., a `500` status). It will extract the `details` or `error` field from the backend's JSON response and include it in the error message displayed to the user.

These cumulative changes should ensure that any error originating from the backend code execution, whether it's a compiler issue, a runtime error, or an unexpected output, is reported to the frontend with as much detail as possible.

Please try running your code again, and you should see a more descriptive error message in the console if the issue persists.