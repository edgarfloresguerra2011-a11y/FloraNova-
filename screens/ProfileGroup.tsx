
import React, { useState, useRef } from 'react';
import { ScreenProps, ScreenId, ImpactStat } from '../types';
import { ScreenContainer, Header } from '../components/Layout';
import { Settings as SettingsIcon, Leaf, Grid, BarChart2, Crown, Globe, ChevronRight, LogOut, Bell, Shield, User, Edit2, Camera, Save, Lock, Mail, ChevronDown, FileText, Check, Calendar, TrendingUp, Wind, Droplets } from 'lucide-react';

// --- PROFILE SCREEN ---
export const Profile: React.FC<ScreenProps> = ({ onNavigate, userState }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
      name: userState?.name || "Alex Morgan",
      slogan: "Amante de las plantas 🌱",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPro = userState?.isPro;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setProfileData(prev => ({ ...prev, img: ev.target!.result as string }));
          }
        };
        reader.readAsDataURL(e.target.files[0]);
      }
  };
  
  return (
    <ScreenContainer className="bg-gray-50">
       <div className="bg-white pb-6 border-b border-gray-100 rounded-b-[2rem] shadow-sm">
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
           <div className="px-6 pt-12 flex items-center gap-5">
              <div className={`w-24 h-24 rounded-full bg-white p-1 shadow-md relative group ${isEditing ? 'cursor-pointer' : ''} ${isPro ? 'ring-4 ring-yellow-400' : 'ring-2 ring-primary/10'}`} onClick={() => isEditing && fileInputRef.current?.click()}>
                 <img src={profileData.img} className="w-full h-full object-cover rounded-full" />
                 {isEditing && <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white"><Camera size={20} /></div>}
                 {!isEditing && <div className={`absolute bottom-0 right-0 text-white p-1.5 rounded-full border-2 border-white ${isPro ? 'bg-yellow-400' : 'bg-primary'}`}>{isPro ? <Crown size={14} fill="currentColor"/> : <Leaf size={14} fill="currentColor" />}</div>}
              </div>
              <div className="flex-1">
                 {isEditing ? (
                     <div className="space-y-2"><input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} className="w-full text-lg font-bold border-b"/><input type="text" value={profileData.slogan} onChange={(e) => setProfileData({...profileData, slogan: e.target.value})} className="w-full text-sm border-b"/></div>
                 ) : (
                     <>
                        <h1 className="text-2xl font-bold text-textPrimary mb-1 flex items-center gap-2">{profileData.name} {isPro && <Crown size={20} className="text-yellow-400" fill="currentColor"/>}</h1>
                        <p className="text-textSecondary text-sm mb-3">{profileData.slogan}</p>
                     </>
                 )}
                 <div className="flex gap-2 mt-1">
                    {isEditing ? <button onClick={() => setIsEditing(false)} className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1"><Save size={12} /> Guardar</button> : <button onClick={() => setIsEditing(true)} className="text-xs bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-200 font-semibold text-textSecondary flex items-center gap-1"><Edit2 size={12} /> Editar</button>}
                    {!isPro && <button onClick={() => onNavigate(ScreenId.UPGRADE_PRO)} className="text-xs bg-gradient-to-r from-primary to-green-600 text-white px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1"><Crown size={12} fill="currentColor" /> PRO</button>}
                 </div>
              </div>
           </div>
           <div className="px-6 grid grid-cols-4 gap-2 mt-8">
              <div className="flex flex-col items-center p-2"><span className="text-lg font-bold text-primary">2.4t</span><span className="text-[10px] text-textSecondary text-center leading-tight mt-1">CO2 Ahorro</span></div>
              <div className="w-[1px] h-8 bg-gray-100 self-center"></div>
              <div className="flex flex-col items-center p-2"><span className="text-lg font-bold text-textPrimary">127</span><span className="text-[10px] text-textSecondary text-center leading-tight mt-1">Plantas</span></div>
              <div className="w-[1px] h-8 bg-gray-100 self-center"></div>
              <div className="flex flex-col items-center p-2"><span className="text-lg font-bold text-textPrimary">23</span><span className="text-[10px] text-textSecondary text-center leading-tight mt-1">Países</span></div>
           </div>
       </div>
       <div className="px-6 mt-6 space-y-3">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2 px-2">Cuenta</h3>
          <button onClick={() => onNavigate(ScreenId.MY_IMPACT)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-green-50 text-primary rounded-xl flex items-center justify-center"><BarChart2 size={20} /></div><span className="font-semibold text-sm text-textPrimary">Mi Impacto</span></div><ChevronRight size={20} className="text-gray-300" /></button>
          <button onClick={() => onNavigate(ScreenId.COLLECTION)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Grid size={20} /></div><span className="font-semibold text-sm text-textPrimary">Colección</span></div><ChevronRight size={20} className="text-gray-300" /></button>
          <button onClick={() => onNavigate(ScreenId.SETTINGS)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-xl flex items-center justify-center"><SettingsIcon size={20} /></div><span className="font-semibold text-sm text-textPrimary">Configuración</span></div><ChevronRight size={20} className="text-gray-300" /></button>
       </div>
    </ScreenContainer>
  );
};

// --- MY IMPACT SCREEN ---
export const MyImpact: React.FC<ScreenProps> = ({ onNavigate }) => {
   const [viewMode, setViewMode] = useState<'CO2' | 'O2'>('CO2');
   
   // Interactive History Data
   const history: ImpactStat[] = [
       { date: '2024-10-12', co2: 10, action: 'Inicio' },
       { date: '2024-11-01', co2: 50, action: 'Adopción Arbol' },
       { date: '2024-12-15', co2: 15, action: 'Plantas Casa' },
       { date: '2025-01-20', co2: 100, action: 'Adopción Bosque' },
       { date: '2025-02-05', co2: 30, action: 'Tratamiento' },
   ];

   const totalCO2 = 2.4; // Tons
   const totalO2 = (totalCO2 * 0.72).toFixed(2); // Approx Oxygen

   return (
      <ScreenContainer className="bg-white">
         <Header title="Mi Impacto" onBack={() => onNavigate(ScreenId.PROFILE)} />
         <div className="p-6">
            {/* Main Stats Card */}
            <div className={`bg-gradient-to-br ${viewMode === 'CO2' ? 'from-primary to-green-800' : 'from-blue-500 to-blue-700'} text-white p-8 rounded-[2rem] mb-6 shadow-xl relative overflow-hidden transition-colors duration-500`}>
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
               
               {/* Toggle Switch */}
               <div className="absolute top-6 right-6 bg-white/20 backdrop-blur p-1 rounded-xl flex gap-1">
                   <button onClick={() => setViewMode('CO2')} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${viewMode === 'CO2' ? 'bg-white text-primary' : 'text-white/70 hover:text-white'}`}>CO₂</button>
                   <button onClick={() => setViewMode('O2')} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${viewMode === 'O2' ? 'bg-white text-blue-600' : 'text-white/70 hover:text-white'}`}>O₂</button>
               </div>

               <div className="relative z-10 mb-6">
                   <span className="bg-white/20 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-2 w-fit mb-2">
                       <Calendar size={12}/> Miembro desde Oct 2024
                   </span>
                   <h2 className="text-lg font-bold">Tu huella ecológica</h2>
               </div>
               
               <div className="flex items-baseline gap-2 relative z-10 mb-6 animate-in fade-in">
                  <span className="text-5xl font-bold">{viewMode === 'CO2' ? totalCO2 : totalO2}</span>
                  <span className="text-base font-medium opacity-90">Toneladas {viewMode === 'CO2' ? 'CO₂ Reducido' : 'O₂ Generado'}</span>
               </div>
               
               <div className="relative z-10">
                   <div className="flex justify-between text-[10px] mb-1 font-bold opacity-80">
                       <span>Nivel Actual: Guardián</span>
                       <span>Siguiente: Maestro</span>
                   </div>
                   <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full transition-all duration-1000 ${viewMode === 'CO2' ? 'bg-green-300' : 'bg-blue-200'}`} style={{ width: '75%' }}></div>
                   </div>
               </div>
            </div>

            {/* Interactive Chart */}
            <h3 className="font-bold text-lg mb-4 text-textPrimary flex items-center gap-2">
                <TrendingUp size={18} className={viewMode === 'CO2' ? 'text-primary' : 'text-blue-500'}/> 
                Historial de {viewMode === 'CO2' ? 'Carbono' : 'Oxígeno'}
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                <div className="flex items-end justify-between h-32 gap-2">
                    {history.map((stat, i) => {
                        const val = viewMode === 'CO2' ? stat.co2 : Math.round(stat.co2 * 0.72);
                        const maxVal = 100; // Scale base
                        const height = Math.min((val / maxVal) * 100, 100);
                        return (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group cursor-pointer">
                                <div 
                                    className={`w-full rounded-t-lg relative transition-all duration-500 ${viewMode === 'CO2' ? 'bg-green-200 hover:bg-green-400' : 'bg-blue-200 hover:bg-blue-400'}`} 
                                    style={{ height: `${height}%` }}
                                >
                                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${viewMode === 'CO2' ? 'text-green-700' : 'text-blue-700'}`}>
                                        {val}{viewMode === 'CO2' ? 'kg' : 'L'}
                                    </div>
                                </div>
                                <div className="text-[9px] text-gray-400 font-bold truncate w-full text-center">{stat.date.slice(5)}</div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Detailed Log */}
            <h3 className="font-bold text-lg mb-4 text-textPrimary">Registro de Actividades</h3>
            <div className="space-y-3 mb-8">
                {history.reverse().map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${viewMode === 'CO2' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                {item.action.includes("Riego") ? <Droplets size={16}/> : item.action.includes("Adopción") ? <Leaf size={16}/> : <Wind size={16}/>}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{item.action}</p>
                                <p className="text-[10px] text-gray-400">{item.date}</p>
                            </div>
                        </div>
                        <span className={`text-sm font-bold ${viewMode === 'CO2' ? 'text-green-600' : 'text-blue-600'}`}>
                            +{viewMode === 'CO2' ? item.co2 : Math.round(item.co2 * 0.72)} {viewMode === 'CO2' ? 'kg' : 'L'}
                        </span>
                    </div>
                ))}
            </div>
         </div>
      </ScreenContainer>
   );
};

