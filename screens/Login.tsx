
import React from 'react';
import { ScreenProps, ScreenId } from '../types';
import { ScreenContainer } from '../components/Layout';
import { Leaf, Mail } from 'lucide-react';

export const Login: React.FC<ScreenProps> = ({ onNavigate, onUpdateUser, userState }) => {
  
  const handleLogin = (method: string) => {
      // Simulating login
      if(onUpdateUser) {
          onUpdateUser({...userState, name: 'Alex Morgan'});
      }
      onNavigate(ScreenId.HOME);
  };

  return (
    <ScreenContainer className="h-screen flex flex-col justify-between relative overflow-hidden">
       {/* High Quality Background Image */}
       <img 
          src="https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1000&q=80" 
          className="absolute inset-0 w-full h-full object-cover z-0" 
          alt="Nature Background" 
       />
       {/* Dark Gradient Overlay */}
       <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80 z-0"></div>

       <div className="relative z-10 mt-16 px-8">
           <div className="w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-2xl flex items-center justify-center mb-6 border border-white/20 shadow-xl">
               <Leaf size={32} fill="currentColor" className="text-green-400"/>
           </div>
           <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
               Flora<span className="text-green-400">Nova</span>
           </h1>
           <p className="text-white/80 text-lg font-medium leading-relaxed max-w-xs">
               Conecta con la naturaleza y únete a la comunidad global de guardianes.
           </p>
       </div>

       <div className="relative z-10 space-y-4 mb-10 px-8">
           <button 
             onClick={() => handleLogin('Google')}
             className="w-full bg-white/95 backdrop-blur-sm p-4 rounded-2xl font-bold text-gray-800 flex items-center justify-center gap-3 hover:bg-white transition-colors shadow-lg"
           >
               <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
               Continuar con Google
           </button>

           <button 
             onClick={() => handleLogin('Apple')}
             className="w-full bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-black transition-colors border border-white/10"
           >
               <svg className="w-5 h-5 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/></svg>
               Continuar con Apple
           </button>
           
           <div className="relative py-2 opacity-70">
               <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/20"></span></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white font-bold backdrop-blur-sm rounded">O con Email</span></div>
           </div>

           <button 
             onClick={() => handleLogin('Email')}
             className="w-full bg-primary hover:bg-green-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary/40 transition-all active:scale-[0.98]"
           >
               <Mail size={20} />
               Iniciar Sesión
           </button>
           
           <p className="text-[10px] text-center text-white/60 mt-6 leading-relaxed px-4">
               Al continuar, aceptas nuestra 
               <span className="text-white font-bold cursor-pointer underline ml-1">Política de Privacidad</span> y 
               <span className="text-white font-bold cursor-pointer underline ml-1">Términos de Uso</span>.
           </p>
       </div>
    </ScreenContainer>
  );
};
