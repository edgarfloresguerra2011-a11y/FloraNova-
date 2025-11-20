
import React, { useState, useEffect, useRef } from 'react';
import { ScreenProps, ScreenId, PlantData } from '../types';
import { ScreenContainer } from '../components/Layout';
import { Image as ImageIcon, ChevronLeft, Loader2, Scan, Bug, Box, Plus, MapPin, RefreshCcw, ArrowUpFromLine, X, Camera as CameraIcon, Crown, Lock, Sun, Home, AlertTriangle, ShieldCheck, Video } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

type ScanMode = 'HEALTH' | 'ROOM' | 'INVENTORY' | 'HOME_SCAN';

// Helper for AR Points
interface ARPoint {
  x: number;
  y: number;
  label: string;
  type: 'PLANT_SPOT' | 'EXISTING_PLANT';
  description?: string;
  recommendedPlant?: string; // New: Specific plant suggestion
}

// --- IDENTIFY SCREEN ---
export const Identify: React.FC<ScreenProps> = ({ onNavigate, onDataChange, userState }) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mode, setMode] = useState<ScanMode>('HEALTH');
  const [streamActive, setStreamActive] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [cameraRequested, setCameraRequested] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setCameraRequested(true);
    setCameraError(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Tu dispositivo no soporta acceso a cámara.");
        return;
    }

    stopStream();
    await new Promise(r => setTimeout(r, 200));

    try {
        let stream: MediaStream | null = null;
        try {
             stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: { ideal: 'environment' } }, 
                audio: false
            });
        } catch (err) {
            console.warn("Rear camera failed, trying fallback...");
        }

        if (!stream) {
             stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        }

        if (stream) {
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                try {
                    await videoRef.current.play();
                    setStreamActive(true);
                    setHasPermission(true);
                } catch (playErr) {
                    console.error("Video play blocked:", playErr);
                    setHasPermission(true); 
                    setStreamActive(true); 
                }
            }
        } else {
            throw new Error("No stream obtained");
        }
    } catch (err: any) {
        console.error("Camera Start Error:", err);
        setHasPermission(false);
        setStreamActive(false);
        if (err.name === 'NotReadableError') {
            setCameraError("Cámara en uso por otra app. Ciérrala y reintenta.");
        } else if (err.name === 'NotAllowedError') {
            setCameraError("Permiso denegado. Actívalo en configuración.");
        } else {
            setCameraError("Error de cámara. Usa 'Subir Foto'.");
        }
    }
  };

  useEffect(() => {
    return () => { stopStream(); };
  }, []);

  const analyzeImage = async (base64Image: string) => {
    if (userState && !userState.isPro && userState.scansUsed >= 3) {
        setShowLimitModal(true);
        return;
    }

    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = base64Image.split(',')[1];
      
      let prompt = "";
      let schema = null;

      if (mode === 'HEALTH') {
          prompt = `Analyze plant image. 1. Identify. 2. DIAGNOSE HEALTH. 3. REMEDIES. 4. SOIL. 5. GROWTH. 6. LIGHT. Response Spanish JSON.`;
          schema = {
            type: Type.OBJECT,
            properties: {
                commonName: { type: Type.STRING },
                scientificName: { type: Type.STRING },
                description: { type: Type.STRING },
                healthStatus: { type: Type.STRING, enum: ["Sana", "Enferma", "Requiere Atención"] },
                pests: {
                    type: Type.OBJECT,
                    properties: {
                        detected: { type: Type.BOOLEAN },
                        name: { type: Type.STRING },
                        remedies: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                },
                soilAnalysis: { type: Type.STRING },
                soilRecommendations: { type: Type.STRING },
                growthProjection: { type: Type.STRING },
                lightNeeds: { type: Type.STRING }
            },
            required: ["commonName", "healthStatus"]
          };
      } else if (mode === 'ROOM') {
          prompt = `Interior Design Botanist. Analyze room. Best spots for plants. Recommend species. X/Y coords. Response Spanish JSON.`;
          schema = {
             type: Type.OBJECT,
             properties: {
                commonName: { type: Type.STRING },
                description: { type: Type.STRING },
                placements: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER },
                            recommendedPlant: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        }
                    }
                }
             }
          };
      } else if (mode === 'HOME_SCAN') {
          prompt = `Computer Vision AI Home Analysis. 1. Detect Rooms. 2. Identify Plants. 3. Locate. 4. SAFETY CHECK (Toxic/Danger). 5. Advice. Response Spanish JSON.`;
          schema = {
              type: Type.OBJECT,
              properties: {
                  commonName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  rooms: {
                      type: Type.ARRAY,
                      items: {
                          type: Type.OBJECT,
                          properties: {
                              name: { type: Type.STRING },
                              plants: {
                                  type: Type.ARRAY,
                                  items: {
                                      type: Type.OBJECT,
                                      properties: {
                                          name: { type: Type.STRING },
                                          location: { type: Type.STRING },
                                          isSafe: { type: Type.BOOLEAN },
                                          advice: { type: Type.STRING }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          };
      } else {
          prompt = `Catalog plants. Health status. X/Y coords. Response Spanish JSON.`;
          schema = {
             type: Type.OBJECT,
             properties: {
                commonName: { type: Type.STRING },
                description: { type: Type.STRING },
                detectedPlants: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            health: { type: Type.STRING },
                            x: { type: Type.NUMBER },
                            y: { type: Type.NUMBER }
                        }
                    }
                }
             }
          };
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType: "image/jpeg", data: base64Data } }, { text: prompt }] }],
        config: { responseMimeType: "application/json", responseSchema: schema }
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        if (onDataChange) {
          let finalData: PlantData = { ...result, image: base64Image, mode: mode };
          if (mode === 'ROOM' && result.placements) {
             finalData.arPoints = result.placements.map((p: any) => ({
                 x: p.x, y: p.y, label: "Sitio Ideal", description: p.reason, recommendedPlant: p.recommendedPlant, type: 'PLANT_SPOT'
             }));
          } else if (mode === 'INVENTORY' && result.detectedPlants) {
              finalData.arPoints = result.detectedPlants.map((p: any) => ({
                  x: p.x || 50, y: p.y || 50, label: p.name, description: p.health, type: 'EXISTING_PLANT'
              }));
          }
          onDataChange(finalData);
        }
        onNavigate(ScreenId.IDENTIFY_RESULT);
      }
    } catch (error) {
      console.error("AI Error", error);
      alert("Error en análisis. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        analyzeImage(dataUrl);
      }
    }
  };

  return (
    <ScreenContainer className="bg-black h-screen relative overflow-hidden flex flex-col">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
           if(e.target.files?.[0]) {
             const reader = new FileReader();
             reader.onloadend = () => analyzeImage(reader.result as string);
             reader.readAsDataURL(e.target.files[0]);
           }
      }} />

      <div className="flex-1 relative bg-gray-900 rounded-b-[2rem] overflow-hidden">
        <video ref={videoRef} muted playsInline className={`w-full h-full object-cover ${streamActive ? 'opacity-100' : 'opacity-0'}`} />

        {!cameraRequested && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30 p-8 text-center">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <CameraIcon size={40} className="text-gray-400"/>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">Activar Cámara</h2>
                <p className="text-gray-400 text-sm mb-8 max-w-xs">Para identificar plantas y escanear tu entorno.</p>
                <button onClick={startCamera} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform text-lg">Permitir Acceso</button>
                <button onClick={() => fileInputRef.current?.click()} className="mt-4 text-white/60 text-sm font-medium underline">O subir una foto</button>
            </div>
        )}

        {cameraError && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-30 p-6 text-center">
               <div className="bg-red-500/20 p-4 rounded-full mb-4"><Bug className="text-red-400" size={40}/></div>
               <p className="text-white font-bold mb-2 text-lg">Error de Cámara</p>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">{cameraError}</p>
               <button onClick={() => fileInputRef.current?.click()} className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full max-w-xs mb-3 flex items-center justify-center gap-2"><ImageIcon size={18}/> Subir Foto</button>
               <button onClick={startCamera} className="text-white/50 text-sm underline">Reintentar</button>
           </div>
        )}

        {streamActive && (
            <>
                <div className="absolute top-0 left-0 right-0 p-6 pt-12 flex justify-between z-10">
                    <button onClick={() => onNavigate(ScreenId.HOME)} className="p-3 bg-black/30 backdrop-blur rounded-full text-white"><ChevronLeft/></button>
                    <span className="text-white font-bold bg-black/30 px-4 py-1 rounded-full backdrop-blur text-sm uppercase">
                        {mode === 'HEALTH' ? 'Diagnóstico' : mode === 'ROOM' ? 'AR Room' : mode === 'HOME_SCAN' ? 'Escáner Hogar' : 'Inventario'}
                    </span>
                    <div className="w-10"></div>
                </div>

                {mode === 'HEALTH' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-80 border border-white/30 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                        </div>
                    </div>
                )}
                {mode === 'HOME_SCAN' && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="absolute top-1/4 bg-red-500/80 backdrop-blur-sm px-4 py-1 rounded-full flex items-center gap-2 text-white text-xs font-bold animate-pulse">
                             <div className="w-2 h-2 bg-white rounded-full"></div> GRABANDO
                         </div>
                         <div className="w-full h-full border-4 border-white/10 relative">
                             <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white"></div>
                             <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white"></div>
                             <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white"></div>
                             <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white"></div>
                         </div>
                    </div>
                )}

                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 overflow-x-auto px-4 pb-2 no-scrollbar">
                     {[
                        { id: 'HEALTH', label: 'Salud', icon: Bug },
                        { id: 'ROOM', label: 'AR Room', icon: Box, locked: !userState?.isPro },
                        { id: 'HOME_SCAN', label: 'Video', icon: Video, locked: !userState?.isPro },
                        { id: 'INVENTORY', label: 'Inventario', icon: Scan }
                    ].map(m => (
                        <button
                            key={m.id}
                            onClick={() => m.locked ? setShowLimitModal(true) : setMode(m.id as ScanMode)}
                            className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-bold backdrop-blur transition-all border whitespace-nowrap ${mode === m.id ? 'bg-primary border-primary text-white' : 'bg-black/40 border-white/10 text-white/70'}`}
                        >
                            {m.label} {m.locked && <Lock size={10} className="ml-1 text-yellow-400"/>}
                        </button>
                    ))}
                </div>

                {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col items-center justify-center text-white">
                        <Loader2 size={40} className="animate-spin text-primary mb-3"/>
                        <span className="font-bold tracking-widest text-sm">ANALIZANDO...</span>
                    </div>
                )}
            </>
        )}
      </div>

      <div className="h-32 bg-black -mt-6 pt-6 relative z-20 flex items-center justify-around px-8">
           <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-white/10 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"><ImageIcon size={24}/></button>
           <button 
              onClick={handleCapture} 
              disabled={!streamActive || isAnalyzing}
              className="w-20 h-20 -mt-12 bg-white rounded-full border-[6px] border-black flex items-center justify-center shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
           >
              <div className={`w-16 h-16 rounded-full border-2 border-gray-200 transition-colors ${mode === 'ROOM' ? 'bg-blue-500' : mode === 'HOME_SCAN' ? 'bg-red-500' : mode === 'INVENTORY' ? 'bg-purple-500' : 'bg-primary group-hover:scale-90'}`}></div>
           </button>
           <div className="w-14"></div> 
      </div>

      {showLimitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur">
             <div className="bg-gray-900 border border-white/10 w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
                 <Crown size={48} className="text-yellow-400 mx-auto mb-4"/>
                 <h2 className="text-2xl font-bold text-white mb-2">Función PRO</h2>
                 <p className="text-gray-400 text-sm mb-6">Desbloquea el Escáner de Video y AR Room con FloraNova Premium.</p>
                 <button onClick={() => onNavigate(ScreenId.UPGRADE_PRO)} className="w-full bg-yellow-500 text-black font-bold py-3 rounded-xl mb-3 hover:bg-yellow-400 transition-colors">Ver Planes</button>
                 <button onClick={() => setShowLimitModal(false)} className="text-white/50 text-xs hover:text-white transition-colors">Cancelar</button>
             </div>
          </div>
      )}
    </ScreenContainer>
  );
};

// --- IDENTIFY RESULT SCREEN ---
export const IdentifyResult: React.FC<ScreenProps> = ({ onNavigate, data, userState }) => {
  const plantData = data as PlantData;
  const [selectedARPoint, setSelectedARPoint] = useState<ARPoint | null>(null);
  const [showARStudio, setShowARStudio] = useState(false);
  const [scale, setScale] = useState(1);
  const [growthYears, setGrowthYears] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [tilt, setTilt] = useState(0);
  const isPro = userState?.isPro;

  if (!plantData) return null;
  const isARMode = plantData.mode === 'ROOM' || plantData.mode === 'INVENTORY';
  const isHomeScan = plantData.mode === 'HOME_SCAN';

  if (showARStudio) {
      return (
          <ScreenContainer className="bg-black h-screen flex flex-col relative overflow-hidden">
             <img src={plantData.image} className="absolute inset-0 w-full h-full object-cover opacity-90" />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
                 <div style={{ transformOrigin: 'bottom center', transform: `translateY(150px) scale(${scale * (1 + growthYears * 0.15)}) rotateY(${rotation}deg) rotateX(${tilt}deg)`, transformStyle: 'preserve-3d', transition: 'all 0.5s ease-out' }}>
                    <img 
                        src={selectedARPoint?.recommendedPlant?.toLowerCase().includes("monstera") ? "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500" : "https://images.unsplash.com/photo-1509223197845-458d87318791?w=500"} 
                        className="h-64 w-auto object-contain drop-shadow-2xl relative z-20"
                        style={{ filter: `brightness(1.1) saturate(${1 + growthYears * 0.1})` }}
                    />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-10 bg-black/40 blur-xl rounded-[100%] transform rotateX(60deg) z-10"></div>
                 </div>
             </div>
             <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl p-6 rounded-t-3xl border-t border-white/10 z-50 pb-10">
                 <div className="flex justify-between items-center text-white mb-6">
                     <h3 className="font-bold">Estudio AR</h3>
                     <button onClick={() => setShowARStudio(false)} className="text-xs bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30 transition-colors">Cerrar</button>
                 </div>
                 <div className="space-y-4">
                     <div className="bg-black/30 p-3 rounded-xl border border-white/10">
                         <div className="flex justify-between text-xs text-white font-bold mb-1"><span>Hoy</span><span className="text-green-400">+{growthYears} Años</span></div>
                         <input type="range" min="0" max="5" value={growthYears} onChange={(e) => setGrowthYears(parseInt(e.target.value))} className="w-full h-2 bg-white/30 rounded-lg appearance-none accent-green-500 cursor-pointer"/>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                         <div><span className="text-[10px] text-white/60 font-bold">Tamaño</span><input type="range" min="0.5" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/30 rounded-lg accent-blue-500 cursor-pointer"/></div>
                         <div><span className="text-[10px] text-white/60 font-bold">Rotación</span><input type="range" min="0" max="360" step="10" value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))} className="w-full h-1.5 bg-white/30 rounded-lg accent-blue-500 cursor-pointer"/></div>
                     </div>
                 </div>
             </div>
          </ScreenContainer>
      )
  }

  if (isHomeScan) {
      return (
        <ScreenContainer className="bg-gray-50 flex flex-col h-screen">
            <div className="h-48 relative shrink-0">
                 <img src={plantData.image} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40"></div>
                 <button onClick={() => onNavigate(ScreenId.HOME)} className="absolute top-6 left-6 p-3 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30 transition-colors"><ChevronLeft size={24} /></button>
                 <div className="absolute bottom-6 left-6 text-white">
                     <h1 className="text-2xl font-bold flex items-center gap-2"><Home/> Análisis del Hogar</h1>
                     <p className="text-sm opacity-80">{plantData.commonName || "Video Scan Completo"}</p>
                 </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pb-24">
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">{plantData.description}</p>

                {plantData.rooms?.map((room, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-3 border-b border-gray-50 pb-2">{room.name}</h3>
                        <div className="space-y-3">
                            {room.plants.map((plant, pIdx) => (
                                <div key={pIdx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                    <div className={`p-2 rounded-full ${plant.isSafe ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {plant.isSafe ? <ShieldCheck size={16}/> : <AlertTriangle size={16}/>}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-gray-800">{plant.name}</h4>
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={10}/> {plant.location}</p>
                                        <p className={`text-xs font-medium ${plant.isSafe ? 'text-green-600' : 'text-red-500'}`}>{plant.advice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button onClick={() => onNavigate(ScreenId.HOME)} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2">
                    <RefreshCcw size={18}/> Sincronizar con Mi Colección
                </button>
            </div>
        </ScreenContainer>
      );
  }

  return (
    <ScreenContainer className="bg-gray-900 flex flex-col h-screen">
      <div className={`relative w-full shrink-0 transition-all duration-500 ${isARMode ? 'h-[60vh]' : 'h-[35vh]'}`}>
         <img src={plantData.image} className="absolute inset-0 w-full h-full object-cover" />
         {plantData.arPoints && plantData.arPoints.map((point, i) => (
             <div key={i} onClick={() => setSelectedARPoint(point)} className={`absolute w-10 h-10 -ml-5 -mt-5 rounded-full border-[3px] flex items-center justify-center cursor-pointer shadow-xl z-20 ${point.type === 'PLANT_SPOT' ? 'bg-white/90 border-blue-500 text-blue-600' : 'bg-white/90 border-green-500 text-green-600'}`} style={{ top: `${point.y}%`, left: `${point.x}%` }}>
                <Plus size={20} strokeWidth={3} />
             </div>
         ))}
         <button onClick={() => onNavigate(ScreenId.IDENTIFY)} className="absolute top-6 left-6 p-3 bg-white/20 text-white rounded-full backdrop-blur-md"><ChevronLeft size={24} /></button>
         {selectedARPoint && (
             <div className="absolute bottom-12 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-2xl animate-in slide-in-from-bottom-4 z-30 border border-white/50">
                 <div className="flex justify-between mb-2">
                     <h3 className="font-bold text-lg text-black">{selectedARPoint.recommendedPlant || selectedARPoint.label}</h3>
                     <button onClick={() => setSelectedARPoint(null)}><X size={20} className="text-gray-500"/></button>
                 </div>
                 <p className="text-sm text-gray-600 mb-4">{selectedARPoint.description}</p>
                 {selectedARPoint.type === 'PLANT_SPOT' && <button onClick={() => setShowARStudio(true)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Box size={18}/> Ver en AR</button>}
             </div>
         )}
      </div>
      <div className="flex-1 bg-white rounded-t-[2rem] -mt-6 relative z-10 flex flex-col overflow-hidden p-8 shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
         <h1 className="text-2xl font-bold text-black mb-1">{plantData.commonName}</h1>
         <p className="text-gray-500 text-sm mb-6 leading-relaxed">{plantData.description?.substring(0, 100)}...</p>
         {!isARMode && (
            <div className="space-y-4 overflow-y-auto pb-20 no-scrollbar">
                <div className={`p-5 rounded-xl border ${isPro ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase">
                        <Sun size={14} className={isPro ? 'text-yellow-600' : 'text-gray-400'}/> 
                        <span className={isPro ? 'text-yellow-800' : 'text-gray-500'}>Luz Ideal</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 text-justify leading-relaxed">{plantData.lightNeeds || "Luz indirecta brillante."}</p>
                </div>
                <div className={`p-5 rounded-xl border ${isPro ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex items-center gap-2 mb-2 font-bold text-xs uppercase">
                        <ArrowUpFromLine size={14} className={isPro ? 'text-green-600' : 'text-gray-400'}/> 
                        <span className={isPro ? 'text-green-800' : 'text-gray-500'}>Crecimiento</span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 text-justify leading-relaxed">{plantData.growthProjection || "Moderado."}</p>
                </div>
            </div>
         )}
         <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
            <button onClick={() => onNavigate(ScreenId.HOME)} className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">Guardar en Mi Jardín</button>
         </div>
      </div>
    </ScreenContainer>
  );
};
