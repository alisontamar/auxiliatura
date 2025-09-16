import React, { useState, useEffect } from 'react';
import { Student, Teacher } from './types';
import { StudentRanking } from './components/StudentRanking';
import { TeacherLogin } from './components/TeacherLogin';
import { TeacherDashboard } from './components/TeacherDashboard';
import { useSupabase } from './hooks/useSupabase';
import { Analytics } from "@vercel/analytics/react"
import { UserCheck, Eye } from 'lucide-react';

function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [view, setView] = useState<'student' | 'teacher-login' | 'teacher-dashboard'>('student');
  const [selectedParalelo, setSelectedParalelo] = useState<number | null>(null);
  const [classroomId] = useState('550e8400-e29b-41d4-a716-446655440001'); // Demo classroom ID
  
  const { getStudents, addStudent, updateStudentPoints, authenticateTeacher, loading, error } = useSupabase();

  // Load students from Supabase
  useEffect(() => {
    loadStudents();
  }, []);

const loadStudents = async () => {
  try {
    const studentsData = await getStudents(classroomId);
    if (studentsData) setStudents(studentsData);
  } catch (err) {
    console.error("Error cargando estudiantes:", err);
  }
};


const handleTeacherLogin = async (email: string, password: string) => {
  try {
    const teacher = await authenticateTeacher(email, password);
    if (teacher) {
      setCurrentTeacher(teacher);
      setView('teacher-dashboard');
      localStorage.setItem("teacher", JSON.stringify(teacher));
    } else {
      alert("Correo o contraseña incorrectos.");
    }
  } catch {
    alert("Error al conectar con el servidor.");
  }
};

const handleTeacherLogout = () => {
  setCurrentTeacher(null);
  setView('student');
  localStorage.removeItem("teacher");
};

// Revisar sesión guardada al montar
useEffect(() => {
  const storedTeacher = localStorage.getItem("teacher");
  if (storedTeacher) {
    setCurrentTeacher(JSON.parse(storedTeacher));
    setView("teacher-dashboard");
  }
  loadStudents();
}, []);

 const handleAddStudent = async (name: string, paralelo: number) => {
  const newStudent = await addStudent(name, paralelo, classroomId);
  if (newStudent) {
    setStudents((prev) => [...prev, newStudent]);
  } else {
    alert("No se pudo agregar el estudiante");
  }
};


 const handlePointsChange = async (studentId: string, pointsChange: number) => {
  if (currentTeacher) {
    const success = await updateStudentPoints(studentId, pointsChange, currentTeacher.id);
    if (success) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, points: s.points + pointsChange } : s
        )
      );
    }
  }
};


  if (loading) {
    return (
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      {view === 'student' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setView('teacher-login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-xl"
          >
            <UserCheck className="w-4 h-4" />
            <span>Acceso Docente</span>
          </button>
        </div>
      )}

      {view === 'teacher-dashboard' && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setView('student')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-xl"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Ranking</span>
          </button>
        </div>
      )}

      {/* Main Content */}
      {view === 'student' && (
        <StudentRanking 
          students={students} 
          selectedParalelo={selectedParalelo}
          onParaleloChange={setSelectedParalelo}
        />
      )}

      {view === 'teacher-login' && (
        <TeacherLogin
          onLogin={handleTeacherLogin}
        />
      )}

      {view === 'teacher-dashboard' && currentTeacher && (
        <TeacherDashboard
          students={students}
          teacher={currentTeacher}
          onAddStudent={handleAddStudent}
          onPointsChange={handlePointsChange}
          onLogout={handleTeacherLogout}
        />
      )}
       <Analytics />
    </div>
  );
}

export default App;