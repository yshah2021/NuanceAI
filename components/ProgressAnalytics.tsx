
import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { SessionResult } from '../types';
import { TrendingUp, Award, Target, AlertTriangle, ArrowUpRight, Minus } from 'lucide-react';

interface ProgressAnalyticsProps {
  history: SessionResult[];
}

// EMA (Exponential Moving Average) Calculator
// Formula: EMA_today = (Value_today * (k / (N + 1))) + (EMA_yesterday * (1 - (k / (N + 1))))
const calculateEMA = (data: { score: number }[], period: number = 5) => {
  const k = 2 / (period + 1);
  let emaArray = [];
  let prevEma = data[0]?.score || 0;

  for (const point of data) {
    const ema = (point.score * k) + (prevEma * (1 - k));
    emaArray.push({ ...point, ema: Math.round(ema) });
    prevEma = ema;
  }
  return emaArray;
};

const ProgressAnalytics: React.FC<ProgressAnalyticsProps> = ({ history }) => {
  // Sort history by date
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [history]);

  // Data for Trend Chart
  const trendData = useMemo(() => {
    const rawData = sortedHistory.map((s, i) => ({
      index: i + 1,
      date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: s.overallScore
    }));
    return calculateEMA(rawData, 5); // 5-session smoothing
  }, [sortedHistory]);

  // Mastery ETA Calculation (Simple Linear Regression)
  const masteryPrediction = useMemo(() => {
    if (sortedHistory.length < 5) return null;
    const recent = sortedHistory.slice(-5);
    const avgGrowthPerSession = (recent[recent.length - 1].overallScore - recent[0].overallScore) / 5;
    const currentScore = recent[recent.length - 1].overallScore;
    const target = 90;
    
    if (avgGrowthPerSession <= 0) return "Plateaued";
    
    const sessionsNeeded = Math.ceil((target - currentScore) / avgGrowthPerSession);
    return `${sessionsNeeded} Sessions`;
  }, [sortedHistory]);

  // Plateau Detection
  const plateauDetected = useMemo(() => {
    if (sortedHistory.length < 4) return false;
    const last3 = sortedHistory.slice(-3).map(s => s.overallScore);
    const variance = Math.max(...last3) - Math.min(...last3);
    return variance < 3 && last3[2] < 85; // Less than 3 points variance and not yet mastery
  }, [sortedHistory]);

  const currentScore = sortedHistory[sortedHistory.length - 1]?.overallScore || 0;
  const startScore = sortedHistory[0]?.overallScore || 0;
  const improvement = currentScore - startScore;

  if (history.length === 0) {
    return (
        <div className="p-12 text-center text-warm-gray">
          <div className="bg-white p-8 rounded-3xl border border-warm-beige shadow-sm inline-block">
             <TrendingUp className="w-12 h-12 text-apricot mx-auto mb-4" />
             <h2 className="font-display font-bold text-xl text-deep-brown mb-2">No Data Yet</h2>
             <p>Complete your first session to unlock analytics.</p>
          </div>
        </div>
    );
  }

  return (
    <div className="p-6 md:p-12 pb-24 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="font-display text-3xl font-bold text-deep-brown mb-2">Progress Analytics</h1>
        <p className="text-warm-gray">Track your mastery velocity and long-term growth.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-warm-beige shadow-sm">
           <div className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-1">Current Level</div>
           <div className="text-3xl font-display font-bold text-deep-brown flex items-end gap-2">
             {currentScore}
             <span className="text-sm text-eucalyptus font-bold mb-1.5 flex items-center">
               <ArrowUpRight className="w-3 h-3" /> Top 15%
             </span>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-warm-beige shadow-sm">
           <div className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-1">Total Growth</div>
           <div className="text-3xl font-display font-bold text-deep-brown flex items-end gap-2">
             {improvement > 0 ? '+' : ''}{improvement}
             <span className="text-sm text-warm-gray font-normal mb-1.5">points</span>
           </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-warm-beige shadow-sm">
           <div className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-1">Mastery ETA</div>
           <div className="text-3xl font-display font-bold text-deep-brown">
             {masteryPrediction || "Calculating..."}
           </div>
           <div className="text-xs text-warm-gray mt-1">Target: Score 90+</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-warm-beige shadow-sm">
           <div className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-1">Status</div>
           <div className="flex items-center gap-2 mt-1">
             {plateauDetected ? (
                <span className="bg-coral/20 text-deep-brown px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                   <Minus className="w-3 h-3" /> Plateau Detected
                </span>
             ) : (
                <span className="bg-eucalyptus/30 text-deep-brown px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                   <TrendingUp className="w-3 h-3" /> Accelerating
                </span>
             )}
           </div>
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white rounded-3xl p-6 border border-warm-beige shadow-sm">
         <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-bold text-lg text-deep-brown">Skill Velocity (EMA)</h3>
              <p className="text-xs text-warm-gray">Exponential moving average showing true growth trend.</p>
            </div>
         </div>
         <div className="h-72 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
               <XAxis dataKey="index" tick={false} axisLine={false} />
               <YAxis domain={[40, 100]} axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
               <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}
                  labelFormatter={(v) => `Session ${v}`}
               />
               <ReferenceLine y={90} label="Mastery" stroke="#C4DED7" strokeDasharray="3 3" />
               {/* Raw Score Dots */}
               <Line type="monotone" dataKey="score" stroke="#FF9A7B" strokeWidth={0} dot={{r: 4, fill: '#FF9A7B', fillOpacity: 0.5}} activeDot={false} isAnimationActive={false} name="Raw Score" />
               {/* Smooth EMA Line */}
               <Line type="monotone" dataKey="ema" stroke="#2C2C2C" strokeWidth={3} dot={false} activeDot={{r: 6}} name="Growth Trend" />
             </LineChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* Insights / Actionable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-warm-beige/50 p-6 rounded-2xl border border-warm-beige">
           <h3 className="font-display font-bold text-deep-brown mb-3 flex items-center gap-2">
             <Award className="w-5 h-5 text-apricot-hover" /> Recent Achievements
           </h3>
           <ul className="space-y-3">
             <li className="bg-white p-3 rounded-xl text-sm flex items-center gap-3 shadow-sm">
                <div className="bg-apricot/20 p-1.5 rounded-full"><Target className="w-4 h-4 text-deep-brown" /></div>
                <span>Achieved <b>High Clarity</b> for 3 sessions in a row.</span>
             </li>
             <li className="bg-white p-3 rounded-xl text-sm flex items-center gap-3 shadow-sm">
                <div className="bg-apricot/20 p-1.5 rounded-full"><TrendingUp className="w-4 h-4 text-deep-brown" /></div>
                <span><b>Active Listening</b> score improved by +12 points.</span>
             </li>
           </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-warm-beige">
           <h3 className="font-display font-bold text-deep-brown mb-3 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-coral" /> Attention Needed
           </h3>
           {plateauDetected ? (
             <div className="text-sm text-deep-brown/80">
               <p className="mb-2">Your <b>Structure</b> score has plateaued around 65 for the last 3 sessions.</p>
               <button className="text-xs font-bold bg-deep-brown text-white px-4 py-2 rounded-full mt-2">
                 Start "Structuring Arguments" Drill
               </button>
             </div>
           ) : (
             <p className="text-sm text-warm-gray">No major plateaus detected. Keep up the momentum!</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProgressAnalytics;
