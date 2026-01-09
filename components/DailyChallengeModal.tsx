
import React, { useState } from 'react';
import { DailyChallenge, SubjectMode } from '../types';
import { CheckCircle, XCircle, BrainCircuit } from 'lucide-react';

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
    }, 2000); // Wait 2s to show result then close
  };

  const getOptionStyle = (index: number) => {
    if (!isSubmitted) {
      return selectedOption === index 
        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
        : 'border-gray-200 hover:bg-gray-50';
    }
    
    // Result state
    if (index === challenge.correctAnswer) {
      return 'border-green-500 bg-green-50 ring-2 ring-green-200';
    }
    if (index === selectedOption && index !== challenge.correctAnswer) {
      return 'border-red-500 bg-red-50';
    }
    return 'border-gray-100 opacity-50';
  };

  const getSubjectName = (mode: SubjectMode) => {
      switch(mode) {
          case SubjectMode.MATH: return 'Matemáticas';
          case SubjectMode.PHYSICS: return 'Física';
          case SubjectMode.CIVICS: return 'Cívica';
          case SubjectMode.HISTORY: return 'Historia';
          case SubjectMode.CHEMISTRY: return 'Química';
          default: return 'Reto General';
      }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-300 rounded-full blur-3xl opacity-20 -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <button onClick={onClose} className="absolute top-0 right-0 text-gray-400 hover:text-gray-600">✕</button>
          
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg text-white">
                <BrainCircuit className="w-8 h-8" />
             </div>
             <div>
                <h2 className="text-2xl font-bold text-gray-800">Reto Diario</h2>
                <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                  {getSubjectName(challenge.subject)}
                </div>
             </div>
          </div>

          <p className="text-lg text-gray-700 font-medium mb-6">
            {challenge.question}
          </p>

          <div className="space-y-3 mb-6">
            {challenge.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                disabled={isSubmitted}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium flex justify-between items-center ${getOptionStyle(idx)}`}
              >
                <span>{opt}</span>
                {isSubmitted && idx === challenge.correctAnswer && <CheckCircle className="w-5 h-5 text-green-500" />}
                {isSubmitted && idx === selectedOption && idx !== challenge.correctAnswer && <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            ))}
          </div>

          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Comprobar Respuesta
            </button>
          ) : (
             <div className={`text-center font-bold text-lg animate-bounce ${selectedOption === challenge.correctAnswer ? 'text-green-600' : 'text-red-500'}`}>
                {selectedOption === challenge.correctAnswer ? challenge.rewardText : "¡Casi! Inténtalo mañana."}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeModal;
