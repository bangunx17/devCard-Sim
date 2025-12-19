import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Copy, RefreshCw, AlertTriangle, Terminal, Database, Download, Check, Sparkles, LayoutGrid, List, CreditCard, Globe, MapPin, Phone, User, Building2, Eye, FileText, ToggleLeft, ToggleRight, Search, ShieldCheck } from 'lucide-react';
import { generateCards, getScheme } from './utils/generator';
import { GeneratedCard, CountryCode } from './types';
import { VisualCard } from './components/VisualCard';

type ViewMode = 'list' | 'grid';

const COUNTRIES: { code: CountryCode; name: string; flag: string }[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
];

// --- Memoized Sub-components for Performance ---

const GridItem = memo(({ card, bin, detailedBilling, copiedId, onCopy }: { card: GeneratedCard, bin: string, detailedBilling: boolean, copiedId: string | null, onCopy: (c: GeneratedCard) => void }) => {
    return (
        <div className="animate-fade-in flex flex-col gap-3 group">
            <VisualCard 
                bin={bin} 
                previewCard={card} 
                className="shadow-xl"
                onClick={() => onCopy(card)}
                isCopied={copiedId === card.id}
            />
            
            {/* Grid Identity Panel */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 backdrop-blur-sm group-hover:bg-slate-800/40 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                        <User className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{card.holderName}</p>
                        <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Phone className="w-2.5 h-2.5" /> {card.phone}
                        </p>
                    </div>
                </div>
                
                {detailedBilling ? (
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-1 gap-y-2 text-[10px]">
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-slate-500">Street</span>
                            <span className="col-span-2 text-slate-300 truncate">{card.address.street}</span>
                        </div>
                        {card.address.street2 && (
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-slate-500">Unit</span>
                                <span className="col-span-2 text-slate-300 truncate">{card.address.street2}</span>
                            </div>
                        )}
                        {card.address.rt_rw && (
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-slate-500">RT/RW</span>
                                <span className="col-span-2 text-slate-300 truncate">{card.address.rt_rw}</span>
                            </div>
                        )}
                        {card.address.village && (
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-slate-500">Village</span>
                                <span className="col-span-2 text-slate-300 truncate">{card.address.village}</span>
                            </div>
                        )}
                        {card.address.district && (
                            <div className="grid grid-cols-3 gap-1">
                                <span className="text-slate-500">District</span>
                                <span className="col-span-2 text-slate-300 truncate">{card.address.district}</span>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-slate-500">City</span>
                            <span className="col-span-2 text-slate-300 truncate">{card.address.city}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                            <span className="text-slate-500">Zip</span>
                            <span className="col-span-2 text-slate-300 font-mono">{card.address.zipCode}</span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-slate-400 leading-relaxed flex flex-col gap-1">
                        <div className="flex gap-2">
                            <MapPin className="w-3 h-3 shrink-0 mt-0.5 text-slate-500" />
                            <span className="line-clamp-2">
                            {card.address.street}
                            </span>
                        </div>
                        <div className="pl-5 text-slate-500 truncate">
                            {card.address.city}, {card.address.state}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

const ListItem = memo(({ card, index, detailedBilling, copiedId, onCopy }: { card: GeneratedCard, index: number, detailedBilling: boolean, copiedId: string | null, onCopy: (c: GeneratedCard) => void }) => {
    return (
        <tr className="group hover:bg-indigo-500/[0.03] transition-colors duration-200">
            <td className="px-6 py-4 align-top">
                <div className="flex items-start gap-3">
                    <span className="text-slate-700 font-mono text-xs w-5 pt-0.5 text-right select-none">{index + 1}</span>
                    <div>
                        <div className="font-bold text-slate-200 text-sm group-hover:text-indigo-300 transition-colors">
                            {card.holderName}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-mono mt-1">
                            {card.scheme} • {card.address.country}
                        </div>
                        <div className="md:hidden mt-2 space-y-1">
                            <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5"><CreditCard className="w-3 h-3"/> {card.number}</p>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 hidden md:table-cell align-top">
                {detailedBilling ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-400">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-600">Street</span>
                            <span className="text-slate-300">{card.address.street} {card.address.street2}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase text-slate-600">City/State</span>
                            <span className="text-slate-300">{card.address.city}, {card.address.state}</span>
                        </div>
                        {(card.address.rt_rw || card.address.village || card.address.district) && (
                            <div className="flex flex-col col-span-2 mt-1">
                                <span className="text-[10px] uppercase text-slate-600">Local Area</span>
                                <span className="text-slate-300">
                                    {[card.address.rt_rw, card.address.village, card.address.district].filter(Boolean).join(', ')}
                                </span>
                            </div>
                        )}
                        <div className="flex flex-col mt-1">
                            <span className="text-[10px] uppercase text-slate-600">Zip Code</span>
                            <span className="font-mono text-slate-300">{card.address.zipCode}</span>
                        </div>
                        <div className="flex flex-col mt-1">
                            <span className="text-[10px] uppercase text-slate-600">Phone</span>
                            <span className="font-mono text-slate-300">{card.phone}</span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                            <Phone className="w-3 h-3 text-slate-500" />
                            <span className="font-mono">{card.phone}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-400 leading-snug">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                            <span>
                                {card.address.street}{card.address.street2 && `, ${card.address.street2}`}
                                <br/>{card.address.city}, {card.address.state}
                            </span>
                        </div>
                    </div>
                )}
            </td>
            <td className="px-6 py-4 text-center hidden sm:table-cell align-top">
                <div className="inline-block text-left bg-slate-900/50 p-2 rounded border border-white/5">
                    <div className="font-mono text-slate-200 text-xs tracking-wider">
                        {card.number}
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                        <span>EXP: {card.expiryMonth}/{card.expiryYear.slice(-2)}</span>
                        <span className="text-yellow-600">CVV: {card.cvv}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-right align-top">
                <button
                    onClick={() => onCopy(card)}
                    className={`p-2 rounded-lg transition-all duration-300 border ${
                        copiedId === card.id 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-transparent border-transparent text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20'
                    }`}
                    title={detailedBilling ? "Copy detailed profile" : "Copy simplified card data"}
                >
                    {copiedId === card.id ? <Check className="w-4 h-4 scale-110" /> : (detailedBilling ? <FileText className="w-4 h-4" /> : <Copy className="w-4 h-4" />)}
                </button>
            </td>
        </tr>
    );
});

function App() {
  const [bin, setBin] = useState('551827706');
  const [quantity, setQuantity] = useState(5);
  const [country, setCountry] = useState<CountryCode>('ID');
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [detailedBilling, setDetailedBilling] = useState(false);

  // Initial generation
  useEffect(() => {
    // Generate instantly on mount
    const newCards = generateCards(bin, quantity, country);
    setCards(newCards);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Performance: Removed artificial delay (setTimeout) for instant response
  const handleGenerate = useCallback(() => {
    const newCards = generateCards(bin, quantity, country);
    setCards(newCards);
    setGeneratedAt(new Date());
  }, [bin, quantity, country]);

  const setTemplate = (templateBin: string) => {
    setBin(templateBin);
    // Auto generate when template clicked for better UX
    const newCards = generateCards(templateBin, quantity, country);
    setCards(newCards);
    setGeneratedAt(new Date());
  };

  // Live BIN Analysis
  const binAnalysis = useMemo(() => {
    if (bin.length < 6) return null;
    const scheme = getScheme(bin.padEnd(16, '0'));
    
    let industry = 'Unknown';
    const firstDigit = bin[0];
    if (firstDigit === '3') industry = 'Travel & Entertainment';
    if (firstDigit === '4' || firstDigit === '5') industry = 'Banking & Financial';
    if (firstDigit === '6') industry = 'Merchandising & Banking';
    if (firstDigit === '8') industry = 'Telecommunications';

    return { scheme, industry };
  }, [bin]);

  const copyToClipboard = useCallback((card: GeneratedCard) => {
    let text = "";

    if (detailedBilling) {
        // Detailed Format
        text = `--- IDENTITY PROFILE ---
Full Name
${card.holderName}

Phone Number
${card.phone}

--- BILLING ADDRESS ---
Street Address
${card.address.street}${card.address.street2 ? `\n${card.address.street2}` : ''}`;

        if (card.address.rt_rw) text += `\n${card.address.rt_rw}`;
        if (card.address.village) text += `\n\nKelurahan / Desa\n${card.address.village}`;
        if (card.address.district) text += `\n\nKecamatan\n${card.address.district}`;

        text += `\n\nCity / Regency\n${card.address.city}

State / Province
${card.address.state}

Postal Code
${card.address.zipCode}

Country
${card.address.country}

--- PAYMENT DETAILS ---
Card Number: ${card.number}
Expiry:      ${card.expiryMonth}/${card.expiryYear.slice(-2)}
CVV:         ${card.cvv}
Scheme:      ${card.scheme}`;
    } else {
        // Simplified Format
        text = `${card.number}|${card.expiryMonth}/${card.expiryYear.slice(-2)}|${card.cvv}|${card.holderName}`;
    }
    
    navigator.clipboard.writeText(text);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 1500);
  }, [detailedBilling]);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(cards, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `devcard_v7_${country}_${bin}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen font-sans p-4 md:p-6 lg:p-8 pb-20">
      
      {/* Deep Space Background - Optimized */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-[#020617]">
        <div className="absolute top-[-10%] left-[20%] w-[50%] h-[50%] bg-indigo-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        
        {/* Header */}
        <header className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative group cursor-default">
                <div className="absolute inset-0 bg-indigo-500 blur opacity-30 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative p-2.5 bg-slate-900 rounded-xl border border-indigo-500/30 text-indigo-400 group-hover:border-indigo-400/50 transition-colors">
                  <Terminal className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  DevCard <span className="text-indigo-400 font-light">Sim</span>
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]">v7.0</span>
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">High-Performance Generator</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/5 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-semibold backdrop-blur-md">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>DEV ONLY</span>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Controls (Sticky on Desktop, Stacked on Mobile) */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-8 z-20">
            
            {/* Master Preview - Hidden on Mobile for Space */}
            <div className="hidden lg:block perspective-1000 w-full transform transition-all hover:scale-[1.02] duration-500">
               <div className="mb-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1 flex justify-between">
                 <span>Master Preview</span>
                 <span className="text-indigo-400">{COUNTRIES.find(c => c.code === country)?.name}</span>
               </div>
              <VisualCard bin={bin} previewCard={cards[0]} />
            </div>

            {/* Config Panel */}
            <div className="glass-panel p-5 md:p-6 rounded-2xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              
              {/* Country Selector */}
              <div className="mb-6">
                <label className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    Target Region
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => setCountry(c.code)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border touch-manipulation ${
                        country === c.code 
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_10px_rgba(79,70,229,0.2)]' 
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Templates */}
              <div className="mb-6">
                 <label className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    Quick Templates
                 </label>
                 <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setTemplate('4')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div> Visa
                    </button>
                    <button onClick={() => setTemplate('5')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-orange-900/30 border border-slate-700 hover:border-orange-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div> MC
                    </button>
                    <button onClick={() => setTemplate('37')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-emerald-900/30 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> Amex
                    </button>
                    <button onClick={() => setTemplate('35')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div> JCB
                    </button>
                    <button onClick={() => setTemplate('62')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-cyan-900/30 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 group-hover:shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div> Union
                    </button>
                    <button onClick={() => setTemplate('6521')} className="flex items-center justify-center gap-1.5 py-3 lg:py-2 px-1 bg-slate-800/50 hover:bg-green-900/30 border border-slate-700 hover:border-green-500/50 rounded-lg transition-all text-[10px] font-semibold text-slate-300 hover:text-white group touch-manipulation">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div> RuPay
                    </button>
                 </div>
              </div>

              <div className="space-y-6">
                {/* BIN Input - Text-base for iOS zoom prevention */}
                <div className="group">
                  <label className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider group-focus-within:text-indigo-400 transition-colors">
                    <span>BIN Prefix</span>
                    <span className="text-slate-600 font-mono">Real-time Analysis</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 15) setBin(val);
                      }}
                      className="glass-input w-full rounded-xl px-4 py-3 text-base lg:text-xl font-mono text-white tracking-widest placeholder-slate-700 focus:outline-none"
                      placeholder="551827"
                      inputMode="numeric"
                    />
                    
                    {/* Live Badge in Input */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                       {binAnalysis && (
                          <div className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border shadow-sm ${
                             binAnalysis.scheme === 'Mastercard' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                             binAnalysis.scheme === 'Visa' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                             binAnalysis.scheme === 'Amex' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                             'bg-slate-700 text-slate-300 border-slate-600'
                          }`}>
                            {binAnalysis.scheme}
                          </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Expanded Analysis Panel */}
                  {binAnalysis && binAnalysis.scheme !== 'Unknown' && (
                     <div className="mt-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg animate-fade-in">
                        <div className="flex items-start gap-3">
                           <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                              <ShieldCheck className="w-4 h-4 text-indigo-400" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] uppercase text-slate-500 font-bold">Industry</span>
                                 <span className="text-[10px] text-slate-300">{binAnalysis.industry}</span>
                              </div>
                              <div className="w-full h-px bg-white/5 my-1"></div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] uppercase text-slate-500 font-bold">Length</span>
                                 <span className="text-[10px] text-slate-300">{bin.startsWith('34') || bin.startsWith('37') ? '15 Digits' : '16 Digits'}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}
                </div>

                {/* Quantity Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
                    <span>Quantity</span>
                    <span className="text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20 font-mono">{quantity}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all touch-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
                    <span>1</span>
                    <span className="cursor-pointer hover:text-indigo-400 p-2 -m-2" onClick={() => setQuantity(5)}>5</span>
                    <span>50</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={bin.length < 1}
                  className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <RefreshCw className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="relative z-10">Generate New Batch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-[600px] lg:h-[calc(100vh-120px)] animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="glass-panel flex-1 rounded-2xl overflow-hidden flex flex-col border border-white/10">
              
              {/* Toolbar */}
              <div className="px-4 md:px-6 py-4 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar max-w-full">
                  {/* View Toggles */}
                  <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700/50 shrink-0">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Billing Details Toggle */}
                  <button 
                    onClick={() => setDetailedBilling(!detailedBilling)}
                    className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        detailedBilling 
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                     {detailedBilling ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                     <span className="hidden sm:inline">{detailedBilling ? 'Detailed Billing' : 'Simplified'}</span>
                     <span className="sm:hidden">{detailedBilling ? 'Detail' : 'Simple'}</span>
                  </button>

                  <div className="h-4 w-px bg-slate-700 mx-1 hidden md:block"></div>
                  
                  <div className="text-sm font-medium text-slate-400 hidden md:block">
                    <span className="text-white font-mono">{cards.length}</span> Results
                  </div>
                </div>
                
                <button 
                  onClick={exportJSON}
                  className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-900/30 text-xs font-medium text-slate-300 hover:text-white transition-all border border-slate-700 hover:border-indigo-500/50"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]/40 p-4 lg:p-6">
                
                {viewMode === 'grid' ? (
                  // GRID VIEW
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                    {cards.map((card, index) => (
                        <GridItem 
                            key={card.id} 
                            card={card} 
                            bin={bin} 
                            detailedBilling={detailedBilling} 
                            copiedId={copiedId} 
                            onCopy={copyToClipboard} 
                        />
                    ))}
                  </div>
                ) : (
                  // LIST VIEW
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="sticky top-0 bg-[#0f172a] z-10 shadow-lg border-b border-white/5">
                        <tr className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            <th className="px-6 py-4">Identity Profile</th>
                            <th className="px-6 py-4 hidden md:table-cell">
                                {detailedBilling ? 'Detailed Address' : 'Contact & Address'}
                            </th>
                            <th className="px-6 py-4 text-center hidden sm:table-cell">Card Details</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                        {cards.map((card, index) => (
                            <ListItem 
                                key={card.id} 
                                card={card} 
                                index={index} 
                                detailedBilling={detailedBilling} 
                                copiedId={copiedId} 
                                onCopy={copyToClipboard} 
                            />
                        ))}
                        </tbody>
                    </table>
                  </div>
                )}
                
                {cards.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                        <CreditCard className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs tracking-widest uppercase opacity-50">System Standby</p>
                    </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600 font-mono">
                    SECURE SIMULATION ENVIRONMENT • {generatedAt.toLocaleTimeString()}
                </p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

export default App;