-- COMPLETE DSA TEST CASES SCHEMA - ALL STEPS IN ONE FILE
-- Run this entire file in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE ALL TABLES
-- =====================================================

-- 1. TEST CASES TABLE
CREATE TABLE IF NOT EXISTS dsa_test_cases (
    id BIGSERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES dsa_questions(id),
    slug VARCHAR(255) NOT NULL,
    input_data JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    description TEXT,
    execution_time_limit INTEGER DEFAULT 1000,
    memory_limit INTEGER DEFAULT 256,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TEST CASE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS dsa_test_case_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    weight DECIMAL(3,2) DEFAULT 1.0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS dsa_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    question_id INTEGER NOT NULL REFERENCES dsa_questions(id),
    slug VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL DEFAULT 'javascript',
    status VARCHAR(20) NOT NULL,
    total_test_cases INTEGER NOT NULL,
    passed_test_cases INTEGER NOT NULL,
    failed_test_cases INTEGER NOT NULL,
    execution_time INTEGER,
    memory_used INTEGER,
    score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SUBMISSION RESULTS TABLE
CREATE TABLE IF NOT EXISTS dsa_submission_results (
    id BIGSERIAL PRIMARY KEY,
    submission_id UUID REFERENCES dsa_submissions(id) ON DELETE CASCADE,
    test_case_id BIGINT REFERENCES dsa_test_cases(id),
    input_data JSONB NOT NULL,
    expected_output JSONB NOT NULL,
    actual_output JSONB,
    is_passed BOOLEAN NOT NULL,
    execution_time INTEGER,
    memory_used INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. QUESTION STATISTICS TABLE
CREATE TABLE IF NOT EXISTS dsa_question_stats (
    id SERIAL PRIMARY KEY,
    question_id INTEGER UNIQUE NOT NULL REFERENCES dsa_questions(id),
    slug VARCHAR(255) UNIQUE NOT NULL,
    total_submissions INTEGER DEFAULT 0,
    accepted_submissions INTEGER DEFAULT 0,
    acceptance_rate DECIMAL(5,2) DEFAULT 0.0,
    average_execution_time INTEGER DEFAULT 0,
    average_memory_usage INTEGER DEFAULT 0,
    difficulty_rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. USER PROGRESS TABLE
CREATE TABLE IF NOT EXISTS dsa_user_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    question_id INTEGER NOT NULL REFERENCES dsa_questions(id),
    slug VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    best_score DECIMAL(5,2) DEFAULT 0.0,
    attempts INTEGER DEFAULT 0,
    first_solved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

-- 7. TEST CASE GENERATION LOG TABLE
CREATE TABLE IF NOT EXISTS dsa_test_case_generation_log (
    id BIGSERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES dsa_questions(id),
    slug VARCHAR(255) NOT NULL,
    generation_status VARCHAR(20) NOT NULL,
    total_cases_generated INTEGER DEFAULT 0,
    visible_cases INTEGER DEFAULT 0,
    hidden_cases INTEGER DEFAULT 0,
    generation_time INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 2: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_dsa_test_cases_question_id ON dsa_test_cases(question_id);
CREATE INDEX IF NOT EXISTS idx_dsa_test_cases_slug ON dsa_test_cases(slug);
CREATE INDEX IF NOT EXISTS idx_dsa_test_cases_category ON dsa_test_cases(category);
CREATE INDEX IF NOT EXISTS idx_dsa_test_cases_hidden ON dsa_test_cases(is_hidden);

CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user_id ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_question_id ON dsa_submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_status ON dsa_submissions(status);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_created_at ON dsa_submissions(created_at);

CREATE INDEX IF NOT EXISTS idx_dsa_submission_results_submission_id ON dsa_submission_results(submission_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submission_results_test_case_id ON dsa_submission_results(test_case_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submission_results_passed ON dsa_submission_results(is_passed);

CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_question_id ON dsa_question_stats(question_id);
CREATE INDEX IF NOT EXISTS idx_dsa_question_stats_acceptance_rate ON dsa_question_stats(acceptance_rate);

CREATE INDEX IF NOT EXISTS idx_dsa_user_progress_user_id ON dsa_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_user_progress_status ON dsa_user_progress(status);
CREATE INDEX IF NOT EXISTS idx_dsa_user_progress_question_id ON dsa_user_progress(question_id);

CREATE INDEX IF NOT EXISTS idx_dsa_test_case_generation_log_question_id ON dsa_test_case_generation_log(question_id);
CREATE INDEX IF NOT EXISTS idx_dsa_test_case_generation_log_status ON dsa_test_case_generation_log(generation_status);

-- =====================================================
-- STEP 3: INSERT DEFAULT DATA
-- =====================================================

INSERT INTO dsa_test_case_categories (category_name, description, weight, is_visible) 
VALUES
    ('basic', 'Basic test cases from problem examples', 1.0, true),
    ('edge', 'Edge cases with special conditions', 1.2, false),
    ('boundary', 'Boundary value test cases', 1.3, false),
    ('performance', 'Large input performance tests', 1.5, false),
    ('stress', 'Random stress test cases', 1.1, false)
ON CONFLICT (category_name) DO NOTHING;

-- =====================================================
-- STEP 4: ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE dsa_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_submission_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON dsa_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON dsa_submissions;
DROP POLICY IF EXISTS "Users can view own submission results" ON dsa_submission_results;
DROP POLICY IF EXISTS "Users can view own progress" ON dsa_user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON dsa_user_progress;

CREATE POLICY "Users can view own submissions" ON dsa_submissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" ON dsa_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own submission results" ON dsa_submission_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM dsa_submissions 
            WHERE dsa_submissions.id = dsa_submission_results.submission_id 
            AND dsa_submissions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own progress" ON dsa_user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON dsa_user_progress
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- STEP 5: CREATE VIEWS
-- =====================================================

DROP VIEW IF EXISTS dsa_question_overview;
DROP VIEW IF EXISTS dsa_user_leaderboard;

CREATE VIEW dsa_question_overview AS
SELECT 
    q.id,
    q.slug,
    q.description,
    q.difficulty,
    q.topics,
    q.constraints,
    q.total_examples,
    COUNT(tc.id) as total_test_cases,
    COUNT(CASE WHEN tc.is_hidden = false THEN 1 END) as visible_test_cases,
    COUNT(CASE WHEN tc.is_hidden = true THEN 1 END) as hidden_test_cases,
    COALESCE(qs.acceptance_rate, 0) as acceptance_rate,
    COALESCE(qs.total_submissions, 0) as total_submissions
FROM dsa_questions q
LEFT JOIN dsa_test_cases tc ON q.id = tc.question_id
LEFT JOIN dsa_question_stats qs ON q.id = qs.question_id
GROUP BY q.id, q.slug, q.description, q.difficulty, q.topics, q.constraints, q.total_examples, qs.acceptance_rate, qs.total_submissions;

CREATE VIEW dsa_user_leaderboard AS
SELECT 
    u.id as user_id,
    u.email,
    COUNT(CASE WHEN up.status = 'solved' THEN 1 END) as problems_solved,
    COUNT(up.id) as problems_attempted,
    COALESCE(AVG(up.best_score), 0) as average_score,
    RANK() OVER (ORDER BY COUNT(CASE WHEN up.status = 'solved' THEN 1 END) DESC) as rank
FROM auth.users u
LEFT JOIN dsa_user_progress up ON u.id = up.user_id
GROUP BY u.id, u.email
ORDER BY problems_solved DESC, average_score DESC;

-- =====================================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- =====================================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS (CORRECTED)
-- =====================================================

DROP FUNCTION IF EXISTS update_question_stats();

CREATE OR REPLACE FUNCTION update_question_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO dsa_question_stats (question_id, slug, total_submissions, accepted_submissions)
    VALUES (NEW.problem_id, NEW.slug, 1, CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END)
    ON CONFLICT (question_id) 
    DO UPDATE SET
        total_submissions = dsa_question_stats.total_submissions + 1,
        accepted_submissions = dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
        acceptance_rate = (dsa_question_stats.accepted_submissions + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END) * 100.0 / (dsa_question_stats.total_submissions + 1),
        created_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_question_stats ON dsa_submissions;

CREATE TRIGGER trigger_update_question_stats
    AFTER INSERT ON dsa_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_question_stats();


-- =====================================================
-- STEP 7: SAMPLE TEST DATA
-- =====================================================

INSERT INTO dsa_test_cases (question_id, slug, input_data, expected_output, is_hidden, category, difficulty, description)
SELECT 
    q.id,
    q.slug,
    '{"arr": [8, 7, 2, 5, 3, 1], "target": 10}',
    '[7, 3]',
    false,
    'basic',
    q.difficulty,
    'Basic example from problem description'
FROM dsa_questions q 
WHERE q.id = 1
ON CONFLICT DO NOTHING;

INSERT INTO dsa_test_cases (question_id, slug, input_data, expected_output, is_hidden, category, difficulty, description)
SELECT 
    q.id,
    q.slug,
    '{"arr": [5, 2, 6, 8, 1, 9], "target": 12}',
    'null',
    false,
    'basic',
    q.difficulty,
    'No pair exists case'
FROM dsa_questions q 
WHERE q.id = 1
ON CONFLICT DO NOTHING;

INSERT INTO dsa_test_cases (question_id, slug, input_data, expected_output, is_hidden, category, difficulty, description)
SELECT 
    q.id,
    q.slug,
    '{"arr": [1, 1], "target": 2}',
    '[1, 1]',
    true,
    'edge',
    q.difficulty,
    'Duplicate elements edge case'
FROM dsa_questions q 
WHERE q.id = 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 DSA TEST CASES SCHEMA COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '✅ Tables created: 7';
    RAISE NOTICE '✅ Indexes created: 14';
    RAISE NOTICE '✅ Views created: 2';
    RAISE NOTICE '✅ Functions created: 1';
    RAISE NOTICE '✅ Triggers created: 1';
    RAISE NOTICE '✅ RLS Policies created: 5';
    RAISE NOTICE '✅ Sample test cases added: 3';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for test case generation and submissions!';
    RAISE NOTICE '📊 Check your tables in Supabase Table Editor';
END $$;