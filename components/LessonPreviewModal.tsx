import React, { useState } from 'react';
import { X, Target, CheckCircle, Mic2 } from 'lucide-react';
import { WeekPlan, Lesson } from '../types';

interface LessonPreviewModalProps {
  week: WeekPlan;
  lesson: Lesson;
  onStart: () => void;
  onCancel: () => void;
}

export const LessonPreviewModal: React.FC<LessonPreviewModalProps> = ({ week, lesson, onStart, onCancel }) => {
  const [showAllScoring, setShowAllScoring] = useState(false);
  const displayedMetrics = showAllScoring ? week.evaluationFocus : week.evaluationFocus.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-deep-brown/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-[32px] max-w-2xl w-full p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
        <button onClick={onCancel} className="absolute top-6 right-6 text-warm-gray hover:text-deep-brown">
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-eucalyptus mb-2 block">{week.title}</span>
          <h2 className="text-3xl font-display font-bold text-deep-brown mb-2">{lesson.focus}</h2>
          <p className="text-warm-gray text-lg">{lesson.task}</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-mist/50 p-5 rounded-2xl border border-warm-beige">
            <h3 className="text-sm font-bold text-deep-brown uppercase tracking-wide mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-apricot" /> The Mission
            </h3>
            <p className="text-deep-brown/80 leading-relaxed text-sm">{lesson.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-warm-beige p-4 rounded-2xl">
              <h3 className="text-xs font-bold text-warm-gray uppercase tracking-wide mb-3">Focus Areas</h3>
              <div className="flex flex-wrap gap-2">
                {week.coreSkills.slice(0, 4).map(skill => (
                  <span key={skill} className="text-xs bg-mist px-2 py-1 rounded-md text-deep-brown font-medium border border-warm-beige">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border border-warm-beige p-4 rounded-2xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold text-warm-gray uppercase tracking-wide">Scoring Criteria</h3>
                {week.evaluationFocus.length > 3 && (
                  <button
                    onClick={() => setShowAllScoring(!showAllScoring)}
                    className="text-[10px] font-bold text-apricot-hover underline"
                  >
                    {showAllScoring ? "Show Less" : "See All"}
                  </button>
                )}
              </div>
              <ul className="space-y-2">
                {displayedMetrics.map(focus => (
                  <li key={focus} className="text-xs text-deep-brown flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-eucalyptus" />
                    {focus}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 rounded-full font-bold text-deep-brown border border-warm-beige hover:bg-mist transition-colors">
            Cancel
          </button>
          <button onClick={onStart} className="flex-[2] py-4 rounded-full font-bold text-deep-brown bg-apricot hover:bg-apricot-hover shadow-lg shadow-apricot/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
            <Mic2 className="w-5 h-5" /> Start Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonPreviewModal;
