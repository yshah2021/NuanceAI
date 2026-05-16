
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';
import { Lesson, SessionResult } from '../types';
import { Mic, Loader2, BarChart3, WifiOff, Trophy, ArrowRight, Pause, X, Info, MessageSquare, Settings, Gauge, Check, User, Sparkles } from 'lucide-react';
import { SCORING_RUBRICS, SESSION_MODE_CONFIG } from '../constants';

interface LivePracticeProps {
  lesson: Lesson;
  weekId: number;
  weekTheme: string;
  evaluationFocus: string[];
  onComplete: (result: SessionResult) => void;
  onCancel: () => void;
}

const AVAILABLE_VOICES = [
  { id: 'Puck', label: 'Puck (Neutral)', desc: 'Balanced & Clear' },
  { id: 'Charon', label: 'Charon (Deep)', desc: 'Authoritative & Calm' },
  { id: 'Kore', label: 'Kore (Soft)', desc: 'Soothing & Gentle' },
  { id: 'Fenrir', label: 'Fenrir (Intense)', desc: 'Energetic & Strong' },
  { id: 'Zephyr', label: 'Zephyr (Bright)', desc: 'Friendly & Upbeat' },
];

const PLAYBACK_SPEEDS = [0.8, 1.0, 1.2, 1.5];

