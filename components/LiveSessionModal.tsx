
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { PERSONAS } from '../constants';
import { SubjectMode } from '../types';
import { createPcmBlob, decodeAudio, decodeAudioData } from '../services/audioUtils';
import { Mic, PhoneOff, Activity } from 'lucide-react';

interface LiveSessionModalProps {
  mode: SubjectMode;
  isOpen: boolean;
  onClose: () => void;
}

const LiveSessionModal: React.FC<LiveSessionModalProps> = ({ mode, isOpen, onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'closed'>('connecting');
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const persona = PERSONAS[mode];

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const startSession = async () => {
      try {
        setStatus('connecting');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Setup Audio Contexts
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        inputAudioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
        audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
        
        const outputNode = audioContextRef.current!.createGain();
        outputNode.connect(audioContextRef.current!.destination);

        // Get User Media
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        // Connect to Live API
        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              if (!mounted) return;
              console.log("Live Session Opened");
              setStatus('connected');

              // Setup Input Stream
              const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                if (!mounted) return;
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                
                // Simple volume visualization
                let sum = 0;
                for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
                setVolume(Math.sqrt(sum / inputData.length) * 100);

                const pcmBlob = createPcmBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current!.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
              if (!mounted) return;

              // Handle Audio Output
              const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (base64Audio && audioContextRef.current) {
                const ctx = audioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                
                const audioBuffer = await decodeAudioData(
                  decodeAudio(base64Audio),
                  ctx,
                  24000,
                  1
                );
                
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                source.addEventListener('ended', () => {
                   sourcesRef.current.delete(source);
                });
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                sourcesRef.current.add(source);
              }

              // Handle Interruption
              if (message.serverContent?.interrupted) {
                 sourcesRef.current.forEach(s => s.stop());
                 sourcesRef.current.clear();
                 nextStartTimeRef.current = 0;
              }
            },
            onclose: () => {
               if(mounted) setStatus('closed');
            },
            onerror: (err) => {
                console.error(err);
                if(mounted) setStatus('error');
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: persona.systemInstruction, // Inject persona
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
            }
          }
        });

        sessionRef.current = sessionPromise;

      } catch (err) {
        console.error("Failed to start live session", err);
        setStatus('error');
      }
    };

    startSession();

    return () => {
      mounted = false;
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (inputAudioContextRef.current) inputAudioContextRef.current.close();
      if (audioContextRef.current) audioContextRef.current.close();
      if (sessionRef.current) {
          sessionRef.current.then(s => s.close());
      }
    };
  }, [isOpen, mode, persona.systemInstruction]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-0 md:p-4 backdrop-blur-sm">
      <div className={`w-full h-full md:h-auto md:max-w-md bg-white md:rounded-3xl p-8 flex flex-col items-center justify-center md:justify-start relative shadow-2xl border-4 ${persona.borderColor}`}>
        
        {/* Header */}
        <h2 className={`text-3xl md:text-2xl font-bold mb-10 md:mb-6 ${persona.color} text-center`}>
          Llamada con {persona.name}
        </h2>

        {/* Visualizer Circle */}
        <div className={`w-60 h-60 md:w-40 md:h-40 rounded-full flex items-center justify-center mb-12 md:mb-8 relative transition-all duration-300 ${status === 'connected' ? 'bg-gradient-to-br ' + persona.bgGradient : 'bg-gray-200'}`}>
          {status === 'connecting' && <div className="animate-spin rounded-full h-16 w-16 md:h-12 md:w-12 border-b-4 border-white"></div>}
          
          {status === 'connected' && (
            <div className="relative w-full h-full flex items-center justify-center">
                 <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-ping" style={{ transform: `scale(${1 + volume/50})` }}></div>
                 <div className="text-8xl md:text-6xl z-10">{persona.avatar}</div>
            </div>
          )}
          
          {status === 'error' && <div className="text-red-500 font-bold">Error</div>}
        </div>

        {/* Status Text */}
        <p className="text-gray-500 font-medium mb-12 md:mb-8 flex items-center gap-2 text-xl md:text-base">
            {status === 'connected' ? (
                <><Activity className="w-6 h-6 md:w-5 md:h-5 animate-pulse text-green-500" /> Escuchando...</>
            ) : status === 'connecting' ? 'Conectando satélites...' : 'Desconectado'}
        </p>

        {/* Controls */}
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-6 shadow-lg transform transition hover:scale-110 flex items-center gap-2 font-bold text-xl md:text-lg w-full md:w-auto justify-center"
        >
          <PhoneOff className="w-8 h-8" />
          Colgar
        </button>

      </div>
    </div>
  );
};

export default LiveSessionModal;
