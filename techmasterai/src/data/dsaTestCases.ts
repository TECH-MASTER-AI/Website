// Test cases for DSA problems
import { supabase } from "@/lib/supabase";

export interface TestCase {
  input: any;
  expected: any;
  hidden?: boolean; // Hidden test cases for submission
}

export interface ProblemTestCases {
  problemId: string;
  testCases: TestCase[];
}

// Fetch test cases from Supabase database
export async function getTestCasesByProblemId(problemId: string): Promise<TestCase[]> {
  try {
    // First, get the question ID from the slug
    const { data: questionData, error: questionError } = await supabase
      .from('dsa_questions')
      .select('id')
      .eq('slug', problemId)
      .single();

    if (questionError || !questionData) {
      console.error('Error fetching question:', questionError);
      return [];
    }

    // Fetch test cases for this question
    const { data: testCases, error: testCasesError } = await supabase
      .from('dsa_test_cases')
      .select('*')
      .eq('question_id', questionData.id)
      .order('id', { ascending: true });

    if (testCasesError) {
      console.error('Error fetching test cases:', testCasesError);
      return [];
    }

    if (!testCases || testCases.length === 0) {
      console.warn(`No test cases found for problem: ${problemId}`);
      return [];
    }

    // Transform database test cases to frontend format
    return testCases.map(tc => ({
      input: tc.input_data,
      expected: tc.expected_output,
      hidden: tc.is_hidden
    }));
  } catch (error) {
    console.error('Error in getTestCasesByProblemId:', error);
    return [];
  }
}

export async function getVisibleTestCases(problemId: string): Promise<TestCase[]> {
  const allTestCases = await getTestCasesByProblemId(problemId);
  return allTestCases.filter((tc) => !tc.hidden);
}

export async function getAllTestCases(problemId: string): Promise<TestCase[]> {
  return getTestCasesByProblemId(problemId);
}