const LivePractice: React.FC<LivePracticeProps> = ({ lesson, weekId, weekTheme, evaluationFocus, onComplete, onCancel }) => {
  const isActiveRef = useRef(false);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>("Ready to start");
  const [transcript, setTranscript] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [streamingText, setStreamingText] = useState<{role: 'user' | 'model', text: string} | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const playbackSpeedRef = useRef(1.0);
  const [selectedVoice, setSelectedVoice] = useState('Puck');

  // State for AI's initial greeting
  const [initialGreeting] = useState(`Hello! Are you ready to begin the "${lesson.focus}" exercise?`);

  // Refs for Audio Contexts and cleanup
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null); // To hold the active session promise
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const currentInputTranscriptionRef = useRef<string>("");
  const currentOutputTranscriptionRef = useRef<string>("");
  const transcriptHistoryRef = useRef<{role: 'user' | 'model', text: string}[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync ref with state and update active sources dynamically
  useEffect(() => {
    playbackSpeedRef.current = playbackSpeed;
    
    // Immediately update speed of any currently playing audio
    sourcesRef.current.forEach(source => {
        try {
            // Check if context is valid before setting
            if (source.context.state === 'running') {
                 source.playbackRate.setValueAtTime(playbackSpeed, source.context.currentTime);
            }
        } catch (e) {
            console.warn("Could not update playback rate for active source", e);
        }
    });
  }, [playbackSpeed]);

  const startSession = async () => {
    if (isConnecting || isActive) return;
    
    // 1. Validate API Key
    if (!process.env.API_KEY) {
        setError("API Key is missing. Please check your configuration.");
        return;
    }

    setIsConnecting(true);
    setError(null);
    setStatus("Initializing audio...");
    
    // Clear previous history
    transcriptHistoryRef.current = [];
    setTranscript([]);
    setSessionResult(null);

    try {
      // 2. Setup Audio Input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      
      // Ensure context is running (sometimes it starts suspended)
      if (inputCtx.state === 'suspended') {
        await inputCtx.resume();
      }

      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      setStatus("Connecting to Nuance...");

      // Determine Session Mode Instruction
      const sessionMode = lesson.sessionMode || 'coaching';
      const modeInstruction = SESSION_MODE_CONFIG[sessionMode];

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Live Session Open");
            setIsActive(true);
            isActiveRef.current = true;
            setIsConnecting(false);
            setStatus("Listening...");
            
            // Add initial greeting to transcript
            const greeting = { role: 'model' as const, text: initialGreeting };
            transcriptHistoryRef.current.push(greeting);
            setTranscript([...transcriptHistoryRef.current]);
            
            // Start processing mic input - Optimized buffer size for lower latency (2048 vs 4096)
            try {
                const source = inputCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputCtx.createScriptProcessor(2048, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                  if (!isActiveRef.current) return; // Use Ref for synchronous check
                  
                  const inputData = e.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  
                  // Safe execution of session send
                  if (sessionPromise) {
                      sessionPromise.then(session => {
                        try {
                            session.sendRealtimeInput({ media: pcmBlob });
                        } catch (err) {
                            console.warn("Failed to send audio chunk", err);
                        }
                      }).catch(() => {
                         // Suppress unhandled rejections from sessionPromise if connection failed
                         // The error is already handled by 'onerror' callback
                      });
                  }
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            } catch (audioErr) {
                console.error("Audio pipeline error", audioErr);
                setError("Failed to start audio pipeline.");
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
             if (message.serverContent?.outputTranscription) {
                const text = message.serverContent.outputTranscription.text;
                currentOutputTranscriptionRef.current += text;
                setStreamingText({ role: 'model', text: currentOutputTranscriptionRef.current });
              } else if (message.serverContent?.inputTranscription) {
                const text = message.serverContent.inputTranscription.text;
                currentInputTranscriptionRef.current += text;
                setStreamingText({ role: 'user', text: currentInputTranscriptionRef.current });
              }
              
              if (message.serverContent?.turnComplete) {
                const userInput = currentInputTranscriptionRef.current;
                const modelOutput = currentOutputTranscriptionRef.current;
                
                if (userInput.trim()) {
                   transcriptHistoryRef.current.push({ role: 'user', text: userInput });
                }
                if (modelOutput.trim()) {
                   transcriptHistoryRef.current.push({ role: 'model', text: modelOutput });
                }
                
                // Update local state for UI preview
                setTranscript([...transcriptHistoryRef.current]);
                setStreamingText(null);

                currentInputTranscriptionRef.current = '';
                currentOutputTranscriptionRef.current = '';
              }

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               if (outputCtx.state === 'suspended') {
                  await outputCtx.resume();
               }

               // Haptic feedback for accessibility
               if (navigator.vibrate) {
                 navigator.vibrate(50);
               }

               // 1.0s delay if this is the start of a response to prevent interrupting
               // Reduced from 2.5s to improve responsiveness while maintaining flow
               const responseDelay = 1.0; 
               const now = outputCtx.currentTime;
               // If queue is empty or finished, start a bit in future
               if (nextStartTimeRef.current < now) {
                   nextStartTimeRef.current = now + responseDelay;
               }

               const audioBuffer = await decodeAudioData(
                 decode(base64Audio),
                 outputCtx,
                 24000,
                 1
               );
               
               const source = outputCtx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               
               // Apply playback speed
               source.playbackRate.value = playbackSpeedRef.current;
               
               source.addEventListener('ended', () => {
                 sourcesRef.current.delete(source);
               });
               
               // Adjust start time calculation based on playback rate
               // duration = actualDuration / rate
               const effectiveDuration = audioBuffer.duration / playbackSpeedRef.current;

               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += effectiveDuration;
               sourcesRef.current.add(source);
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setIsActive(false);
            isActiveRef.current = false;
          },
          onerror: (err: any) => {
            console.error("Session Error", err);
            let errorMsg = "Connection disrupted. Please check your internet or try again.";
            
            // Enhanced Error Handling
            if (err && (err.message || err.toString())) {
                const msg = (err.message || err.toString()).toLowerCase();
                if (msg.includes('503') || msg.includes('unavailable')) {
                    errorMsg = "Service unavailable (High Traffic). Please try again in a moment.";
                } else if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch')) {
                    errorMsg = "Network Error: Unable to connect. Please check your internet or API Key.";
                } else if (msg.includes('notallowed') || msg.includes('permission denied')) {
                    errorMsg = "Microphone access denied. Please enable permissions.";
                } else if (msg.includes('notfound')) {
                    errorMsg = "No microphone found. Please check your devices.";
                } else if (msg.includes('api key')) {
                    errorMsg = "Invalid API Key. Please verify your settings.";
                }
            }
            
            logEvent('session_error', { error: errorMsg });
            setError(errorMsg);
            setIsActive(false);
            isActiveRef.current = false;
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are **Nu**, an AI communication coach. Your job is to help users improve speaking, listening, and emotional expression through real conversational practice.

CONTEXT:
- Current Week: ${weekId} (${weekTheme})
- Lesson Focus: "${lesson.focus}"
- Task: "${lesson.task}"

${modeInstruction}

${lesson.aiContext ? `SPECIFIC EXERCISE INSTRUCTIONS (OVERRIDE DEFAULT BEHAVIOR):\n${lesson.aiContext}\n` : ''}

LANGUAGE PROTOCOL:
- STRICTLY SPEAK AND LISTEN IN ENGLISH ONLY.
- Even if the user has an accent, interpret it as English.
- Do not speak, transcribe, or respond in Hindi, Spanish, or any other language.
- If the user explicitly speaks another language, politely remind them: "I'm trained to coach in English. Let's try that again."

COACHING STYLE:
• Supportive, curious, non-judgmental.
• Uses warmth, clarity, and gentle directness.
• PAUSE briefly (approx 1 sec) before responding to let the user finish their thought.
• WAIT for the user to stop speaking completely. Do not interrupt.

CONVERSATION DESIGN RULES:
1) ASK → when user gives short replies
2) FOLLOW-UP → when user reveals something meaningful
3) DEEPEN → when user generalizes
4) CHALLENGE (POLITE) → when user generalizes
5) AFFIRM → when user seems unsure
6) REDIRECT → when conversation derails
7) SUMMARIZE → when closing a topic

