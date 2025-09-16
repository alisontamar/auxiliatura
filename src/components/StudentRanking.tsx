import React from 'react';
import { Student } from '../types';
import { StudentCard } from './StudentCard';
import { BarChart3, Users, Trophy, Filter } from 'lucide-react';

interface StudentRankingProps {
  students: Student[];
  selectedParalelo: number | null;
  onParaleloChange: (paralelo: number | null) => void;
}

export function StudentRanking({ students, selectedParalelo, onParaleloChange }: StudentRankingProps) {
  const filteredStudents = selectedParalelo 
    ? students.filter(student => student.paralelo === selectedParalelo)
    : students;
  
  const sortedStudents = [...filteredStudents].sort((a, b) => b.points - a.points);
  const totalStudents = students.length;
  const filteredCount = filteredStudents.length;
  const averagePoints = totalStudents > 0
  ? Math.round(students.reduce((sum, student) => sum + (student.points ?? 0), 0) / totalStudents)
  : 0;

  const topStudent = sortedStudents[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-800">
              Ranking de la Clase
              {selectedParalelo && ` - Paralelo ${selectedParalelo}`}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">¡Mira cómo van tus compañeros!</p>
        </div>

        {/* Paralelo Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 border-t-4 border-indigo-500">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-gray-700">Filtrar por Paralelo:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onParaleloChange(null)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedParalelo === null
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {[1, 2, 3].map(paralelo => (
                <button
                  key={paralelo}
                  onClick={() => onParaleloChange(paralelo)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedParalelo === paralelo
                      ? 'bg-indigo-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Paralelo {paralelo}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">
                  {selectedParalelo ? `Estudiantes Paralelo ${selectedParalelo}` : 'Total Estudiantes'}
                </p>
                <p className="text-2xl font-bold text-gray-800">{filteredCount}</p>
                {selectedParalelo && (
                  <p className="text-xs text-blue-600">de {totalStudents} total</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Promedio de Puntos</p>
                <p className="text-2xl font-bold text-gray-800">{averagePoints}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">
                  {selectedParalelo ? `Líder Paralelo ${selectedParalelo}` : 'Líder General'}
                </p>
                <p className="text-lg font-bold text-gray-800">{topStudent?.name}</p>
                <p className="text-sm text-yellow-600">
                  {topStudent?.points} puntos
                  {topStudent && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      P{topStudent.paralelo}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Posiciones {selectedParalelo ? `- Paralelo ${selectedParalelo}` : '- General'}
          </h2>
          {sortedStudents.map((student, index) => (
            <StudentCard
              key={student.id}
              student={student}
              position={index + 1}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white rounded-xl shadow-lg">
          <p className="text-gray-600">
            ¡Sigue esforzándote para subir en el ranking! 🌟
          </p>
          {selectedParalelo && (
            <p className="text-sm text-gray-500 mt-2">
              Mostrando solo estudiantes del Paralelo {selectedParalelo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}