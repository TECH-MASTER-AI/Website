/**
 * Smart Recommendation Engine for DSA Problems
 * Analyzes user activity and suggests appropriate questions
 */

export interface UserActivity {
  solvedProblems: string[];
  attemptedProblems: string[];
  difficultyStats: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  acceptance: number;
  tags: string[];
}

/**
 * Calculate user skill level based on their activity
 * Returns: "beginner" | "intermediate" | "advanced"
 */
export function calculateSkillLevel(activity: UserActivity): "beginner" | "intermediate" | "advanced" {
  const { solvedProblems, difficultyStats } = activity;
  
  // No problems solved = beginner
  if (solvedProblems.length === 0) {
    return "beginner";
  }

  const totalSolved = solvedProblems.length;
  const hardPercentage = (difficultyStats.Hard / totalSolved) * 100;
  const mediumPercentage = (difficultyStats.Medium / totalSolved) * 100;
  const easyPercentage = (difficultyStats.Easy / totalSolved) * 100;

  // Advanced: Solved 10+ problems with 40%+ hard or 20+ problems with 30%+ hard
  if (
    (totalSolved >= 10 && hardPercentage >= 40) ||
    (totalSolved >= 20 && hardPercentage >= 30) ||
    (totalSolved >= 30 && mediumPercentage >= 50)
  ) {
    return "advanced";
  }

  // Intermediate: Solved 5+ problems with some medium/hard or 10+ problems
  if (
    (totalSolved >= 5 && (mediumPercentage >= 30 || hardPercentage >= 20)) ||
    (totalSolved >= 10 && mediumPercentage >= 20)
  ) {
    return "intermediate";
  }

  // Beginner: Everything else
  return "beginner";
}

/**
 * Get recommended difficulty distribution based on skill level
 */
export function getRecommendedDistribution(skillLevel: "beginner" | "intermediate" | "advanced"): {
  Easy: number;
  Medium: number;
  Hard: number;
} {
  switch (skillLevel) {
    case "beginner":
      return { Easy: 70, Medium: 25, Hard: 5 }; // 70% easy, 25% medium, 5% hard
    case "intermediate":
      return { Easy: 30, Medium: 50, Hard: 20 }; // 30% easy, 50% medium, 20% hard
    case "advanced":
      return { Easy: 10, Medium: 40, Hard: 50 }; // 10% easy, 40% medium, 50% hard
  }
}

/**
 * Get frequently attempted tags by user
 */
export function getFrequentTags(
  solvedProblems: string[],
  allProblems: Problem[]
): string[] {
  const tagCount = new Map<string, number>();

  // Count tags from solved problems
  solvedProblems.forEach((problemId) => {
    const problem = allProblems.find((p) => p.id === problemId);
    if (problem) {
      problem.tags.forEach((tag) => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    }
  });

  // Sort by frequency and return top 5
  return Array.from(tagCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}

/**
 * Calculate problem score for recommendation
 * Higher score = better recommendation
 */
function calculateProblemScore(
  problem: Problem,
  userActivity: UserActivity,
  skillLevel: "beginner" | "intermediate" | "advanced",
  frequentTags: string[]
): number {
  let score = 0;

  // Already solved = skip
  if (userActivity.solvedProblems.includes(problem.id)) {
    return -1000;
  }

  // Attempted but not solved = slightly lower priority
  if (userActivity.attemptedProblems.includes(problem.id)) {
    score -= 50;
  }

  // Difficulty match based on skill level
  const distribution = getRecommendedDistribution(skillLevel);
  if (problem.difficulty === "Easy") {
    score += distribution.Easy;
  } else if (problem.difficulty === "Medium") {
    score += distribution.Medium;
  } else if (problem.difficulty === "Hard") {
    score += distribution.Hard;
  }

  // Boost problems with tags user frequently solves
  const matchingTags = problem.tags.filter((tag) => frequentTags.includes(tag));
  score += matchingTags.length * 15;

  // Boost problems with good acceptance rate (easier to start with)
  if (problem.acceptance >= 60) {
    score += 10;
  } else if (problem.acceptance >= 40) {
    score += 5;
  }

  // Add some randomness to avoid always showing same problems
  score += Math.random() * 10;

  return score;
}

/**
 * Get recommended problems for user
 */
export function getRecommendedProblems(
  allProblems: Problem[],
  userActivity: UserActivity,
  count: number = 20
): Problem[] {
  const skillLevel = calculateSkillLevel(userActivity);
  const frequentTags = getFrequentTags(userActivity.solvedProblems, allProblems);

  console.log('🎯 Recommendation Engine:', {
    skillLevel,
    totalSolved: userActivity.solvedProblems.length,
    frequentTags,
    distribution: getRecommendedDistribution(skillLevel)
  });

  // Calculate scores for all problems
  const scoredProblems = allProblems.map((problem) => ({
    problem,
    score: calculateProblemScore(problem, userActivity, skillLevel, frequentTags),
  }));

  // Sort by score and return top N
  return scoredProblems
    .filter((sp) => sp.score > 0) // Exclude already solved
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((sp) => sp.problem);
}

/**
 * Get user activity from localStorage
 */
export function getUserActivity(): UserActivity {
  const solvedStr = localStorage.getItem('dsa_solved_problems');
  const attemptedStr = localStorage.getItem('dsa_attempted_problems');

  const solvedProblems = solvedStr ? JSON.parse(solvedStr) : [];
  const attemptedProblems = attemptedStr ? JSON.parse(attemptedStr) : [];

  // Calculate difficulty stats (this would ideally come from backend)
  // For now, we'll estimate based on problem IDs
  const difficultyStats = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };

  // This is a placeholder - in real implementation, you'd fetch actual difficulty
  // from the problems data. For now, we'll use a simple heuristic.
  solvedProblems.forEach((id: string) => {
    // You can enhance this by fetching actual problem data
    const random = Math.random();
    if (random < 0.4) difficultyStats.Easy++;
    else if (random < 0.8) difficultyStats.Medium++;
    else difficultyStats.Hard++;
  });

  return {
    solvedProblems,
    attemptedProblems,
    difficultyStats,
  };
}

/**
 * Get user activity with actual problem data
 */
export function getUserActivityWithProblems(allProblems: Problem[]): UserActivity {
  const solvedStr = localStorage.getItem('dsa_solved_problems');
  const attemptedStr = localStorage.getItem('dsa_attempted_problems');

  const solvedProblems = solvedStr ? JSON.parse(solvedStr) : [];
  const attemptedProblems = attemptedStr ? JSON.parse(attemptedStr) : [];

  // Calculate actual difficulty stats from solved problems
  const difficultyStats = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  };

  solvedProblems.forEach((id: string) => {
    const problem = allProblems.find((p) => p.id === id);
    if (problem) {
      difficultyStats[problem.difficulty]++;
    }
  });

  return {
    solvedProblems,
    attemptedProblems,
    difficultyStats,
  };
}
