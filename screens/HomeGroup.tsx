
import React, { useState, useEffect } from 'react';
import { ScreenProps, ScreenId, AppNotification } from '../types';
import { ScreenContainer, Header } from '../components/Layout';
import { Bell, Trophy, Activity, Zap, MapPin, Camera, ChevronRight, CloudRain, Sun, AlertTriangle, Store, Crown, Medal, Flame, Gift, CheckCircle2, Target, Calendar, ArrowUp, ArrowDown, X, User, TrendingUp, Lock, BarChart, Droplets, Wind, Loader2, Sprout, Clock, Cloud, ThermometerSun, Navigation, ExternalLink, Leaf, RefreshCw, Map as MapIcon } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- HOME SCREEN ---
export const Home: React.FC<ScreenProps> = ({ onNavigate, userState, notifications, onUpdateNotifications }) => {
  const [showNurseryMap, setShowNurseryMap] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [locationName, setLocationName] = useState("Localizando...");
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  // AI Data States
  const [trivia, setTrivia] = useState([
    { title: "El Pumamaqui", text: "Especie nativa que conserva agua en los páramos." },
    { title: "Riego en Quito", text: "En época seca, riega tus plantas al atardecer." },
    { title: "Suelo Volcánico", text: "La tierra andina es rica en minerales para tus plantas." },
    { title: "Orquídeas", text: "Ecuador tiene la mayor diversidad de orquídeas del mundo." },
    { title: "Luz Solar", text: "El sol ecuatorial es fuerte; protege las plantas de sombra." }
  ]);
  
  // Forecast State 
  const [forecastData, setForecastData] = useState({
      days: ['Hoy', 'Mañana', 'Mié', 'Jue', 'Vie'],
      uv: [8, 9, 6, 5, 7], // Daily Max
      rain: [20, 10, 60, 80, 40], // Daily Prob
      fire: [60, 70, 20, 10, 30], // Daily Risk
      temp: [22, 24, 19, 18, 20],
      advice: {
          uv: "Usa malla sombra al mediodía.",
          rain: "Revisa el drenaje de macetas.",
          fire: "Mantén el sustrato húmedo."
      }
  });

  const [loadingTrivia, setLoadingTrivia] = useState(false);
  const [activeWeatherMetric, setActiveWeatherMetric] = useState<'UV' | 'RAIN' | 'FIRE' | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  
  const isPro = userState?.isPro;
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Simulated Nearby Stores based on User Location
  const nearbyStores = [
      { id: 1, name: "Vivero San Gabriel", dist: "1.2 km", lat: -0.185, lng: -78.485 },
      { id: 2, name: "MegaKiwi Jardinería", dist: "2.5 km", lat: -0.175, lng: -78.475 },
      { id: 3, name: "Floristería La Orquídea", dist: "3.0 km", lat: -0.190, lng: -78.490 },
  ];

  const findNurseries = () => {
    // Ensure we have coordinates before showing map, otherwise default to Quito Center
    if (!userCoords) {
        setUserCoords({ lat: -0.1807, lng: -78.4678 }); // Default Quito
    }
    setShowNurseryMap(true);
  };

  const handleWeatherClick = (metric: 'UV' | 'RAIN' | 'FIRE') => {
      setActiveWeatherMetric(metric);
      setSelectedDayIndex(0); // Reset to today
  };
  
  const markAsRead = () => {
      if (onUpdateNotifications && notifications) {
          const updated = notifications.map(n => ({ ...n, read: true }));
          onUpdateNotifications(updated);
      }
  };

  // Helper to generate realistic hourly data based on the daily average
  const getHourlyData = (dayIdx: number, metric: 'UV' | 'RAIN' | 'FIRE') => {
      const hours = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
      const dailyValue = metric === 'UV' ? forecastData.uv[dayIdx] : metric === 'RAIN' ? forecastData.rain[dayIdx] : forecastData.fire[dayIdx];
      const baseTemp = forecastData.temp[dayIdx];

      return hours.map((h, i) => {
          let value = 0;
          let icon = Sun;
          
          if (metric === 'UV') {
              // UV follows a bell curve peaking at noon (index 3-4)
              if (i < 1 || i > 6) value = 0;
              else if (i === 3 || i === 4) value = dailyValue; // Peak
              else value = Math.floor(dailyValue * 0.6);
              icon = value > 6 ? Sun : Cloud;
          } else if (metric === 'RAIN') {
              // Rain is random but centered around daily prob
              const variation = Math.random() * 20 - 10;
              value = Math.max(0, Math.min(100, Math.floor(dailyValue + variation)));
              icon = value > 40 ? CloudRain : Cloud;
          } else {
              // Fire risk follows temp (peak afternoon)
              const timeFactor = (i > 2 && i < 6) ? 1.2 : 0.8;
              value = Math.max(0, Math.min(100, Math.floor(dailyValue * timeFactor)));
              icon = value > 50 ? Flame : Cloud;
          }

          // Simulating temp curve
          const hourTemp = i < 4 ? baseTemp - (4-i) : baseTemp - (i-4);

          return { hour: h, value, temp: hourTemp, icon };
      });
  };

  const getLocationAndData = () => {
    if (navigator.geolocation) {
        setIsLocating(true);
        setLocationName("Buscando GPS...");
        
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            setUserCoords({ lat: latitude, lng: longitude });
            fetchAIData(latitude, longitude);
        }, (err) => {
            console.warn(`Geolocation error (${err.code}): ${err.message}`);
            // Fallback to Quito for Demo if GPS fails
            const fallbackLat = -0.1807;
            const fallbackLng = -78.4678;
            setUserCoords({ lat: fallbackLat, lng: fallbackLng });
            setLocationName("Quito, Ecuador (GPS Sim)");
            fetchAIData(fallbackLat, fallbackLng);
            setIsLocating(false);
        }, {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000
        });
    } else {
        // Default Fallback
        setUserCoords({ lat: -0.1807, lng: -78.4678 });
        setLocationName("Quito, Ecuador");
        fetchAIData(-0.1807, -78.4678);
    }
  };

  const fetchAIData = async (lat: number, lng: number) => {
      try {
        setLoadingTrivia(true);
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            Context: Plant care app in Ecuador/Andes (or user location: ${lat}, ${lng}). Date: ${new Date().toLocaleDateString()}.
            Task: Return JSON with:
            1. "locationName": City/Country (e.g. Quito, Ecuador).
            2. "facts": 5 short plant facts (max 12 words each).
            3. "forecast": 5-day forecast starting today.
               - "days": ["Lun", "Mar"...]
               - "uv": 5 integers (0-12)
               - "rain": 5 integers (0-100)
               - "fire": 5 integers (0-100)
               - "temp": 5 integers (Celsius)
               - "advice": object with "uv", "rain", "fire" keys (short advice string max 10 words).
        `;
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                locationName: { type: Type.STRING },
                facts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, text: { type: Type.STRING } } } },
                forecast: {
                    type: Type.OBJECT,
                    properties: {
                        days: { type: Type.ARRAY, items: { type: Type.STRING } },
                        uv: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        rain: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        fire: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        temp: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        advice: { type: Type.OBJECT, properties: { uv: { type: Type.STRING }, rain: { type: Type.STRING }, fire: { type: Type.STRING } } }
                    }
                }
            }
        };

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema, maxOutputTokens: 1000 }
        });

        if (result.text) {
            try {
                const data = JSON.parse(result.text);
                if (data.locationName) setLocationName(data.locationName);
                if (data.facts && data.facts.length > 0) setTrivia(data.facts);
                if (data.forecast) setForecastData(data.forecast);
            } catch (jsonError) {
                console.warn("JSON Parse error, using fallback", jsonError);
            }
        }
    } catch (e) {
        console.error("Error fetching AI data", e);
        setLocationName("Ubicación Detectada");
    } finally {
        setLoadingTrivia(false);
        setIsLocating(false);
    }
  }

  useEffect(() => {
    getLocationAndData();
  }, []);

  // ... (getMetricStyle helper remains same)
  const getMetricStyle = () => {
      if (activeWeatherMetric === 'UV') return { color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200', gradient: 'from-yellow-400 to-orange-500', advice: forecastData.advice.uv, icon: Sun };
      if (activeWeatherMetric === 'RAIN') return { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-600', advice: forecastData.advice.rain, icon: CloudRain };
      return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', gradient: 'from-orange-500 to-red-600', advice: forecastData.advice.fire, icon: Flame };
  };
  const metricStyle = activeWeatherMetric ? getMetricStyle() : null;
  const hourlyData = activeWeatherMetric ? getHourlyData(selectedDayIndex, activeWeatherMetric) : [];

  return (
    <ScreenContainer className="bg-gray-50/50">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cube-coat.png')] opacity-5"></div>
        <div className="relative z-10">
            <div className="flex items-center gap-2">
                 <p className="text-textSecondary text-sm font-medium flex items-center gap-1"><MapPin size={12} className="text-primary"/> {locationName}</p>
                 <button onClick={getLocationAndData} className="p-1 bg-gray-50 rounded-full hover:bg-gray-100">
                     <RefreshCw size={10} className={isLocating ? 'animate-spin text-primary' : 'text-gray-400'} />
                 </button>
            </div>
          <h1 className="text-2xl font-bold text-textPrimary mt-0.5 flex items-center gap-2">
            Hola, Jardinero
            {isPro && <Crown size={18} className="text-yellow-400" fill="currentColor" />}
          </h1>
        </div>
        <div className="flex gap-3 relative z-10">
          <button onClick={findNurseries} className="p-2.5 bg-green-50 rounded-full text-primary hover:bg-green-100 transition-colors border border-green-100 shadow-sm">
            <Store size={20} />
          </button>
          <button 
             onClick={() => setShowNotifications(true)}
             className="p-2.5 bg-gray-50 rounded-full text-textSecondary hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm relative"
          >
              <Bell size={20} />
              {unreadCount > 0 && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"><span className="sr-only">{unreadCount}</span></div>}
          </button>
        </div>
      </div>

      {/* Notifications Modal */}
      {showNotifications && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 backdrop-blur-sm p-4 pt-20 animate-in fade-in">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="font-bold text-textPrimary flex items-center gap-2"><Bell size={18}/> Notificaciones</h3>
                      <button onClick={() => setShowNotifications(false)} className="p-1 rounded-full hover:bg-gray-200"><X size={18}/></button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                      {!notifications || notifications.length === 0 ? <div className="p-8 text-center text-gray-400 text-xs">No tienes notificaciones nuevas.</div> : notifications.map(notif => (
                            <div key={notif.id} onClick={() => { setShowNotifications(false); if(notif.screen) onNavigate(notif.screen); }} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color}`}><notif.icon size={18} /></div>
                                <div className="flex-1"><div className="flex justify-between items-start"><h4 className="text-sm font-bold text-gray-800">{notif.title}</h4><span className="text-[10px] text-gray-400">{notif.time}</span></div><p className="text-xs text-gray-600 mt-0.5">{notif.msg}</p></div>
                                {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                            </div>
                        ))}
                  </div>
                  <div className="p-3 text-center border-t border-gray-50"><button className="text-xs font-bold text-primary" onClick={markAsRead}>Marcar todo como leído</button></div>
              </div>
          </div>
      )}

      {/* Weather Modal (Same) */}
      {activeWeatherMetric && metricStyle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-300">
               <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
                  {!isPro ? (
                      <div className="relative">
                          <button onClick={() => setActiveWeatherMetric(null)} className="absolute top-4 right-4 p-2 bg-white/50 rounded-full hover:bg-white z-20 backdrop-blur-sm"><X size={20} className="text-gray-600"/></button>
                          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-30"></div>
                          <div className="text-center pt-10 pb-8 px-6 relative z-10">
                              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 relative border border-gray-100 shadow-inner"><Lock size={36} className="text-gray-400"/><div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-300 to-yellow-500 p-2 rounded-full border-4 border-white shadow-md"><Crown size={14} className="text-white" fill="currentColor"/></div></div>
                              <h3 className="text-2xl font-extrabold text-gray-800 mb-2 tracking-tight">Análisis Climático</h3>
                              <p className="text-gray-500 text-sm mb-8 leading-relaxed px-2">Desbloquea el pronóstico por horas para <strong>{locationName}</strong> y recibe alertas inteligentes.</p>
                              <button onClick={() => { setActiveWeatherMetric(null); onNavigate(ScreenId.UPGRADE_PRO); }} className="w-full bg-gradient-to-r from-primary to-green-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-200 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"><Crown size={18} fill="currentColor"/> Actualizar a PRO</button>
                              <button onClick={() => setActiveWeatherMetric(null)} className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600">Cerrar</button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col h-full">
                          <div className={`p-6 pb-8 relative overflow-hidden bg-gradient-to-br ${metricStyle.gradient}`}>
                              <button onClick={() => setActiveWeatherMetric(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 text-white z-20"><X size={20}/></button>
                              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                              <div className="relative z-10 flex items-center gap-4">
                                  <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white shadow-inner border border-white/10"><metricStyle.icon size={32} fill="currentColor" className="text-white"/></div>
                                  <div>
                                      <div className="flex items-center gap-1.5 mb-1"><span className="bg-black/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm flex items-center gap-1"><Crown size={8} fill="currentColor"/> PRO</span><span className="text-white/80 text-[10px] font-bold uppercase tracking-wider">Pronóstico Detallado</span></div>
                                      <h3 className="text-2xl font-bold text-white">{activeWeatherMetric === 'UV' ? 'Radiación UV' : activeWeatherMetric === 'RAIN' ? 'Lluvias' : 'Riesgo Incendio'}</h3>
                                  </div>
                              </div>
                          </div>
                          <div className="flex-1 bg-white -mt-6 rounded-t-[2rem] relative z-10 p-6 overflow-y-auto">
                              <div className="mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Por Horas ({forecastData.days[selectedDayIndex]})</h4>
                                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                      {hourlyData.map((h, i) => (
                                          <div key={i} className="min-w-[70px] bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col items-center justify-center gap-2">
                                              <span className="text-[10px] font-bold text-gray-400">{h.hour}</span>
                                              <h.icon size={20} className={metricStyle.color} />
                                              <span className={`text-lg font-extrabold ${metricStyle.color}`}>{h.value}{activeWeatherMetric === 'RAIN' || activeWeatherMetric === 'FIRE' ? '%' : ''}</span>
                                              <span className="text-[10px] text-gray-500 font-medium flex items-center gap-0.5"><ThermometerSun size={8}/> {Math.round(h.temp)}°</span>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                              <div className="mb-6">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Próximos 5 Días</h4>
                                  <div className="space-y-2">
                                      {forecastData.days.map((day, i) => {
                                          const isSelected = i === selectedDayIndex;
                                          const dailyVal = activeWeatherMetric === 'UV' ? forecastData.uv[i] : activeWeatherMetric === 'RAIN' ? forecastData.rain[i] : forecastData.fire[i];
                                          return (
                                              <button key={i} onClick={() => setSelectedDayIndex(i)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? `${metricStyle.bg} ${metricStyle.border} ring-1 ring-offset-1` : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                                                  <span className={`text-sm font-bold ${isSelected ? metricStyle.color : 'text-gray-600'}`}>{day}</span>
                                                  <div className="flex items-center gap-4"><span className="text-xs text-gray-400 font-medium">{forecastData.temp[i]}°C</span><span className={`text-base font-extrabold ${metricStyle.color}`}>{dailyVal}{activeWeatherMetric === 'UV' ? '' : '%'}</span></div>
                                              </button>
                                          )
                                      })}
                                  </div>
                              </div>
                              <div className={`p-4 rounded-2xl border flex gap-3 ${metricStyle.bg} ${metricStyle.border}`}>
                                  <div className={`p-2 rounded-full h-fit bg-white/50`}><Zap size={18} className={metricStyle.color} /></div>
                                  <div><h4 className={`text-xs font-bold uppercase mb-1 ${metricStyle.color}`}>Recomendación IA</h4><p className="text-xs text-gray-600 leading-relaxed font-medium">{loadingTrivia ? "Generando consejo..." : metricStyle.advice}</p></div>
                              </div>
                          </div>
                      </div>
                  )}
               </div>
          </div>
      )}

      {/* In-App Nursery Map Modal (Enhanced with Fallback) */}
      {showNurseryMap && (
         <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in fade-in duration-200">
            <div className="bg-white p-4 pt-12 flex justify-between items-center shadow-md z-10">
               <div>
                  <h3 className="font-bold text-lg text-textPrimary">Viveros & Tiendas Cercanos</h3>
                  <p className="text-xs text-textSecondary">
                      Resultados cerca de {locationName}
                  </p>
               </div>
               <button onClick={() => setShowNurseryMap(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X size={20} className="text-gray-600"/>
               </button>
            </div>
            
            <div className="flex-1 relative bg-gray-200">
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://maps.google.com/maps?q=Viveros+tiendas+de+plantas&center=${userCoords?.lat || -0.1807},${userCoords?.lng || -78.4678}&z=14&ie=UTF8&iwloc=&output=embed`}
                  title="Viveros Map"
                  className="w-full h-full"
                ></iframe>
            </div>
            
            <div className="bg-white p-4 pb-8 border-t border-gray-200 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] max-h-[40vh] overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><MapIcon size={12}/> Lugares Detectados</p>
                
                <div className="space-y-3">
                    {nearbyStores.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="font-bold text-sm text-gray-800">{store.name}</h4>
                                <p className="text-xs text-gray-500">{store.dist} • Abierto ahora</p>
                            </div>
                            <div className="flex gap-2">
                                <a 
                                  href={`https://waze.com/ul?ll=${store.lat},${store.lng}&navigate=yes`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                >
                                    <Navigation size={16}/>
                                </a>
                                <a 
                                  href={`https://www.google.com/maps/search/?api=1&query=${store.lat},${store.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                >
                                    <MapPin size={16}/>
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                     <p className="text-[10px] text-center text-gray-400 mb-2">O buscar en general:</p>
                     <div className="flex gap-3">
                        <a href={`https://waze.com/ul?q=viveros&navigate=yes`} target="_blank" rel="noreferrer" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"><Navigation size={14} /> Waze</a>
                        <a href={`https://www.google.com/maps/search/viveros+cerca+de+mi`} target="_blank" rel="noreferrer" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors"><MapPin size={14} /> Maps</a>
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* ... Rest of home ... */}
      <div className="px-6 space-y-6 pb-24">
        {/* Weather Widget */}
        <div className={`bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden group transition-all ${isPro ? 'ring-2 ring-yellow-400 shadow-yellow-500/20' : ''}`}>
            <img src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-700" alt="Sky" />
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="flex justify-between items-start relative z-10">
                <div><h3 className="font-bold text-sm flex items-center gap-2"><CloudRain size={16}/> Boletín Meteorológico</h3><p className="text-xs opacity-90 mt-1">Pronóstico para tus plantas hoy</p></div>
                <button onClick={() => onNavigate(ScreenId.UPGRADE_PRO)} className={`px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm flex items-center gap-1 border transition-colors cursor-pointer ${isPro ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/20 border-white/20 text-white hover:bg-white/30'}`}>{isPro ? <CheckCircle2 size={10} /> : <Crown size={10} className="text-yellow-300" fill="currentColor"/>} {isPro ? 'PRO ACTIVO' : 'PRO'}</button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 relative z-10">
                <div onClick={() => handleWeatherClick('UV')} className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors border border-white/5"><Sun size={16} className="mx-auto mb-1 text-yellow-300"/><span className="text-[10px] block font-medium">UV {forecastData.uv[0]}</span></div>
                <div onClick={() => handleWeatherClick('RAIN')} className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors border border-white/5"><CloudRain size={16} className="mx-auto mb-1 text-blue-200"/><span className="text-[10px] block font-medium">{forecastData.rain[0]}% Lluvia</span></div>
                <div onClick={() => handleWeatherClick('FIRE')} className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors border border-white/5"><AlertTriangle size={16} className="mx-auto mb-1 text-orange-300"/><span className="text-[10px] block font-medium">{forecastData.fire[0] > 50 ? 'Alto' : 'Bajo'}</span></div>
            </div>
        </div>

        {/* GreenScore Card */}
        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-primary/20 relative overflow-hidden">
           <img src="https://images.unsplash.com/photo-1545239351-ef35f43d514b?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-10 mix-blend-multiply" alt="Fern Texture" />
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-4"><div><h2 className="font-bold text-lg">Tu impacto verde</h2><p className="text-green-100 text-sm">Nivel: Guardián del Bosque</p></div><div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm"><Zap size={20} className="text-white" /></div></div>
              <div className="mb-2 flex justify-between items-end"><span className="text-4xl font-bold">847</span><span className="text-sm opacity-80 mb-1">/ 1000 GreenScore</span></div>
              <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden"><div className="bg-white h-full rounded-full relative" style={{ width: '84.7%' }}><div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_white]"></div></div></div>
           </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4">
           <div onClick={() => onNavigate(ScreenId.IDENTIFY)} className="bg-white p-0 rounded-2xl shadow-card border border-gray-100 flex items-center relative overflow-hidden cursor-pointer hover:border-primary/30 transition-all group h-28">
              <img src="https://images.unsplash.com/photo-1599687267812-35c05ff70ee9?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all" alt="Scanning Plant with Phone" />
              <div className="relative z-10 flex items-center p-4 w-full gap-4"><div className="w-16 h-16 rounded-xl bg-green-100/80 backdrop-blur-sm flex items-center justify-center text-primary shrink-0 shadow-sm"><Camera size={32} /></div><div className="flex-1"><h3 className="font-bold text-textPrimary text-lg">Escaner IA & Plagas</h3><p className="text-xs text-textSecondary mt-1">Diagnóstico de salud, suelo y proyección.</p></div><div className="bg-white/80 p-2 rounded-full backdrop-blur-sm"><ChevronRight size={20} className="text-gray-400" /></div></div>
           </div>
           <div onClick={() => onNavigate(ScreenId.ADOPT)} className="bg-white p-0 rounded-2xl shadow-card border border-gray-100 flex items-center relative overflow-hidden cursor-pointer hover:border-primary/30 transition-all group h-28">
              <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all" alt="Andean Forest" />
              <div className="relative z-10 flex items-center p-4 w-full gap-4"><div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative shadow-sm ring-2 ring-green-50"><img src="https://images.unsplash.com/photo-1518182170546-0766de6f6a56?auto=format&fit=crop&w=200&q=80" className="w-full h-full object-cover" /></div><div className="flex-1"><h3 className="font-bold text-textPrimary text-lg">Reforestación Quito</h3><p className="text-xs text-textSecondary mt-1">Adopta especies nativas en la Mitad del Mundo.</p></div><div className="bg-white/80 p-2 rounded-full backdrop-blur-sm"><ChevronRight size={20} className="text-gray-400" /></div></div>
           </div>
        </div>

        {/* Shortcuts */}
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate(ScreenId.CHALLENGES)} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md hover:scale-[1.02] transition-all h-32"><div className="bg-orange-50 p-3 rounded-full text-orange-500 shadow-sm"><Flame size={24} fill="currentColor" /></div><div><span className="block font-bold text-sm text-gray-800">Desafíos & Racha</span><span className="text-xs text-orange-600 font-medium">Nivel 5: Semilla</span></div></button>
          <button onClick={() => onNavigate(ScreenId.RANKING)} className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md hover:scale-[1.02] transition-all h-32"><div className="bg-blue-50 p-3 rounded-full text-blue-500 shadow-sm"><Medal size={24} fill="currentColor" /></div><div><span className="block font-bold text-sm text-gray-800">Ranking Global</span><span className="text-xs text-blue-600 font-medium">Liga Brote #4</span></div></button>
        </div>

        {/* Carousel */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 flex-nowrap snap-x">
            {loadingTrivia ? <div className="bg-white p-4 rounded-2xl shadow-sm min-w-[280px] flex items-center justify-center snap-center"><span className="text-xs text-gray-400 flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Cargando curiosidades...</span></div> : trivia.map((tip, i) => (<div key={i} className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex gap-4 items-start min-w-[280px] shadow-sm snap-center"><div className="bg-white p-2 rounded-xl shadow-sm text-purple-500 shrink-0"><Sprout size={24} /></div><div><h4 className="font-bold text-purple-900 text-sm">¿Sabías qué?</h4><p className="text-xs text-purple-700 mt-1 leading-relaxed"><span className="font-bold block mb-0.5">{tip.title}</span>{tip.text}</p></div></div>))}
        </div>
      </div>
    </ScreenContainer>
  );
};

// --- CHALLENGES SCREEN ---
export const Challenges: React.FC<ScreenProps> = ({ onNavigate, userState }) => {
  const isPro = userState?.isPro;
  const [missions, setMissions] = useState([
      { id: 1, title: "Escanea 1 Planta", xp: "+50 XP", done: false, icon: Camera, action: () => onNavigate(ScreenId.IDENTIFY) },
      { id: 2, title: "Visita la Comunidad", xp: "+20 XP", done: false, icon: User, action: () => onNavigate(ScreenId.COMMUNITY) },
      { id: 3, title: "Lee un Consejo", xp: "+10 XP", done: false, icon: Zap, action: () => setShowTips(true) },
  ]);
  const [showTips, setShowTips] = useState(false);

  const handleMissionClick = (id: number, action: () => void) => {
      setMissions(prev => prev.map(m => m.id === id ? { ...m, done: true } : m));
      action();
  };

  return (
    <ScreenContainer className="bg-gray-50">
      <Header title="Desafíos" onBack={() => onNavigate(ScreenId.HOME)} />
      
      <div className="p-6 space-y-6 pb-24">
         {showTips && (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
                 <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                     <h3 className="text-xl font-bold text-green-700 mb-2">Consejo del Día 🌿</h3>
                     <p className="text-gray-600 mb-6">"Limpia las hojas de tus plantas con un paño húmedo cada semana para mejorar su fotosíntesis."</p>
                     <button onClick={() => setShowTips(false)} className="w-full bg-primary text-white font-bold py-3 rounded-xl">¡Entendido!</button>
                 </div>
             </div>
         )}

         <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
             <div className="flex justify-between items-center relative z-10">
                 <div><p className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">Nivel Actual</p><h2 className="text-2xl font-bold flex items-center gap-2">Semilla de Roble <Crown size={20} className="text-yellow-300" fill="currentColor"/></h2></div>
                 <div className="text-center"><div className="text-3xl font-bold">5</div><div className="text-[10px] opacity-80">Nivel</div></div>
             </div>
             <div className="mt-6">
                 <div className="flex justify-between text-xs mb-2 opacity-90 font-medium"><span>XP: 1250</span><span>Siguiente: 2000</span></div>
                 <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden"><div className="bg-white h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: '65%' }}></div></div>
             </div>
         </div>

         <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
             <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-textPrimary flex items-center gap-2"><Flame className="text-orange-500" fill="currentColor" size={18}/> Racha Diaria</h3><span className="bg-orange-50 text-orange-600 text-xs font-bold px-2 py-1 rounded-lg">3 Días</span></div>
             <div className="flex justify-between">{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, i) => (<div key={i} className="flex flex-col items-center gap-2"><div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? 'bg-orange-500 text-white shadow-md shadow-orange-200' : i === 3 ? 'bg-gray-200 text-gray-400 border-2 border-white ring-2 ring-orange-200' : 'bg-gray-100 text-gray-400'}`}>{i < 3 ? <CheckCircle2 size={14}/> : day}</div></div>))}</div>
         </div>

         {!isPro && (
             <div className="bg-purple-600 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg">
                 <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full"><Zap size={20}/></div><div><p className="font-bold text-sm">¿Perdiste tu racha?</p><p className="text-xs opacity-80">Mira un video para recuperarla</p></div></div>
                 <button className="bg-white text-purple-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Ver Video</button>
             </div>
         )}

         <div>
             <h3 className="font-bold text-textPrimary text-lg mb-3 flex items-center gap-2"><Target className="text-blue-500"/> Misiones de Hoy</h3>
             <div className="space-y-3">
                 {missions.map((mission, i) => (
                     <div key={mission.id} onClick={() => handleMissionClick(mission.id, mission.action)} className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform ${mission.done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-green-200'}`}>
                         <div className="flex items-center gap-3"><div className={`p-2 rounded-full ${mission.done ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-500'}`}><mission.icon size={18} /></div><div><p className={`font-bold text-sm ${mission.done ? 'text-green-800' : 'text-gray-700'}`}>{mission.title}</p><p className="text-xs text-gray-500 font-medium">{mission.xp}</p></div></div>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${mission.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>{mission.done && <CheckCircle2 size={14} className="text-white" />}</div>
                     </div>
                 ))}
             </div>
         </div>

         <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-1 shadow-lg">
             <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex items-center gap-4">
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0 animate-bounce"><Gift size={32} className="text-yellow-300" /></div>
                 <div className="flex-1"><h3 className="text-white font-bold text-sm">Cofre Semanal</h3><p className="text-indigo-100 text-xs mb-2">Completa 15 misiones para abrir</p><div className="w-full bg-black/30 h-2 rounded-full overflow-hidden"><div className="bg-yellow-400 h-full rounded-full" style={{ width: '40%' }}></div></div></div>
             </div>
         </div>
      </div>
    </ScreenContainer>
  );
};

// --- RANKING SCREEN ---
export const Ranking: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [scope, setScope] = useState<'CITY' | 'PROVINCE' | 'COUNTRY' | 'WORLD'>('CITY');
  const data = {
      CITY: [
          { id: 1, name: 'Mateo Benalcázar', score: 1250, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', location: 'La Floresta', trend: 'up' },
          { id: 2, name: 'Sofia Caicedo', score: 1120, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', location: 'Cumbayá', trend: 'same' },
          { id: 3, name: 'Luis Torres', score: 980, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100', location: 'Centro', trend: 'down' },
          { id: 4, name: 'Alex Morgan', score: 847, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', location: 'Tú', isMe: true, trend: 'up' },
          { id: 5, name: 'Ana Pérez', score: 800, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', location: 'Iñaquito', trend: 'up' }
      ],
      PROVINCE: [
          { id: 1, name: 'Carla Vinueza', score: 1500, avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100', location: 'Cayambe', trend: 'up' },
          { id: 2, name: 'Mateo Benalcázar', score: 1250, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', location: 'Quito', trend: 'same' },
          { id: 3, name: 'Roberto M.', score: 1150, avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=100', location: 'Rumiñahui', trend: 'up' },
          { id: 4, name: 'Sofia Caicedo', score: 1120, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100', location: 'Quito', trend: 'down' },
          { id: 5, name: 'Pedro S.', score: 1000, avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100', location: 'Mejía', trend: 'same' },
      ],
      COUNTRY: [
          { id: 1, name: 'Andrés L.', score: 1800, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', location: 'Guayaquil', trend: 'up' },
          { id: 2, name: 'Carla Vinueza', score: 1500, avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100', location: 'Pichincha', trend: 'down' },
          { id: 3, name: 'María J.', score: 1450, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', location: 'Cuenca', trend: 'up' },
          { id: 4, name: 'Juan D.', score: 1300, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', location: 'Ambato', trend: 'same' },
          { id: 5, name: 'Mateo B.', score: 1250, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', location: 'Quito', trend: 'up' },
      ],
      WORLD: [
          { id: 1, name: 'Global Green', score: 5000, avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100', location: 'Norway', trend: 'up' },
          { id: 2, name: 'EcoWarrior', score: 4800, avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100', location: 'Canada', trend: 'same' },
          { id: 3, name: 'ForestKing', score: 4500, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', location: 'Brazil', trend: 'up' },
          { id: 4, name: 'JungleJane', score: 4200, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', location: 'Australia', trend: 'down' },
          { id: 5, name: 'Andrés L.', score: 1800, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100', location: 'Ecuador', trend: 'up' },
      ]
  };
  const currentList = data[scope];
  const myRank = scope === 'CITY' ? 4 : scope === 'PROVINCE' ? 12 : scope === 'COUNTRY' ? 154 : 3402;

  return (
    <ScreenContainer className="bg-gray-50 pb-20">
      <Header title="Ranking Global" onBack={() => onNavigate(ScreenId.HOME)} />
      <div className="bg-[#0b8a4a] text-white p-6 pb-12 -mt-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10"><Medal size={120} /></div>
          <div className="relative z-10 text-center">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-green-200 mb-1">Temporada 4</h4>
              <h2 className="text-3xl font-bold mb-2">Liga Brote</h2>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium"><Calendar size={12} />Termina en 3 días</div>
          </div>
      </div>
      <div className="px-4 -mt-6 relative z-20">
         <div className="flex p-1.5 bg-white rounded-xl shadow-lg border border-gray-100 overflow-x-auto no-scrollbar">
            {[{ id: 'CITY', label: 'Ciudad' }, { id: 'PROVINCE', label: 'Provincia' }, { id: 'COUNTRY', label: 'País' }, { id: 'WORLD', label: 'Mundial' }].map((tab) => (
                <button key={tab.id} onClick={() => setScope(tab.id as any)} className={`flex-1 min-w-[80px] py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${scope === tab.id ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{tab.label}</button>
            ))}
         </div>
      </div>
      <div className="px-4 space-y-3 pb-24 mt-4">
         {currentList.map((user, index) => (
             <div key={user.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${user.isMe ? 'bg-green-50 border-green-200 shadow-md ring-1 ring-green-300' : 'bg-white border-gray-100 shadow-sm'} relative overflow-hidden transition-transform hover:scale-[1.01]`}>
                 <div className="flex flex-col items-center w-8">
                     <div className={`font-bold text-lg ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>{index < 3 ? <Crown size={20} fill="currentColor" /> : index + 1}</div>
                     <div className="mt-1">{user.trend === 'up' && <ArrowUp size={12} className="text-green-500" />}{user.trend === 'down' && <ArrowDown size={12} className="text-red-400" />}{user.trend === 'same' && <div className="w-2 h-0.5 bg-gray-300 my-1"></div>}</div>
                 </div>
                 <div className="w-12 h-12 rounded-full relative shrink-0"><img src={user.avatar} className="w-full h-full object-cover rounded-full border-2 border-white shadow-sm" alt={user.name} />{index < 3 && (<div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}`}>{index + 1}</div>)}</div>
                 <div className="flex-1"><h4 className={`font-bold text-sm ${user.isMe ? 'text-primary' : 'text-textPrimary'}`}>{user.name} {user.isMe && '(Tú)'}</h4><p className="text-xs text-textSecondary flex items-center gap-1"><MapPin size={10} /> {user.location}</p></div>
                 <div className="text-right"><span className="block font-bold text-primary text-base">{user.score}</span><span className="text-[10px] text-textSecondary">pts</span></div>
             </div>
         ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto">
          <div className="flex items-center gap-4"><div className="w-8 text-center font-bold text-gray-500 text-sm">#{myRank}</div><div className="w-10 h-10 rounded-full relative shrink-0"><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="w-full h-full object-cover rounded-full border border-gray-100" alt="Me" /></div><div className="flex-1"><h4 className="font-bold text-sm text-textPrimary">Alex Morgan</h4><p className="text-xs text-textSecondary">Liga Brote <span className="text-green-500 font-bold">• Subiendo</span></p></div><div className="bg-green-100 text-primary px-3 py-1 rounded-lg font-bold text-sm shadow-sm">847 pts</div></div>
      </div>
    </ScreenContainer>
  );
};
