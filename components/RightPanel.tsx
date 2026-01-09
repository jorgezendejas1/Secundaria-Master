
import React, { useState } from 'react';
import { Achievement, UserProfile, SubjectMode } from '../types';
import { PERSONAS } from '../constants';
import { Trophy, Lock, Star, Edit2, Check, LayoutGrid, BarChart2, LogOut, Flame, Sparkles } from 'lucide-react';

interface RightPanelProps {
  isOpen: boolean;
  achievements: Achievement[];
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onClose: () => void;
  onLogout: () => void;
}

const AVATARS = ["😎", "🤓", "🐱", "🚀", "🤖", "🦊", "🐲", "🦁", "🎮", "⚽", "🧪", "🎨"];

const RightPanel: React.FC<RightPanelProps> = ({ 
  isOpen, 
  achievements, 
  userProfile, 
  onUpdateProfile,
  onClose,
  onLogout
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userProfile.username);
  const [showAvatars, setShowAvatars] = useState(false);

  const handleSaveName = () => {
    if (tempName.trim()) onUpdateProfile({ ...userProfile, username: tempName });
    setIsEditing(false);
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 w-full md:w-[450px] glass shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-[50] md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[3rem] overflow-hidden
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      flex flex-col
    `}>
      {/* Header Profile Bento */}
      <div className="p-8 pb-12 relative overflow-hidden shrink-0">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-black/5 hover:bg-black/10 rounded-full transition-colors z-10 text-gray-500">✕</button>
        
        <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
                <button 
                    onClick={() => setShowAvatars(!showAvatars)}
                    className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl shadow-2xl border-4 border-white active:scale-95 transition-all hover:rotate-3"
                >
                    {userProfile.avatar}
                </button>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
                    <Edit2 className="w-4 h-4" />
                </div>
            </div>

            {isEditing ? (
                <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="text" 
                        value={tempName} 
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-transparent border-b-2 border-black px-2 py-1 text-2xl font-bold text-center outline-none"
                        autoFocus
                    />
                    <button onClick={handleSaveName} className="p-2 bg-green-500 rounded-full text-white shadow-lg"><Check className="w-5 h-5" /></button>
                </div>
            ) : (
                <h2 onClick={() => setIsEditing(true)} className="text-3xl font-bold text-gray-900 font-display mb-1 flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
                    {userProfile.username}
                </h2>
            )}
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-6">Nivel {Math.floor(userProfile.totalQuestions / 10) + 1} • Estudiante Pro</p>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white/50 p-4 rounded-3xl border border-white shadow-sm flex flex-col items-center">
                    <Flame className="w-6 h-6 text-orange-500 mb-1" />
                    <span className="text-lg font-bold text-gray-900">{userProfile.streak}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Racha</span>
                </div>
                <div className="bg-white/50 p-4 rounded-3xl border border-white shadow-sm flex flex-col items-center">
                    <Sparkles className="w-6 h-6 text-purple-500 mb-1" />
                    <span className="text-lg font-bold text-gray-900">{userProfile.totalQuestions}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Preguntas</span>
                </div>
            </div>
        </div>

        {showAvatars && (
            <div className="mt-8 grid grid-cols-6 gap-3 animate-slide-up">
                {AVATARS.map(av => (
                    <button 
                        key={av} 
                        onClick={() => { onUpdateProfile({...userProfile, avatar: av}); setShowAvatars(false); }}
                        className="text-2xl w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm hover:scale-110 hover:shadow-md transition-all"
                    >
                        {av}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10">
        <section>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 font-bold text-lg font-display">Logros Épicos</h3>
                <span className="text-[10px] font-bold bg-black text-white px-3 py-1 rounded-full uppercase tracking-widest">
                    {achievements.filter(a => a.unlocked).length} Desbloqueados
                </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
            {achievements.map((ach) => (
                <div 
                    key={ach.id}
                    className={`
                        p-5 rounded-[2rem] border-2 transition-all duration-500 group relative
                        ${ach.unlocked 
                        ? 'border-transparent bg-white shadow-xl scale-100' 
                        : 'border-gray-100 bg-gray-50/50 opacity-40'}
                    `}
                >
                    <div className="text-3xl mb-3">{ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-gray-300" />}</div>
                    <div className="text-sm font-bold text-gray-900 mb-1 leading-tight">{ach.title}</div>
                    <div className="text-[10px] text-gray-400 font-medium leading-tight">{ach.description}</div>
                </div>
            ))}
            </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-6 rounded-[2rem] bg-red-50 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95 mb-10"
        >
          <LogOut className="w-5 h-5" />
          Cerrar Sesión Pro
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
