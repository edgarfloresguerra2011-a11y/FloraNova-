
import React, { useState } from 'react';
import { ScreenId, PlantData } from './types';
import { BottomNav } from './components/Layout';
import { Home, Challenges, Ranking } from './screens/HomeGroup';
import { Identify, IdentifyResult } from './screens/IdentifyGroup';
import { AdoptTree, MyTrees, Certificate } from './screens/AdoptGroup';
import { Community } from './screens/CommunityGroup';
import { Profile, MyImpact, Collection, Settings, UpgradePro } from './screens/ProfileGroup';
import { Login } from './screens/Login';

const App: React.FC = () => {
  // App starts at LOGIN
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(ScreenId.LOGIN);
  const [plantData, setPlantData] = useState<PlantData | null>(null);
  
  // User State for Freemium Logic (PRO status, scan limits)
  const [userState, setUserState] = useState({ 
      isPro: false, 
      scansUsed: 0, 
      streak: 3,
      name: 'Invitado'
  });

  const renderScreen = () => {
    const commonProps = { 
        onNavigate: setCurrentScreen,
        userState,
        onUpdateUser: setUserState
    };
    
    switch (currentScreen) {
      case ScreenId.LOGIN: return <Login {...commonProps} />;
      case ScreenId.HOME: return <Home {...commonProps} />;
      case ScreenId.CHALLENGES: return <Challenges {...commonProps} />;
      case ScreenId.RANKING: return <Ranking {...commonProps} />;
      
      // Pass data handlers to Identify group
      case ScreenId.IDENTIFY: return <Identify {...commonProps} onDataChange={setPlantData} />;
      case ScreenId.IDENTIFY_RESULT: return <IdentifyResult {...commonProps} data={plantData} />;
      
      case ScreenId.ADOPT: return <AdoptTree {...commonProps} />;
      case ScreenId.MY_TREES: return <MyTrees {...commonProps} />;
      case ScreenId.CERTIFICATE: return <Certificate {...commonProps} />;
      case ScreenId.COMMUNITY: return <Community {...commonProps} />;
      case ScreenId.PROFILE: return <Profile {...commonProps} />;
      case ScreenId.MY_IMPACT: return <MyImpact {...commonProps} />;
      case ScreenId.COLLECTION: return <Collection {...commonProps} />;
      case ScreenId.SETTINGS: return <Settings {...commonProps} />;
      case ScreenId.UPGRADE_PRO: return <UpgradePro {...commonProps} />;
      default: return <Login {...commonProps} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
      {renderScreen()}
      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
    </div>
  );
};

export default App;
