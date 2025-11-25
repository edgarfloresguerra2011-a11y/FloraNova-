
import React, { useState, useRef } from 'react';
import { ScreenProps, ScreenId, UserPlant, AppNotification } from '../types';
import { ScreenContainer, Header } from '../components/Layout';
import { Map, Info, Download, CheckCircle, TreeDeciduous, Globe, MapPin, ExternalLink, X, Droplets, Sun, Bug, Scissors, ChevronDown, ChevronUp, AlertCircle, Heart, Smile, Frown, Camera, Stethoscope, Loader2, CreditCard, ShieldCheck, Lock } from 'lucide-react';

// Define Props Interface locally if not in types
interface PlantCardProps {
  plant: UserPlant;
  onClick?: () => void;
}

const LeafIcon = ({size, className}: {size: number, className?: string}) => (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
);

// Plant Card Component definition moved to top level to avoid scope issues
const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => (
    <div className={`relative bg-white rounded-3xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${plant.health.status === 'sick' ? 'border-red-400 shadow-red-100 scale-[1.02]' : 'border-gray-100'}`}>
        {plant.health.status === 'sick' && <div className="absolute inset-0 border-4 border-red-400 rounded-3xl animate-pulse z-0 pointer-events-none"></div>}
        <div className="absolute top-4 right-4 z-20 max-w-[60%]"><div className={`relative bg-white p-3 rounded-2xl rounded-tr-none shadow-sm text-xs font-bold border ${plant.health.status === 'sick' ? 'text-red-600 border-red-100' : 'text-primary border-green-100'}`}>{plant.dialogue}<div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-b border-r transform rotate-45 translate-x-[-10px] translate-y-[-10px] z-0 border-inherit"></div></div></div>
        <div className="flex p-4 relative z-10"><div className="w-24 h-32 bg-gray-100 rounded-2xl overflow-hidden shrink-0 relative shadow-sm"><img src={plant.img} className="w-full h-full object-cover" /><div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md">{plant.emotion === 'happy' && <Smile className="text-green-500" size={20}/>}{plant.emotion === 'sad' && <Frown className="text-blue-500" size={20}/>}{plant.emotion === 'sick' && <AlertCircle className="text-red-500" size={20}/>}</div></div><div className="flex-1 pl-4 pt-2"><h3 className="font-bold text-lg text-textPrimary">{plant.name}</h3><p className="text-xs text-textSecondary italic mb-3">{plant.species}</p><div className="flex gap-2 mb-3 flex-wrap">{plant.health.water === 'needs_water' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"><Droplets size={12}/> Sed</span>}{plant.health.status === 'ok' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1"><CheckCircle size={12}/> Sana</span>}</div><div className="flex gap-2">{plant.health.status === 'sick' || plant.isQuarantined ? (<button onClick={onClick} className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-200 flex items-center gap-2 hover:bg-red-600 transition-colors"><Stethoscope size={14}/> Tratar</button>) : (<button className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200">Detalles</button>)}</div></div></div>
    </div>
);

