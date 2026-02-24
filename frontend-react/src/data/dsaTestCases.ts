// Test cases for DSA problems
export interface TestCase {
  input: any;
  expected: any;
  hidden?: boolean; // Hidden test cases for submission
}

export interface ProblemTestCases {
  problemId: string;
  testCases: TestCase[];
}

export const DSA_TEST_CASES: ProblemTestCases[] = [
  {
    problemId: "two-sum",
    testCases: [
      // Visible
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      // Hidden - edge cases
      { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4], hidden: true },
      { input: { nums: [1, 2, 3, 4, 5], target: 9 }, expected: [3, 4], hidden: true },
      // Tough: large negative numbers
      { input: { nums: [-1000000, 1000000, 0, 500000, -500000], target: 0 }, expected: [0, 1], hidden: true },
      // Tough: duplicate values, pick correct pair
      { input: { nums: [0, 4, 3, 0], target: 0 }, expected: [0, 3], hidden: true },
      // Tough: two elements only
      { input: { nums: [1, 999999999], target: 1000000000 }, expected: [0, 1], hidden: true },
      // Tough: large array with answer at the end
      { input: { nums: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3], target: 5 }, expected: [19, 20], hidden: true },
    ],
  },
  {
    problemId: "valid-palindrome",
    testCases: [
      // Visible
      { input: { s: "A man, a plan, a canal: Panama" }, expected: true },
      { input: { s: "race a car" }, expected: false },
      { input: { s: " " }, expected: true },
      // Hidden
      { input: { s: "ab_a" }, expected: true, hidden: true },
      { input: { s: "0P" }, expected: false, hidden: true },
      // Tough: empty string
      { input: { s: "" }, expected: true, hidden: true },
      // Tough: only special characters
      { input: { s: ".,;:!@#$%^&*()" }, expected: true, hidden: true },
      // Tough: mixed case with numbers
      { input: { s: "1a2b2A1" }, expected: true, hidden: true },
      // Tough: single character
      { input: { s: "a" }, expected: true, hidden: true },
      // Tough: unicode-like but ASCII punctuation
      { input: { s: "Was it a car or a cat I saw?" }, expected: true, hidden: true },
      // Tough: long palindrome with spaces
      { input: { s: "No 'x' in Nixon" }, expected: true, hidden: true },
    ],
  },
  {
    problemId: "reverse-linked-list",
    testCases: [
      // Visible
      { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
      { input: { head: [1, 2] }, expected: [2, 1] },
      { input: { head: [] }, expected: [] },
      // Hidden
      { input: { head: [1] }, expected: [1], hidden: true },
      { input: { head: [1, 2, 3] }, expected: [3, 2, 1], hidden: true },
      // Tough: longer list
      { input: { head: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, expected: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], hidden: true },
      // Tough: duplicate values
      { input: { head: [1, 1, 1, 1] }, expected: [1, 1, 1, 1], hidden: true },
      // Tough: negative values
      { input: { head: [-5, -3, -1, 0, 2, 4] }, expected: [4, 2, 0, -1, -3, -5], hidden: true },
    ],
  },
  {
    problemId: "max-depth-binary-tree",
    testCases: [
      // Visible
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expected: 3 },
      { input: { root: [1, null, 2] }, expected: 2 },
      { input: { root: [] }, expected: 0 },
      // Hidden
      { input: { root: [1, 2, 3, 4, 5] }, expected: 3, hidden: true },
      // Tough: single node
      { input: { root: [1] }, expected: 1, hidden: true },
      // Tough: completely left-skewed (like a linked list)
      { input: { root: [1, 2, null, 3, null, 4, null, 5] }, expected: 5, hidden: true },
      // Tough: completely right-skewed
      { input: { root: [1, null, 2, null, 3, null, 4] }, expected: 4, hidden: true },
      // Tough: perfect binary tree
      { input: { root: [1, 2, 3, 4, 5, 6, 7] }, expected: 3, hidden: true },
      // Tough: unbalanced tree
      { input: { root: [1, 2, 3, 4, null, null, null, 5, null, null, null, null, null, null, null] }, expected: 4, hidden: true },
    ],
  },
  {
    problemId: "best-time-to-buy-sell",
    testCases: [
      // Visible
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
      { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
      { input: { prices: [1, 2] }, expected: 1 },
      // Hidden
      { input: { prices: [2, 4, 1] }, expected: 2, hidden: true },
      { input: { prices: [3, 2, 6, 5, 0, 3] }, expected: 4, hidden: true },
      // Tough: single price
      { input: { prices: [5] }, expected: 0, hidden: true },
      // Tough: all same prices
      { input: { prices: [3, 3, 3, 3, 3] }, expected: 0, hidden: true },
      // Tough: best buy at the very start, best sell at the very end
      { input: { prices: [1, 9, 2, 8, 3, 7, 4, 6, 5, 10] }, expected: 9, hidden: true },
      // Tough: descending then sharp spike
      { input: { prices: [100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 200] }, expected: 190, hidden: true },
      // Tough: large values
      { input: { prices: [10000, 1, 10000] }, expected: 9999, hidden: true },
      // Tough: valley then peak pattern
      { input: { prices: [2, 1, 4, 5, 2, 9, 7] }, expected: 8, hidden: true },
    ],
  },
  {
    problemId: "valid-parentheses",
    testCases: [
      // Visible
      { input: { s: "()" }, expected: true },
      { input: { s: "()[]{}" }, expected: true },
      { input: { s: "(]" }, expected: false },
      // Hidden
      { input: { s: "([)]" }, expected: false, hidden: true },
      { input: { s: "{[]}" }, expected: true, hidden: true },
      // Tough: empty string
      { input: { s: "" }, expected: true, hidden: true },
      // Tough: single bracket
      { input: { s: "(" }, expected: false, hidden: true },
      { input: { s: "}" }, expected: false, hidden: true },
      // Tough: deeply nested
      { input: { s: "((((((()))))))" }, expected: true, hidden: true },
      // Tough: interleaved wrong
      { input: { s: "({[)]}" }, expected: false, hidden: true },
      // Tough: correct complex nesting
      { input: { s: "{[()()]()}" }, expected: true, hidden: true },
      // Tough: closing before opening
      { input: { s: ")(" }, expected: false, hidden: true },
      // Tough: long valid sequence
      { input: { s: "(){}[](){}[](){}[]" }, expected: true, hidden: true },
      // Tough: only closing brackets
      { input: { s: "))))" }, expected: false, hidden: true },
    ],
  },
];

export function getTestCasesByProblemId(problemId: string): TestCase[] {
  const problemTests = DSA_TEST_CASES.find((p) => p.problemId === problemId);
  return problemTests?.testCases || [];
}

export function getVisibleTestCases(problemId: string): TestCase[] {
  return getTestCasesByProblemId(problemId).filter((tc) => !tc.hidden);
}

export function getAllTestCases(problemId: string): TestCase[] {
  return getTestCasesByProblemId(problemId);
}
