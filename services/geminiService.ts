
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SubjectMode } from '../types';
import { PERSONAS } from '../constants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Models
const CHAT_MODEL = 'gemini-flash-lite-latest';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Manage separate chat sessions for each subject
const chatSessions: Record<string, Chat> = {};

export const getOrCreateChatSession = (mode: SubjectMode): Chat => {
  if (!chatSessions[mode]) {
    const persona = PERSONAS[mode];
    
    const config: any = {
      systemInstruction: persona.systemInstruction,
    };

    // Feature: Thinking Mode for Math
    // Flash-Lite supports thinking. We keep a small budget for logic verification while prioritizing speed.
    if (mode === SubjectMode.MATH) {
      config.thinkingConfig = { thinkingBudget: 1024 }; 
    } 
    
    // Feature: Search Grounding for Physics, Civics, and History
    if (mode === SubjectMode.PHYSICS || mode === SubjectMode.CIVICS || mode === SubjectMode.HISTORY) {
       config.tools = [{ googleSearch: {} }];
    }

    chatSessions[mode] = ai.chats.create({
      model: CHAT_MODEL,
      config,
    });
  }
  return chatSessions[mode];
};

export const sendMessageStream = async (
  mode: SubjectMode, 
  message: string, 
  imagePart?: { inlineData: { data: string; mimeType: string } }
) => {
  const chat = getOrCreateChatSession(mode);
  
  let msgContent: any = message;
  if (imagePart) {
      msgContent = {
          parts: [
              imagePart,
              { text: message }
          ]
      };
  }

  // Use sendMessageStream
  return chat.sendMessageStream({ message: msgContent });
};

// Feature: Generate Speech (TTS)
export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Energetic voice
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// Feature: Transcribe Audio (STT)
export const transcribeAudio = async (base64Audio: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'audio/wav', // Assuming WAV container from frontend recorder
                            data: base64Audio
                        }
                    },
                    {
                        text: "Transcribe este audio exactamente como fue dicho, en español."
                    }
                ]
            }
        });
        return response.text;
    } catch (e) {
        console.error("Transcription error", e);
        return null;
    }
}