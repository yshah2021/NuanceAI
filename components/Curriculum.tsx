import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lock, Play, CheckCircle, Clock } from 'lucide-react';
import { User, UserState, WeekPlan, Lesson } from '../types';
import { WEEKLY_PLANS } from '../data/curriculum';
import { isContentLocked } from '../utils/content';

interface CurriculumProps {
  userState: UserState;
  user: User;
  onPreview: (week: WeekPlan, lesson: Lesson) => void;
  onShowPricing: () => void;
}

export const Curriculum: React.FC<CurriculumProps> = ({ userState, user, onPreview, onShowPricing }) => {
  const [expandedWeek, setExpandedWeek] = useState<number>(userState.currentWeek);

  return (
    <div className="p-6 md:p-12 pb-24 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="font-display text-3xl font-bold text-deep-brown mb-2">Training Plan</h1>
        <p className="text-warm-gray">Your journey to conversational mastery.</p>
      </header>

      <div className="space-y-4">
        {WEEKLY_PLANS.map((week) => {
          const isCurrent = week.id === userState.currentWeek;
          const isExpanded = expandedWeek === week.id;

          if (week.comingSoon) {
            return (
              <div key={week.id} className="rounded-3xl border border-warm-beige bg-white/60 opacity-70 overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-warm-gray/20 text-warm-gray">
                      {week.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-deep-brown/50 text-lg">{week.title}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-apricot/40 text-deep-brown/60 text-xs font-label font-semibold">
                          <Clock className="w-3 h-3" /> Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-warm-gray/70">{week.theme}</p>
                    </div>
                  </div>
                  <Lock className="w-5 h-5 text-warm-gray/40" />
                </div>
              </div>
            );
          }

          return (
            <div key={week.id} className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isCurrent ? 'bg-white border-apricot shadow-md' : 'bg-white border-warm-beige'}`}>
              <button
                onClick={() => setExpandedWeek(isExpanded ? 0 : week.id)}
                className="w-full p-6 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isCurrent ? 'bg-apricot text-deep-brown' : 'bg-eucalyptus text-white'}`}>
                    {week.id}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-deep-brown text-lg">{week.title}</h3>
                    <p className="text-sm text-warm-gray">{week.theme}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp className="w-5 h-5 text-warm-gray" /> : <ChevronDown className="w-5 h-5 text-warm-gray" />}
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 space-y-3">
                  {week.lessons.map((lesson) => {
                    const locked = isContentLocked(user, week.id, lesson.day);
                    const isLessonCompleted = lesson.completed;
                    const isLessonActive = !locked && !isLessonCompleted && week.id === userState.currentWeek && lesson.day === userState.currentDay;

                    return (
                      <div
                        key={lesson.day}
                        onClick={() => locked ? onShowPricing() : onPreview(week, lesson)}
                        className={`flex items-center justify-between p-4 rounded-xl transition-colors group cursor-pointer ${
                          locked ? 'bg-mist opacity-70 border border-transparent' :
                          isLessonActive ? 'bg-apricot/10 border border-apricot/30' :
                          'bg-mist/30 hover:bg-mist/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            locked ? 'bg-warm-gray/20 text-warm-gray' :
                            isLessonCompleted ? 'bg-eucalyptus/20 text-eucalyptus' :
                            isLessonActive ? 'bg-apricot text-deep-brown' :
                            'bg-white border border-warm-beige text-warm-gray'
                          }`}>
                            {locked ? <Lock className="w-3 h-3" /> : isLessonCompleted ? <CheckCircle className="w-4 h-4" /> : lesson.day}
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${isLessonActive ? 'text-deep-brown' : 'text-deep-brown/80'}`}>{lesson.focus}</h4>
                            <p className="text-xs text-warm-gray">{lesson.task}</p>
                          </div>
                        </div>
                        <button className={`p-2 rounded-full transition-all ${locked ? 'text-warm-gray' : 'opacity-0 group-hover:opacity-100 bg-deep-brown text-white'}`}>
                          {locked ? <Lock className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Curriculum;
