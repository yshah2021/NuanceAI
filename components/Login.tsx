
import React, { useState } from 'react';
import { Mic2, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (username: string, role: UserRole) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username && password) {
      onLogin(username, 'free');
    } else {
      setError('Please enter a username and password');
    }
  };

  return (
    <div className="min-h-screen bg-mist flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 w-full max-w-md border border-warm-beige relative overflow-hidden">
        
        {/* Decorative Background Blob */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-apricot/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-eucalyptus/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-apricot rounded-3xl flex items-center justify-center shadow-lg mb-8 transform rotate-3">
            <Mic2 className="text-deep-brown w-10 h-10" />
          </div>
          
          <h1 className="font-display text-4xl font-bold text-deep-brown mb-2 text-center">Nuance AI</h1>
          <p className="text-warm-gray text-center mb-8">Master the art of communication.</p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <label className="block text-xs font-bold text-deep-brown uppercase tracking-wider mb-2 ml-2">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-mist border border-warm-beige rounded-2xl px-5 py-4 text-deep-brown focus:outline-none focus:border-apricot focus:ring-2 focus:ring-apricot/20 transition-all font-medium"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-deep-brown uppercase tracking-wider mb-2 ml-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-mist border border-warm-beige rounded-2xl px-5 py-4 text-deep-brown focus:outline-none focus:border-apricot focus:ring-2 focus:ring-apricot/20 transition-all font-medium"
                placeholder="Enter password"
              />
            </div>

            {error && <p className="text-coral text-sm font-bold text-center">{error}</p>}

            <button 
              type="submit"
              className="w-full bg-deep-brown text-white py-4 rounded-full font-bold text-lg shadow-xl hover:bg-black hover:shadow-2xl transition-all flex items-center justify-center gap-2 mt-4"
            >
              Sign In <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-mist w-full text-center">
            <p className="text-xs text-warm-gray">
              This is a demo app. Enter any username and password to explore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
