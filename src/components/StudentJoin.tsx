import { useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebaseClient';

export default function StudentJoin({ onJoin }: { onJoin: (pin: string, studentId: string) => void }) {
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const join = async () => {
    if (!pin || !name) {
      setError('Por favor, insira o PIN e seu nome.');
      return;
    }
    setError('');
    
    // Verifica se a sessão existe
    const sessionRef = doc(db, 'liveSessions', pin);
    const sessionSnap = await getDoc(sessionRef);

    if (sessionSnap.exists()) {
      const studentId = 'student-' + Math.floor(Math.random() * 100000);
      await setDoc(doc(db, `liveSessions/${pin}/participants`, studentId), {
        name: name,
        score: 0
      });
      onJoin(pin, studentId);
    } else {
      setError('PIN inválido ou sessão não encontrada.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0B] text-[#E4E4E7]">
      <div className="bg-[#141416] p-8 rounded-xl border border-[#27272A] w-full max-w-sm text-center shadow-2xl">
        <h2 data-testid="student-join-heading" name="h2Student" className="text-3xl font-black mb-2 text-[#D4AF37]">Entrar no Quiz</h2>
        <p className="text-gray-400 mb-8 font-medium">Insira o código fornecido pelo professor</p>
        
        {error && <p className="text-red-500 mb-4 font-bold">{error}</p>}
        
        <input
          data-testid="pin-input"
          className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-lg mb-4 text-center text-3xl tracking-widest outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-700 font-bold uppercase transition-all"
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.toUpperCase())}
          maxLength={6}
        />
        
        <input
          data-testid="name-input"
          className="w-full bg-[#0A0A0B] border border-[#27272A] p-4 rounded-lg mb-8 text-center text-xl outline-none focus:ring-2 focus:ring-[#D4AF37] placeholder-gray-700 transition-all"
          placeholder="Seu Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          data-testid="join-button"
          onClick={join}
          className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-lg uppercase tracking-wider hover:bg-opacity-90 transition-all shadow-lg text-lg disabled:opacity-50"
          disabled={!pin || !name}
        >
          Entrar no Jogo
        </button>
      </div>
    </div>
  );
}
