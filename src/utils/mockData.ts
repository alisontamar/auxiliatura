import { Student, Teacher } from '../types';

export const mockTeacher: Teacher = {
  id: '1',
  name: 'Prof. María González',
  email: 'docente@escuela.edu',
  password: 'docente123'
};

export const initialStudents: Student[] = [
  { id: '1', name: 'Ana Martínez', points: 95 },
  { id: '2', name: 'Carlos López', points: 87 },
  { id: '3', name: 'Sofia Rodríguez', points: 92 },
  { id: '4', name: 'Miguel Torres', points: 78 },
  { id: '5', name: 'Lucía Fernández', points: 89 },
  { id: '6', name: 'Diego Morales', points: 84 },
  { id: '7', name: 'Valentina Castro', points: 91 },
  { id: '8', name: 'Mateo Silva', points: 73 },
  { id: '9', name: 'Isabella Ruiz', points: 96 },
  { id: '10', name: 'Sebastián Herrera', points: 82 },
];