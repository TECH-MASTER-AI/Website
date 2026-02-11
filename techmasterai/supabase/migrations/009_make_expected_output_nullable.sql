-- Make expected_output nullable for hidden test cases
-- This allows us to store test cases that will be validated during code execution

ALTER TABLE dsa_test_cases 
ALTER COLUMN expected_output DROP NOT NULL;

-- Add a comment explaining the nullable field
COMMENT ON COLUMN dsa_test_cases.expected_output IS 'Expected output for test case. Can be NULL for hidden test cases that are validated during execution.';
