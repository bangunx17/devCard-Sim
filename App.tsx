import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Copy, RefreshCw, AlertTriangle, Terminal, Database, Download, Check, Sparkles, 
  LayoutGrid, List, CreditCard, Globe, MapPin, Phone, User, Landmark, 
  Zap, Search, ShieldCheck, Settings2, Filter, Share2, Eye, FileText, 
  ToggleLeft, ToggleRight, Info, Layers, Navigation, Box, Smartphone
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateCards, getScheme } from './utils/generator';
import { GeneratedCard, CountryCode } from './types';
import { VisualCard } from './components/VisualCard';

type ViewMode = 'list' | 'grid';

const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
];

const BIN_LIBRARY = [
  { label: 'MASTERCARD ID', bin: '551827706', desc: 'Central Asia • Premium', color: 'text-orange-400', icon: Box },
  { label: 'VISA INFINITE US', bin: '453978', desc: 'Chase Bank • Elite', color: 'text-sky-400', icon: Zap },
  { label: 'AMEX GOLD US', bin: '371449', desc: 'Membership Rewards', color: 'text-emerald-400', icon: Sparkles },
  { label: 'JCB PRECIOUS JP', bin: '353011', desc: 'Mizuho Bank • Luxury', color: 'text-rose-400', icon: Globe },
  { label: 'RUPAY PLATINUM IN', bin: '508534', desc: 'National Payments • IN', color: 'text-green-400', icon: Database },
];

const fetchBinIntelligence = async (bin: string) => {
  if (bin.length < 6) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide JSON info for credit card BIN ${bin}. Include "bank", "type" (Credit/Debit), "level" (Platinum/Gold/Standard), "brand", and "country". Return ONLY raw JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Intelligence node unreachable", error);
    return null;
  }
};

