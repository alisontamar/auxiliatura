import React from 'react';
import { Student } from '../types';
import { Trophy, Medal, Award } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  position: number;
  isTeacherView?: boolean;
  onPointsChange?: (studentId: string, change: number) => void;
}

export function StudentCard({ student, position, isTeacherView = false, onPointsChange }: StudentCardProps) {
  const getRankIcon = () => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getRankBadge = () => {
    if (position <= 3) {
      const colors = {
        1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
        2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
        3: 'bg-gradient-to-r from-amber-500 to-amber-700 text-white'
      };
      return colors[position as keyof typeof colors];
    }
    return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
  };

  const getPointsColor = () => {
    if (student.points >= 90) return 'text-green-600 font-bold';
    if (student.points >= 80) return 'text-blue-600 font-semibold';
    if (student.points >= 70) return 'text-orange-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 ${
      position <= 3 ? 'border-yellow-400' : 'border-blue-400'
    } transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getRankBadge()}`}>
            {position}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Paralelo {student.paralelo}
              </span>
              {getRankIcon()}
            </div>
            <div className="flex items-center mt-1">
              <span className={`text-2xl font-bold ${getPointsColor()}`}>
                {student.points}
              </span>
              <span className="text-sm text-gray-500 ml-1">puntos</span>
            </div>
          </div>
        </div>

        {isTeacherView && onPointsChange && (
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onPointsChange(student.id, 5)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              +5
            </button>
            <button
              onClick={() => onPointsChange(student.id, 1)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              +1
            </button>
            <button
              onClick={() => onPointsChange(student.id, -1)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              -1
            </button>
            <button
              onClick={() => onPointsChange(student.id, -5)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              -5
            </button>
          </div>
        )}
      </div>
    </div>
  );
}