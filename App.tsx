import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { 
  Copy, RefreshCw, Terminal, Database, Download, Check, Sparkles, 
  LayoutGrid, List, CreditCard, Globe, MapPin, Phone, User, Landmark, 
  Zap, Search, ShieldCheck, Settings2, FileText, 
  ToggleLeft, ToggleRight, Navigation, Box, Smartphone, Calendar, Lock, Clipboard,
  ChevronDown, Layers, Layout, Home, Hash, Flag, AlignLeft
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { generateCards } from './utils/generator';
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

interface CopyFieldProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'compact' | 'full' | 'minimal';
}

const CopyField = ({ value, label, icon, variant = 'compact' }: CopyFieldProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'minimal') {
    return (
      <div 
        onClick={handleCopy}
        className="group/field flex items-center justify-between py-1.5 px-3 bg-slate-900/40 border border-white/5 rounded-lg hover:border-sky-500/30 transition-all cursor-pointer"
      >
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">{label}</span>
          <span className="text-[10px] font-bold text-slate-300 truncate font-mono">{value}</span>
        </div>
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3 text-slate-800 group-hover/field:text-sky-500 transition-colors" />}
      </div>
    );
  }

  return (
    <div 
      onClick={handleCopy}
      className={`group/field relative flex items-center justify-between p-2.5 bg-slate-900/60 border border-white/5 rounded-xl hover:bg-sky-500/10 hover:border-sky-500/20 transition-all cursor-pointer overflow-hidden ${variant === 'full' ? 'w-full' : ''}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && <div className="text-slate-600 group-hover/field:text-sky-400 transition-colors shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.1em] leading-none mb-1">{label}</p>
          <p className="text-[11px] font-bold text-slate-200 truncate font-mono tracking-tight">{value}</p>
        </div>
      </div>
      <div className="ml-2 shrink-0">
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Clipboard className="w-3.5 h-3.5 text-slate-700 group-hover/field:text-sky-400 transition-all" />
        )}
      </div>
    </div>
  );
};

const GridItem = memo(({ card, bin, bankName }: { card: GeneratedCard, bin: string, bankName?: string }) => {
    const kelKec = `${card.address.village || 'N/A'}, ${card.address.district || 'N/A'}`;
    const alamatJalan = `${card.address.street}${card.address.rt_rw ? `, ${card.address.rt_rw}` : ''}`;
    
    // Structured Address Formatting for "Copy All"
    const formattedAddress = `## Alamat Lengkap

**Nama Penerima:**  
${card.holderName}  

**Alamat Jalan:**  
${alamatJalan}  

**Kelurahan / Kecamatan:**  
${kelKec}  

**Kota / Kabupaten:**  
${card.address.city}  

**Provinsi:**  
${card.address.province || card.address.state}  

**Kode Pos:**  
${card.address.zipCode}  

**Negara:**  
${card.address.country}  

**Nomor Telepon:**  
${card.phone}`;

    return (
        <div className="animate-slide-up flex flex-col gap-4 group h-full">
            <VisualCard 
                bin={bin} 
                previewCard={card} 
                bankName={bankName}
                className="shadow-2xl shadow-black/80 group-hover:scale-[1.01] transition-transform duration-500"
            />
            
            <div className="glass-card rounded-[2rem] p-5 flex-1 flex flex-col gap-3 border border-white/5 hover:border-sky-500/20 transition-all duration-300">
                {/* 1. Recipient & Phone Header */}
                <div className="grid grid-cols-2 gap-2">
                   <CopyField value={card.holderName} label="Nama Penerima" icon={<User className="w-3.5 h-3.5" />} />
                   <CopyField value={card.phone} label="Nomor Telepon" icon={<Phone className="w-3.5 h-3.5" />} />
                </div>

                {/* 2. Card Specifics */}
                <div className="grid grid-cols-1 gap-2 p-2 bg-slate-950/40 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 mb-1 px-1">
                      <CreditCard className="w-3 h-3 text-sky-500/50" />
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Quantum Data node</span>
                   </div>
                   <CopyField value={card.number} label="Nomor Kartu" variant="compact" />
                   <div className="grid grid-cols-2 gap-2">
                      <CopyField value={`${card.expiryMonth} / ${card.expiryYear.slice(-2)}`} label="Validity" variant="compact" />
                      <CopyField value={card.cvv} label="Auth / CVV" variant="compact" />
                   </div>
                </div>

                {/* 3. Detailed Address Matrix (The "Alamat Lengkap" structure) */}
                <div className="space-y-1.5 p-3 bg-slate-900/30 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-2 mb-2 px-1">
                      <MapPin className="w-3 h-3 text-sky-500/50" />
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Physical Alamat Matrix</span>
                   </div>
                   
                   <div className="space-y-1">
                      <CopyField value={alamatJalan} label="Alamat Jalan" variant="minimal" />
                      <CopyField value={kelKec} label="Kelurahan / Kecamatan" variant="minimal" />
                      <CopyField value={card.address.city} label="Kota / Kabupaten" variant="minimal" />
                      <div className="grid grid-cols-2 gap-1.5">
                        <CopyField value={card.address.province || card.address.state} label="Provinsi" variant="minimal" />
                        <CopyField value={card.address.zipCode} label="Kode Pos" variant="minimal" />
                      </div>
                      <CopyField value={card.address.country} label="Negara" variant="minimal" />
                   </div>
                </div>

                {/* 4. Global Action */}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(formattedAddress);
                    // Add some simple feedback if needed or rely on CopyField
                  }}
                  className="mt-auto flex items-center justify-center gap-2 w-full py-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 group/btn"
                >
                   <AlignLeft className="w-3.5 h-3.5 group-hover/btn:rotate-6 transition-transform" />
                   Salin Alamat Lengkap
                </button>
            </div>
        </div>
    );
});

function App() {
  const [bin, setBin] = useState('551827706');
  const [quantity, setQuantity] = useState(6);
  const [country, setCountry] = useState<CountryCode>('ID');
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
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

  const exportJSON = useCallback(() => {
    if (cards.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `quantum_sim_${bin}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }, [cards, bin]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-sky-500/30 grid-pattern overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(56,189,248,0.06),transparent_80%)]"></div>
      </div>

      <div className="max-w-[1720px] mx-auto px-4 py-8 md:px-10">
        
        {/* Dashboard Header */}
        <header className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
               <div className="absolute inset-0 bg-sky-500 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
               <div className="relative p-4 bg-slate-900 rounded-3xl border border-sky-500/20 shadow-2xl">
                 <Terminal className="w-10 h-10 text-sky-400" />
               </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-4">
                DEVCARD <span className="font-thin text-slate-500 italic">SIMULATOR</span>
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-sky-500 text-slate-950 uppercase tracking-[0.2em]">v9.3 PRO</span>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] font-mono">Quantum Intelligence Grid</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden sm:flex items-center gap-3 px-6 py-3 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-xl">
                <Smartphone className="w-4 h-4 text-sky-500/40" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">High Density UI</span>
             </div>
             <button onClick={exportJSON} className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-slate-400 hover:text-sky-400 transition-all active:scale-90">
                <Download className="w-5 h-5" />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Controls (Left) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Intel Panel */}
            <div className="glass-card rounded-[2.5rem] p-7 border-sky-500/10">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <Search className="w-5 h-5 text-sky-400" />
                     <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">BIN Decoder</span>
                  </div>
                  {isIntelLoading && <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />}
               </div>

               <div className="space-y-6">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={bin}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 15);
                        setBin(v);
                        if (v.length >= 6) handleIntelLookup(v);
                      }}
                      className="quantum-input w-full rounded-2xl px-8 py-6 text-3xl font-mono text-white tracking-[0.3em] placeholder-slate-900"
                      placeholder="XXXXXX"
                    />
                    <Zap className={`absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-all duration-700 ${intel ? 'text-sky-400' : 'text-slate-900'}`} />
                  </div>

                  {intel ? (
                    <div className="bg-slate-950/80 rounded-2xl border border-white/5 p-5 space-y-4 animate-slide-up">
                       <div className="flex items-start gap-4">
                          <Landmark className="w-5 h-5 text-sky-500/50 mt-1" />
                          <div className="min-w-0">
                             <p className="text-[10px] uppercase font-black text-slate-600 tracking-widest mb-1">Detected Issuer</p>
                             <p className="text-sm font-bold text-white truncate">{intel.bank || 'Simulation Engine'}</p>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-slate-900 rounded-[2rem]">
                       <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest">Awaiting BIN Signal</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Config */}
            <div className="glass-card rounded-[2.5rem] p-7 space-y-10">
               <div>
                  <div className="flex items-center gap-4 mb-6">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Geozone Focus</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COUNTRIES.map(c => (
                      <button 
                        key={c.code}
                        onClick={() => setCountry(c.code)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-500 ${
                          country === c.code ? 'bg-sky-600/20 border-sky-500/50 text-white shadow-xl' : 'bg-slate-950/50 border-white/5 text-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter">{c.code}</span>
                      </button>
                    ))}
                  </div>
               </div>

               <div>
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                       <Settings2 className="w-5 h-5 text-slate-500" />
                       <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Density</span>
                    </div>
                    <span className="text-sm font-mono text-sky-400 font-black">{quantity} Units</span>
                 </div>
                 <input 
                   type="range" min="1" max="50" value={quantity} 
                   onChange={(e) => setQuantity(parseInt(e.target.value))}
                   className="w-full h-2 bg-slate-900 rounded-full appearance-none cursor-pointer accent-sky-500"
                 />
               </div>

               <button 
                onClick={handleGenerate}
                className="w-full bg-white text-slate-950 font-black text-xs uppercase tracking-[0.4em] py-6 rounded-[2rem] hover:bg-sky-400 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 group"
               >
                 <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform" /> Sync Neural Grid
               </button>
            </div>

            {/* Modules */}
            <div className="glass-card rounded-[2.5rem] p-7">
               <div className="flex items-center gap-4 mb-8">
                  <Database className="w-5 h-5 text-slate-500" />
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Core Modules</span>
               </div>
               <div className="space-y-2">
                  {BIN_LIBRARY.map(lib => (
                    <button 
                      key={lib.bin}
                      onClick={() => setTemplate(lib.bin)}
                      className="w-full text-left p-4 rounded-2xl border border-white/5 bg-slate-950/30 hover:bg-sky-500/5 hover:border-sky-500/30 transition-all flex items-center gap-4 group"
                    >
                      <div className={`p-2.5 rounded-xl bg-slate-950 border border-white/5 ${lib.color}`}>
                        <lib.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase text-white truncate">{lib.label}</p>
                        <p className="text-[8px] text-slate-700 mt-1 uppercase tracking-widest font-bold truncate">{lib.desc}</p>
                      </div>
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Viewport (Right) */}
          <div className="xl:col-span-9 flex flex-col min-h-[900px]">
            
            {/* Control Bar */}
            <div className="glass-card rounded-[2rem] p-3 mb-8 flex flex-wrap items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="flex bg-slate-950 p-1 rounded-[1.2rem] border border-white/5">
                     <button onClick={() => setViewMode('grid')} className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                        <Layout className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Matrix View</span>
                     </button>
                     <button onClick={() => setViewMode('list')} className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-sky-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
                        <List className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Stream View</span>
                     </button>
                  </div>
               </div>
               <div className="pr-6 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                  <span className="text-white">{cards.length}</span> Active Profiles
               </div>
            </div>

            {/* Content Field */}
            <div className="flex-1 glass-card rounded-[3.5rem] p-4 md:p-10 relative overflow-hidden flex flex-col">
               <div className="h-full overflow-y-auto custom-scrollbar">
                  {cards.length > 0 ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 pb-10">
                         {cards.map((card) => (
                           <GridItem 
                              key={card.id}
                              card={card} 
                              bin={bin} 
                              bankName={intel?.bank}
                           />
                         ))}
                      </div>
                    ) : (
                      <div className="space-y-4 pb-10">
                        {cards.map((card) => (
                           <div key={card.id} className="glass-card rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-8 animate-slide-up group border border-white/5 hover:border-sky-500/30 transition-all">
                              <div className="flex items-center gap-6 min-w-0 flex-1">
                                 <div className="w-14 h-14 rounded-2xl bg-sky-500/5 border border-sky-500/10 flex items-center justify-center text-sky-400 shrink-0 group-hover:scale-105 transition-transform">
                                    <User className="w-7 h-7" />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="font-black text-white text-lg tracking-tight truncate uppercase">{card.holderName}</p>
                                    <p className="text-[10px] text-slate-500 mt-1.5 font-mono uppercase tracking-[0.2em] truncate">{card.address.city}, {card.address.country}</p>
                                 </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                                 <div className="bg-slate-950 px-6 py-3 rounded-xl border border-white/5 font-mono text-xs text-sky-400 font-bold tracking-[0.2em] shadow-inner">
                                    {card.number}
                                 </div>
                                 <div className="flex gap-3">
                                    <div className="bg-slate-950 px-4 py-3 rounded-xl border border-white/5 font-mono text-xs text-slate-500 font-bold">
                                       {card.expiryMonth}/{card.expiryYear.slice(-2)}
                                    </div>
                                    <div className="bg-slate-950 px-4 py-3 rounded-xl border border-white/5 font-mono text-xs text-yellow-600 font-bold">
                                       {card.cvv}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-10">
                       <Box className="w-24 h-24 mb-8" />
                       <h3 className="text-xl font-black uppercase tracking-[0.4em]">Grid Silent</h3>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 pb-16 text-center">
         <div className="inline-flex items-center gap-6 px-10 py-4 bg-slate-900/30 rounded-full border border-white/5 backdrop-blur-md">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">DEVCARD QUANTUM SYSTEM V9.3 PRO • SIMULATION MATRIX</span>
         </div>
      </footer>
    </div>
  );
}

export default App;