const GridItem = memo(({ card, bin, detailedBilling, copiedId, onCopy, bankName }: { card: GeneratedCard, bin: string, detailedBilling: boolean, copiedId: string | null, onCopy: (c: GeneratedCard) => void, bankName?: string }) => {
    return (
        <div className="animate-fade-in flex flex-col gap-3 group">
            <VisualCard 
                bin={bin} 
                previewCard={card} 
                bankName={bankName}
                className="shadow-2xl shadow-black/40"
                onClick={() => onCopy(card)}
                isCopied={copiedId === card.id}
            />
            
            <div className="glass-card rounded-2xl p-4 transition-all duration-300 group-hover:bg-slate-900/80 group-hover:border-sky-500/20 group-hover:translate-y-[-2px]">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0 border border-sky-500/20 group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5 text-sky-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate leading-none mb-1.5">{card.holderName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <Smartphone className="w-3 h-3 text-sky-500/50" /> {card.phone}
                        </div>
                    </div>
                    <button onClick={() => onCopy(card)} className="p-2 rounded-lg bg-white/5 hover:bg-sky-500/20 text-slate-500 hover:text-sky-400 transition-colors">
                       <Copy className="w-4 h-4" />
                    </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                    {detailedBilling ? (
                        <div className="grid grid-cols-1 gap-2 text-[11px]">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Navigation className="w-3.5 h-3.5 text-sky-500/40" />
                                <span className="truncate">{card.address.street} {card.address.street2}</span>
                            </div>
                            {card.address.rt_rw && (
                                <div className="flex items-center gap-3 text-slate-400 pl-6.5">
                                   <div className="w-1 h-1 rounded-full bg-sky-500/30 mr-2"></div>
                                   <span className="text-[10px]">{card.address.rt_rw} • {card.address.village}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-slate-400 pl-6.5">
                                <div className="w-1 h-1 rounded-full bg-sky-500/30 mr-2"></div>
                                <span>{card.address.district}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300 font-semibold bg-sky-500/5 p-2 rounded-lg">
                                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                                <span className="truncate">{card.address.city}, {card.address.zipCode}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-sky-500/40 shrink-0" />
                            <span className="truncate">{card.address.city}, {card.address.country}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

function App() {
  const [bin, setBin] = useState('551827706');
  const [quantity, setQuantity] = useState(6);
  const [country, setCountry] = useState<CountryCode>('ID');
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [detailedBilling, setDetailedBilling] = useState(true);
  const [intel, setIntel] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);

  useEffect(() => {
    handleGenerate();
    handleIntelLookup(bin);
  }, []);

  const handleIntelLookup = async (lookupBin: string) => {
    if (lookupBin.length < 6) {
        setIntel(null);
        return;
    }
    setIsIntelLoading(true);
    const data = await fetchBinIntelligence(lookupBin);
    setIntel(data);
    setIsIntelLoading(false);
  };

  const handleGenerate = useCallback(() => {
    const newCards = generateCards(bin, quantity, country);
    setCards(newCards);
  }, [bin, quantity, country]);

  const setTemplate = (templateBin: string) => {
    setBin(templateBin);
    handleIntelLookup(templateBin);
    const newCards = generateCards(templateBin, quantity, country);
    setCards(newCards);
  };

  const copyToClipboard = useCallback((card: GeneratedCard) => {
    let text = `${card.number}|${card.expiryMonth}/${card.expiryYear.slice(-2)}|${card.cvv}|${card.holderName}`;
    if (detailedBilling) {
        text += `\nAddress: ${card.address.street} ${card.address.street2 || ''}, ${card.address.rt_rw || ''}, ${card.address.city}, ${card.address.zipCode}, ${card.address.country}`;
        text += `\nPhone: ${card.phone}`;
        if (intel?.bank) text += `\nBank: ${intel.bank}`;
    }
    navigator.clipboard.writeText(text);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, [detailedBilling, intel]);

  const exportJSON = useCallback(() => {
    if (cards.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `quantum_intel_${bin}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [cards, bin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 grid-pattern">
      
      {/* Immersive BG Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-sky-900/10 blur-[180px] rounded-full animate-pulse-slow"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[180px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-[1720px] mx-auto px-4 py-6 md:px-8 md:py-10">
        
        {/* Header - Compact & Premium */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="relative group">
               <div className="absolute inset-0 bg-sky-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
               <div className="relative p-3.5 bg-slate-900 rounded-2xl border border-sky-500/30 shadow-2xl">
                 <Terminal className="w-8 h-8 text-sky-400" />
               </div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                QUANTUM <span className="font-light text-slate-500 italic">NODE</span>
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-sky-500 text-slate-950 uppercase tracking-widest shadow-lg shadow-sky-500/20">v9.0</span>
                <div className="h-1 w-1 rounded-full bg-slate-700"></div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Neural Simulation Grid</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-center">
             <div className="flex items-center gap-2.5 px-5 py-2.5 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
                <div className="relative w-2 h-2">
                   <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                   <div className="relative w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Grid Operational</span>
             </div>
             <div className="hidden lg:flex items-center gap-2.5 px-5 py-2.5 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-md">
                <Layers className="w-4 h-4 text-sky-500/50" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Encrypted Stream</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          
          {/* Dashboard Left Rail */}
          <div className="xl:col-span-3 space-y-6 lg:sticky lg:top-10">
            
            {/* Intelligence Node */}
            <div className="glass-card rounded-[2rem] p-7 border-sky-500/10 shadow-sky-500/5 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/30"></div>
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full"></div>
               
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                     <Search className="w-4 h-4 text-sky-400" />
                     <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">Node Analysis</span>
                  </div>
                  {isIntelLoading && <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>}
               </div>

               <div className="space-y-5">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={bin}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 15);
                        setBin(v);
                        if (v.length >= 6) handleIntelLookup(v);
                      }}
                      className="quantum-input w-full rounded-2xl px-6 py-5 text-2xl font-mono text-white tracking-[0.3em] placeholder-slate-800"
                      placeholder="XXXXXX"
                      inputMode="numeric"
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                       <Zap className={`w-5 h-5 transition-colors duration-500 ${intel ? 'text-sky-400' : 'text-slate-800'}`} />
                    </div>
                  </div>

                  {intel ? (
                    <div className="bg-slate-950/80 rounded-2xl border border-white/5 p-5 space-y-4 animate-slide-up">
                       <div className="flex items-start gap-4">
                          <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
                             <Landmark className="w-4 h-4 text-sky-400" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest mb-1">Issuer Oracle</p>
                             <p className="text-sm font-bold text-white truncate">{intel.bank || 'External Node'}</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                             <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Protocol</p>
                             <p className="text-[10px] text-sky-300 font-black uppercase">{intel.level || 'Standard'}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest">Modality</p>
                             <p className="text-[10px] text-white font-black uppercase">{intel.type || 'Universal'}</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-900 rounded-3xl group-hover:border-slate-800 transition-colors">
                       <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Scan BIN for Intel</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Config Sub-panel */}
            <div className="glass-card rounded-[2rem] p-7 space-y-8">
               
               {/* Country Node */}
               <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Target Region</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COUNTRIES.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => setCountry(c.code)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 group ${
                          country === c.code ? 'bg-sky-600/20 border-sky-500/50 text-white shadow-lg' : 'bg-slate-950/50 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                        }`}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{c.flag}</span>
                        <span className="text-[10px] font-black uppercase">{c.code}</span>
                      </button>
                    ))}
                  </div>
               </div>

               {/* Batch Node */}
               <div>
                 <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                       <Settings2 className="w-4 h-4 text-slate-500" />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Batch Load</span>
                    </div>
                    <span className="text-xs font-mono text-sky-400 font-black">{quantity} Units</span>
                 </div>
                 <input 
                   type="range" min="1" max="50" value={quantity} 
                   onChange={(e) => setQuantity(parseInt(e.target.value))}
                   className="w-full h-1.5 bg-slate-900 rounded-full appearance-none cursor-pointer accent-sky-500"
                 />
                 <div className="flex justify-between mt-3 px-1">
                    <span className="text-[9px] font-bold text-slate-700">MIN_1</span>
                    <span className="text-[9px] font-bold text-slate-700">MAX_50</span>
                 </div>
               </div>

               <button 
                onClick={handleGenerate}
                className="w-full bg-white text-slate-950 font-black text-xs uppercase tracking-[0.3em] py-5 rounded-2xl hover:bg-sky-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-sky-500/10 active:scale-95 group"
               >
                 <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" /> Initialize Batch
               </button>
            </div>

            {/* Quick Access */}
            <div className="glass-card rounded-[2rem] p-7">
               <div className="flex items-center gap-3 mb-6">
                  <Database className="w-4 h-4 text-slate-500" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Preset Library</span>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  {BIN_LIBRARY.map(lib => (
                    <button 
                      key={lib.bin}
                      onClick={() => setTemplate(lib.bin)}
                      className="w-full text-left p-4 rounded-2xl border border-white/5 bg-slate-950/50 hover:bg-sky-500/5 hover:border-sky-500/20 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                         <div className={`p-2 rounded-lg bg-slate-900 border border-white/5 ${lib.color}`}>
                            <lib.icon className="w-4 h-4" />
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase text-white truncate">{lib.label}</p>
                            <p className="text-[9px] text-slate-600 mt-0.5 truncate">{lib.desc}</p>
                         </div>
                      </div>
                      <Box className="w-3.5 h-3.5 text-slate-800 group-hover:text-sky-500/40 transition-colors" />
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Grid Viewport */}
          <div className="xl:col-span-9 flex flex-col min-h-[800px]">
            
            {/* Viewport Control Bar */}
            <div className="glass-card rounded-3xl p-4 mb-6 flex flex-wrap items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                     <button onClick={() => setViewMode('grid')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white shadow-xl shadow-sky-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                        <LayoutGrid className="w-4 h-4" /> <span className="hidden sm:inline">Grid</span>
                     </button>
                     <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-sky-600 text-white shadow-xl shadow-sky-600/20' : 'text-slate-500 hover:text-slate-300'}`}>
                        <List className="w-4 h-4" /> <span className="hidden sm:inline">Stream</span>
                     </button>
                  </div>
                  <div className="h-8 w-px bg-white/5 hidden md:block"></div>
                  <button 
                    onClick={() => setDetailedBilling(!detailedBilling)}
                    className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                        detailedBilling ? 'bg-sky-500/10 border-sky-500/30 text-sky-400' : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-400'
                    }`}
                  >
                     {detailedBilling ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                     <span>Depth Analysis</span>
                  </button>
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                     {[...Array(3)].map((_, i) => <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800"></div>)}
                     <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-sky-600 flex items-center justify-center text-[8px] font-black">{cards.length}</div>
                  </div>
                  <button onClick={exportJSON} className="p-3.5 rounded-2xl bg-slate-950 border border-white/10 text-slate-400 hover:text-sky-400 hover:border-sky-500/30 transition-all shadow-xl">
                     <Share2 className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Data Stream */}
            <div className="flex-1 glass-card rounded-[3rem] p-6 md:p-10 relative overflow-hidden flex flex-col">
               {/* Decorative Grid Lines */}
               <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #fff 1px, transparent 0), linear-gradient(#fff 1px, transparent 0)', backgroundSize: '100px 100px' }}></div>
               
               <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                  {cards.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                         {cards.map((card, i) => (
                           <div key={card.id} className="animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                             <GridItem 
                                card={card} 
                                bin={bin} 
                                detailedBilling={detailedBilling} 
                                copiedId={copiedId} 
                                onCopy={copyToClipboard}
                                bankName={intel?.bank}
                             />
                           </div>
                         ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                           <thead className="text-[10px] text-slate-600 uppercase font-black tracking-[0.3em] px-4">
                              <tr>
                                 <th className="pb-4 pl-6">Operator Node</th>
                                 <th className="pb-4">Payment Modality</th>
                                 <th className="pb-4 text-right pr-6">Command</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/[0.02]">
                              {cards.map(card => (
                                <tr key={card.id} className="group glass-card rounded-2xl">
                                   <td className="py-6 pl-6 rounded-l-3xl">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-sky-500">
                                            <User className="w-5 h-5" />
                                         </div>
                                         <div>
                                            <p className="font-bold text-slate-200 text-sm">{card.holderName}</p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase">{card.address.city}, {card.address.country}</p>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="py-6">
                                      <div className="inline-flex items-center gap-4 bg-slate-950 px-5 py-2.5 rounded-2xl border border-white/5 font-mono text-xs shadow-inner">
                                         <span className="text-sky-400 font-bold">{card.number}</span>
                                         <span className="text-slate-800">/</span>
                                         <span className="text-slate-400">{card.expiryMonth}•{card.expiryYear.slice(-2)}</span>
                                         <span className="text-slate-800">/</span>
                                         <span className="text-yellow-600 font-bold">{card.cvv}</span>
                                      </div>
                                   </td>
                                   <td className="py-6 text-right pr-6 rounded-r-3xl">
                                      <button 
                                        onClick={() => copyToClipboard(card)} 
                                        className={`p-3 rounded-xl transition-all duration-300 border ${
                                            copiedId === card.id ? 'bg-sky-500 text-white shadow-xl shadow-sky-500/20' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-sky-400 hover:border-sky-500/20'
                                        }`}
                                      >
                                         {copiedId === card.id ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                      </button>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                       <div className="relative mb-8">
                          <div className="absolute inset-0 bg-sky-500 blur-3xl opacity-10 animate-pulse"></div>
                          <Box className="w-20 h-20 text-slate-800 relative z-10" />
                       </div>
                       <h3 className="text-xl font-black text-slate-700 uppercase tracking-[0.2em] mb-3">Void Node Detected</h3>
                       <p className="text-xs text-slate-600 uppercase font-bold tracking-widest">Initialize neural grid to stream identities</p>
                    </div>
                  )}
               </div>

               {/* Footer Insight Bar */}
               <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">
                     <Landmark className="w-4 h-4 text-sky-500/30" /> Issuer Prediction: AI Node v2
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">
                     <ShieldCheck className="w-4 h-4 text-emerald-500/30" /> Protocol: Luhn-10 Validated
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em]">
                     <Info className="w-4 h-4 text-slate-700" /> Usage: Test Node Simulation
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>

      <footer className="mt-12 pb-10 text-center">
         <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-slate-900/40 rounded-full border border-white/5 backdrop-blur-md">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Quantum Engine Pulse: {new Date().toLocaleTimeString()}</span>
            <div className="h-4 w-px bg-white/5"></div>
            <a href="#" className="text-[10px] font-black text-sky-400 hover:text-white uppercase tracking-widest transition-colors">Neural Documentation</a>
         </div>
      </footer>
    </div>
  );
}

export default App;