Speak in natural, conversational lengths (2-5 sentences).
Do NOT provide scores or lectures during the live session.

OPENING PROTOCOL:
The user has just seen: "${initialGreeting}"
Treat the user's first input as a response to this. Do not repeat the greeting.`,
          speechConfig: {
             voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
      
      sessionRef.current = sessionPromise;
      
      // Catch initial connection failures to prevent unhandled rejections
      sessionPromise.catch(err => {
         console.error("Initial connection failed", err);
         // The error will often be caught by onerror as well, but this handles the promise rejection
         if (!isActiveRef.current) {
             setError("Failed to establish connection to Gemini Live.");
             setIsConnecting(false);
         }
      });

    } catch (err: any) {
      console.error(err);
      let errorMsg = "Failed to initialize session.";
      if (err.name === 'NotAllowedError') {
        errorMsg = "Microphone permission is required. Please enable it in your browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMsg = "No microphone device found.";
      }
      setError(errorMsg);
      setIsConnecting(false);
    }
  };

  const handleManualTurnEnd = () => {
    if (isActiveRef.current && sessionRef.current) {
      sessionRef.current.then((session: any) => {
        try {
            session.sendRealtimeInput({ text: "." });
        } catch (e) {
            console.warn("Failed to send manual turn signal", e);
        }
      }).catch(() => {
        // Suppress errors if session is closed/failed
      });
    }
  };

  const stopSession = async () => {
    // 1. Cleanup Audio
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      await inputAudioContextRef.current.close();
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      await outputAudioContextRef.current.close();
    }
    
    // 2. Close Gemini Live Session
    if (sessionRef.current) {
      sessionRef.current.then(session => session.close()).catch(() => console.log("Session already closed"));
      sessionRef.current = null;
    }

    setIsActive(false);
    isActiveRef.current = false;
    
    // 3. Generate Analysis
    analyzeSession();
  };

  const analyzeSession = async () => {
    // Basic validation: Check if user actually spoke
    const userTurns = transcriptHistoryRef.current.filter(t => t.role === 'user').length;
    
    if (userTurns === 0) {
       setStatus("Session Complete");
       setSessionResult({
         date: new Date().toISOString(),
         weekId,
         dayId: lesson.day,
         transcriptSummary: "Session ended early.",
         overallScore: 0,
         metrics: [],
         feedbackAnalysis: {
            strengths: ["Session started"],
            improvements: ["Please try speaking next time"],
            tip: "Check your microphone if you're having trouble.",
            tone: "Neutral"
         }
       });
       return;
    }

    setIsAnalyzing(true);
    setStatus("Analyzing your performance...");
    setError(null);

    try {
      const historyText = transcriptHistoryRef.current
        .map(t => `${t.role.toUpperCase()}: ${t.text}`)
        .join('\n');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct the Scoring Rubric part of the prompt
      const relevantRubrics = evaluationFocus.map(metric => {
         const rubric = SCORING_RUBRICS[metric];
         if (!rubric) return "";
         return `METRIC: ${metric}\nDEFINITION: ${rubric.definition}`;
      }).join("\n");

      const prompt = `
        Analyze the following conversation transcript from a communication training session.
        Context: The user is practicing "${lesson.focus}" with the goal of "${lesson.task}".
        
        Transcript:
        ${historyText.length > 0 ? historyText : "[No significant conversation recorded]"}

        Please provide a structured JSON response evaluating the user based on these specific criteria: ${evaluationFocus.join(', ')}.
        
        IMPORTANT: Use the following SCIENTIFIC RUBRICS to assign scores. Do NOT guess. Use the measurable signals defined below.
        
        ${relevantRubrics}
        
        IMPORTANT: The entire response, including all feedback and analysis, MUST be in English.

        Your feedback style must be **supportive, psychologically safe, and constructive**. Avoid harsh language. Use the sandwich method implicitly (positives first).

        The feedback must strictly follow this structure:
        1. **strengths_first**: Identify 2-3 specific moments where the user shone. Explain WHY it was effective.
        2. **focused_corrections**: Select MAX 2 areas for improvement. Be gentle but specific. Focus on the "how", not just the "what".
        3. **next_session_tip**: One single, clear, actionable takeaway for the next practice.
        4. **emotional_tone**: A soft, motivating summary sentence.
        5. **recommendedResources**: Suggest 2 specific, actionable resources to address the weaker areas found in this session.
           - At least ONE resource MUST be of type "Practice" (drill).
        6. **transcriptHighlights**: Identify 1-2 key moments in the transcript (quotes) where the user could have improved or did well, and provide a suggestion.

        Required JSON Schema:
        {
          "feedbackAnalysis": {
             "strengths_first": ["detailed point 1", "detailed point 2"],
             "focused_corrections": ["detailed area 1", "detailed area 2"],
             "next_session_tip": "one actionable tip",
             "emotional_tone": "motivational summary",
             "recommendedResources": [
               { "type": "Watch", "title": "Resource Title", "description": "Why this helps" },
               { "type": "Practice", "title": "Exercise Name", "description": "Instructions for the drill" }
             ],
             "transcriptHighlights": [
                { "quote": "User said...", "feedback": "Observation...", "suggestion": "Try saying..." }
             ]
          },
          "overallScore": number (0-100),
          "metrics": [
            { 
              "parameter": "Criteria Name", 
              "score": number (0-100), 
              "feedback": "Analysis...", 
              "actionableAdvice": "Specific thing to do...", 
              "nextSessionGoal": "Goal for next time..." 
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              feedbackAnalysis: {
                 type: Type.OBJECT,
                 properties: {
                    strengths_first: { type: Type.ARRAY, items: { type: Type.STRING } },
                    focused_corrections: { type: Type.ARRAY, items: { type: Type.STRING } },
                    next_session_tip: { type: Type.STRING },
                    emotional_tone: { type: Type.STRING },
                    recommendedResources: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: { type: Type.STRING },
                          title: { type: Type.STRING },
                          description: { type: Type.STRING }
                        }
                      }
                    },
                    transcriptHighlights: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          quote: { type: Type.STRING },
                          feedback: { type: Type.STRING },
                          suggestion: { type: Type.STRING }
                        }
                      }
                    }
                 }
              },
              overallScore: { type: Type.NUMBER },
              metrics: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                     parameter: { type: Type.STRING },
                     score: { type: Type.NUMBER },
                     feedback: { type: Type.STRING },
                     actionableAdvice: { type: Type.STRING },
                     nextSessionGoal: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const analysisText = response.text;
      if (!analysisText) throw new Error('Empty response from AI analysis');
      const resultData = JSON.parse(analysisText);
      
      const finalResult: SessionResult = {
        date: new Date().toISOString(),
        weekId: weekId,
        dayId: lesson.day,
        transcriptSummary: resultData.feedbackAnalysis?.emotional_tone || "Session completed.",
        feedbackAnalysis: {
          strengths: resultData.feedbackAnalysis?.strengths_first || [],
          improvements: resultData.feedbackAnalysis?.focused_corrections || [],
          tip: resultData.feedbackAnalysis?.next_session_tip || "",
          tone: resultData.feedbackAnalysis?.emotional_tone || "",
          recommendedResources: resultData.feedbackAnalysis?.recommendedResources || [],
          transcriptHighlights: resultData.feedbackAnalysis?.transcriptHighlights || []
        },
        overallScore: resultData.overallScore || 70,
        metrics: resultData.metrics || []
      };

      setSessionResult(finalResult);
      setIsAnalyzing(false);
      setStatus("Session Complete");

    } catch (e: any) {
      console.error("Analysis failed", e);
      let errorMsg = "Failed to generate analysis. Please try again.";
      if (e.message && (e.message.includes("Network") || e.message.includes("fetch"))) {
          errorMsg = "Network error during analysis. Please check your connection.";
      }
      setError(errorMsg);
      setIsAnalyzing(false);
    }
  };

  // Helper log function
  const logEvent = (event: string, details: any) => {
    console.log(`[NuanceAI] ${event}`, details);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
      }
      if (sessionRef.current) {
         sessionRef.current.then(s => s.close()).catch(() => {});
      }
      setIsActive(false);
      isActiveRef.current = false;
    };
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, streamingText]);

  const getTopStrength = () => {
    if (!sessionResult || !sessionResult.metrics.length) return { parameter: "Practice", score: 0 };
    return sessionResult.metrics.reduce((prev, current) => (prev.score > current.score) ? prev : current);
  };

  const retryConnection = () => {
    // Basic retry logic
    setIsConnecting(false);
    setTimeout(() => startSession(), 100);
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] bg-white rounded-[32px] overflow-hidden relative shadow-2xl border border-warm-beige">
      {/* Header */}
      <div className="bg-warm-beige/50 p-6 flex justify-between items-center border-b border-warm-beige absolute top-0 left-0 right-0 z-10 backdrop-blur-sm">
        <div>
           <h2 className="text-xl font-display font-bold text-deep-brown" aria-label={`Current Lesson: ${lesson.focus}`}>{lesson.focus}</h2>
           <p className="text-warm-gray text-sm flex items-center gap-2" role="status">
             <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-eucalyptus animate-pulse' : 'bg-warm-gray'}`}></span>
             {status}
           </p>
        </div>
        <div className="flex items-center gap-2">
            {!sessionResult && !isConnecting && (
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-3 rounded-full transition-colors ${showSettings ? 'bg-deep-brown text-white' : 'hover:bg-mist text-warm-gray'}`}
                  aria-label="Session Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
            )}
            {!isActive && !isConnecting && !isAnalyzing && !sessionResult && (
                <button 
                  onClick={onCancel} 
                  className="p-3 rounded-full hover:bg-mist text-warm-gray transition-colors"
                  aria-label="Close Session"
                >
                  <X className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && !sessionResult && (
          <div className="absolute top-20 right-6 z-40 bg-white rounded-2xl shadow-xl border border-warm-beige p-5 w-72 animate-in fade-in zoom-in-95">
             <h3 className="font-bold text-deep-brown mb-4 flex items-center gap-2">
               <Settings className="w-4 h-4" /> Session Settings
             </h3>
             
             {/* Voice Selection */}
             <div className={`mb-4 ${isActive ? 'opacity-50 pointer-events-none' : ''}`}>
               <label className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2 block flex items-center gap-1">
                 <Mic className="w-3 h-3" /> AI Voice {isActive && <span className="text-[10px] lowercase italic">(locked during session)</span>}
               </label>
               <div className="space-y-2">
                 {AVAILABLE_VOICES.map(voice => (
                   <button
                     key={voice.id}
                     disabled={isActive}
                     onClick={() => setSelectedVoice(voice.id)}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between border ${
                       selectedVoice === voice.id 
                       ? 'bg-apricot/20 border-apricot text-deep-brown font-bold' 
                       : 'bg-mist border-transparent text-deep-brown/80 hover:bg-mist/80'
                     }`}
                     aria-pressed={selectedVoice === voice.id}
                   >
                      <span>{voice.label}</span>
                      {selectedVoice === voice.id && <Check className="w-4 h-4 text-deep-brown" />}
                   </button>
                 ))}
               </div>
             </div>

             {/* Playback Speed */}
             <div>
               <label className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2 block flex items-center gap-1">
                 <Gauge className="w-3 h-3" /> Audio Speed
               </label>
               <div className="flex bg-mist rounded-lg p-1">
                 {PLAYBACK_SPEEDS.map(speed => (
                   <button
                     key={speed}
                     onClick={() => setPlaybackSpeed(speed)}
                     className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                        playbackSpeed === speed 
                        ? 'bg-white shadow-sm text-deep-brown' 
                        : 'text-warm-gray hover:text-deep-brown'
                     }`}
                     aria-label={`Set speed to ${speed}x`}
                   >
                     {speed}x
                   </button>
                 ))}
               </div>
             </div>
          </div>
      )}

      {/* Main Visual Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-mist/30 pt-24" aria-live="polite">
        
        {sessionResult ? (
          <div className="text-center animate-in fade-in zoom-in duration-500 w-full max-w-md">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-apricot/20 text-deep-brown mb-6 mx-auto shadow-sm">
                <Trophy className="w-12 h-12 text-coral" />
            </div>
            <h3 className="text-warm-gray text-xs uppercase tracking-wider font-bold mb-2 font-label">Overall Confidence</h3>
            <div className="text-7xl font-display font-bold text-deep-brown mb-8">{sessionResult.overallScore}</div>
            
            <div className="bg-white rounded-2xl p-5 w-full mb-8 border border-warm-beige shadow-sm">
                <div className="text-eucalyptus text-xs font-bold uppercase mb-1 flex items-center justify-center gap-1 font-label">
                  <BarChart3 className="w-3 h-3" /> Top Strength
                </div>
                <div className="text-deep-brown font-display font-semibold text-lg">
                    {getTopStrength().parameter}
                </div>
            </div>

            <button 
                onClick={() => onComplete(sessionResult)}
                className="flex items-center justify-center gap-2 bg-apricot hover:bg-apricot-hover text-deep-brown px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-apricot/20 w-full transform hover:scale-[1.02]"
                aria-label="View Full Analysis Report"
            >
                View Full Analysis <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            {/* Animated Voice Orb (Nuance Design) */}
            <div className={`relative transition-all duration-1000 ${isActive ? 'scale-100' : 'scale-95 opacity-60'}`} aria-hidden="true">
               {/* Outer glow */}
               <div className={`w-64 h-64 rounded-full blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors duration-1000
                 ${isActive ? 'bg-apricot/40' : 'bg-warm-gray/10'}
               `}></div>
               
               {/* Main Orb */}
               <div className={`w-48 h-48 rounded-full border-[6px] flex items-center justify-center relative z-10 backdrop-blur-sm shadow-xl transition-all duration-700
                 ${isActive ? 'border-eucalyptus bg-white' : 'border-warm-beige bg-white'}
                 ${isActive && 'animate-breathe'}
               `}>
                 {isConnecting || isAnalyzing ? (
                   <Loader2 className="w-12 h-12 text-apricot animate-spin" />
                 ) : isActive ? (
                   <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-apricot to-blush-pink opacity-80 blur-xl animate-pulse"></div>
                 ) : (
                   <Mic className="w-12 h-12 text-warm-gray/50" />
                 )}
               </div>
            </div>

            {/* Live Transcript Snippet - Teleprompter Style */}
            {isActive && (
              <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 max-w-3xl mx-auto w-full z-20 pointer-events-none">
                 <div className="h-64 overflow-y-auto flex flex-col justify-end space-y-3 p-4 w-full scroll-smooth pointer-events-auto mask-linear-gradient">
                    <style>{`.mask-linear-gradient { mask-image: linear-gradient(to bottom, transparent 0%, black 20%); }`}</style>
                    {/* Render History */}
                    {transcript.slice(-3).map((t, i) => (
                      <div key={`hist-${i}`} className="w-full flex justify-center animate-slideUpFade">
                          <div className={`relative max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-sm md:text-lg font-medium shadow-md backdrop-blur-md border flex flex-col items-center gap-2 ${
                              t.role === 'model' 
                              ? 'bg-white/90 border-eucalyptus/30 text-deep-brown' 
                              : 'bg-deep-brown/90 border-apricot/30 text-warm-beige'
                          }`}>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {t.role === 'model' ? (
                                    <>
                                        <Sparkles className="w-3 h-3 text-eucalyptus" />
                                        <span className="text-eucalyptus">Nu</span>
                                    </>
                                ) : (
                                    <>
                                         <span className="text-apricot">You</span>
                                         <User className="w-3 h-3 text-apricot" />
                                    </>
                                )}
                            </div>
                            <p className="text-center leading-relaxed">
                                {t.text}
                            </p>
                          </div>
                      </div>
                    ))}
                    {/* Streaming Text */}
                    {streamingText && (
                       <div className="w-full flex justify-center animate-pulse">
                          <div className={`relative max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-sm md:text-lg font-medium shadow-md backdrop-blur-md border flex flex-col items-center gap-2 ${
                              streamingText.role === 'model' 
                              ? 'bg-white/90 border-eucalyptus/30 text-deep-brown' 
                              : 'bg-deep-brown/90 border-apricot/30 text-warm-beige'
                          }`}>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-80">
                                {streamingText.role === 'model' ? (
                                    <>
                                        <Sparkles className="w-3 h-3 text-eucalyptus" />
                                        <span className="text-eucalyptus">Nu</span>
                                    </>
                                ) : (
                                    <>
                                         <span className="text-apricot">You</span>
                                         <User className="w-3 h-3 text-apricot" />
                                    </>
                                )}
                            </div>
                            <p className="text-center leading-relaxed">
                                {streamingText.text} <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-1 align-middle opacity-50 rounded-full"></span>
                            </p>
                          </div>
                       </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>
              </div>
            )}

            {error && (
              <div className="absolute top-24 bg-coral/10 text-coral px-4 py-2 rounded-full border border-coral/20 flex items-center gap-2 text-sm font-bold z-20 animate-in slide-in-from-top-2" role="alert">
                <WifiOff className="w-4 h-4" /> {error}
                {error.includes("Network") && (
                   <button onClick={retryConnection} className="ml-2 underline hover:text-deep-brown">Retry</button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {!sessionResult && (
        <div className="bg-white p-8 flex flex-col justify-center items-center gap-4 border-t border-warm-beige shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-30 relative">
          {!isActive && !isConnecting && !isAnalyzing ? (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={startSession}
                className="flex items-center gap-3 bg-apricot hover:bg-apricot-hover text-deep-brown px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-apricot/30 transition-all transform hover:scale-105"
                aria-label="Start Practice Session"
              >
                <Mic className="w-6 h-6" /> {error ? "Retry Session" : "Start Practice"}
              </button>
              {transcript.length > 2 && (
                   <button 
                    onClick={analyzeSession} 
                    className="text-sm font-bold text-warm-gray hover:text-deep-brown underline"
                    aria-label="Generate Analysis for partially completed session"
                   >
                       Generate Analysis for completed part
                   </button>
              )}
            </div>
          ) : isAnalyzing ? (
             <div className="text-warm-gray flex items-center gap-3 font-medium animate-pulse" role="status">
               <BarChart3 className="w-5 h-5 text-coral" /> Generating Feedback...
             </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm">
               <div className="flex gap-4 w-full justify-center">
                  <button 
                    onClick={handleManualTurnEnd}
                    className="flex flex-1 items-center justify-center gap-2 bg-mist hover:bg-warm-beige text-deep-brown border border-warm-beige px-4 py-3 rounded-full font-bold text-sm transition-all shadow-sm pointer-events-auto"
                    aria-label="I'm done speaking"
                  >
                    <MessageSquare className="w-4 h-4 text-eucalyptus" /> Done Speaking
                  </button>

                  <button 
                    onClick={stopSession}
                    className="flex flex-1 items-center justify-center gap-2 bg-white hover:bg-blush-pink/30 text-deep-brown border-2 border-blush-pink px-4 py-3 rounded-full font-bold text-sm transition-all pointer-events-auto"
                    aria-label="End Session"
                  >
                    <Pause className="w-4 h-4 text-coral" /> End Session
                  </button>
               </div>
               <div className="flex items-center gap-2 text-xs text-warm-gray px-3 py-1">
                 <Info className="w-3 h-3" /> Detailed feedback provided after session ends
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePractice;
