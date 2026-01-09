
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
      case SubjectMode.MATH: return <Calculator className="w-5 h-5 md:w-6 md:h-6" />;
      case SubjectMode.PHYSICS: return <Atom className="w-5 h-5 md:w-6 md:h-6" />;
      case SubjectMode.CIVICS: return <Scale className="w-5 h-5 md:w-6 md:h-6" />;
      case SubjectMode.HISTORY: return <Hourglass className="w-5 h-5 md:w-6 md:h-6" />;
      case SubjectMode.CHEMISTRY: return <FlaskConical className="w-5 h-5 md:w-6 md:h-6" />;
    }
  };

  const menuOrder = [SubjectMode.PHYSICS, SubjectMode.CHEMISTRY, SubjectMode.MATH, SubjectMode.HISTORY, SubjectMode.CIVICS];

  return (
    <div className="md:ml-4 md:my-4 w-full md:w-24 h-16 md:h-[calc(100vh-2rem)] glass md:rounded-[2.5rem] flex flex-row md:flex-col items-center py-0 md:py-8 shrink-0 z-40 transition-all duration-500 shadow-2xl">
      {/* Logo Circle */}
      <div className="hidden md:flex items-center justify-center w-12 h-12 bg-black rounded-2xl mb-12 shadow-lg shadow-black/20">
        <Sparkles className="text-white w-6 h-6" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start items-center w-full gap-2 md:gap-6 px-4 md:px-0">
        {menuOrder.map((mode) => {
          const persona = PERSONAS[mode];
          const isActive = currentMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              title={persona.name}
              className={`
                group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-black text-white shadow-xl scale-110' 
                  : 'text-gray-400 hover:bg-gray-100 hover:text-black hover:scale-105'}
              `}
            >
              {getIcon(mode)}
              {/* Tooltip desktop */}
              <div className="absolute left-20 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden md:block whitespace-nowrap z-50">
                {persona.name}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 md:px-0 flex items-center justify-center">
        <button 
          onClick={onLogout}
          className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
