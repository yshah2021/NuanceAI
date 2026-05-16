import React, { useState, useEffect } from 'react';
import { UserState, AdaptivePlan, AdaptiveDrill } from '../types';
import { generateDailyPlan } from '../services/adaptiveEngine';
import { Sparkles, Brain, Clock, Play, RefreshCw, Target } from 'lucide-react';

interface AdaptivePracticeProps {
  userState: UserState;
  onStartDrill: (drill: AdaptiveDrill) => void;
}

const AdaptivePractice: React.FC<AdaptivePracticeProps> = ({ userState, onStartDrill }) => {
  const [plan, setPlan] = useState<AdaptivePlan | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Load or generate plan on mount
  useEffect(() => {
    const loadPlan = async () => {
      // In a real app, check localStorage or backend first for today's plan
      const savedPlan = localStorage.getItem('dailyAdaptivePlan');
      const today = new Date().toISOString().split('T')[0];
      
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.date.startsWith(today)) {
          setPlan(parsed);
          return;
        }
      }

      // Generate new if none exists for today
      setLoading(true);
      const newPlan = await generateDailyPlan(userState.sessionHistory);
      setPlan(newPlan);
      localStorage.setItem('dailyAdaptivePlan', JSON.stringify(newPlan));
      setLoading(false);
    };

    loadPlan();
  }, [userState.sessionHistory]);

  const handleRefresh = async () => {
    setLoading(true);
    const newPlan = await generateDailyPlan(userState.sessionHistory);
    setPlan(newPlan);
    localStorage.setItem('dailyAdaptivePlan', JSON.stringify(newPlan));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-pulse">
        <div className="w-16 h-16 bg-gradient-to-tr from-apricot to-blush-pink rounded-full flex items-center justify-center mb-6 animate-spin">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold text-deep-brown mb-2">Designing Your Workout...</h2>
        <p className="text-warm-gray">Analyzing your recent sessions to find the perfect drills.</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="p-6 md:p-12 pb-24 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-gradient-to-r from-apricot to-blush-pink text-deep-brown text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Beta Feature
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold text-deep-brown mb-2 flex items-center gap-3">
            Daily Mix <Sparkles className="w-8 h-8 text-apricot fill-current" />
          </h1>
          <p className="text-warm-gray text-lg max-w-xl">
            {plan.weaknessAnalysis}
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="text-sm font-bold text-warm-gray hover:text-deep-brown flex items-center gap-2 px-4 py-2 rounded-full hover:bg-mist transition-colors self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Mix
        </button>
      </header>

      {/* Stats Bar */}
      <div className="bg-white rounded-3xl p-6 border border-warm-beige shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-mist rounded-full flex items-center justify-center">
               <Target className="w-6 h-6 text-deep-brown" />
            </div>
            <div>
               <div className="text-xs font-bold text-warm-gray uppercase tracking-wider">Focus Areas</div>
               <div className="font-bold text-deep-brown capitalize">{plan.focusAreas.join(', ')}</div>
            </div>
         </div>
         <div className="h-10 w-px bg-warm-beige hidden md:block"></div>
         <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-mist rounded-full flex items-center justify-center">
               <Clock className="w-6 h-6 text-deep-brown" />
            </div>
            <div>
               <div className="text-xs font-bold text-warm-gray uppercase tracking-wider">Est. Time</div>
               <div className="font-bold text-deep-brown">{plan.estimatedTotalMinutes} Minutes</div>
            </div>
         </div>
      </div>

      {/* Drills List */}
      <div className="space-y-4">
         <h3 className="font-display font-bold text-xl text-deep-brown mb-4">Your Drills</h3>
         {plan.drills.map((drill, idx) => (
           <div 
             key={drill.id} 
             className="bg-white rounded-3xl p-6 border border-warm-beige shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
             onClick={() => onStartDrill(drill)}
           >
              {/* Hover Effect Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-apricot/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 group-hover:bg-apricot/20 transition-colors"></div>

              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
                 <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="bg-mist px-2 py-1 rounded-md text-xs font-bold text-warm-gray border border-warm-beige">
                          Drill {idx + 1}
                       </span>
                       <span className="text-xs font-bold text-eucalyptus flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {drill.estimatedMinutes} min
                       </span>
                    </div>
                    <h3 className="text-xl font-display font-bold text-deep-brown mb-2 group-hover:text-apricot-hover transition-colors">
                      {drill.title}
                    </h3>
                    <p className="text-warm-gray text-sm leading-relaxed mb-3">
                      {drill.goal}
                    </p>
                    <div className="flex gap-2">
                      {drill.primaryMetrics.map(m => (
                        <span key={m} className="text-[10px] uppercase font-bold text-deep-brown/60 bg-mist px-2 py-1 rounded-sm">
                          {m}
                        </span>
                      ))}
                    </div>
                 </div>

                 <button className="bg-deep-brown text-white p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Play className="w-6 h-6 fill-current ml-1" />
                 </button>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default AdaptivePractice;
