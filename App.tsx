import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { UserState, SessionResult, Lesson, WeekPlan, User, UserRole, AdaptiveDrill } from './types';
import { MOCK_LONG_TERM_HISTORY } from './data/mockData';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Curriculum } from './components/Curriculum';
import { LessonPreviewModal } from './components/LessonPreviewModal';
import LivePractice from './components/LivePractice';
import SessionFeedback from './components/SessionFeedback';
import ProgressAnalytics from './components/ProgressAnalytics';
import DesignSystem from './components/DesignSystem';
import Login from './components/Login';
import Pricing from './components/Pricing';
import AdaptivePractice from './components/AdaptivePractice';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showPricing, setShowPricing] = useState(false);

  const [userState, setUserState] = useState<UserState>({
    currentWeek: 1,
    currentDay: 1,
    sessionHistory: MOCK_LONG_TERM_HISTORY
  });

  const [selectedPreview, setSelectedPreview] = useState<{ week: WeekPlan, lesson: Lesson } | null>(null);
  const [activeSession, setActiveSession] = useState<{ week: WeekPlan, lesson: Lesson } | null>(null);
  const [viewingResult, setViewingResult] = useState<SessionResult | null>(null);

  const handleLogin = (username: string, role: UserRole) => {
    setUser({ username, role });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveSession(null);
    setViewingResult(null);
    setSelectedPreview(null);
  };

  const handleUpgrade = () => {
    if (user) {
      setUser({ ...user, role: 'premium' });
      setShowPricing(false);
    }
  };

  const handlePreviewLesson = (week: WeekPlan, lesson: Lesson) => {
    setSelectedPreview({ week, lesson });
  };

  const handleStartSession = () => {
    if (selectedPreview) {
      setActiveSession(selectedPreview);
      setSelectedPreview(null);
    }
  };

  const handleStartAdaptiveDrill = (drill: AdaptiveDrill) => {
    const drillLesson: Lesson = {
      day: 0,
      focus: drill.title,
      task: drill.goal,
      description: drill.taskPrompt,
      sessionMode: 'coaching',
      completed: false,
      aiContext: drill.aiContext
    };

    setActiveSession({
      week: {
        id: 99,
        title: "Adaptive Practice",
        theme: "Personalized Skill Building",
        coreSkills: drill.primaryMetrics,
        lessons: [drillLesson],
        evaluationFocus: drill.primaryMetrics
      },
      lesson: drillLesson
    });
  };

  const handleCompleteSession = (result: SessionResult) => {
    setActiveSession(null);
    setViewingResult(result);
    setUserState((prev: UserState) => ({
      ...prev,
      sessionHistory: [...prev.sessionHistory, result],
    }));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (activeSession) {
    return (
      <div className="fixed inset-0 bg-mist p-4 md:p-8 z-50 overflow-hidden">
        <LivePractice
          lesson={activeSession.lesson}
          weekId={activeSession.week.id}
          weekTheme={activeSession.week.theme}
          evaluationFocus={activeSession.week.evaluationFocus}
          onComplete={handleCompleteSession}
          onCancel={() => setActiveSession(null)}
        />
      </div>
    );
  }

  if (viewingResult) {
    return (
      <div className="fixed inset-0 bg-mist p-4 md:p-8 z-50 overflow-y-auto">
        <SessionFeedback
          result={viewingResult}
          onClose={() => setViewingResult(null)}
        />
      </div>
    );
  }

  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-mist">
        <Navigation
          user={user}
          onLogout={handleLogout}
          onShowPricing={() => setShowPricing(true)}
        />

        <main className="flex-1 bg-[#FDFCF8] rounded-tl-[40px] shadow-[-20px_0_60px_rgba(0,0,0,0.05)] overflow-y-auto min-h-screen relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard userState={userState} user={user} onPreview={handlePreviewLesson} onShowPricing={() => setShowPricing(true)} />} />
            <Route path="/adaptive" element={<AdaptivePractice userState={userState} onStartDrill={handleStartAdaptiveDrill} />} />
            <Route path="/curriculum" element={<Curriculum userState={userState} user={user} onPreview={handlePreviewLesson} onShowPricing={() => setShowPricing(true)} />} />
            <Route path="/progress" element={<ProgressAnalytics history={userState.sessionHistory} />} />
<Route path="/design" element={<DesignSystem />} />
          </Routes>
        </main>

        {selectedPreview && (
          <LessonPreviewModal
            week={selectedPreview.week}
            lesson={selectedPreview.lesson}
            onStart={handleStartSession}
            onCancel={() => setSelectedPreview(null)}
          />
        )}

        {showPricing && (
          <Pricing
            onClose={() => setShowPricing(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </div>
    </Router>
  );
};

export default App;
