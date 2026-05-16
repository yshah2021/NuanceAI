import React from 'react';
import { Dashboard } from './Dashboard';
import { Curriculum } from './Curriculum';
import { Navigation } from './Navigation';
import SessionFeedback from './SessionFeedback';
import ProgressAnalytics from './ProgressAnalytics';
import { MOCK_LONG_TERM_HISTORY } from '../constants';
import { UserState, SessionResult, User } from '../types';
import { Info, MessageSquare, Pause } from 'lucide-react';

// --- MOCK DATA SETUP ---

const mockUserState: UserState = {
  currentWeek: 1,
  currentDay: 2,
  sessionHistory: MOCK_LONG_TERM_HISTORY
};

const mockUser: User = {
  username: "Design User",
  role: "premium"
};

const mockNoop = () => {};

const mockSessionResult: SessionResult = {
  date: new Date().toISOString(),
  weekId: 1,
  dayId: 1,
  overallScore: 82,
  transcriptSummary: "Excellent pacing and modulation.",
  metrics: [
    { parameter: "Clarity", score: 85, feedback: "Crystal clear articulation.", actionableAdvice: "Keep this up." },
    { parameter: "Tone", score: 72, feedback: "Good range, could be warmer.", actionableAdvice: "Smile while speaking." },
    { parameter: "Pacing", score: 90, feedback: "Perfect speed.", actionableAdvice: "Great use of pauses." },
    { parameter: "Fillers", score: 65, feedback: "Used 'um' 4 times.", actionableAdvice: "Pause instead of filling." },
  ],
  feedbackAnalysis: {
    strengths: ["Great energy", "Clear pronunciation"],
    improvements: ["Reduce filler words", "Ask more questions"],
    tip: "Try pausing for 2 seconds before answering.",
    tone: "Confident and Engaging",
    recommendedResources: [
      { type: 'Watch', title: 'The Power of Pause', description: 'TED Talk on silence.' },
      { type: 'Practice', title: 'Tongue Twisters', description: 'Improve articulation.' }
    ],
    transcriptHighlights: [
       { quote: "I uh, think that...", feedback: "Filler word used.", suggestion: "I think that..." }
    ]
  }
};

// --- MOCK COMPONENTS ---

