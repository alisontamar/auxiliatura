import React, { useState } from 'react';
import { Student, Teacher } from '../types';
import { StudentCard } from './StudentCard';
import { LogOut, Settings, RotateCcw, Users, TrendingUp, UserPlus } from 'lucide-react';

interface TeacherDashboardProps {
  students: Student[];
  teacher: Teacher;
  onAddStudent: (name: string, paralelo: number) => void;
  onPointsChange: (studentId: string, pointsChange: number) => void;
  onLogout: () => void;
}

export function TeacherDashboard({ students, teacher, onAddStudent, onPointsChange, onLogout }: TeacherDashboardProps) {
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentParalelo, setNewStudentParalelo] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handlePointsChange = (studentId: string, change: number) => {
    onPointsChange(studentId, change);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim(), newStudentParalelo);
      setNewStudentName('');
      setNewStudentParalelo(1);
      setShowAddForm(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar todos los puntos a 0?')) {
      // Reset all students to 0 points
      students.forEach(student => {
        if (student.points > 0) {
          onPointsChange(student.id, -student.points);
        }
      });
    }
  };

  const sortedStudents = [...students].sort((a, b) => b.points - a.points);
  const filteredStudents = sortedStudents.filter(student => 
    student.name.toLowerCase().includes(searchName.toLowerCase())
  );
  const totalStudents = students.length;
  const averagePoints = Math.round(students.reduce((sum, student) => sum + student.points, 0) / totalStudents);
  const studentsAboveAverage = students.filter(s => s.points >= averagePoints).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Panel de Control</h1>
                <p className="text-sm sm:text-base text-gray-600">Bienvenido/a, {teacher.name}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Añadir Estudiante</span>
                <span className="sm:hidden">Añadir</span>
              </button>
              
              <button
                onClick={handleReset}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reiniciar</span>
              </button>
              
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200 text-sm sm:text-base"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Add Student Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8 border-t-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nuevo Estudiante</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Nombre completo del estudiante"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paralelo
                  </label>
                  <select
                    value={newStudentParalelo}
                    onChange={(e) => setNewStudentParalelo(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value={1}>Paralelo 1</option>
                    <option value={2}>Paralelo 2</option>
                    <option value={3}>Paralelo 3</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Añadir Estudiante</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStudentName('');
                    setNewStudentParalelo(1);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors duration-200"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Student Form - Old version to remove */}
        {false && showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-green-500">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Añadir Nuevo Estudiante</h3>
            <form onSubmit={handleAddStudent} className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nombre completo del estudiante"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors duration-200"
              >
                <UserPlus className="w-4 h-4" />
                <span>Añadir</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewStudentName('');
                  setNewStudentParalelo(1);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors duration-200"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}

        {/* Auto-save indicator */}
        <div className="text-center mb-6">
          <p className="text-xs sm:text-sm text-gray-500 bg-gray-50 inline-block px-4 py-2 rounded-full">
            💾 Los cambios se guardan automáticamente
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <Users className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Total Estudiantes</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-green-500">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 sm:w-8 h-6 sm:h-8 text-green-500" />
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Promedio General</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{averagePoints}</p>
                <p className="text-xs text-green-600">{studentsAboveAverage} sobre el promedio</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-t-4 border-purple-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                {sortedStudents[0]?.name[0]}
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Mejor Estudiante</p>
                <p className="text-sm sm:text-lg font-bold text-gray-800 truncate">{sortedStudents[0]?.name}</p>
                <p className="text-xs sm:text-sm text-purple-600">{sortedStudents[0]?.points} puntos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Instrucciones:</h3>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
            <li>• Usa los botones +5/+1 para dar puntos por buen comportamiento o tareas completadas</li>
            <li>• Usa los botones -1/-5 para descontar puntos por mal comportamiento</li>
            <li>• Añade nuevos estudiantes usando el botón "Añadir Estudiante"</li>
            <li>• Asigna a cada estudiante un paralelo (1, 2 o 3) para organizar mejor la clase</li>
            <li>• Los cambios se guardan automáticamente al modificar puntos</li>
            <li>• Los estudiantes pueden ver el ranking actualizado en tiempo real</li>
            <li>• Los estudiantes pueden filtrar el ranking por paralelo o ver el ranking general</li>
          </ul>
        </div>

        {/* Students Management */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestionar Estudiantes</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          {filteredStudents.map((student, index) => (
            <StudentCard
              key={student.id}
              student={student}
              position={sortedStudents.findIndex(s => s.id === student.id) + 1}
              isTeacherView={true}
              onPointsChange={handlePointsChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}