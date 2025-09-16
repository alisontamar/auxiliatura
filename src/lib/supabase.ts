import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      teachers: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      classrooms: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          teacher_id: string;
          class_code: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          teacher_id: string;
          class_code: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          teacher_id?: string;
          class_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          full_name: string;
          paralelo: number;
          classroom_id: string;
          total_points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          paralelo?: number;
          classroom_id: string;
          total_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          paralelo?: number;
          classroom_id?: string;
          total_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      point_transactions: {
        Row: {
          id: string;
          student_id: string;
          teacher_id: string;
          points_change: number;
          reason: string | null;
          transaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          teacher_id: string;
          points_change: number;
          reason?: string | null;
          transaction_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          teacher_id?: string;
          points_change?: number;
          reason?: string | null;
          transaction_type?: string;
          created_at?: string;
        };
      };
    };
  };
};