
import React, { useState, useEffect, useRef } from 'react';
import { SubjectMode, Message, Achievement, DailyChallenge, UserProfile, PersonaConfig } from './types';
import { PERSONAS, INITIAL_ACHIEVEMENTS, DAILY_CHALLENGES, INITIAL_USER_PROFILE } from './constants';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import DailyChallengeModal from './components/DailyChallengeModal';
import { sendMessageStream } from './services/geminiService';
import LiveSessionModal from './components/LiveSessionModal';
import { Send, BrainCircuit, Loader2, LogIn, Phone, Sparkles, User, ShieldCheck } from 'lucide-react';
import { GenerateContentResponse } from '@google/genai';

const TESTING_USERS = [
  { email: 'user1@secumaster.com', pass: 'user1', name: 'Master Alex', avatar: '🚀' },
  { email: 'user2@secumaster.com', pass: 'user2', name: 'User 2', avatar: '🤖' },
  { email: 'user3@secumaster.com', pass: 'user3', name: 'Genio Lucas', avatar: '🧬' },
  { email: 'user4@secumaster.com', pass: 'user4', name: 'Beta Reader', avatar: '📚' },
];

const LoginPage: React.FC<{ onLogin: (user: typeof TESTING_USERS[0]) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = TESTING_USERS.find(u => u.email === email && u.pass === password);
    if (user) onLogin(user);
    else {
      setError('Credenciales inválidas.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f5f5f7] flex items-center justify-center p-6 z-[200] animate-fade-in">
      <div className="w-full max-w-xl glass rounded-[4rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
        
        <div className="w-24 h-24 glass-dark rounded-[2.5rem] flex items-center justify-center mb-10 shadow-2xl rotate-3">
          <Sparkles className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 font-display tracking-tight text-center">Secundaria Master</h1>
        <p className="text-gray-400 font-medium text-lg mb-12 text-center">Tutoría Inteligente • Experiencia Premium</p>

        <form onSubmit={handleManualLogin} className="w-full space-y-4">
          <input 
            type="email" 
            placeholder="Usuario o Correo" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/60 border border-gray-100 rounded-2xl py-5 px-8 focus:ring-4 focus:ring-black/5 outline-none transition-all text-lg font-medium shadow-sm"
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/60 border border-gray-100 rounded-2xl py-5 px-8 focus:ring-4 focus:ring-black/5 outline-none transition-all text-lg font-medium shadow-sm"
          />
          {error && <p className="text-red-500 text-sm font-bold text-center py-2">{error}</p>}
          <button type="submit" className="apple-button w-full py-5 bg-black text-white font-bold rounded-2xl shadow-2xl hover:opacity-90 flex items-center justify-center gap-3 text-xl mt-4">
            Comenzar Sesión <LogIn className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-16 w-full">
          <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gray-100 flex-1"></div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Cuentas de Prueba</p>
              <div className="h-px bg-gray-100 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {TESTING_USERS.map((user) => (
              <button key={user.email} onClick={() => onLogin(user)} className="apple-button flex items-center gap-4 p-4 bg-white/40 hover:bg-white rounded-3xl border border-white/50 transition-all shadow-sm">
                <span className="text-2xl">{user.avatar}</span>
                <span className="text-sm font-bold truncate text-gray-700">{user.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<SubjectMode>(SubjectMode.MATH);
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
    setDailyChallenge(DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)]);
  }, []);

  useEffect(() => {
    if (userProfile.isAuthenticated) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [histories, currentMode, isLoading, userProfile.isAuthenticated]);

  const handleLogin = (user: typeof TESTING_USERS[0]) => {
    setUserProfile({ ...INITIAL_USER_PROFILE, username: user.name, avatar: user.avatar, email: user.email, isAuthenticated: true });
  };

  const handleLogout = () => {
    setUserProfile(INITIAL_USER_PROFILE);
    setIsRightPanelOpen(false);
    setIsLiveOpen(false);
    setIsChallengeOpen(false);
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
    <div className="flex flex-col-reverse md:flex-row h-screen bg-[#f5f5f7] overflow-hidden p-0 md:p-6 gap-6">
      <Sidebar currentMode={currentMode} onModeChange={setCurrentMode} onLogout={handleLogout} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Apple Premium Header */}
        <header className="glass rounded-[2.5rem] p-5 md:p-6 mb-6 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.02)] z-30 shrink-0 mx-2 md:mx-0 smooth-transition border border-white/60">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2.2rem] bg-black flex items-center justify-center text-3xl md:text-4xl shadow-2xl scale-105 relative">
               {currentPersona.avatar}
               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
             </div>
             <div>
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-display tracking-tight leading-tight">{currentPersona.name}</h2>
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.3em]">{currentPersona.role}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsChallengeOpen(true)} className="apple-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-white/90 hover:bg-yellow-100 text-yellow-600 rounded-3xl shadow-sm border border-white">
                <BrainCircuit className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button onClick={() => setIsLiveOpen(true)} className="apple-button w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black text-white rounded-3xl shadow-xl hover:scale-110">
                <Phone className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button onClick={() => setIsRightPanelOpen(true)} className="apple-button flex items-center gap-4 pl-5 pr-2 py-2 bg-white rounded-[2rem] shadow-sm border border-gray-50 group">
                <span className="text-sm font-bold text-gray-700 hidden sm:block font-display">{userProfile.username}</span>
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gray-50 flex items-center justify-center text-2xl shadow-inner border border-white group-hover:scale-110 transition-transform">
                    {userProfile.avatar}
                </div>
            </button>
          </div>
        </header>

        {/* Message Canvas with Apple Bubbles */}
        <div className="flex-1 overflow-y-auto px-4 md:px-12 space-y-10 py-8">
          {histories[currentMode].map((msg) => (
            <div key={msg.id} className={`flex w-full animate-slide-up ${msg.role === 'system' ? 'justify-center' : msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[85%] md:max-w-[70%] p-6 md:p-8 smooth-transition
                ${msg.role === 'system' 
                  ? 'bg-gray-200/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full px-10 py-3 mb-4' 
                  : msg.role === 'user' 
                    ? 'chat-bubble-user text-white rounded-[2.5rem] rounded-tr-[0.5rem] text-lg font-medium leading-relaxed' 
                    : 'glass text-gray-800 rounded-[2.5rem] rounded-tl-[0.5rem] border-white/50 shadow-sm text-lg font-medium leading-relaxed'}
              `}>
                {msg.isThinking ? (
                  <div className="flex gap-2.5 p-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
                ) : msg.text.split('\n').map((l, i) => <p key={i} className="mb-4 last:mb-0 leading-relaxed tracking-tight">{l}</p>)}
                {msg.role !== 'system' && (
                    <div className={`text-[9px] mt-4 opacity-40 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Command Dock */}
        <div className="p-4 md:p-10 bg-transparent shrink-0">
          <div className="max-w-4xl mx-auto glass rounded-[3rem] p-3 md:p-4 flex items-center gap-4 shadow-[0_30px_100px_rgba(0,0,0,0.1)] border border-white/60 group focus-within:ring-4 focus-within:ring-black/5 transition-all">
            <input 
              type="text" 
              value={inputs[currentMode]} 
              onChange={(e) => setInputs(prev => ({ ...prev, [currentMode]: e.target.value }))} 
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
              placeholder={`Escribe a ${currentPersona.name}...`} 
              className="flex-1 bg-transparent text-gray-800 text-lg md:text-xl font-medium px-6 py-4 focus:outline-none placeholder-gray-400 font-display" 
            />
            <button 
                onClick={handleSend} 
                disabled={isLoading || !inputs[currentMode].trim()} 
                className={`apple-button p-4 md:p-5 rounded-[2.2rem] text-white shadow-2xl active:scale-90 flex items-center justify-center ${isLoading ? 'bg-gray-200' : 'bg-black hover:opacity-90'}`}
            >
              {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Send className="w-7 h-7" />}
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">Gemini Ultra Flash</span>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">Encriptación Pro</span>
          </div>
        </div>

        <LiveSessionModal isOpen={isLiveOpen} onClose={() => setIsLiveOpen(false)} mode={currentMode} />
        <DailyChallengeModal isOpen={isChallengeOpen} onClose={() => setIsChallengeOpen(false)} challenge={dailyChallenge} onComplete={() => setIsChallengeOpen(false)} />
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
