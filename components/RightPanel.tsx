
import React, { useState } from 'react';
import { Achievement, UserProfile } from '../types';
import { Edit2, Check, LogOut, Flame, Sparkles, X, Star, Trophy, Target } from 'lucide-react';

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
      fixed inset-y-0 right-0 w-full md:w-[500px] glass shadow-[0_0_80px_rgba(0,0,0,0.1)] transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-[100] md:m-4 md:h-[calc(100vh-2rem)] md:rounded-[3rem] overflow-hidden
      ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}
      flex flex-col
    `}>
      {/* Profile Bento Header */}
      <div className="p-8 md:p-10 pb-6 relative shrink-0 flex flex-col items-center">
        <button onClick={onClose} className="apple-button absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100/80 hover:bg-white rounded-full z-10 text-gray-500 shadow-sm border border-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="relative mb-6">
            <button 
                onClick={() => setShowAvatars(!showAvatars)}
                className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-6xl shadow-2xl border-4 border-white apple-button hover:scale-105 relative z-10 overflow-hidden"
            >
                {userProfile.avatar}
            </button>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-xl border-2 border-white z-20 apple-button">
                <Edit2 className="w-4 h-4" />
            </div>
        </div>

        {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
                <input 
                    type="text" 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-transparent border-b-2 border-black px-2 py-1 text-3xl font-bold text-center outline-none w-48 font-display"
                    autoFocus
                />
                <button onClick={handleSaveName} className="p-2 bg-green-500 rounded-full text-white shadow-lg apple-button"><Check className="w-5 h-5" /></button>
            </div>
        ) : (
            <h2 onClick={() => setIsEditing(true)} className="text-3xl font-bold text-gray-900 font-display mb-1 cursor-pointer hover:opacity-60 smooth-transition">
                {userProfile.username}
            </h2>
        )}
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-8">Nivel {Math.floor(userProfile.totalQuestions / 10) + 1} • Estudiante Pro</p>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-2 gap-4 w-full mb-4">
            <div className="bg-white/60 p-5 rounded-[2rem] border border-white flex flex-col items-center justify-center shadow-sm hover:shadow-md smooth-transition group">
                <Flame className="w-7 h-7 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-black text-gray-900 leading-none">{userProfile.streak}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Racha</span>
            </div>
            <div className="bg-white/60 p-5 rounded-[2rem] border border-white flex flex-col items-center justify-center shadow-sm hover:shadow-md smooth-transition group">
                <Sparkles className="w-7 h-7 text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-black text-gray-900 leading-none">{userProfile.totalQuestions}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Preguntas</span>
            </div>
        </div>

        {showAvatars && (
            <div className="mt-4 grid grid-cols-4 gap-3 animate-slide-up w-full max-h-40 overflow-y-auto p-2 glass rounded-3xl">
                {AVATARS.map(av => (
                    <button 
                        key={av} 
                        onClick={() => { onUpdateProfile({...userProfile, avatar: av}); setShowAvatars(false); }}
                        className="text-2xl w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm apple-button border border-gray-100 hover:border-black"
                    >
                        {av}
                    </button>
                ))}
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-8 md:px-10 space-y-10 pb-10">
        <section>
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-gray-900 font-bold text-lg font-display tracking-tight">Logros Desbloqueados</h3>
                <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            
            <div className="grid grid-cols-1 gap-3">
            {achievements.map((ach) => (
                <div 
                    key={ach.id}
                    className={`
                        p-5 rounded-[2rem] border smooth-transition flex items-center gap-5
                        ${ach.unlocked 
                        ? 'border-transparent bg-white shadow-lg hover:translate-y-[-2px]' 
                        : 'border-gray-100 bg-gray-50/50 opacity-40 grayscale'}
                    `}
                >
                    <div className="text-4xl w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl">{ach.unlocked ? ach.icon : "🔒"}</div>
                    <div className="flex-1">
                      <div className="text-base font-bold text-gray-900 leading-tight mb-0.5">{ach.title}</div>
                      <div className="text-[11px] text-gray-500 font-medium leading-tight">{ach.description}</div>
                    </div>
                </div>
            ))}
            </div>
        </section>

        {/* Premium Logout Button (from prompt request) */}
        <div className="pt-4">
            <button 
              onClick={onLogout}
              className="apple-button w-full flex items-center justify-center gap-3 p-6 rounded-[2.5rem] bg-red-50/80 border border-red-100 text-red-500 font-bold hover:bg-red-500 hover:text-white group"
            >
              <div className="w-full h-1 bg-red-200/50 rounded-full flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/20 group-hover:bg-white/30 animate-pulse"></div>
              </div>
              <LogOut className="w-5 h-5" />
              <span className="whitespace-nowrap font-display text-base">Cerrar Sesión Pro</span>
              <div className="w-full h-1 bg-red-200/50 rounded-full flex-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/20 group-hover:bg-white/30 animate-pulse"></div>
              </div>
            </button>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
