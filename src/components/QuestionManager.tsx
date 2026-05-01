import { useState } from 'react';

export default function QuestionManager({ onAddQuestion }: { onAddQuestion: (q: any) => void }) {
  const [text, setText] = useState('');
  const [type, setType] = useState('multiple_choice');
  const [options, setOptions] = useState([{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }, { id: 'E', text: '' }]);
  const [correctAnswer, setCorrectAnswer] = useState('A');
  
  // For match type
  const [matchPairs, setMatchPairs] = useState([{ left: '', right: '' }, { left: '', right: '' }]);

  const add = () => {
    if (!text) return;
    
    let questionData: any = { text, type };
    
    if (type === 'multiple_choice') {
      questionData.options = options.map(o => ({ ...o }));
      questionData.correctAnswer = correctAnswer;
    } else if (type === 'true_false') {
      questionData.options = [{ id: 'true', text: 'Verdadeiro' }, { id: 'false', text: 'Falso' }];
      questionData.correctAnswer = correctAnswer === 'true' ? 'true' : 'false';
    } else if (type === 'match') {
      questionData.matchPairs = matchPairs.map(p => ({ ...p }));
    }

    onAddQuestion(questionData);
    
    // Reset fields
    setText('');
    setOptions([{ id: 'A', text: '' }, { id: 'B', text: '' }, { id: 'C', text: '' }, { id: 'D', text: '' }, { id: 'E', text: '' }]);
    setCorrectAnswer('A');
    setMatchPairs([{ left: '', right: '' }, { left: '', right: '' }]);
  };

  return (
    <div className="bg-[#141416] p-6 rounded-xl border border-[#27272A] mt-6">
      <h2 className="text-xl font-bold mb-4 text-[#E4E4E7]">Adicionar Questão</h2>
      <input 
        id="texto-pergunta"
        className="w-full bg-[#0A0A0B] border border-[#27272A] p-3 rounded-lg mb-4 text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] outline-none"
        placeholder="Texto da Pergunta"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <select 
        id="options"
        className="w-full bg-[#0A0A0B] border border-[#27272A] p-3 rounded-lg mb-4 text-[#E4E4E7] focus:ring-1 focus:ring-[#D4AF37] outline-none"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
          if (e.target.value === 'true_false') setCorrectAnswer('true');
          else if (e.target.value === 'multiple_choice') setCorrectAnswer('A');
        }}
      >
        <option id="multiple" value="multiple_choice">Múltipla Escolha (5 opções)</option>
        <option id="boolValue" value="true_false">Certo ou Errado</option>
        <option id="correspondence" value="match">Correspondência</option>
      </select>

      {type === 'multiple_choice' && (
        <div className="mb-4 space-y-2">
          {options.map((opt, i) => (
            <div key={opt.id} className="flex gap-2 items-center">
              <span className="text-[#E4E4E7] w-6">{opt.id}.</span>
              <input 
                className="flex-1 bg-[#0A0A0B] border border-[#27272A] p-2 rounded text-[#E4E4E7] outline-none"
                placeholder={`Opção ${opt.id}`}
                value={opt.text}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i].text = e.target.value;
                  setOptions(newOpts);
                }}
              />
              <input 
                type="radio" 
                name="correct_m" 
                checked={correctAnswer === opt.id} 
                onChange={() => setCorrectAnswer(opt.id)} 
                className="ml-2 accent-[#D4AF37]"
              />
            </div>
          ))}
          <p className="text-sm text-gray-500">Selecione o rádio para a resposta correta.</p>
        </div>
      )}

      {type === 'true_false' && (
        <div className="mb-4 flex gap-4 text-[#E4E4E7]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="correct_tf" checked={correctAnswer === 'true'} onChange={() => setCorrectAnswer('true')} className="accent-[#D4AF37]"/> Verdadeiro
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="correct_tf" checked={correctAnswer === 'false'} onChange={() => setCorrectAnswer('false')} className="accent-[#D4AF37]"/> Falso
          </label>
        </div>
      )}

      {type === 'match' && (
        <div className="mb-4 space-y-2 text-[#E4E4E7]">
          {matchPairs.map((pair, i) => (
            <div key={i} className="flex gap-2">
              <input 
                className="flex-1 bg-[#0A0A0B] border border-[#27272A] p-2 rounded text-[#E4E4E7] outline-none"
                placeholder="Conceito (ex: Merge Sort)"
                value={pair.left}
                onChange={(e) => {
                  const newPairs = [...matchPairs];
                  newPairs[i].left = e.target.value;
                  setMatchPairs(newPairs);
                }}
              />
              <input 
                className="flex-1 bg-[#0A0A0B] border border-[#27272A] p-2 rounded text-[#E4E4E7] outline-none"
                placeholder="Correspondência (ex: O(n log n))"
                value={pair.right}
                onChange={(e) => {
                  const newPairs = [...matchPairs];
                  newPairs[i].right = e.target.value;
                  setMatchPairs(newPairs);
                }}
              />
            </div>
          ))}
          <button 
            onClick={() => setMatchPairs([...matchPairs, { left: '', right: '' }])}
            className="text-[#D4AF37] text-sm font-bold mt-2"
          >
            + Adicionar Par
          </button>
        </div>
      )}

      <button onClick={add} className="bg-[#D4AF37] text-black font-bold px-6 py-2 rounded-lg w-full mt-2 hover:bg-opacity-90">
        Salvar Questão
      </button>
    </div>
  );
}