// --- ADOPT TREE SCREEN ---
export const AdoptTree: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [showMap, setShowMap] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'payoneer'>('stripe');
  
  const handleAdoptClick = (pkg: any) => {
      setSelectedPkg(pkg);
      setShowCheckout(true);
  };

  const handlePayment = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setIsProcessing(false);
          setShowCheckout(false);
          alert("¡Adopción exitosa! Recibirás tu certificado digital en breve.");
          onNavigate(ScreenId.MY_TREES);
      }, 2500);
  };
  
  return (
    <ScreenContainer>
      <Header title="Adoptar en Quito" rightAction={<button onClick={() => onNavigate(ScreenId.MY_TREES)} className="text-primary text-sm font-bold">Mis Árboles</button>} />
      
      {showMap && (
         <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in fade-in duration-200">
            <div className="bg-white p-4 pt-12 flex justify-between items-center shadow-md z-10">
               <div><h3 className="font-bold text-lg text-textPrimary">Ubicación del Proyecto</h3><p className="text-xs text-textSecondary">Mirador del Volcán Casitagua</p></div>
               <button onClick={() => setShowMap(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} className="text-gray-600"/></button>
            </div>
            <div className="flex-1 bg-gray-100 relative">
                <iframe width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight={0} marginWidth={0} src="https://maps.google.com/maps?q=Mirador+Volcan+Casitagua&t=k&z=15&ie=UTF8&iwloc=&output=embed" title="Reforestation Map" className="w-full h-full"></iframe>
            </div>
         </div>
      )}

      {showCheckout && selectedPkg && (
          <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in slide-in-from-bottom-10">
              <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Lock size={18} className="text-green-600"/> Checkout Seguro</h3>
                      <button onClick={() => setShowCheckout(false)} className="p-1 bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0"><img src={selectedPkg.img} className="w-full h-full object-cover"/></div>
                      <div><h4 className="font-bold text-sm">{selectedPkg.label}</h4><p className="text-xs text-gray-500">{selectedPkg.count} Árboles + Certificado + Mantenimiento</p><p className="text-lg font-bold text-primary mt-1">${selectedPkg.price}.00</p></div>
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 ml-1">Selecciona Pasarela de Pago</p>
                  <div className="space-y-3 mb-8">
                      <button onClick={() => setPaymentMethod('stripe')} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'stripe' ? 'border-primary bg-primary/5 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}><div className="flex items-center gap-3"><div className="bg-indigo-600 text-white p-1.5 rounded-lg"><CreditCard size={20}/></div><div className="text-left"><span className="font-bold text-sm block text-gray-800">Tarjeta de Crédito (Stripe)</span><span className="text-[10px] text-gray-400">Visa, Mastercard, Amex</span></div></div>{paymentMethod === 'stripe' && <CheckCircle size={20} className="text-primary" fill="currentColor" color="white"/>}</button>
                      <button onClick={() => setPaymentMethod('payoneer')} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'payoneer' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}><div className="flex items-center gap-3"><div className="bg-blue-600 text-white p-1.5 rounded-lg font-bold text-[10px] w-8 h-8 flex items-center justify-center">P</div><div className="text-left"><span className="font-bold text-sm block text-gray-800">Payoneer / PayPal</span><span className="text-[10px] text-gray-400">Pago internacional seguro</span></div></div>{paymentMethod === 'payoneer' && <CheckCircle size={20} className="text-blue-500" fill="currentColor" color="white"/>}</button>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 mb-4 bg-gray-50 py-2 rounded-lg"><ShieldCheck size={12} className="text-green-600"/> <span className="font-medium">Transacción protegida con SSL de 256-bits</span></div>
                      <button onClick={handlePayment} disabled={isProcessing} className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 transition-all active:scale-[0.98] ${paymentMethod === 'stripe' ? 'bg-primary shadow-green-200' : 'bg-blue-600 shadow-blue-200'}`}>{isProcessing ? <Loader2 className="animate-spin" size={20}/> : <Lock size={18}/>}{isProcessing ? 'Procesando Pago...' : `Pagar $${selectedPkg.price}.00`}</button>
                  </div>
              </div>
          </div>
      )}

      <div className="p-6">
         <div className="bg-green-900 text-white p-6 rounded-2xl text-center mb-8 shadow-lg relative overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60"></div>
            <div className="relative z-10 pt-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white mx-auto mb-3 border border-white/30 shadow-lg"><TreeDeciduous size={28} /></div>
                <h2 className="text-2xl font-bold mb-2 text-shadow-sm">Reforesta la Mitad del Mundo</h2>
                <p className="text-green-50 text-sm mb-6 leading-relaxed opacity-90 font-medium">Únete al proyecto de reforestación en las laderas del Pichincha y recupera el bosque andino.</p>
                <div className="flex justify-center gap-3 text-xs font-bold">
                    <button onClick={() => setShowMap(true)} className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 cursor-pointer hover:bg-white/30 transition-colors shadow-sm"><Globe size={14}/> Quito, EC</button>
                    <button onClick={() => onNavigate(ScreenId.CERTIFICATE)} className="bg-white/20 backdrop-blur px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2 cursor-pointer hover:bg-white/30 transition-colors shadow-sm"><CheckCircle size={14}/> Ver Certificado</button>
                </div>
            </div>
         </div>
         
         <h3 className="font-bold text-lg mb-4 text-textPrimary flex items-center gap-2"><LeafIcon size={18} className="text-primary"/> Especies Nativas Andinas</h3>
         <div className="space-y-4 mb-8">
            {[{ count: 1, price: '5', label: 'Polylepis (Yagual)', desc: 'Corteza de papel, nativo de páramo.', color: 'bg-white border-gray-100', img: 'https://images.unsplash.com/photo-1445964047600-cdbdb873673d?auto=format&fit=crop&w=400&q=80' }, { count: 10, price: '45', label: 'Arrayán', desc: 'Bosque denso y aromático.', color: 'bg-green-600 text-white border-green-600', img: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&q=80', popular: true }, { count: 50, price: '200', label: 'Pumamaqui', desc: 'Hojas en forma de mano de puma.', color: 'bg-white border-gray-100', img: 'https://images.unsplash.com/photo-1596237572322-785d19146217?auto=format&fit=crop&w=400&q=80' }].map((pkg, idx) => (
               <div key={idx} onClick={() => handleAdoptClick(pkg)} className={`${pkg.color} border p-1 rounded-2xl flex items-center relative shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer`}>
                   {pkg.popular && <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl z-10 shadow-sm">MÁS POPULAR</div>}
                   <div className="w-24 h-24 rounded-xl overflow-hidden m-2 shrink-0 relative"><img src={pkg.img} className="w-full h-full object-cover" alt={pkg.label} /></div>
                   <div className="flex-1 px-3 py-2"><span className={`text-[10px] uppercase tracking-wider font-bold ${pkg.popular ? 'text-green-100' : 'text-textSecondary'}`}>{pkg.desc}</span><h4 className={`font-bold text-xl mt-0.5 ${pkg.popular ? 'text-white' : 'text-textPrimary'}`}>{pkg.label}</h4><p className={`text-xs mt-1 ${pkg.popular ? 'text-green-50' : 'text-gray-500'}`}>{pkg.count} Árbol{pkg.count > 1 ? 'es' : ''} + Mantenimiento</p></div>
                   <div className="pr-6 text-right"><span className={`text-xl font-bold block ${pkg.popular ? 'text-white' : 'text-primary'}`}>${pkg.price}</span></div>
               </div>
            ))}
         </div>
      </div>
    </ScreenContainer>
  );
};

export const MyTrees: React.FC<ScreenProps> = ({ onNavigate, userPlants, onUpdatePlants, notifications, onUpdateNotifications }) => {
   const [showTreatmentModal, setShowTreatmentModal] = useState<UserPlant | null>(null);
   const [photoUploaded, setPhotoUploaded] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   const healthyPlants = userPlants?.filter(p => !p.isQuarantined) || [];
   const quarantinePlants = userPlants?.filter(p => p.isQuarantined) || [];

   const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       if(e.target.files?.[0]) {
           setPhotoUploaded(true);
           setTimeout(() => {
               if(showTreatmentModal && onUpdatePlants && userPlants) {
                   const updatedPlants = userPlants.map(p => { 
                        if(p.id === showTreatmentModal.id) { 
                            const updatedPlant: UserPlant = { 
                                ...p, 
                                health: { status: 'ok', water: 'ok', pests: 'ok' }, 
                                emotion: 'happy', 
                                dialogue: "¡Gracias! Me siento mucho mejor. 😊", 
                                isQuarantined: false 
                            };
                            return updatedPlant;
                        } 
                        return p; 
                   });
                   onUpdatePlants(updatedPlants);
                   alert("¡Excelente! Tu planta se ve mejor. Sigue así.");
                   setShowTreatmentModal(null); setPhotoUploaded(false);
               }
           }, 1500);
       }
   };

   return (
      <ScreenContainer>
         <Header title="Mi Jardín y Adopciones" onBack={() => onNavigate(ScreenId.ADOPT)} />
         <div className="bg-white min-h-screen p-6 space-y-8">
             <div><h2 className="text-2xl font-bold text-textPrimary">Hola, Jardinero</h2><p className="text-textSecondary">Tus plantas te necesitan hoy.</p></div>
             {quarantinePlants.length > 0 && (<div className="bg-red-50 rounded-[2rem] p-6 border-2 border-red-200 border-dashed relative overflow-hidden"><div className="absolute -right-4 -top-4 bg-red-200 rounded-full p-4 opacity-50"><AlertCircle size={64} className="text-red-500"/></div><h3 className="font-bold text-red-700 flex items-center gap-2 mb-4 relative z-10"><AlertCircle/> ZONA DE CUARENTENA</h3><p className="text-xs text-red-600 mb-4 relative z-10">Estas plantas están aisladas para evitar contagios. Trátalas con prioridad.</p><div className="space-y-4 relative z-10">{quarantinePlants.map(plant => <PlantCard key={plant.id} plant={plant} onClick={() => setShowTreatmentModal(plant)}/>)}</div></div>)}
             <div><h3 className="font-bold text-lg text-textPrimary mb-4 flex items-center gap-2"><Smile className="text-green-500"/> Mi Jardín</h3>{healthyPlants.length === 0 ? (<p className="text-gray-400 text-sm italic">No tienes plantas sanas por ahora.</p>) : (<div className="space-y-6">{healthyPlants.map(plant => <PlantCard key={plant.id} plant={plant} onClick={() => setShowTreatmentModal(plant)}/>)}</div>)}</div>
         </div>
         {showTreatmentModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in zoom-in duration-200"><div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-xl text-red-600 flex items-center gap-2"><Stethoscope/> Tratamiento</h3><button onClick={() => setShowTreatmentModal(null)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button></div><div className="space-y-4 mb-6"><div className="bg-red-50 p-4 rounded-xl border border-red-100"><h4 className="font-bold text-sm text-red-800 mb-2">Problemas Detectados:</h4><ul className="list-disc list-inside text-xs text-red-700 space-y-1">{showTreatmentModal.tips.map((t, i) => <li key={i}>{t.text}</li>)}</ul></div><input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} accept="image/*"/><button onClick={() => fileInputRef.current?.click()} className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">{photoUploaded ? <Loader2 className="animate-spin"/> : <Camera size={20} />}{photoUploaded ? 'Verificando...' : 'Subir Foto de Progreso'}</button></div></div></div>)}
      </ScreenContainer>
   );
};

export const Certificate: React.FC<ScreenProps> = ({ onNavigate }) => {
   return (
      <ScreenContainer className="bg-gray-100 flex flex-col items-center justify-center p-6 h-screen">
         <div className="bg-[#fdfbf7] w-full max-w-sm p-8 rounded-none shadow-2xl border-[12px] border-double border-[#0b8a4a]/20 relative text-center aspect-[3/4] flex flex-col justify-center">
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6 mx-auto"><Globe size={40} strokeWidth={1.5} /></div>
            <h1 className="text-2xl font-serif font-bold text-primary mb-1 tracking-wide">CERTIFICADO</h1>
            <p className="text-textSecondary text-xs uppercase tracking-[0.3em] mb-8">Mitad del Mundo, EC</p>
            <p className="text-sm text-textSecondary mb-4 font-serif italic">Otorgado a</p>
            <h2 className="text-2xl font-serif font-bold border-b-2 border-primary/10 pb-4 mb-6 inline-block w-3/4 mx-auto text-textPrimary">Alex Morgan</h2>
            <p className="text-sm text-textSecondary leading-relaxed px-4">Por su compromiso con el planeta al adoptar un <strong>Polylepis</strong> nativo y contribuir a la reforestación de Quito.</p>
            <div className="mt-auto pt-8 flex justify-between items-end border-t border-gray-100"><div className="text-left"><p className="font-bold text-xs text-primary">#UIO-2025-8832</p><p className="text-xs text-textSecondary uppercase mt-1">ID Quito</p></div><div className="text-right"><div className="w-16 h-16 bg-white p-1 border border-gray-200"><img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FloraNovaQuitoCert" className="w-full h-full opacity-80" alt="QR Code" /></div></div></div>
         </div>
         <div className="flex gap-4 mt-8 w-full max-w-sm"><button onClick={() => onNavigate(ScreenId.MY_TREES)} className="flex-1 bg-white text-textPrimary font-bold py-3.5 rounded-xl border border-gray-200 shadow-sm">Cerrar</button><button className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25"><Download size={18} /> Descargar</button></div>
      </ScreenContainer>
   );
};