const MockLiveSession = () => {
  const transcript = [
    { role: 'model', text: "Hello! Ready to practice your storytelling today?" },
    { role: 'user', text: "Yes, I think I'm ready." },
    { role: 'model', text: "Great. Let's start with a simple prompt. Tell me about a time you felt truly proud." },
    { role: 'user', text: "Well, last year I finished a marathon. It was really hard but..." }
  ];

  return (
    <div className="flex flex-col h-[600px] w-full bg-white rounded-[32px] overflow-hidden relative shadow-2xl border border-warm-beige">
      {/* Header */}
      <div className="bg-warm-beige/50 p-6 flex justify-between items-center border-b border-warm-beige absolute top-0 left-0 right-0 z-10 backdrop-blur-sm">
        <div>
           <h2 className="text-xl font-display font-bold text-deep-brown">Storytelling Basics</h2>
           <p className="text-warm-gray text-sm flex items-center gap-2">
             <span className={`w-2 h-2 rounded-full bg-eucalyptus animate-pulse`}></span>
             Listening...
           </p>
        </div>
      </div>

      {/* Main Visual Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-mist/30 pt-24">
         {/* Animated Voice Orb */}
         <div className={`relative transition-all duration-1000 scale-100`}>
            <div className={`w-64 h-64 rounded-full blur-[60px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-apricot/40`}></div>
            <div className={`w-48 h-48 rounded-full border-[6px] flex items-center justify-center relative z-10 backdrop-blur-sm shadow-xl border-eucalyptus bg-white animate-breathe`}>
               <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-apricot to-blush-pink opacity-80 blur-xl animate-pulse"></div>
            </div>
         </div>

         {/* Transcript */}
         <div className="absolute bottom-4 left-0 right-0 px-4 md:px-8 max-w-3xl mx-auto w-full z-20 pointer-events-none">
            <div className="flex flex-col items-center justify-end space-y-3 p-4 w-full mask-linear-gradient">
               {transcript.map((t, i) => (
                 <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-lg font-medium shadow-sm backdrop-blur-sm break-words border text-center ${
                     t.role === 'model' 
                     ? 'bg-white/95 border-warm-beige text-deep-brown' 
                     : 'bg-deep-brown/95 border-transparent text-white'
                 }`}>
                   <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1 ${t.role === 'model' ? 'text-eucalyptus' : 'text-apricot'}`}>
                       {t.role === 'model' ? 'Nu' : 'You'}
                   </div>
                   {t.text}
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-8 flex flex-col justify-center items-center gap-4 border-t border-warm-beige shadow-[0_-10px_40px_rgba(0,0,0,0.02)] z-30 relative">
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
           <div className="flex gap-4 w-full justify-center">
              <button className="flex flex-1 items-center justify-center gap-2 bg-mist text-deep-brown border border-warm-beige px-4 py-3 rounded-full font-bold text-sm shadow-sm">
                <MessageSquare className="w-4 h-4 text-eucalyptus" /> Done Speaking
              </button>
              <button className="flex flex-1 items-center justify-center gap-2 bg-white text-deep-brown border-2 border-blush-pink px-4 py-3 rounded-full font-bold text-sm">
                <Pause className="w-4 h-4 text-coral" /> End Session
              </button>
           </div>
           <div className="flex items-center gap-2 text-xs text-warm-gray px-3 py-1">
             <Info className="w-3 h-3" /> Detailed feedback provided after session ends
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN GALLERY ---

const ScreenWrapper = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="mb-24">
    <h2 className="text-3xl font-display font-bold text-deep-brown mb-6 pl-4 border-l-4 border-apricot">
      {title}
    </h2>
    <div className="border-4 border-dashed border-warm-gray/20 rounded-[40px] p-4 bg-mist/50">
       <div className="relative rounded-[32px] overflow-hidden bg-mist shadow-2xl">
         {children}
       </div>
    </div>
  </div>
);

const DesignSystem = () => {
  return (
    <div className="bg-white min-h-screen p-8 md:p-16">
      <header className="mb-16 max-w-4xl">
        <h1 className="text-5xl font-display font-extrabold text-deep-brown mb-4">Screen Gallery</h1>
        <p className="text-xl text-warm-gray">
          Static captures of the Nuance AI application flow. <br/>
          <strong>For Figma Import:</strong> Use the "html.to.design" plugin and capture this full page.
        </p>
      </header>

      <div className="max-w-[1200px] mx-auto space-y-12">
        
        {/* 1. DASHBOARD */}
        <ScreenWrapper title="1. Dashboard">
           <div className="min-h-[900px] w-full relative bg-[#FDFCF8] flex">
              {/* Fake Nav Sidebar for Context */}
              <div className="w-64 border-r border-warm-gray/10 hidden md:block shrink-0">
                 <Navigation user={mockUser} onLogout={mockNoop} onShowPricing={mockNoop} />
              </div>
              <div className="flex-1">
                 <Dashboard 
                    userState={mockUserState} 
                    user={mockUser}
                    onPreview={mockNoop} 
                    onShowPricing={mockNoop}
                 />
              </div>
           </div>
        </ScreenWrapper>

        {/* 2. CURRICULUM */}
        <ScreenWrapper title="2. Curriculum">
           <div className="min-h-[900px] w-full relative bg-[#FDFCF8] flex">
              <div className="w-64 border-r border-warm-gray/10 hidden md:block shrink-0">
                 <Navigation user={mockUser} onLogout={mockNoop} onShowPricing={mockNoop} />
              </div>
              <div className="flex-1">
                 <Curriculum 
                    userState={mockUserState} 
                    user={mockUser}
                    onPreview={mockNoop} 
                    onShowPricing={mockNoop}
                 />
              </div>
           </div>
        </ScreenWrapper>

        {/* 3. LIVE SESSION */}
        <ScreenWrapper title="3. Active Session (Mock)">
           <div className="p-8 bg-mist h-[800px] flex items-center justify-center">
              <div className="max-w-4xl w-full">
                 <MockLiveSession />
              </div>
           </div>
        </ScreenWrapper>

        {/* 4. FEEDBACK REPORT */}
        <ScreenWrapper title="4. Session Analysis">
           <div className="p-8 bg-mist min-h-[1000px]">
              <SessionFeedback 
                 result={mockSessionResult} 
                 onClose={() => {}} 
              />
           </div>
        </ScreenWrapper>

        {/* 5. ANALYTICS */}
        <ScreenWrapper title="5. Progress Analytics">
           <div className="min-h-[900px] w-full relative bg-[#FDFCF8] flex">
              <div className="w-64 border-r border-warm-gray/10 hidden md:block shrink-0">
                 <Navigation user={mockUser} onLogout={mockNoop} onShowPricing={mockNoop} />
              </div>
              <div className="flex-1">
                 <ProgressAnalytics history={MOCK_LONG_TERM_HISTORY} />
              </div>
           </div>
        </ScreenWrapper>

      </div>
    </div>
  );
};

export default DesignSystem;