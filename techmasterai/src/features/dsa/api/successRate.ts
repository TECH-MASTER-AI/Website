/**
 * Real-time Success Rate API
 * Fetches live success rate data from Supabase dsa_question_stats table
 */

import { supabase } from "@/lib/supabase";

export interface ProblemSuccessRate {
  problemId: string;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
}

/**
 * Get success rate for a specific problem
 */
export async function getProblemSuccessRate(problemId: string): Promise<ProblemSuccessRate | null> {
  try {
    const { data, error } = await supabase
      .from('dsa_question_stats')
      .select('question_id, total_submissions, accepted_submissions, acceptance_rate')
      .eq('question_id', problemId)
      .single();

    if (error || !data) {
      console.error('Error fetching success rate:', error);
      return null;
    }

    return {
      problemId: data.question_id.toString(),
      totalAttempts: data.total_submissions || 0,
      successfulAttempts: data.accepted_submissions || 0,
      successRate: data.acceptance_rate || 0,
    };
  } catch (error) {
    console.error('Error fetching success rate:', error);
    return null;
  }
}

/**
 * Get success rates for multiple problems
 */
export async function getMultipleProblemSuccessRates(problemIds: string[]): Promise<Map<string, ProblemSuccessRate>> {
  try {
    const numericIds = problemIds.map(id => parseInt(id)).filter(id => !isNaN(id));
    
    const { data, error } = await supabase
      .from('dsa_question_stats')
      .select('question_id, total_submissions, accepted_submissions, acceptance_rate')
      .in('question_id', numericIds);

    if (error || !data) {
      console.error('Error fetching success rates:', error);
      return new Map();
    }

    const ratesMap = new Map<string, ProblemSuccessRate>();
    data.forEach(stat => {
      ratesMap.set(stat.question_id.toString(), {
        problemId: stat.question_id.toString(),
        totalAttempts: stat.total_submissions || 0,
        successfulAttempts: stat.accepted_submissions || 0,
        successRate: stat.acceptance_rate || 0,
      });
    });

    return ratesMap;
  } catch (error) {
    console.error('Error fetching success rates:', error);
    return new Map();
  }
}

/**
 * Get all problems with their success rates
 */
export async function getAllProblemsSuccessRates(): Promise<Map<string, ProblemSuccessRate>> {
  try {
    const { data, error } = await supabase
      .from('dsa_question_stats')
      .select('question_id, total_submissions, accepted_submissions, acceptance_rate');

    if (error || !data) {
      console.error('Error fetching all success rates:', error);
      return new Map();
    }

    const ratesMap = new Map<string, ProblemSuccessRate>();
    data.forEach(stat => {
      ratesMap.set(stat.question_id.toString(), {
        problemId: stat.question_id.toString(),
        totalAttempts: stat.total_submissions || 0,
        successfulAttempts: stat.accepted_submissions || 0,
        successRate: stat.acceptance_rate || 0,
      });
    });

    return ratesMap;
  } catch (error) {
    console.error('Error fetching all success rates:', error);
    return new Map();
  }
}

/**
 * Subscribe to real-time success rate updates for a problem
 */
export function subscribeToSuccessRate(
  problemId: string,
  callback: (rate: ProblemSuccessRate) => void
) {
  const channel = supabase
    .channel(`success-rate-${problemId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'dsa_question_stats',
        filter: `question_id=eq.${problemId}`,
      },
      (payload) => {
        const data = payload.new as any;
        callback({
          problemId: data.question_id.toString(),
          totalAttempts: data.total_submissions || 0,
          successfulAttempts: data.accepted_submissions || 0,
          successRate: data.acceptance_rate || 0,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Get success rate statistics
 */
export async function getSuccessRateStats() {
  try {
    const { data: statsData, error: statsError } = await supabase
      .from('dsa_question_stats')
      .select('acceptance_rate, question_id');

    if (statsError || !statsData) {
      return {
        averageSuccessRate: 0,
        easyAverage: 0,
        mediumAverage: 0,
        hardAverage: 0,
      };
    }

    // Get question difficulties
    const { data: questionsData, error: questionsError } = await supabase
      .from('dsa_questions')
      .select('id, difficulty');

    if (questionsError || !questionsData) {
      const rates = statsData.map(s => s.acceptance_rate || 0);
      const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      return {
        averageSuccessRate: avg(rates),
        easyAverage: 0,
        mediumAverage: 0,
        hardAverage: 0,
      };
    }

    // Create difficulty map
    const difficultyMap = new Map(questionsData.map(q => [q.id, q.difficulty]));

    const rates = statsData.map(s => s.acceptance_rate || 0);
    const easyRates = statsData
      .filter(s => difficultyMap.get(s.question_id) === 'Easy')
      .map(s => s.acceptance_rate || 0);
    const mediumRates = statsData
      .filter(s => difficultyMap.get(s.question_id) === 'Medium')
      .map(s => s.acceptance_rate || 0);
    const hardRates = statsData
      .filter(s => difficultyMap.get(s.question_id) === 'Hard')
      .map(s => s.acceptance_rate || 0);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    return {
      averageSuccessRate: avg(rates),
      easyAverage: avg(easyRates),
      mediumAverage: avg(mediumRates),
      hardAverage: avg(hardRates),
    };
  } catch (error) {
    console.error('Error fetching success rate stats:', error);
    return {
      averageSuccessRate: 0,
      easyAverage: 0,
      mediumAverage: 0,
      hardAverage: 0,
    };
  }
}
