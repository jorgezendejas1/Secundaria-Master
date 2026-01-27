
import React, { useState } from 'react';
import { DailyChallenge, SubjectMode } from '../types';
import { CheckCircle, XCircle, BrainCircuit, X } from 'lucide-react';

interface DailyChallengeModalProps {
  challenge: DailyChallenge | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (success: boolean) => void;
}

const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({ 
  challenge, 
  isOpen, 
  onClose,
  onComplete 
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen || !challenge) return null;

  const handleOptionClick = (index: number) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    
    const isCorrect = selectedOption === challenge.correctAnswer;
    setTimeout(() => {
        onComplete(isCorrect);
    }, 2500); 
  };

  const getOptionStyle = (index: number) => {
    if (!isSubmitted) {
      return selectedOption === index 
        ? 'border-black bg-black text-white shadow-xl scale-[1.02]' 
        : 'border-gray-100 bg-white/50 hover:bg-white hover:border-gray-200';
    }
    
    if (index === challenge.correctAnswer) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-100 scale-[1.02]';
    }
    if (index === selectedOption && index !== challenge.correctAnswer) {
      return 'border-red-400 bg-red-50 opacity-60';
    }
    return 'border-gray-50 opacity-30 grayscale';
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[300] p-4 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-xl glass rounded-[3.5rem] p-10 md:p-14 shadow-[0_50px_100px_rgba(0,0,0,0.2)] relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-200/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-[80px] -ml-32 -mb-32"></div>

        <div className="relative z-10">
          <button onClick={onClose} className="apple-button absolute -top-4 -right-4 w-12 h-12 flex items-center justify-center glass rounded-full shadow-sm hover:scale-110">
            <X className="w-6 h-6 text-gray-400" />
          </button>
          
          <div className="flex flex-col items-center text-center mb-10">
             <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-[2rem] shadow-2xl flex items-center justify-center text-white mb-6 rotate-3">
                <BrainCircuit className="w-10 h-10" />
             </div>
             <h2 className="text-4xl font-bold text-gray-900 font-display tracking-tight mb-2">Reto Diario</h2>
             <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em]">Misión de Inteligencia</p>
          </div>

          <p className="text-xl text-gray-800 font-medium mb-10 text-center leading-relaxed">
            {challenge.question}
          </p>

          <div className="space-y-4 mb-10">
            {challenge.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isSubmitted}
                className={`w-full text-center p-6 rounded-[2rem] border-2 smooth-transition font-bold text-lg flex justify-center items-center gap-3 ${getOptionStyle(idx)}`}
              >
                <span>{opt}</span>
                {isSubmitted && idx === challenge.correctAnswer && <CheckCircle className="w-6 h-6 text-green-500" />}
                {isSubmitted && idx === selectedOption && idx !== challenge.correctAnswer && <XCircle className="w-6 h-6 text-red-500" />}
              </button>
            ))}
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="apple-button w-full py-6 rounded-[2.2rem] bg-black text-white font-bold text-xl shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
            >
              Verificar ADN Cognitivo
            </button>
          ) : (
             <div className={`text-center font-bold text-xl animate-bounce pt-2 font-display ${selectedOption === challenge.correctAnswer ? 'text-green-600' : 'text-red-500'}`}>
                {selectedOption === challenge.correctAnswer ? "✨ ¡Magnífico! +10 Puntos de IQ" : "⚠️ Recalibrando neuronas..."}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeModal;
