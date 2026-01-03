-- 3D Rubik's Cube Solver Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scrambles table
CREATE TABLE IF NOT EXISTS scrambles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seed VARCHAR(64) UNIQUE NOT NULL,
    moves JSONB NOT NULL,
    move_count INTEGER NOT NULL CHECK (move_count = 25),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on seed for fast lookup
CREATE INDEX IF NOT EXISTS idx_scrambles_seed ON scrambles(seed);
CREATE INDEX IF NOT EXISTS idx_scrambles_created_at ON scrambles(created_at DESC);

-- Solutions table (renamed from solve_sessions)
CREATE TABLE IF NOT EXISTS solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scramble_id UUID REFERENCES scrambles(id) ON DELETE SET NULL,
    solver_type VARCHAR(20) NOT NULL CHECK (solver_type IN ('algorithm', 'slm')),
    moves JSONB NOT NULL,
    move_count INTEGER NOT NULL CHECK (move_count >= 0),
    compute_time_ms REAL NOT NULL CHECK (compute_time_ms >= 0),
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for solutions
CREATE INDEX IF NOT EXISTS idx_solutions_scramble_id ON solutions(scramble_id);
CREATE INDEX IF NOT EXISTS idx_solutions_solver_type ON solutions(solver_type);
CREATE INDEX IF NOT EXISTS idx_solutions_created_at ON solutions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solutions_success ON solutions(success);

-- Comments for documentation
COMMENT ON TABLE scrambles IS 'Stores scramble sequences with deterministic seeds for reproducibility';
COMMENT ON TABLE solutions IS 'Stores solution attempts with performance metrics and error tracking';
COMMENT ON COLUMN scrambles.seed IS 'Unique seed for deterministic scramble generation';
COMMENT ON COLUMN scrambles.moves IS 'JSON array of Move objects [{face: "U", direction: 1}, ...]';
COMMENT ON COLUMN solutions.solver_type IS 'Type of solver used: algorithm (Kociemba) or slm (Qwen2.5)';
COMMENT ON COLUMN solutions.compute_time_ms IS 'Time taken to compute solution in milliseconds';
