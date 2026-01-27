
import { GoogleGenAI, Chat, Modality } from "@google/genai";
import { SubjectMode } from '../types';
import { PERSONAS } from '../constants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ABSOLUTELY MOST ECONOMICAL MODELS
const CHAT_MODEL = 'gemini-flash-lite-latest'; // Text/Chat - The cheapest flash model
const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Native Audio Flash
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'; // TTS Flash

// Manage separate chat sessions for each subject
const chatSessions: Record<string, Chat> = {};

export const getOrCreateChatSession = (mode: SubjectMode): Chat => {
  if (!chatSessions[mode]) {
    const persona = PERSONAS[mode];
    
    const config: any = {
      systemInstruction: persona.systemInstruction,
    };

    // Keep it economical: minimum thinking budget only where logic is critical
    if (mode === SubjectMode.MATH) {
      config.thinkingConfig = { thinkingBudget: 0 }; // Disable thinking to keep it ultra-fast and cheap
    } 
    
    // Feature: Search Grounding (economical search tool)
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

  return chat.sendMessageStream({ message: msgContent });
};

// Feature: Generate Speech (TTS Flash)
export const generateSpeech = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, 
          },
        },
      },
    });
    
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};