// --- COLLECTION SCREEN ---
export const Collection: React.FC<ScreenProps> = ({ onNavigate }) => {
   return (
      <ScreenContainer>
         <Header title="Mi Colección" onBack={() => onNavigate(ScreenId.PROFILE)} />
         <div className="p-4 grid grid-cols-3 gap-4">
            {[
                { name: 'Monstera', sci: 'Monstera deliciosa', img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=200&q=80' },
                { name: 'Ficus', sci: 'Ficus elastica', img: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=200&q=80' },
                { name: 'Helecho', sci: 'Nephrolepis exaltata', img: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=200&q=80' },
                { name: 'Cactus', sci: 'Cactaceae', img: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=200&q=80' },
                { name: 'Aloe', sci: 'Aloe vera', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
                { name: 'Pothos', sci: 'Epipremnum aureum', img: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?auto=format&fit=crop&w=200&q=80' },
            ].map((item, i) => (
               <div key={i} className="flex flex-col gap-2 group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow relative">
                     <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                  <div>
                     <p className="font-bold text-xs text-textPrimary truncate">{item.name}</p>
                     <p className="text--[10px] text-textSecondary italic truncate">{item.sci}</p>
                  </div>
               </div>
            ))}
         </div>
      </ScreenContainer>
   );
};

// --- SETTINGS SCREEN ---
export const Settings: React.FC<ScreenProps> = ({ onNavigate }) => {
   const [lang, setLang] = useState('es');
   const [expandedSection, setExpandedSection] = useState<string | null>(null);
   const toggleSection = (sec: string) => setExpandedSection(expandedSection === sec ? null : sec);
   const handleSignOut = () => { if(confirm("¿Estás seguro de cerrar sesión?")) onNavigate(ScreenId.LOGIN); };

   return (
      <ScreenContainer className="bg-gray-50">
         <Header title="Configuración" onBack={() => onNavigate(ScreenId.PROFILE)} />
         <div className="p-6 space-y-8">
            <div>
               <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3 pl-2">General</h3>
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  <div className="p-4 flex justify-between items-center">
                     <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Globe size={16}/></div><span className="text-sm font-medium text-textPrimary">Idioma</span></div>
                     <select value={lang} onChange={(e) => setLang(e.target.value)} className="text-xs font-medium text-textSecondary bg-transparent border-none focus:ring-0 text-right w-32"><option value="es">Español (Auto)</option><option value="en">English</option></select>
                  </div>
                  <div className="p-4 flex justify-between items-center">
                     <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Bell size={16}/></div><span className="text-sm font-medium text-textPrimary">Notificaciones</span></div>
                     <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div></div>
                  </div>
               </div>
            </div>
            <button onClick={handleSignOut} className="w-full p-4 text-red-500 font-bold text-sm flex items-center justify-center gap-2 mt-8 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100 transition-colors"><LogOut size={18} /> Cerrar Sesión</button>
            <p className="text-center text-[10px] text-textSecondary mt-4">FloraNova v5.1 (Global Build)</p>
         </div>
      </ScreenContainer>
   );
};

// --- UPGRADE PRO SCREEN ---
export const UpgradePro: React.FC<ScreenProps> = ({ onNavigate, userState, onUpdateUser }) => {
   const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
   const handleUpgrade = () => { if (onUpdateUser) { onUpdateUser({ ...userState, isPro: true }); alert(`¡Bienvenido a PRO! Plan ${plan === 'monthly' ? 'Mensual' : 'Anual'} activado.`); onNavigate(ScreenId.HOME); } };

   return (
      <ScreenContainer className="bg-white relative h-screen flex flex-col">
         <button onClick={() => onNavigate(ScreenId.PROFILE)} className="absolute top-6 left-6 p-3 z-10 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors"><ChevronRight size={24} className="rotate-180" /></button>
         <div className="h-[40vh] w-full relative overflow-hidden">
             <img src="https://images.unsplash.com/photo-1448375240586-dfd8f3793300?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Cloud Forest" />
             <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white"></div>
             <div className="absolute bottom-0 w-full p-8 text-center">
                 <div className="w-16 h-16 bg-white text-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce"><Crown size={32} fill="currentColor" /></div>
                 <h1 className="text-3xl font-bold text-textPrimary mb-2">FloraNova PRO</h1>
                 <p className="text-textSecondary font-medium">Maximiza tu impacto ecológico</p>
             </div>
         </div>
         <div className="px-8 flex-1 flex flex-col">
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-xl flex relative">
                    <button onClick={() => setPlan('monthly')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${plan === 'monthly' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>Mensual</button>
                    <button onClick={() => setPlan('annual')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${plan === 'annual' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}>Anual <span className="bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-md">-17%</span></button>
                </div>
            </div>
            <div className="space-y-4 mb-8 flex-1">
               {[{ title: 'Identificaciones Ilimitadas', desc: 'Escanea sin el límite diario de 3 plantas.' }, { title: 'AR Room Scanner', desc: 'Diseña tu espacio ideal con realidad aumentada.' }, { title: 'Soporte Botánico 24/7', desc: 'Expertos listos para ayudarte.' }, { title: 'Doble Impacto', desc: 'Plantamos 2 árboles por mes.' }].map((feature, i) => (<div key={i} className="flex gap-4 items-start"><div className="mt-0.5 bg-green-100 text-primary rounded-full p-1 h-5 w-5 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={3}/></div><div><h4 className="font-bold text-sm text-textPrimary">{feature.title}</h4><p className="text-xs text-textSecondary">{feature.desc}</p></div></div>))}
            </div>
            <div className="pb-8"><button onClick={handleUpgrade} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/30 text-lg mb-3 hover:bg-green-700 transition-colors active:scale-[0.98]">{plan === 'monthly' ? 'Suscribirse - $4.99/mes' : 'Suscribirse - $49.99/año'}</button><p className="text-center text-[10px] text-textSecondary">Cancela cuando quieras.</p></div>
         </div>
      </ScreenContainer>
   );
};
