
import React, { useState, useEffect, useRef } from 'react';
import { SubjectMode, Message, Achievement, DailyChallenge, UserProfile, PersonaConfig } from './types';
import { PERSONAS, INITIAL_ACHIEVEMENTS, DAILY_CHALLENGES, INITIAL_USER_PROFILE } from './constants';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import DailyChallengeModal from './components/DailyChallengeModal';
import { sendMessageStream } from './services/geminiService';
import LiveSessionModal from './components/LiveSessionModal';
import { Send, BrainCircuit, Loader2, User, Lock, LogIn, Terminal, Trophy, Phone, Sparkles } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';

// --- LOGIN PAGE CORREGIDA ---

const TESTING_USERS = [
  { email: 'user1@secumaster.com', pass: 'user1', name: 'User 1', avatar: '🚀' },
  { email: 'user2@secumaster.com', pass: 'user2', name: 'User 2', avatar: '🤖' },
  { email: 'user3@secumaster.com', pass: 'user3', name: 'User 3', avatar: '🧬' },
  { email: 'user4@secumaster.com', pass: 'user4', name: 'User 4', avatar: '📚' },
];

const LoginPage: React.FC<{ onLogin: (user: typeof TESTING_USERS[0]) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = TESTING_USERS.find(u => u.email === email && u.pass === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f5f5f7] flex items-center justify-center p-4 z-[100] animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-2xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 font-display">Secundaria Master</h1>
          <p className="text-gray-400 font-medium">Diseñado para el futuro de la educación.</p>
        </div>

        <form onSubmit={handleManualLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Correo" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-black outline-none transition-all"
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 focus:ring-2 focus:ring-black outline-none transition-all"
          />
          
          {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}

          <button 
            type="submit"
            className="w-full py-5 bg-black text-white font-bold rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Entrar <LogIn className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-[10px] text-center font-bold text-gray-300 uppercase tracking-[0.2em] mb-4">Acceso Rápido para Pruebas</p>
          <div className="grid grid-cols-2 gap-3">
            {TESTING_USERS.map((user) => (
              <button 
                key={user.email}
                onClick={() => onLogin(user)}
                className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-white border border-gray-100 hover:border-black/10 rounded-2xl transition-all group"
              >
                <span className="text-xl">{user.avatar}</span>
                <span className="text-xs font-bold text-gray-600">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP COMPONENT ---

const ThinkingIndicator: React.FC<{ persona: PersonaConfig }> = ({ persona }) => {
  return (
    <div className="flex items-center gap-4 p-2">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      </div>
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{persona.name} está pensando...</span>
    </div>
  );
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<SubjectMode>(SubjectMode.PHYSICS);
  const [inputs, setInputs] = useState<Record<string, string>>({
    [SubjectMode.MATH]: '', [SubjectMode.PHYSICS]: '', [SubjectMode.CIVICS]: '', [SubjectMode.HISTORY]: '', [SubjectMode.CHEMISTRY]: '',
  });
  
  const [histories, setHistories] = useState<Record<SubjectMode, Message[]>>({
    [SubjectMode.MATH]: [{ id: '0', role: 'system', text: PERSONAS[SubjectMode.MATH].welcomeMessage, timestamp: new Date() }],
    [SubjectMode.PHYSICS]: [{ id: '0', role: 'system', text: PERSONAS[SubjectMode.PHYSICS].welcomeMessage, timestamp: new Date() }],
    [SubjectMode.CIVICS]: [{ id: '0', role: 'system', text: PERSONAS[SubjectMode.CIVICS].welcomeMessage, timestamp: new Date() }],
    [SubjectMode.HISTORY]: [{ id: '0', role: 'system', text: PERSONAS[SubjectMode.HISTORY].welcomeMessage, timestamp: new Date() }],
    [SubjectMode.CHEMISTRY]: [{ id: '0', role: 'system', text: PERSONAS[SubjectMode.CHEMISTRY].welcomeMessage, timestamp: new Date() }],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const randomChallenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
    setDailyChallenge(randomChallenge);
  }, []);

  useEffect(() => {
    if (userProfile.isAuthenticated) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [histories, currentMode, isLoading, userProfile.isAuthenticated]);

  const handleLogin = (user: typeof TESTING_USERS[0]) => {
    setUserProfile({
      ...INITIAL_USER_PROFILE,
      username: user.name,
      avatar: user.avatar,
      email: user.email,
      isAuthenticated: true
    });
  };

  const handleLogout = () => {
    // This function now fully resets the application state to ensure a clean logout.
    
    // 1. Reset the user profile to the initial, unauthenticated state.
    setUserProfile(INITIAL_USER_PROFILE);
    
    // 2. Close any open modals or side panels.
    setIsRightPanelOpen(false);
    setIsLiveOpen(false);
    setIsChallengeOpen(false);
    
    // 3. Reset all chat histories for privacy and a fresh start for the next user.
    const cleanHistories = (Object.keys(PERSONAS) as SubjectMode[]).reduce((acc, mode) => {
        acc[mode] = [{ id: '0', role: 'system', text: PERSONAS[mode].welcomeMessage, timestamp: new Date() }];
        return acc;
    }, {} as Record<SubjectMode, Message[]>);
    setHistories(cleanHistories);
  };

  const handleSend = async () => {
    const inputValue = inputs[currentMode];
    if (!inputValue.trim() || isLoading) return;

    const botMsgId = Date.now().toString();
    const newUserMsg: Message = { id: botMsgId + 'u', role: 'user', text: inputValue, timestamp: new Date() };

    setHistories(prev => ({ ...prev, [currentMode]: [...prev[currentMode], newUserMsg] }));
    setInputs(prev => ({ ...prev, [currentMode]: '' }));
    setIsLoading(true);
    
    try {
      const streamResult = await sendMessageStream(currentMode, inputValue);
      let fullText = '';
      
      setHistories(prev => ({
        ...prev,
        [currentMode]: [...prev[currentMode], { id: botMsgId, role: 'model', text: '', timestamp: new Date(), isThinking: true }]
      }));

      for await (const chunk of streamResult) {
          const c = chunk as GenerateContentResponse;
          fullText += c.text || '';
          setHistories(prev => {
              const hist = [...prev[currentMode]];
              const idx = hist.findIndex(m => m.id === botMsgId);
              if (idx !== -1) hist[idx] = { ...hist[idx], text: fullText, isThinking: false };
              return { ...prev, [currentMode]: hist };
          });
      }
      setUserProfile(prev => ({ ...prev, totalQuestions: prev.totalQuestions + 1 }));
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  if (!userProfile.isAuthenticated) return <LoginPage onLogin={handleLogin} />;

  const currentPersona = PERSONAS[currentMode];

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] bg-[#f5f5f7] overflow-hidden p-0 md:p-0">
      <Sidebar currentMode={currentMode} onModeChange={setCurrentMode} onLogout={handleLogout} />
      
      <main className="flex-1 flex flex-col relative h-full overflow-hidden md:mx-4 md:my-4">
        {/* Header Frosted */}
        <header className="glass md:rounded-[2rem] p-4 md:p-6 mb-4 flex items-center justify-between shadow-sm z-30 shrink-0 mx-2 md:mx-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.5rem] bg-black flex items-center justify-center text-2xl md:text-3xl shadow-xl">
               {currentPersona.avatar}
             </div>
             <div>
                 <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-display">{currentPersona.name}</h2>
                 <p className="text-xs md:text-sm text-gray-500 font-medium">{currentPersona.role}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setIsChallengeOpen(true)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gray-100 hover:bg-yellow-100 text-yellow-600 rounded-2xl transition-colors">
                <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => setIsLiveOpen(true)} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-black text-white rounded-2xl shadow-lg hover:scale-105 transition-all">
                <Phone className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button onClick={() => setIsRightPanelOpen(true)} className="flex items-center gap-3 pl-3 pr-1 py-1 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all">
                <span className="text-xs font-bold text-gray-700 hidden sm:block">{userProfile.username}</span>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    {userProfile.avatar}
                </div>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {histories[currentMode].map((msg) => (
            <div key={msg.id} className={`flex w-full animate-slide-up ${msg.role === 'system' ? 'justify-center' : msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[90%] md:max-w-[70%] p-4 md:p-6 shadow-sm relative
                ${msg.role === 'system' 
                  ? 'bg-gray-200/50 text-gray-500 text-xs font-bold rounded-2xl px-6' 
                  : msg.role === 'user' 
                    ? 'bg-black text-white rounded-[2rem] rounded-tr-none shadow-xl' 
                    : 'bg-white text-gray-800 rounded-[2.5rem] rounded-tl-none border border-gray-100 shadow-sm font-medium'}
              `}>
                {msg.isThinking ? <ThinkingIndicator persona={currentPersona} /> : msg.text.split('\n').map((l, i) => <p key={i} className="mb-2 last:mb-0 leading-relaxed">{l}</p>)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-4 md:p-6 bg-transparent shrink-0">
          <div className="max-w-4xl mx-auto glass rounded-[2.5rem] p-2 md:p-3 flex items-center gap-2 md:gap-4 shadow-2xl">
            <input 
              type="text" 
              value={inputs[currentMode]} 
              onChange={(e) => setInputs(prev => ({ ...prev, [currentMode]: e.target.value }))} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={`Escribe a ${currentPersona.name}...`} 
              className="flex-1 bg-transparent text-gray-800 text-base md:text-lg font-medium px-4 md:px-6 py-2 md:py-3 focus:outline-none" 
            />
            <button onClick={handleSend} disabled={isLoading || !inputs[currentMode].trim()} className={`p-3 md:p-4 rounded-[1.5rem] text-white shadow-xl transition-all active:scale-90 ${isLoading ? 'bg-gray-300' : 'bg-black hover:bg-gray-900'}`}>
              {isLoading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
        </div>

        <LiveSessionModal isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} mode={currentMode} />
        <DailyChallengeModal isOpen={isChallengeOpen} onClose={() => setIsChallengeOpen(false)} challenge={dailyChallenge} onComplete={() => {}} />
      </main>
      
      <RightPanel 
        isOpen={isRightPanelOpen} 
        onClose={() => setIsRightPanelOpen(false)} 
        achievements={INITIAL_ACHIEVEMENTS} 
        userProfile={userProfile} 
        onUpdateProfile={setUserProfile} 
        onLogout={handleLogout} 
      />
    </div>
  );
};

export default App;
