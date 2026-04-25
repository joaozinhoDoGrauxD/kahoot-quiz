/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import TeacherDashboard from './components/TeacherDashboard';
import StudentJoin from './components/StudentJoin';
import Gameplay from './components/Gameplay';

export default function App() {
  const [role, setRole] = useState<'teacher' | 'student' | null>(null);
  const [activeSession, setActiveSession] = useState<{pin: string, studentId: string} | null>(null);

  if (activeSession) {
    return <Gameplay sessionId={activeSession.pin} studentId={activeSession.studentId} />;
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] flex flex-col items-center justify-center font-sans p-4">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-block bg-[#141416] p-4 px-8 rounded-full border border-[#27272A] mb-8 shadow-2xl">
            <span className="text-xl text-gray-400 font-bold tracking-[0.2em] uppercase">Algoritmos LMS Gamificado</span> 
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight max-w-4xl mx-auto">Como você deseja acessar?</h1>
          <p className="text-xl text-gray-500 mb-16">Selecione seu perfil para entrar na plataforma de ensino.</p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button 
              onClick={() => setRole('student')} 
              className="bg-[#D4AF37] text-[#0A0A0B] font-black py-6 px-16 rounded-2xl text-2xl uppercase tracking-wider hover:bg-opacity-90 shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1"
            >
              Sou Aluno
            </button>
            <button 
              onClick={() => setRole('teacher')} 
              className="bg-[#141416] text-white border border-[#27272A] font-black py-6 px-16 rounded-2xl text-2xl uppercase tracking-wider hover:bg-[#27272A] shadow-lg transition-all hover:-translate-y-1"
            >
              Sou Professor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="fixed top-0 p-4 z-50">
        <button onClick={() => setRole(null)} className="text-gray-500 hover:text-white uppercase font-bold text-sm tracking-widest transition-colors flex items-center gap-2">
          ← Voltar para Início
        </button>
      </div>
      {role === 'teacher' ? <TeacherDashboard /> : <StudentJoin onJoin={(pin, studentId) => setActiveSession({pin, studentId})} />}
    </div>
  );
}
