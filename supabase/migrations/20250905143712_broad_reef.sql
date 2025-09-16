/*
  # Student Ranking System Database Schema
  
  1. New Tables
    - `teachers` - Store teacher authentication and profile data
    - `classrooms` - Store classroom information with teacher association
    - `students` - Store student data with classroom and paralelo assignment
    - `point_transactions` - Track all point changes with audit trail
    - `ranking_snapshots` - Optional historical ranking data
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated teachers to manage their classrooms
    - Add policies for public read access to student rankings
  
  3. Features
    - Automatic point calculation via triggers
    - Ranking functions for classroom and paralelo views
    - Statistics functions for dashboard metrics
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: teachers
CREATE TABLE IF NOT EXISTS teachers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    full_name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: classrooms
CREATE TABLE IF NOT EXISTS classrooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_code text UNIQUE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: students
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    paralelo integer NOT NULL DEFAULT 1 CHECK (paralelo IN (1, 2, 3)),
    classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    total_points integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Table: point_transactions
CREATE TABLE IF NOT EXISTS point_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    points_change integer NOT NULL,
    reason text,
    transaction_type text DEFAULT 'manual',
    created_at timestamptz DEFAULT now()
);

-- Table: ranking_snapshots
CREATE TABLE IF NOT EXISTS ranking_snapshots (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    classroom_id uuid NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    snapshot_date date NOT NULL,
    ranking_data jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_classroom_id ON students(classroom_id);
CREATE INDEX IF NOT EXISTS idx_students_total_points ON students(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_students_paralelo ON students(paralelo);
CREATE INDEX IF NOT EXISTS idx_point_transactions_student_id ON point_transactions(student_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_id ON classrooms(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classrooms_class_code ON classrooms(class_code);

-- Enable RLS
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers
CREATE POLICY "Teachers can read own data"
  ON teachers
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- RLS Policies for classrooms
CREATE POLICY "Teachers can manage own classrooms"
  ON classrooms
  FOR ALL
  TO authenticated
  USING (teacher_id::text = auth.uid()::text);

CREATE POLICY "Public can read active classrooms"
  ON classrooms
  FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for students
CREATE POLICY "Teachers can manage students in their classrooms"
  ON students
  FOR ALL
  TO authenticated
  USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Public can read active students"
  ON students
  FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for point_transactions
CREATE POLICY "Teachers can manage transactions for their students"
  ON point_transactions
  FOR ALL
  TO authenticated
  USING (
    student_id IN (
      SELECT s.id FROM students s
      JOIN classrooms c ON s.classroom_id = c.id
      WHERE c.teacher_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Public can read point transactions"
  ON point_transactions
  FOR SELECT
  TO anon
  USING (true);

-- Function to update student total points automatically
CREATE OR REPLACE FUNCTION update_student_total_points()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE students 
    SET total_points = (
        SELECT COALESCE(SUM(points_change), 0) 
        FROM point_transactions 
        WHERE student_id = NEW.student_id
    ),
    updated_at = now()
    WHERE id = NEW.student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update student points when transaction is added
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_student_points'
    ) THEN
        CREATE TRIGGER trigger_update_student_points
            AFTER INSERT ON point_transactions
            FOR EACH ROW
            EXECUTE FUNCTION update_student_total_points();
    END IF;
END $$;

-- Function to get classroom ranking
CREATE OR REPLACE FUNCTION get_classroom_ranking(classroom_uuid uuid, paralelo_filter integer DEFAULT NULL)
RETURNS TABLE (
    student_id uuid,
    student_name text,
    paralelo integer,
    total_points integer,
    ranking_position bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.full_name,
        s.paralelo,
        s.total_points,
        ROW_NUMBER() OVER (ORDER BY s.total_points DESC, s.created_at ASC) as position
    FROM students s
    WHERE s.classroom_id = classroom_uuid 
      AND s.is_active = true
      AND (paralelo_filter IS NULL OR s.paralelo = paralelo_filter)
    ORDER BY s.total_points DESC, s.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get classroom statistics
CREATE OR REPLACE FUNCTION get_classroom_stats(classroom_uuid uuid, paralelo_filter integer DEFAULT NULL)
RETURNS TABLE (
    total_students bigint,
    average_points numeric,
    top_student_name text,
    top_student_points integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_students,
        ROUND(AVG(s.total_points), 2) as average_points,
        (SELECT full_name FROM students WHERE classroom_id = classroom_uuid AND is_active = true 
         AND (paralelo_filter IS NULL OR paralelo = paralelo_filter)
         ORDER BY total_points DESC LIMIT 1),
        (SELECT total_points FROM students WHERE classroom_id = classroom_uuid AND is_active = true 
         AND (paralelo_filter IS NULL OR paralelo = paralelo_filter)
         ORDER BY total_points DESC LIMIT 1)
    FROM students s
    WHERE s.classroom_id = classroom_uuid 
      AND s.is_active = true
      AND (paralelo_filter IS NULL OR s.paralelo = paralelo_filter);
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion
INSERT INTO teachers (id, email, password_hash, full_name) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'docente@escuela.edu', '$2b$10$example_hash_here', 'Prof. María González')
ON CONFLICT (email) DO NOTHING;

INSERT INTO classrooms (id, name, description, teacher_id, class_code) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Clase de Prueba', 'Clase para demostración del sistema', 
 '550e8400-e29b-41d4-a716-446655440000', 'TEST01')
ON CONFLICT (class_code) DO NOTHING;

-- Sample students with different paralelos
INSERT INTO students (full_name, paralelo, classroom_id) VALUES
('Ana Martínez', 1, '550e8400-e29b-41d4-a716-446655440001'),
('Carlos López', 2, '550e8400-e29b-41d4-a716-446655440001'),
('Sofia Rodríguez', 1, '550e8400-e29b-41d4-a716-446655440001'),
('Miguel Torres', 3, '550e8400-e29b-41d4-a716-446655440001'),
('Lucía Fernández', 2, '550e8400-e29b-41d4-a716-446655440001'),
('Diego Morales', 1, '550e8400-e29b-41d4-a716-446655440001'),
('Valentina Castro', 3, '550e8400-e29b-41d4-a716-446655440001'),
('Mateo Silva', 2, '550e8400-e29b-41d4-a716-446655440001'),
('Isabella Ruiz', 1, '550e8400-e29b-41d4-a716-446655440001'),
('Sebastián Herrera', 3, '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Sample point transactions to give students initial points
INSERT INTO point_transactions (student_id, teacher_id, points_change, reason)
SELECT 
    s.id,
    '550e8400-e29b-41d4-a716-446655440000',
    CASE s.full_name
        WHEN 'Isabella Ruiz' THEN 96
        WHEN 'Ana Martínez' THEN 95
        WHEN 'Sofia Rodríguez' THEN 92
        WHEN 'Valentina Castro' THEN 91
        WHEN 'Lucía Fernández' THEN 89
        WHEN 'Carlos López' THEN 87
        WHEN 'Diego Morales' THEN 84
        WHEN 'Sebastián Herrera' THEN 82
        WHEN 'Miguel Torres' THEN 78
        WHEN 'Mateo Silva' THEN 73
        ELSE 75
    END,
    'Puntos iniciales del sistema'
FROM students s
WHERE s.classroom_id = '550e8400-e29b-41d4-a716-446655440001'
ON CONFLICT DO NOTHING;