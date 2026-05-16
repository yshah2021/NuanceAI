import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic2, LayoutDashboard, BookOpen, Award, Dumbbell, Star, LogOut } from 'lucide-react';
import { User } from '../types';

interface NavigationProps {
  user: User;
  onLogout: () => void;
  onShowPricing: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ user, onLogout, onShowPricing }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Dumbbell, label: 'Daily Mix', path: '/adaptive' },
    { icon: BookOpen, label: 'Curriculum', path: '/curriculum' },
    { icon: Award, label: 'Progress', path: '/progress' },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-mist border-t border-warm-gray/10 md:relative md:w-64 md:h-screen md:flex-col md:border-r md:border-t-0 md:justify-start pt-8 z-50">
      <div className="hidden md:flex flex-col items-center mb-8 px-6">
        <div className="w-12 h-12 bg-apricot rounded-2xl flex items-center justify-center shadow-sm mb-3">
          <Mic2 className="text-deep-brown w-6 h-6" />
        </div>
        <h1 className="font-display font-bold text-xl text-deep-brown tracking-tight">Nuance AI</h1>
        <div className="mt-2 px-3 py-1 bg-white border border-warm-beige rounded-full text-[10px] font-bold uppercase tracking-wider text-deep-brown flex items-center gap-1">
          {user.role === 'free' ? <span className="w-2 h-2 rounded-full bg-warm-gray"></span> : <Star className="w-3 h-3 text-apricot fill-current" />}
          {user.role === 'admin' ? 'Admin Access' : user.role === 'premium' ? 'Premium' : 'Free Plan'}
        </div>
      </div>

      <div className="flex justify-around md:flex-col md:space-y-2 md:px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex md:flex-row flex-col items-center md:px-4 md:py-3 p-3 rounded-xl transition-all duration-200 group ${isActive(item.path) ? 'bg-white shadow-sm' : 'hover:bg-warm-beige'}`}
          >
            <item.icon className={`w-5 h-5 mb-1 md:mb-0 md:mr-3 transition-colors ${isActive(item.path) ? 'text-deep-brown' : 'text-warm-gray group-hover:text-deep-brown'}`} />
            <span className={`text-[10px] md:text-sm font-label font-bold tracking-wide transition-colors ${isActive(item.path) ? 'text-deep-brown' : 'text-warm-gray group-hover:text-deep-brown'}`}>{item.label}</span>
          </Link>
        ))}

        {user.role === 'free' && (
          <button
            onClick={onShowPricing}
            className="hidden md:flex flex-row items-center px-4 py-3 rounded-xl bg-deep-brown text-white mt-4 mx-2 shadow-lg hover:bg-black transition-all"
          >
            <Star className="w-4 h-4 mr-3 text-apricot" />
            <span className="text-sm font-label font-bold tracking-wide">Upgrade</span>
          </button>
        )}

        <button
          onClick={onLogout}
          className="hidden md:flex flex-row items-center px-4 py-3 rounded-xl transition-all duration-200 group mt-auto hover:bg-coral/10"
        >
          <LogOut className="w-5 h-5 mr-3 text-warm-gray group-hover:text-coral" />
          <span className="text-sm font-label font-bold tracking-wide text-warm-gray group-hover:text-coral">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
