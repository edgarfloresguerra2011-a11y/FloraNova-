
import React from 'react';
import { Home, Camera, Sprout, Users, User } from 'lucide-react';
import { ScreenId, NavigationProps } from '../types';

interface BottomNavProps extends NavigationProps {}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: ScreenId.HOME, icon: Home, label: 'Inicio' },
    { id: ScreenId.IDENTIFY, icon: Camera, label: 'Cámara' },
    { id: ScreenId.ADOPT, icon: Sprout, label: 'Adoptar' },
    { id: ScreenId.COMMUNITY, icon: Users, label: 'Comunidad' },
    { id: ScreenId.PROFILE, icon: User, label: 'Perfil' },
  ];

  const isMainTab = tabs.some(t => t.id === currentScreen);

  // Only show bottom nav on main screens, or allow navigation back to them easily.
  // The requirement implies persistence on main tabs.
  // We will hide it on Onboarding, Certificate, Identify Result for better focus.
  
  const hideNavScreens = [
    ScreenId.LOGIN,
    ScreenId.ONBOARDING,
    ScreenId.IDENTIFY_RESULT,
    ScreenId.CERTIFICATE,
    ScreenId.UPGRADE_PRO
  ];

  if (hideNavScreens.includes(currentScreen)) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-4 pt-2 px-4 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id || 
            (tab.id === ScreenId.HOME && [ScreenId.CHALLENGES, ScreenId.RANKING].includes(currentScreen)) ||
            (tab.id === ScreenId.ADOPT && [ScreenId.MY_TREES].includes(currentScreen)) ||
            (tab.id === ScreenId.PROFILE && [ScreenId.MY_IMPACT, ScreenId.COLLECTION, ScreenId.SETTINGS].includes(currentScreen));
          
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center p-2 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ScreenContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => {
  return (
    <div className={`min-h-screen bg-background text-textPrimary pb-24 ${className}`}>
      {children}
    </div>
  );
};

export const Header: React.FC<{ title?: string; onBack?: () => void; rightAction?: React.ReactNode }> = ({ title, onBack, rightAction }) => {
  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-gray-50">
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded-full">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        {title && <h1 className="text-lg font-semibold text-textPrimary">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">{rightAction}</div>
    </div>
  );
};
