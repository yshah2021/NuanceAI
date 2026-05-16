import React from 'react';
import { Database, Lock, CreditCard, HardDrive, Shield, CheckCircle2, Accessibility } from 'lucide-react';

const Roadmap = () => {
  const steps = [
    {
      icon: Database,
      title: "Backend Persistence",
      desc: "Migrate from local mock data to Supabase, Firebase, or PostgreSQL to persist user progress, session scores, and lesson completion status.",
      status: "planned"
    },
    {
      icon: Lock,
      title: "Authentication",
      desc: "Implement secure user authentication (Auth0, Clerk, or Firebase Auth). Support social logins (Google/Apple) and email/password.",
      status: "planned"
    },
    {
      icon: CreditCard,
      title: "Payment Integration",
      desc: "Integrate a payment gateway (Stripe or LemonSqueezy) to handle Premium subscriptions and implement webhooks for status updates.",
      status: "planned"
    },
    {
      icon: HardDrive,
      title: "Audio Infrastructure",
      desc: "Upload session recordings to cloud object storage (AWS S3 or Google Cloud Storage) for playback history and handle transcoding.",
      status: "planned"
    },
    {
      icon: Shield,
      title: "Security & Rate Limiting",
      desc: "Move Gemini API calls to a proxy backend server to hide the API key and implement per-user rate limiting.",
      status: "planned"
    },
    {
      icon: Accessibility,
      title: "Accessibility",
      desc: "Conduct a full ARIA audit and ensure full keyboard navigation support and screen reader compatibility.",
      status: "planned"
    }
  ];

  return (
    <div className="p-6 md:p-12 pb-24 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="font-display text-3xl font-bold text-deep-brown mb-2">Production Roadmap</h1>
        <p className="text-warm-gray text-lg">The architectural path from MVP to Scalable Product.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-warm-beige shadow-sm flex flex-col gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity bg-deep-brown rounded-full w-32 h-32"></div>
                
                <div className="w-12 h-12 rounded-2xl bg-mist flex items-center justify-center border border-warm-beige text-deep-brown group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6" />
                </div>
                
                <div>
                    <h3 className="font-display font-bold text-lg text-deep-brown mb-2">{step.title}</h3>
                    <p className="text-sm text-warm-gray leading-relaxed">{step.desc}</p>
                </div>
                
                <div className="mt-auto pt-4 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-mist rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-warm-gray/30 rounded-full"></div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-warm-gray">ToDo</span>
                </div>
            </div>
        ))}
      </div>
      
      <div className="bg-eucalyptus/20 p-8 rounded-3xl border border-eucalyptus/30 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
        <div className="bg-white p-4 rounded-full shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-eucalyptus" />
        </div>
        <div>
            <h3 className="font-display font-bold text-xl text-deep-brown mb-2">MVP Complete</h3>
            <p className="text-deep-brown/80 leading-relaxed">
                The current version features a complete frontend architecture with <strong>Google Gemini Live API</strong> integration, 
                low-latency audio processing, comprehensive mock data structures, and a polished design system ready for backend connection.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Roadmap;