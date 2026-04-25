import { useState, useEffect } from 'react';
import { db } from '../lib/firebaseClient';
import { collection, addDoc, getDocs, query, where, onSnapshot, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import QuestionManager from './QuestionManager';

export default function TeacherDashboard() {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<{pin: string, quizId: string} | null>(null);
  const [sessionDoc, setSessionDoc] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(30); // 30s por pergunta

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Timer da sessão ativa
  useEffect(() => {
    let timer: any;
    if (activeSession && sessionDoc?.status === 'active' && !sessionDoc?.showLeaderboard) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0; // Terminou o tempo
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeSession, sessionDoc?.status, sessionDoc?.showLeaderboard, sessionDoc?.currentQuestionIndex]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const q = query(collection(db, 'quizzes'), where('teacherId', '==', 'teacher-123'));
      const snapshot = await getDocs(q);
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    const unsub = onSnapshot(doc(db, 'liveSessions', activeSession.pin), (doc) => {
      setSessionDoc(doc.data());
    });
    
    // Monitorar participantes
    const unsubParticipants = onSnapshot(collection(db, `liveSessions/${activeSession.pin}/participants`), (snapshot) => {
      const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by score descending
      parts.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
      setParticipants(parts);
    });

    return () => { unsub(); unsubParticipants(); };
  }, [activeSession]);

  // Mover effect
  const showLeaderboard = async () => {
    if (!activeSession) return;
    const sessionRef = doc(db, 'liveSessions', activeSession.pin);
    await updateDoc(sessionRef, {
      showLeaderboard: true
    });
  };

  // Verificar se todos responderam para ir para o Leaderboard automaticamente
  useEffect(() => {
    if (activeSession && sessionDoc && sessionDoc.status === 'active' && !sessionDoc.showLeaderboard) {
      if (participants.length > 0) {
        const allAnswered = participants.every(p => p.answeredQuestionIndex === sessionDoc.currentQuestionIndex);
        if (allAnswered || timeLeft === 0) {
          showLeaderboard();
        }
      } else if (timeLeft === 0) {
        showLeaderboard();
      }
    }
  }, [participants, sessionDoc, timeLeft, activeSession]);

  const createQuiz = async () => {
    if (!quizTitle) return;
    try {
      const docRef = await addDoc(collection(db, 'quizzes'), {
        title: quizTitle,
        teacherId: 'teacher-123',
        questions
      });
      // alert removido para evitar problemas no iframe
      setQuizzes([...quizzes, { id: docRef.id, title: quizTitle, questions }]);
      setQuizTitle('');
      setQuestions([]);
    } catch (e: any) {
      console.error(e);
      // alert removido
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      setConfirmDeleteId(null);
    } catch (e: any) {
      console.error("Erro ao deletar: " + e.message);
    }
  };

  const startSession = async (quizId: string) => {
    try {
      console.log('Iniciando sessão para quiz ID:', quizId);
      const quizRef = doc(db, 'quizzes', quizId);
      const quizSnap = await getDoc(quizRef);
      
      if (!quizSnap.exists()) {
        throw new Error('Quiz não encontrado');
      }
      
      const quizData = quizSnap.data();
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('PIN gerado:', pin);
      
      const sessionRef = doc(db, 'liveSessions', pin);
      await setDoc(sessionRef, {
        pin,
        quizId,
        status: 'waiting',
        currentQuestionIndex: 0,
        questions: quizData?.questions || [],
        createdAt: new Date().toISOString()
      });
      
      console.log('Sessão salva no Firestore. Atualizando estado local.');
      setActiveSession({ pin, quizId });
    } catch(e: any) {
        console.error("Erro completo:", e);
        // alert removido para iFrame support
    }
  };

  const startGame = async () => {
    if (!activeSession) return;
    const sessionRef = doc(db, 'liveSessions', activeSession.pin);
    setTimeLeft(30);
    await updateDoc(sessionRef, {
      status: 'active',
      showLeaderboard: false
    });
  };

  const nextQuestion = async () => {
    if (!activeSession) return;
    const sessionRef = doc(db, 'liveSessions', activeSession.pin);
    const sessionSnap = await getDoc(sessionRef);
    if (!sessionSnap.exists()) return;
    
    const data = sessionSnap.data();
    setTimeLeft(30);
    await updateDoc(sessionRef, {
      currentQuestionIndex: (data.currentQuestionIndex || 0) + 1,
      showLeaderboard: false
    });
  };

  const finishSession = () => {
    setActiveSession(null);
    setSessionDoc(null);
    setParticipants([]);
  };

  if (activeSession && sessionDoc) {
    const isFinished = sessionDoc.status === 'active' && sessionDoc.currentQuestionIndex >= (sessionDoc.questions?.length || 0);
    const isWaiting = sessionDoc.status === 'waiting';
    const isShowingLeaderboard = sessionDoc.showLeaderboard;
    const currentQuestion = sessionDoc.questions?.[sessionDoc.currentQuestionIndex];
    const colors = ['bg-red-600', 'bg-blue-600', 'bg-yellow-500', 'bg-green-600', 'bg-purple-600'];

    return (
      <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] p-8 font-sans flex flex-col items-center justify-center">
        {!isWaiting && !isFinished && !isShowingLeaderboard && (
          <div className="absolute top-8 right-12 text-center">
             <div className="text-gray-400 font-bold mb-1">TEMPO</div>
             <div className={`text-6xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft}
             </div>
          </div>
        )}

        <div className="w-full max-w-5xl text-center mb-8">
          <p className="text-xl text-gray-400 font-bold tracking-[0.2em] mb-4">
            {isWaiting ? 'SALA DE ESPERA' : isFinished ? 'RESULTADOS FINAIS' : (isShowingLeaderboard ? 'PLACAR ATUAL' : `PERGUNTA ${sessionDoc.currentQuestionIndex + 1}`)}
          </p>
          <div className="inline-block bg-[#141416] p-4 px-8 rounded-full border border-[#27272A] mb-8 shadow-2xl">
              <span className="text-gray-400 mr-4 font-bold">PIN DA SALA:</span> 
              <span className="text-4xl font-black tracking-widest text-[#D4AF37]">{activeSession.pin}</span>
          </div>

          {!isWaiting && !isFinished && !isShowingLeaderboard && currentQuestion && (
            <div className="w-full">
              <h1 className="text-5xl md:text-6xl font-black mb-16 leading-tight max-w-4xl mx-auto">{currentQuestion.text}</h1>
              
              {currentQuestion.type === 'multiple_choice' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-5xl mx-auto">
                  {currentQuestion.options?.map((opt: any, idx: number) => (
                    <div key={opt.id} className={`${colors[idx % colors.length]} p-6 rounded-xl flex items-center shadow-lg`}>
                        <div className="text-white opacity-80 text-3xl font-black mr-6">{opt.id}</div> 
                        <div className="text-3xl font-bold text-white">{opt.text}</div>
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
                   <div className="bg-blue-600 p-8 rounded-xl text-center shadow-lg">
                      <div className="text-5xl font-black text-white">Verdadeiro</div>
                   </div>
                   <div className="bg-red-600 p-8 rounded-xl text-center shadow-lg">
                      <div className="text-5xl font-black text-white">Falso</div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {(isWaiting || isShowingLeaderboard || isFinished) && (
          <div className="w-full max-w-4xl bg-[#141416] p-8 rounded-xl border border-[#27272A] mb-8 shadow-2xl flex-1 max-h-[60vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-8 flex items-center justify-center gap-3">
              {isWaiting ? '👥 Alunos na Sala' : '🏆 Leaderboard Top Players'}
            </h2>
            <div className="space-y-4">
              {participants.length === 0 && <p className="text-gray-500 text-center italic text-xl">Aguardando jogadores ingressarem no PIN {activeSession.pin}...</p>}
              {participants.map((p, idx) => (
                <div key={p.id} className="flex justify-between items-center bg-[#0A0A0B] p-5 rounded-lg border border-[#27272A] transform transition-transform hover:scale-[1.01]">
                  <div className="flex items-center gap-6">
                    {!isWaiting && (
                      <span className={`font-black text-3xl w-12 text-center ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                        #{idx + 1}
                      </span>
                    )}
                    <span className="font-bold text-2xl">{p.name || p.id}</span>
                  </div>
                  {!isWaiting && <span className="font-mono text-3xl font-bold text-[#D4AF37]">{p.score || 0} pts</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 fixed bottom-12 right-12 z-50">
          {isWaiting ? (
            <button 
              onClick={startGame}
              className="bg-[#D4AF37] text-[#0A0A0B] font-black py-5 px-16 rounded-2xl text-2xl uppercase tracking-wider hover:bg-opacity-90 shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all hover:scale-105"
            >
              Iniciar Jogo
            </button>
          ) : !isFinished ? (
               isShowingLeaderboard ? (
                <button 
                  onClick={nextQuestion}
                  className="bg-[#D4AF37] text-[#0A0A0B] font-black py-4 px-12 rounded-xl text-xl uppercase hover:bg-opacity-90 shadow-lg"
                >
                  Próxima Pergunta
                </button>
               ) : (
                <button 
                  onClick={showLeaderboard}
                  className="bg-blue-600 text-white font-black py-4 px-12 rounded-xl text-xl uppercase hover:bg-blue-500 shadow-lg"
                >
                  Revelar Leaderboard
                </button>
               )
          ) : (
            <button 
              onClick={finishSession}
              className="bg-red-600 text-white font-black py-5 px-12 rounded-2xl text-xl uppercase hover:bg-red-500 shadow-lg"
            >
              Encerrar Sessão
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#141416] p-8 rounded-xl border border-[#27272A]">
          <h1 className="text-3xl font-serif italic mb-6 text-[#E4E4E7]">Teacher Dashboard</h1>
          <div className="flex gap-4 items-center mb-4">
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="Enter Quiz Title..."
              className="flex-1 bg-[#0A0A0B] border border-[#27272A] p-3 rounded-lg text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] outline-none"
              id="quiz-title-input"
            />
            <button 
              onClick={createQuiz} 
              className="bg-[#D4AF37] text-[#0A0A0B] font-bold py-3 px-6 rounded-lg uppercase hover:bg-opacity-90 transition-colors" 
              id="create-quiz-btn"
            >
              Save Quiz ({questions.length} questions)
            </button>
          </div>
          <QuestionManager onAddQuestion={(q) => setQuestions([...questions, q])} />
        </div>

        <div className="bg-[#141416] p-8 rounded-xl border border-[#27272A]">
          <h2 className="text-2xl font-bold mb-4">Seus Quizzes</h2>
          {quizzes.length === 0 && <p className="text-gray-500 italic">Nenhum quiz criado ainda.</p>}
          <div className="space-y-4">
            {quizzes.map(q => (
              <div key={q.id} className="flex justify-between items-center bg-[#0A0A0B] p-4 rounded-lg border border-[#27272A]">
                <div>
                  <span className="font-bold text-lg block">{q.title}</span>
                  <span className="text-gray-500 text-sm">{q.questions?.length || 0} questões</span>
                </div>
                <div className="flex gap-2">
                  {confirmDeleteId === q.id ? (
                    <button 
                      onClick={() => deleteQuiz(q.id)}
                      className="bg-red-600 border border-red-700 text-white font-bold uppercase px-4 py-3 rounded transition-colors"
                    >
                      Confirmar Exclusão
                    </button>
                  ) : (
                    <button 
                      onClick={() => setConfirmDeleteId(q.id)}
                      className="bg-red-900 border border-red-700 text-white font-bold uppercase px-4 py-3 rounded hover:bg-red-800 transition-colors"
                    >
                      Excluir
                    </button>
                  )}
                  <button 
                    onClick={() => startSession(q.id)}
                    className="bg-[#D4AF37] text-[#0A0A0B] font-bold uppercase px-6 py-3 rounded hover:bg-opacity-90 transition-transform active:scale-95"
                  >
                    Iniciar Sessão
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
