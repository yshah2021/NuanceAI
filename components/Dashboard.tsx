import React from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Target, Lock, Play } from 'lucide-react';
import { User, UserState, WeekPlan, Lesson } from '../types';
import { WEEKLY_PLANS } from '../data/curriculum';
import { MOCK_RECENT_SESSIONS } from '../data/mockData';
import { isContentLocked } from '../utils/content';

interface DashboardProps {
  userState: UserState;
  user: User;
  onPreview: (week: WeekPlan, lesson: Lesson) => void;
  onShowPricing: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userState, user, onPreview, onShowPricing }) => {
  const currentWeekPlan = WEEKLY_PLANS.find(w => w.id === userState.currentWeek) || WEEKLY_PLANS[0];
  const nextLesson = currentWeekPlan.lessons.find(l => l.day === userState.currentDay) || currentWeekPlan.lessons[0];
  const locked = isContentLocked(user, currentWeekPlan.id, nextLesson.day);

  return (
    <div className="p-6 md:p-12 space-y-8 pb-24 md:pb-12 max-w-5xl mx-auto font-sans">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-3xl font-bold text-deep-brown mb-2">Welcome back, {user.username}</h1>
          <p className="text-warm-gray">Ready to master your communication skills?</p>
        </div>
      </header>

      <div className="bg-white border border-warm-beige rounded-[32px] p-8 relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mist px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-warm-beige text-warm-gray">
            <Target className="w-3 h-3 text-coral" /> Up Next
          </div>
          <h2 className="text-3xl font-display font-bold mb-2 text-deep-brown">{nextLesson.focus}</h2>
          <p className="text-warm-gray mb-8 max-w-xl leading-relaxed">{nextLesson.description}</p>

          {locked ? (
            <button
              onClick={onShowPricing}
              className="bg-deep-brown hover:bg-black text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-transform transform hover:scale-105 shadow-lg"
            >
              <Lock className="w-5 h-5" /> Unlock Premium to Start
            </button>
          ) : (
            <button
              onClick={() => onPreview(currentWeekPlan, nextLesson)}
              className="bg-apricot hover:bg-apricot-hover text-deep-brown px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-transform transform hover:scale-105 shadow-lg shadow-apricot/20"
            >
              <Play className="w-5 h-5 fill-current" /> Start Session
            </button>
          )}
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-apricot/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-warm-beige shadow-sm min-w-0">
          <h3 className="font-display font-bold text-lg mb-4 text-deep-brown">Recent Activity</h3>
          <div className="h-40 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_RECENT_SESSIONS}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="score" fill="#FF9A7B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-warm-beige shadow-sm min-w-0">
          <h3 className="font-display font-bold text-lg mb-4 text-deep-brown">Current Focus</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold text-deep-brown">{currentWeekPlan.title}</span>
                <span className="text-warm-gray">Week {currentWeekPlan.id}/6</span>
              </div>
              <div className="w-full bg-mist rounded-full h-2">
                <div className="bg-eucalyptus h-2 rounded-full" style={{ width: `${(userState.currentDay / 7) * 100}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-mist/50 rounded-xl">
              <h4 className="text-xs font-bold text-warm-gray uppercase tracking-wider mb-2">Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {currentWeekPlan.coreSkills.map(skill => (
                  <span key={skill} className="text-xs bg-white px-2 py-1 rounded-md border border-warm-beige text-deep-brown font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
