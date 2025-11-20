
import React from 'react';
import { ScreenProps, ScreenId } from '../types';
import { ScreenContainer } from '../components/Layout';

export const Onboarding: React.FC<ScreenProps> = ({ onNavigate }) => {
  return (
    <ScreenContainer className="flex flex-col items-center justify-between p-6 pb-10 h-screen bg-white">
      <div className="w-full pt-10 flex flex-col items-center">
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-12">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: '15%' }}></div>
        </div>
        
        {/* Central Image - High Quality Monstera Leaf */}
        <div className="relative w-80 h-96 mb-8 flex items-center justify-center overflow-visible">
            <div className="absolute inset-0 bg-green-50 rounded-full transform scale-90 translate-y-8 blur-xl opacity-50"></div>
            <img 
              src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80" 
              alt="Monstera Leaf" 
              className="w-full h-full object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-700" 
            />
        </div>

        <div className="text-center space-y-4 max-w-xs mx-auto">
            <h1 className="text-3xl font-bold text-textPrimary tracking-tight">
              Descubre la flora nativa
            </h1>
            <p className="text-textSecondary text-base leading-relaxed">
              Identifica plantas de Ecuador al instante, diagnostica plagas y adopta árboles en los Andes.
            </p>
        </div>
      </div>

      <button
        onClick={() => onNavigate(ScreenId.HOME)}
        className="w-full max-w-sm bg-primary text-white font-semibold text-lg py-4 rounded-2xl shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all hover:bg-primary/90"
      >
        Continuar
      </button>
    </ScreenContainer>
  );
};
