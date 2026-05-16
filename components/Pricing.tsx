import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface PricingProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-deep-brown/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-[40px] max-w-md w-full p-12 shadow-2xl relative text-center animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-6 right-6 text-warm-gray hover:text-deep-brown transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="w-16 h-16 bg-apricot/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-apricot" />
        </div>

        <h2 className="font-display text-3xl font-bold text-deep-brown mb-3">Premium Coming Soon</h2>
        <p className="text-warm-gray leading-relaxed">
          Paid plans are not yet available in this demo. Full access is enabled for all users.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
