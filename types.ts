
export enum ScreenId {
  LOGIN = 'login',
  ONBOARDING = 'onboarding_01',
  HOME = 'home_mobile',
  IDENTIFY = 'identify_mobile',
  IDENTIFY_RESULT = 'identify_result',
  ADOPT = 'adopt_tree',
  MY_TREES = 'my_trees',
  CERTIFICATE = 'certificate',
  COMMUNITY = 'community',
  CHALLENGES = 'challenges',
  RANKING = 'ranking',
  PROFILE = 'profile',
  MY_IMPACT = 'my_impact',
  COLLECTION = 'collection',
  SETTINGS = 'settings',
  UPGRADE_PRO = 'upgrade_pro',
}

export interface AppNotification {
  id: number;
  title: string;
  msg: string;
  time: string;
  icon: any; // Lucide icon component
  color: string;
  bg: string;
  screen?: ScreenId;
  read: boolean;
}

export interface UserPlant {
  id: number;
  name: string;
  species: string;
  date: string;
  img: string;
  health: {
      status: 'ok' | 'sick' | 'thirsty';
      water: 'needs_water' | 'ok';
      pests: 'alert' | 'ok';
  };
  emotion: 'happy' | 'sad' | 'sick';
  dialogue: string;
  tips: { type: string; text: string }[];
  isQuarantined?: boolean;
}

export interface PlantData {
  commonName: string;
  scientificName?: string;
  description: string;
  accuracy?: string;
  image?: string;
  mode?: 'HEALTH' | 'ROOM' | 'INVENTORY' | 'HOME_SCAN';
  healthStatus?: 'Sana' | 'Enferma' | 'Requiere Atención';
  pests?: {
    detected: boolean;
    name?: string;
    remedies?: string[];
  };
  soilAnalysis?: string;
  soilComposition?: string;
  soilRecommendations?: string;
  growthProjection?: string;
  lightNeeds?: string;
  location?: {
    lat: number;
    lng: number;
    name?: string;
  };
  arPoints?: Array<{
    x: number;
    y: number;
    label: string;
    description?: string;
    type: 'PLANT_SPOT' | 'EXISTING_PLANT';
    recommendedPlant?: string;
  }>;
  rooms?: Array<{
    name: string;
    plants: Array<{
      name: string;
      location: string;
      isSafe: boolean;
      advice: string;
    }>;
  }>;
}

export interface ImpactStat {
    date: string;
    co2: number;
    action: string; // "Riego", "Adopción", "Diagnóstico"
}

export interface NavigationProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export interface ScreenProps {
  onNavigate: (screen: ScreenId) => void;
  data?: any;
  onDataChange?: (data: any) => void;
  userState?: any; 
  onUpdateUser?: (user: any) => void;
  userPlants?: UserPlant[];
  onUpdatePlants?: (plants: UserPlant[]) => void;
  notifications?: AppNotification[];
  onUpdateNotifications?: (notifs: AppNotification[]) => void;
}
