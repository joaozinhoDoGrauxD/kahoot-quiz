import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export default function Gameplay({ sessionId, studentId }: { sessionId: string, studentId: string }) {
  const [session, setSession] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [answered, setAnswered] = useState<{correct: boolean, points: number} | null>(null);
  const [matchAnswers, setMatchAnswers] = useState<Record<number, string>>({}); // for match type

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'liveSessions', sessionId), (docSnap) => {
      const data = docSnap.data();
      setSession(data);
    });
    return unsub;
  }, [sessionId]);

  useEffect(() => {
    if (session?.currentQuestionIndex !== undefined) {
      setStartTime(Date.now());
      setAnswered(null);
      setMatchAnswers({});
    }
  }, [session?.currentQuestionIndex]);

  const submitAnswer = async (answer: string | Record<number, string>) => {
    if (!session || answered) return;
    
    const currentQuestion = session.questions[session.currentQuestionIndex];
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') {
      isCorrect = answer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'match') {
      // Simplistic match validation
      isCorrect = true;
      Object.keys(currentQuestion.matchPairs).forEach((key: any) => {
        if (currentQuestion.matchPairs[key].right !== (answer as any)[key]) {
          isCorrect = false;
        }
      });
    }

    // Time-based scoring: 1000 base points max
    const timeTaken = Date.now() - startTime;
    const maxTime = 30000; // 30 seconds
    let pointsEarned = 0;
    
    if (isCorrect) {
      // Fórmula exata: Pontos = P_base * (1 - (T_resposta / (2 * T_total)))
      pointsEarned = Math.max(10, Math.floor(1000 * (1 - (timeTaken / (2 * maxTime)))));
    }
    
    setAnswered({ correct: isCorrect, points: pointsEarned });

    // Atualiza resposta do aluno
    await setDoc(doc(db, `liveSessions/${sessionId}/participants`, studentId), {
      lastAnswerTime: timeTaken,
      score: increment(pointsEarned),
      answeredQuestionIndex: session.currentQuestionIndex
    }, { merge: true });
  };

  const handleMatchSelect = (index: number, rightValue: string) => {
    setMatchAnswers(prev => {
      const updated = { ...prev, [index]: rightValue };
      const currentQuestion = session.questions[session.currentQuestionIndex];
      // Auto-submit se todas as correspondências foram preenchidas
      if (Object.keys(updated).length === currentQuestion.matchPairs.length) {
         submitAnswer(updated);
      }
      return updated;
    });
  }

  if (!session) return <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center">Carregando...</div>;

  if (session.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-[#E4E4E7] p-8 text-center">
        <h1 className="text-4xl font-bold mb-4 text-[#D4AF37]">Você entrou!</h1>
        <p className="text-xl text-gray-400">Olhe para a tela do professor e aguarde o jogo começar.</p>
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const isFinished = session.status === 'active' && session.currentQuestionIndex >= session.questions.length;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-[#E4E4E7] p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Quiz Finalizado!</h1>
        <p className="text-xl">Aguarde os resultados finais na tela do professor.</p>
      </div>
    );
  }

  // Mapeamento de cores sólidas para os botões do Kahoot
  const colors = ['bg-red-600', 'bg-blue-600', 'bg-yellow-500', 'bg-green-600', 'bg-purple-600'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0B] text-[#E4E4E7] p-4 text-center">
      {session.showLeaderboard ? (
        <div className="text-center bg-[#141416] p-8 rounded-2xl border border-[#27272A] max-w-lg w-full">
           <h2 className="text-3xl font-bold mb-4 text-[#D4AF37]">Olhe a tela do professor!</h2>
           <p className="text-xl text-gray-400">O placar está sendo exibido.</p>
        </div>
      ) : answered ? (
        <div className={`p-8 rounded-2xl border border-[#27272A] w-full max-w-lg ${answered.correct ? 'bg-green-900 border-green-600' : 'bg-red-900 border-red-600'}`}>
          {answered.correct ? (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-4xl font-black text-white mb-2">Correto!</h2>
              <div className="inline-block bg-black bg-opacity-30 px-6 py-2 rounded-full mt-4">
                <span className="text-2xl font-bold text-green-400">+{answered.points} pontos</span>
              </div>
            </>
          ) : (
             <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-4xl font-black text-white mb-2">Incorreto!</h2>
              <p className="text-xl text-red-200 mt-2">Desejamos mais sorte na próxima!</p>
             </>
          )}
          <p className="text-lg text-gray-300 mt-8 opacity-80">Aguardando os outros jogadores...</p>
        </div>
      ) : (
        <div className="w-full max-w-2xl h-[70vh] flex flex-col justify-center">
          {currentQuestion?.type === 'multiple_choice' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {currentQuestion.options.map((opt: any, idx: number) => (
                <button 
                  key={opt.id} 
                  onClick={() => submitAnswer(opt.id)}
                  className={`${colors[idx % colors.length]} p-8 rounded-xl hover:brightness-110 hover:scale-[1.02] text-4xl font-bold transition-transform shadow-lg flex items-center justify-center w-full min-h-[120px]`}
                >
                  {/* Foca nos botões limpos, o contexto fica no telão */}
                  {opt.id}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-4 h-x-full">
              {currentQuestion.options.map((opt: any) => (
                <button 
                  key={opt.id} 
                  onClick={() => submitAnswer(opt.id)}
                  className={`p-10 rounded-xl text-4xl font-bold transition-all shadow-lg flex items-center justify-center h-[200px] hover:scale-[1.02] ${opt.id === 'true' ? 'bg-blue-600' : 'bg-red-600'}`}
                >
                  {opt.id === 'true' ? 'Verdadeiro' : 'Falso'}
                </button>
              ))}
            </div>
          )}

          {currentQuestion?.type === 'match' && (
            <div className="flex flex-col gap-4">
              {currentQuestion.matchPairs.map((pair: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 items-center bg-[#141416] p-4 rounded-xl border border-[#27272A]">
                  <div className="flex-1 text-xl font-medium">{pair.left}</div>
                  <select 
                    className="flex-1 bg-[#0A0A0B] border border-[#27272A] p-3 rounded-lg text-white"
                    value={matchAnswers[i] || ''}
                    onChange={(e) => handleMatchSelect(i, e.target.value)}
                  >
                    <option value="" disabled>Selecione a correspondência...</option>
                    {/* Shuffle the rights for options - this is simplified */}
                    {currentQuestion.matchPairs.map((p: any, j: number) => (
                      <option key={j} value={p.right}>{p.right}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="text-center mt-4 text-gray-500 text-sm">A resposta é enviada automaticamente ao preencher todos.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
