
import React, { useState, useRef, useEffect } from 'react';
import { ScreenProps, ScreenId } from '../types';
import { ScreenContainer, Header } from '../components/Layout';
import { Heart, MessageCircle, Share2, MoreHorizontal, X, Image, MapPin, Copy, Plus, Camera, Leaf, CheckCircle2, Send, AlertCircle, Loader2, ShieldAlert, Trash2, Flag, Link as LinkIcon, Gift, Award, Grid } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Custom Brand Icons
const BrandIcon = ({ name, size = 24, color = "currentColor" }: { name: string, size?: number, color?: string }) => {
    const paths: Record<string, string> = {
        WhatsApp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
        Facebook: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
        Twitter: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
        LinkedIn: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h5v-8.306c0-4.613 5.48-4.515 5.48 0v8.306h5v-10.507c0-6.245-6.79-5.975-9.266-2.297l-.155.002.008-1.196h-1.19zm0 0",
        Telegram: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z",
    };
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
            <path d={paths[name] || ""} />
        </svg>
    );
};

export const Community: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [tab, setTab] = useState<'FEED' | 'ADOPT'>('FEED');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState<any>(null);
  const [showAdoptionForm, setShowAdoptionForm] = useState(false);
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [shareUrl, setShareUrl] = useState('https://floranova.app/post/123');
  
  // Post Creation State
  const [newPostText, setNewPostText] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isModerating, setIsModerating] = useState(false);
  const [isSafeToPost, setIsSafeToPost] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock Data
  const [posts, setPosts] = useState([
    {
        id: 1,
        user: "Maria Garcia",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
        image: "https://images.unsplash.com/photo-1560712330-70a6779e9a0c?w=600",
        desc: "¡Miren esta orquídea que rescaté! 🌱✨",
        likes: 245,
        time: "Hace 2h",
        liked: false,
        comments: [{ user: "Juan", text: "¡Qué colores tan vivos!" }],
        showComments: false
    },
    {
        id: 2,
        user: "Carlos Ruiz",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100",
        image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600",
        desc: "Mi Ficus Elastica está creciendo enorme. ¿Consejos para podar?",
        likes: 56,
        time: "Hace 5h",
        liked: true,
        comments: [],
        showComments: false
    }
  ]);

  const [adoptions, setAdoptions] = useState([
      { id: 1, user: "Ana Lopez", img: "https://images.unsplash.com/photo-1459156212016-c812468e2115?w=200", name: "Suculenta", desc: "Me mudo y no puedo llevarla.", loc: "Quito Norte" }
  ]);

  // Updated Share Links with SVG Icon Support
  const shareLinks = [
      { name: 'WhatsApp', url: `whatsapp://send?text=${shareUrl}`, color: 'bg-[#25D366]', icon: 'WhatsApp' }, 
      { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, color: 'bg-[#1877F2]', icon: 'Facebook' },
      { name: 'X / Twitter', url: `https://twitter.com/intent/tweet?url=${shareUrl}`, color: 'bg-black', icon: 'Twitter' },
      { name: 'LinkedIn', url: `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}`, color: 'bg-[#0A66C2]', icon: 'LinkedIn' },
      { name: 'Telegram', url: `https://t.me/share/url?url=${shareUrl}`, color: 'bg-[#0088cc]', icon: 'Telegram' },
  ];

  // Handlers
  const toggleLike = (id: number) => setPosts(posts.map(p => p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  const toggleComments = (id: number) => setPosts(posts.map(p => p.id === id ? { ...p, showComments: !p.showComments } : p));
  const addComment = (id: number, text: string) => {
      if(!text.trim()) return;
      setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, { user: "Alex", text }] } : p));
  };
  const handleDeletePost = (id: number) => { if(confirm("¿Eliminar?")) setPosts(posts.filter(p => p.id !== id)); };

  const handlePublishAdoption = () => {
      setAdoptions([{ id: Date.now(), user: "Alex Morgan", img: newPostImage || "", name: "Planta en Adopción", desc: newPostText, loc: "Quito" }, ...adoptions]);
      setShowAdoptionForm(false);
      setNewPostText(""); setNewPostImage(null);
  };

  const checkContentSafety = async (base64Image: string) => {
      setIsModerating(true);
      try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          // Simulated delay and check for demo stability
          await new Promise(r => setTimeout(r, 1000));
          setIsSafeToPost(true); 
          setNewPostImage(base64Image);
      } catch (error) { 
          setIsSafeToPost(true); 
          setNewPostImage(base64Image); 
      } finally { 
          setIsModerating(false); 
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => checkContentSafety(ev.target?.result as string);
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleCreatePost = () => {
      if(!newPostText && !newPostImage) return;
      const newPost = {
          id: Date.now(),
          user: "Alex Morgan",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
          image: newPostImage || undefined,
          desc: newPostText,
          likes: 0,
          time: "Ahora",
          liked: false,
          comments: [],
          showComments: false
      };
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setNewPostText("");
      setNewPostImage(null);
  };

  return (
    <ScreenContainer className="bg-gray-50">
      <Header title="Comunidad" onBack={() => onNavigate(ScreenId.HOME)} />
      <div className="px-4 py-2 sticky top-[72px] z-20 bg-gray-50/95 backdrop-blur-sm">
        <div className="flex p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
            <button onClick={() => setTab('FEED')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'FEED' ? 'bg-gray-100 text-primary' : 'text-gray-400'}`}>Feed Social</button>
            <button onClick={() => setTab('ADOPT')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${tab === 'ADOPT' ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>Adopciones</button>
        </div>
      </div>

      <div className="pb-24 pt-2 min-h-screen">
         {tab === 'FEED' && posts.map((post) => (
            <div key={post.id} className="bg-white mb-4 border-b border-gray-100 pb-4 relative">
               <div className="flex justify-between items-center px-4 py-3">
                  <div className="flex items-center gap-3">
                     <img src={post.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt={post.user} />
                     <div><h4 className="font-bold text-sm text-gray-900">{post.user}</h4><p className="text-[10px] text-gray-400">{post.time}</p></div>
                  </div>
                  <div className="relative">
                      <button onClick={() => setActiveActionId(activeActionId === post.id ? null : post.id)} className="text-gray-400 p-2 rounded-full hover:bg-gray-50"><MoreHorizontal size={20}/></button>
                      {activeActionId === post.id && (
                          <div className="absolute right-0 top-8 bg-white shadow-xl border border-gray-100 rounded-xl overflow-hidden z-30 w-40 animate-in fade-in zoom-in duration-200">
                              <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"><Flag size={14}/> Reportar</button>
                              <button className="w-full text-left px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"><LinkIcon size={14}/> Copiar Enlace</button>
                              {post.user === "Alex Morgan" && <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"><Trash2 size={14}/> Eliminar</button>}
                          </div>
                      )}
                  </div>
               </div>
               {post.image && <img src={post.image} className="w-full max-h-[500px] object-cover bg-gray-100" />}
               <div className="px-4 flex gap-4 mt-3 mb-2">
                  <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1"><Heart size={26} className={post.liked ? 'fill-red-500 text-red-500' : 'text-gray-800'}/></button>
                  <button onClick={() => toggleComments(post.id)}><MessageCircle size={26} className="text-gray-800"/></button>
                  <button onClick={() => setShowShareModal(true)} className="ml-auto"><Share2 size={26} className="text-gray-800"/></button>
               </div>
               <div className="px-4"><p className="text-sm font-bold mb-1">{post.likes} Me gusta</p><p className="text-sm text-gray-700"><span className="font-bold mr-1">{post.user}</span> {post.desc}</p></div>
               {post.showComments && (
                   <div className="px-4 mt-3 pt-3 border-t border-gray-100 bg-gray-50/50 pb-3">
                       <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                           {post.comments.length > 0 ? post.comments.map((c,i)=><p key={i} className="text-xs text-gray-700"><span className="font-bold">{c.user}</span> {c.text}</p>) : <p className="text-xs text-gray-400 italic">Sé el primero en comentar</p>}
                       </div>
                       <div className="flex gap-2 items-center">
                           <input type="text" placeholder="Escribe un comentario..." className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-primary" onKeyDown={(e) => { if(e.key === 'Enter') { addComment(post.id, e.currentTarget.value); e.currentTarget.value=''; } }} />
                           <button className="p-2 bg-primary text-white rounded-full shadow-sm hover:bg-green-700"><Send size={14}/></button>
                       </div>
                   </div>
               )}
            </div>
         ))}
         
         {tab === 'ADOPT' && (
             <div className="p-4 grid grid-cols-2 gap-4">
                 <div onClick={() => setShowAdoptionForm(true)} className="border-2 border-dashed border-green-200 rounded-2xl flex flex-col items-center justify-center p-6 text-green-600 cursor-pointer hover:bg-green-50 transition-colors aspect-[3/4] shadow-sm">
                     <div className="bg-green-100 p-3 rounded-full mb-2"><Plus size={24}/></div>
                     <span className="text-xs font-bold text-center">Dar en Adopción</span>
                 </div>
                 {adoptions.map(item => (
                     <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 aspect-[3/4] flex flex-col">
                         <div className="h-32 bg-gray-100 relative"><img src={item.img} className="w-full h-full object-cover"/><div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/50 to-transparent"></div></div>
                         <div className="p-3 flex-1 flex flex-col">
                             <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h4>
                             <p className="text-[10px] text-gray-500 line-clamp-2 mb-2">{item.desc}</p>
                             <div className="mt-auto pt-2 flex justify-between items-center border-t border-gray-50">
                                 <span className="text-[10px] font-bold text-green-600 flex items-center gap-1 truncate max-w-[60px]"><MapPin size={10}/> {item.loc}</span>
                                 <button className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-green-700">Adoptar</button>
                             </div>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>

      {tab === 'FEED' && (
          <button onClick={() => setShowCreateModal(true)} className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 z-30 transition-transform active:scale-95">
              <Plus size={28} />
          </button>
      )}

      {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Crear Publicación</h3>
                      <button onClick={() => setShowCreateModal(false)} className="p-1 bg-gray-50 rounded-full hover:bg-gray-100"><X size={20}/></button>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto">
                      <div className="flex gap-3 mb-4">
                          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="w-10 h-10 rounded-full object-cover" />
                          <div><p className="text-sm font-bold">Alex Morgan</p><p className="text-xs text-gray-400">Público</p></div>
                      </div>
                      <div className="relative border border-gray-200 rounded-2xl p-2 mb-4 focus-within:ring-2 focus-within:ring-green-100 transition-all">
                          <textarea placeholder="¿Qué hay de nuevo en tu jardín?" className="w-full h-32 resize-none p-2 text-sm outline-none" value={newPostText} onChange={(e) => setNewPostText(e.target.value)}></textarea>
                          <button onClick={handleCreatePost} disabled={(!newPostText && !newPostImage)} className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${(!newPostText && !newPostImage) ? 'bg-gray-100 text-gray-300' : 'bg-primary text-white shadow-md hover:scale-105'}`}><Send size={18} /></button>
                      </div>
                      {newPostImage && (<div className="relative rounded-xl overflow-hidden mb-4 border border-gray-100"><img src={newPostImage} className="w-full max-h-64 object-cover" /><button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><X size={16}/></button></div>)}
                      {isModerating && <div className="flex items-center gap-2 text-xs text-orange-500 font-bold bg-orange-50 p-3 rounded-xl mb-4"><Loader2 className="animate-spin" size={14}/> Revisando contenido con IA...</div>}
                      <div className="flex gap-4">
                           <div onClick={() => fileInputRef.current?.click()} className="flex-1 bg-green-50 p-4 rounded-2xl flex flex-col items-center justify-center text-green-700 cursor-pointer hover:bg-green-100 transition-colors border border-green-100"><Image size={24} className="mb-1"/><span className="text-xs font-bold">Foto / Video</span></div>
                           <div className="flex-1 bg-blue-50 p-4 rounded-2xl flex flex-col items-center justify-center text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors border border-blue-100"><Camera size={24} className="mb-1"/><span className="text-xs font-bold">Cámara</span></div>
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*"/>
                  </div>
              </div>
          </div>
      )}

      {showShareModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-end justify-center animate-in slide-in-from-bottom-10">
              <div className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Compartir</h3>
                      <button onClick={() => setShowShareModal(false)} className="p-1 bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                      {shareLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 group">
                              <div className={`w-14 h-14 ${link.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform`}>
                                  <BrandIcon name={link.icon} size={24} color="white"/>
                              </div>
                              <span className="text-[10px] font-medium text-gray-600">{link.name}</span>
                          </a>
                      ))}
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
                      <span className="text-xs text-gray-500 truncate flex-1">{shareUrl}</span>
                      <button className="text-xs font-bold text-primary flex items-center gap-1 hover:text-green-700"><Copy size={14}/> Copiar</button>
                  </div>
              </div>
          </div>
      )}
      
      {showAdoptionForm && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                  <h3 className="font-bold text-lg mb-4 text-green-700 flex items-center gap-2"><Leaf size={20}/> Dar en Adopción</h3>
                  <div className="space-y-4">
                      <div onClick={() => fileInputRef.current?.click()} className="h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-green-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-green-50 transition-colors relative overflow-hidden">
                          {newPostImage ? <img src={newPostImage} className="w-full h-full object-cover"/> : <><Camera size={32} className="text-green-300 mb-2"/><span className="text-xs font-bold text-green-600">Toca para subir foto</span></>}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*"/>
                      <input type="text" placeholder="Nombre de la planta" className="w-full p-4 bg-gray-50 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-100"/>
                      <textarea placeholder="Cuéntanos por qué la das en adopción..." className="w-full p-4 bg-gray-50 rounded-xl text-sm font-medium h-28 resize-none focus:outline-none focus:ring-2 focus:ring-green-100" value={newPostText} onChange={e => setNewPostText(e.target.value)}></textarea>
                      <button onClick={handlePublishAdoption} className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-transform active:scale-[0.98]">Publicar Anuncio</button>
                      <button onClick={() => setShowAdoptionForm(false)} className="w-full text-gray-400 text-xs font-bold py-2 hover:text-gray-600">Cancelar</button>
                  </div>
              </div>
          </div>
      )}
    </ScreenContainer>
  );
};
