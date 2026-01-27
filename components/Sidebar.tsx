
import React from 'react';
import { SubjectMode } from '../types';
import { PERSONAS } from '../constants';
import { Calculator, Atom, Scale, Hourglass, FlaskConical, LogOut, Sparkles } from 'lucide-react';

interface SidebarProps {
  currentMode: SubjectMode;
  onModeChange: (mode: SubjectMode) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange, onLogout }) => {
  const getIcon = (mode: SubjectMode) => {
    switch (mode) {
      case SubjectMode.MATH: return <Calculator className="w-6 h-6 md:w-7 md:h-7" />;
      case SubjectMode.PHYSICS: return <Atom className="w-6 h-6 md:w-7 md:h-7" />;
      case SubjectMode.CIVICS: return <Scale className="w-6 h-6 md:w-7 md:h-7" />;
      case SubjectMode.HISTORY: return <Hourglass className="w-6 h-6 md:w-7 md:h-7" />;
      case SubjectMode.CHEMISTRY: return <FlaskConical className="w-6 h-6 md:w-7 md:h-7" />;
    }
  };

  const menuOrder = [SubjectMode.PHYSICS, SubjectMode.CHEMISTRY, SubjectMode.MATH, SubjectMode.HISTORY, SubjectMode.CIVICS];

  return (
    <div className="w-full md:w-24 h-20 md:h-full glass md:rounded-[2.5rem] flex flex-row md:flex-col items-center py-0 md:py-12 shrink-0 z-40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] smooth-transition border border-white/40">
      {/* Logo Circle */}
      <div className="hidden md:flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-16 shadow-2xl rotate-3 hover:rotate-0 transition-all cursor-pointer group">
        <Sparkles className="text-white w-7 h-7 group-hover:scale-110 transition-transform" />
      </div>

      {/* Nav Items (The Dock) */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-center items-center w-full gap-4 md:gap-10 px-4 md:px-0">
        {menuOrder.map((mode) => {
          const isActive = currentMode === mode;
          
          return (
            <div key={mode} className="relative group">
                <button
                onClick={() => onModeChange(mode)}
                className={`
                    apple-button relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl smooth-transition
                    ${isActive 
                    ? 'bg-black text-white shadow-xl scale-110 z-10' 
                    : 'text-gray-400 hover:bg-white hover:text-black hover:scale-105'}
                `}
                >
                {getIcon(mode)}
                </button>
                {isActive && (
                    <div className="absolute -bottom-2 md:-right-2 md:bottom-auto w-1.5 h-1.5 bg-black rounded-full shadow-lg"></div>
                )}
                {/* Minimal Tooltip */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block whitespace-nowrap z-50">
                    {PERSONAS[mode].name}
                </div>
            </div>
          );
        })}
      </nav>

      {/* Logout Button from Screenshot style */}
      <div className="px-6 md:px-0 md:mt-auto">
        <button 
          onClick={onLogout}
          className="apple-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 rounded-2xl smooth-transition"
          title="Cerrar Sesión"
        >
          <LogOut className="w-6 h-6 md:w-7 md:h-7" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
