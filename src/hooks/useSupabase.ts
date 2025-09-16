import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Teacher, Classroom } from '../types';

export function useSupabase() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get students from a classroom with optional paralelo filter
  const getStudents = async (classroomId: string, paralelo?: number): Promise<Student[]> => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('students')
        .select('*')
        .eq('classroom_id', classroomId)
        .eq('is_active', true)
        .order('total_points', { ascending: false });

      if (paralelo) {
        query = query.eq('paralelo', paralelo);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data.map(student => ({
        id: student.id,
        name: student.full_name,
        paralelo: student.paralelo,
        points: student.total_points
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching students');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Add a new student
// Add a new student
// Add a new student
const addStudent = async (name: string, paralelo: number, classroomId: string): Promise<Student | null> => {
  setError(null);
  try {
    const { data, error } = await supabase
      .from("students")
      .insert({
        full_name: name,
        paralelo,
        classroom_id: classroomId,
        total_points: 0,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.full_name,
      paralelo: data.paralelo,
      points: data.total_points,
    };
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error adding student");
    return null;
  }
};

// Update student points
const updateStudentPoints = async (
  studentId: string,
  pointsChange: number,
  teacherId: string,
  reason?: string
): Promise<Student | null> => {
  setError(null);
  try {
    const { error: txError } = await supabase
      .from("point_transactions")
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        points_change: pointsChange,
        reason: reason || "Ajuste manual de puntos",
        transaction_type: "manual",
      });

    if (txError) throw txError;

    const { data, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError) throw studentError;

    return {
      id: data.id,
      name: data.full_name,
      paralelo: data.paralelo,
      points: data.total_points,
    };
  } catch (err) {
    setError(err instanceof Error ? err.message : "Error updating points");
    return null;
  }
};


  // Authenticate teacher
 // Authenticate teacher
const authenticateTeacher = async (email: string, password: string): Promise<Teacher | null> => {
  setLoading(true);
  setError(null);

  try {
    // 1. Autenticación con Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message || "Credenciales incorrectas");
    }

    // 2. Buscar al teacher en tu tabla
    const { data: teacher, error: teacherError } = await supabase
      .from("teachers")
      .select("*")
      .eq("id", data.user.id) // 👈 el id del usuario en Auth coincide con el id en teachers
      .single();

    if (teacherError) throw teacherError;

    return {
      id: teacher.id,
      name: teacher.full_name,
      email: teacher.email,
    };
  } catch (err) {
    setError(err instanceof Error ? err.message : "Authentication failed");
    return null;
  } finally {
    setLoading(false);
  }
};



  // Get classroom by code
  const getClassroomByCode = async (classCode: string): Promise<Classroom | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('class_code', classCode)
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        teacher_id: data.teacher_id,
        class_code: data.class_code,
        is_active: data.is_active
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classroom not found');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getStudents,
    addStudent,
    updateStudentPoints,
    authenticateTeacher,
    getClassroomByCode
  };
}