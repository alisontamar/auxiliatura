export interface Student {
  id: string;
  name: string;
  paralelo: number;
  points: number;
  avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacher_id: string;
  class_code: string;
  is_active: boolean;
}

export interface PointTransaction {
  id: string;
  student_id: string;
  teacher_id: string;
  points_change: number;
  reason?: string;
  transaction_type: string;
  created_at: string;
}