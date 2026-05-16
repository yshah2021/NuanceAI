
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { SessionResult } from '../types';
import { CheckCircle, AlertCircle, Sparkles, TrendingUp, Lightbulb, ArrowLeft, MonitorPlay, BookOpen, Headphones, Dumbbell, Quote, Target, ArrowUpRight } from 'lucide-react';

interface SessionFeedbackProps {
  result: SessionResult;
  onClose: () => void;
}

const SessionFeedback: React.FC<SessionFeedbackProps> = ({ result, onClose }) => {
  const radarData = result.metrics.map(m => ({
    subject: m.parameter.split(' ')[0], // Shorten name for chart
    A: m.score,
    fullMark: 100,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-eucalyptus';
    if (score >= 70) return 'text-apricot-hover'; // Darker apricot
    return 'text-coral';
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'watch': return <MonitorPlay className="w-4 h-4 text-coral" />;
      case 'read': return <BookOpen className="w-4 h-4 text-eucalyptus" />;
      case 'listen': return <Headphones className="w-4 h-4 text-apricot-hover" />;
      default: return <Dumbbell className="w-4 h-4 text-deep-brown" />;
    }
  };

  const hasStructuredFeedback = !!result.feedbackAnalysis;
  const recommendedResources = result.feedbackAnalysis?.recommendedResources || [];
  const transcriptHighlights = result.feedbackAnalysis?.transcriptHighlights || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white md:bg-transparent">
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-warm-beige shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-deep-brown mb-1">Session Analysis</h2>
            <p className="text-warm-gray text-sm font-medium">Completed on {new Date(result.date).toLocaleDateString()}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-warm-gray uppercase tracking-widest font-bold mb-1">Overall Score</span>
            <div className="relative">
               <span className={`font-display text-6xl font-bold ${getScoreColor(result.overallScore)}`}>
                 {result.overallScore}
               </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Radar Chart */}
          <div className="bg-mist/50 rounded-3xl p-4 flex flex-col items-center justify-center h-full relative min-h-[340px]">
            <h3 className="text-warm-gray font-bold text-sm absolute top-6 left-6 font-label uppercase tracking-wide">Skill Profile</h3>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="52%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888888', fontSize: 12, fontFamily: 'Nunito', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="#FF9A7B"
                  strokeWidth={3}
                  fill="#FF9A7B"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Structured Feedback */}
          <div className="space-y-5">
             {hasStructuredFeedback ? (
               <>
                 {/* Strengths */}
                 <div className="bg-warm-beige rounded-2xl p-5 border border-apricot/20">
                    <h3 className="text-deep-brown font-display font-bold mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-apricot-hover" /> What you did well
                    </h3>
                    <ul className="space-y-3">
                      {result.feedbackAnalysis?.strengths.map((point, i) => (
                        <li key={i} className="text-sm text-deep-brown/80 flex items-start gap-3">
                           <CheckCircle className="w-5 h-5 text-eucalyptus mt-0.5 shrink-0" />
                           <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                 </div>
                 
                 {/* Improvements */}
                 <div className="bg-white rounded-2xl p-5 border border-warm-gray/10 shadow-sm">
                    <h3 className="text-deep-brown font-display font-bold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-coral" /> Where to grow
                    </h3>
                    <ul className="space-y-3">
                      {result.feedbackAnalysis?.improvements.map((point, i) => (
                        <li key={i} className="text-sm text-deep-brown/80 flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-coral mt-2 shrink-0"></div>
                           <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                 </div>

                 {/* Tip */}
                 <div className="bg-gradient-to-r from-apricot/30 to-blush-pink/30 rounded-2xl p-5">
                    <h3 className="text-deep-brown font-display font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Lightbulb className="w-4 h-4 text-deep-brown" /> Next Session Tip
                    </h3>
                    <p className="text-deep-brown text-sm leading-relaxed font-medium italic">
                       "{result.feedbackAnalysis?.tip}"
                    </p>
                 </div>
               </>
             ) : (
                /* Fallback */
                <div className="bg-mist rounded-2xl p-6">
                  <h3 className="text-deep-brown font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> AI Observation
                  </h3>
                  <p className="text-warm-gray text-sm leading-relaxed">
                    {result.transcriptSummary}
                  </p>
                </div>
             )}
          </div>
        </div>

        {/* Detailed Metrics List with Actionable Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {result.metrics.map((metric, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-warm-beige shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-display font-bold text-deep-brown">{metric.parameter}</h4>
                <div className={`text-xs font-bold px-3 py-1 rounded-full ${
                  metric.score >= 80 ? 'bg-eucalyptus/30 text-deep-brown' :
                  metric.score >= 60 ? 'bg-apricot/40 text-deep-brown' :
                  'bg-coral/20 text-deep-brown'
                }`}>
                  {metric.score}/100
                </div>
              </div>
              <div className="w-full bg-mist h-2 rounded-full mb-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    metric.score >= 80 ? 'bg-eucalyptus' :
                    metric.score >= 60 ? 'bg-apricot' :
                    'bg-coral'
                  }`} 
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-warm-gray leading-relaxed font-medium mb-4 flex-grow">
                {metric.feedback}
              </p>
              
              {metric.actionableAdvice && (
                <div className="mt-auto pt-3 border-t border-mist">
                  <div className="flex items-start gap-2 mb-2">
                     <ArrowUpRight className="w-3 h-3 text-deep-brown mt-0.5" />
                     <p className="text-xs text-deep-brown/80"><span className="font-bold">Advice:</span> {metric.actionableAdvice}</p>
                  </div>
                  {metric.nextSessionGoal && (
                    <div className="flex items-start gap-2">
                       <Target className="w-3 h-3 text-eucalyptus mt-0.5" />
                       <p className="text-xs text-deep-brown/80"><span className="font-bold">Goal:</span> {metric.nextSessionGoal}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Transcript Highlights (New Section) */}
        {hasStructuredFeedback && transcriptHighlights.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-warm-beige shadow-sm mt-8">
             <h3 className="text-deep-brown font-display font-bold mb-4 flex items-center gap-2">
                <Quote className="w-5 h-5 text-apricot-hover" /> Moment Analysis
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transcriptHighlights.map((hl, idx) => (
                  <div key={idx} className="bg-mist p-4 rounded-xl border border-warm-beige/50">
                     <div className="flex gap-2 mb-2">
                        <Quote className="w-4 h-4 text-warm-gray rotate-180" />
                        <p className="text-sm font-serif italic text-deep-brown/80">"{hl.quote}"</p>
                     </div>
                     <div className="pl-6 space-y-2">
                        <p className="text-xs text-coral font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Observation:
                          <span className="font-medium text-deep-brown">{hl.feedback}</span>
                        </p>
                        <p className="text-xs text-eucalyptus font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Try instead:
                          <span className="font-medium text-deep-brown">{hl.suggestion}</span>
                        </p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* Action Items / Resources */}
        {hasStructuredFeedback && recommendedResources.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-warm-beige shadow-sm mt-8">
             <h3 className="text-deep-brown font-display font-bold mb-4 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-eucalyptus" /> Recommended for You
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedResources.map((res, idx) => (
                  <div key={idx} className="bg-mist p-4 rounded-xl flex gap-4 items-start border border-transparent hover:border-warm-beige transition-colors">
                     <div className="bg-white p-2.5 rounded-full shadow-sm">
                       {getResourceIcon(res.type)}
                     </div>
                     <div>
                       <div className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-1">{res.type}</div>
                       <h4 className="text-deep-brown font-bold text-sm mb-1">{res.title}</h4>
                       <p className="text-deep-brown/70 text-xs leading-relaxed">{res.description}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Footer / Tone */}
      {result.feedbackAnalysis?.tone && (
        <div className="text-center text-warm-gray italic text-sm font-serif">
           ~ {result.feedbackAnalysis.tone} ~
        </div>
      )}

      <div className="flex justify-center pt-8 pb-12">
        <button 
          onClick={onClose}
          className="bg-deep-brown hover:bg-black text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 transform hover:-translate-y-1"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SessionFeedback;
