import React, { memo } from 'react';
import { Wifi, Landmark, ShieldCheck, Cpu } from 'lucide-react';
import { GeneratedCard } from '../types';

interface VisualCardProps {
  bin: string;
  previewCard?: GeneratedCard | null;
  className?: string;
  bankName?: string;
}

const MastercardLogo = () => (
  <svg viewBox="0 0 24 24" className="h-6 w-auto drop-shadow-md" fill="none">
    <circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.9"/>
    <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9"/>
    <path d="M12 16.6C13.5 15.5 14.5 13.9 14.5 12C14.5 10.1 13.5 8.5 12 7.4C10.5 8.5 9.5 10.1 9.5 12C9.5 13.9 10.5 15.5 12 16.6Z" fill="#FF5F00"/>
  </svg>
);

const VisaLogo = () => (
  <svg viewBox="0 0 36 12" className="h-4.5 w-auto drop-shadow-md" fill="none">
    <path d="M13.6 0.2L9 11.2H6L3.7 2.6C3.5 2 3.4 1.8 3 1.6C2.2 1.2 1.1 0.8 0.1 0.6L0.2 0.2H4.8C5.4 0.2 6 0.6 6.1 1.3L7.3 7.6L10.3 0.2H13.6ZM25.7 7.7C25.7 4.7 21.6 4.5 21.6 3.3C21.6 2.9 22 2.5 22.9 2.4C23.3 2.4 24.5 2.3 25.7 2.9L26.2 0.7C25.6 0.5 24.8 0.3 23.8 0.3C20.9 0.3 18.9 1.8 18.9 4.3C18.9 6.2 20.6 7.2 21.9 7.9C23.2 8.5 23.6 8.9 23.6 9.5C23.6 10.3 22.6 10.7 21.7 10.7C20.2 10.7 19.3 10.3 18.6 10L18.1 12.2C18.8 12.5 20.1 12.8 21.4 12.8C24.5 12.8 26.5 11.2 26.5 8.7L25.7 7.7ZM33.5 0.2H30.4C29.5 0.2 28.8 0.5 28.5 1.1L24.4 11.2H27.7L28.3 9.4H31.9L32.2 11.2H35.1L33.5 0.2ZM29.2 7L30.8 2.5L31.6 7H29.2ZM17.2 0.2L15 11.2H17.8L20 0.2H17.2Z" fill="white"/>
  </svg>
);

const AmexLogo = () => (
  <div className="bg-emerald-600 px-2 py-0.5 rounded text-[9px] font-black italic tracking-widest text-white border border-emerald-400/30">AMEX</div>
);

export const VisualCard = memo(({ bin, previewCard, className = "", bankName }: VisualCardProps) => {
  let gradient = "bg-gradient-to-br from-slate-800 via-slate-900 to-black";
  let LogoComponent = () => <span className="font-bold tracking-widest text-[10px] uppercase opacity-50 font-mono italic">GENERIC</span>;
  
  const checkBin = previewCard ? previewCard.number : bin;

  if (checkBin.startsWith('5')) {
    gradient = "bg-gradient-to-br from-[#1e293b] via-[#2d1b1b] to-[#450a0a]";
    LogoComponent = MastercardLogo;
  } else if (checkBin.startsWith('4')) {
    gradient = "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554]";
    LogoComponent = VisaLogo;
  } else if (checkBin.startsWith('34') || checkBin.startsWith('37')) {
    gradient = "bg-gradient-to-br from-[#064e3b] via-[#022c22] to-black";
    LogoComponent = AmexLogo;
  }

  let displayNumber = '•••• •••• •••• ••••';
  if (checkBin.startsWith('34') || checkBin.startsWith('37')) {
    const source = previewCard ? previewCard.number : bin.padEnd(15, '•');
    displayNumber = `${source.slice(0,4)} ${source.slice(4,10)} ${source.slice(10,15)}`;
  } else {
    const source = previewCard ? previewCard.number : bin.padEnd(16, '•');
    displayNumber = source.match(/.{1,4}/g)?.join(' ') || displayNumber;
  }

  return (
    <div 
      className={`relative w-full aspect-[1.586] rounded-[1.2rem] text-white shadow-2xl transition-all duration-500 ${gradient} border border-white/10 overflow-hidden group select-none ${className}`}
    >
      {/* Holographic Overlays */}
      <div className="absolute inset-0 holo-sheen opacity-30 pointer-events-none mix-blend-overlay"></div>
      
      <div className="relative z-10 h-full flex flex-col justify-between p-5 md:p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="h-6 flex items-center gap-2">
             <div className="p-1 bg-white/5 rounded border border-white/10 backdrop-blur-sm">
                <LogoComponent />
             </div>
             {bankName && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-black/30 rounded border border-white/5 text-[8px] font-bold uppercase text-white/50 tracking-wider">
                   <Landmark className="w-2.5 h-2.5 text-sky-400" /> {bankName}
                </div>
             )}
          </div>
          <div className="flex flex-col items-end gap-0.5">
             <Wifi className="w-6 h-6 opacity-30 rotate-90" />
             <div className="flex gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-sky-400 opacity-40" />
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500/20 animate-pulse"></div>
             </div>
          </div>
        </div>

        {/* Card Specifics */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-7">
               <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 rounded-md border border-yellow-200/30 shadow-inner"></div>
               <Cpu className="absolute inset-0 m-auto w-5 h-5 text-black/10" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          <div className="font-mono font-bold tracking-[0.1em] text-white/90 drop-shadow-md" 
               style={{ fontSize: '1.15rem' }}>
             {displayNumber}
          </div>

          {/* Footer Data */}
          <div className="flex justify-between items-end border-t border-white/5 pt-3">
            <div className="space-y-0.5 max-w-[60%]">
              <p className="text-[7px] uppercase font-black tracking-widest text-white/20">Cardholder</p>
              <p className="font-bold tracking-widest text-[10px] md:text-xs uppercase text-white/90 truncate">
                {previewCard ? previewCard.holderName : 'QUANTUM PROTOCOL'}
              </p>
            </div>
            
            <div className="flex gap-4">
                <div className="text-right">
                   <p className="text-[7px] uppercase font-black tracking-widest text-white/20">Expiry</p>
                   <p className="font-mono font-bold text-[10px] text-sky-300">
                     {previewCard ? `${previewCard.expiryMonth}/${previewCard.expiryYear.slice(-2)}` : 'XX/XX'}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[7px] uppercase font-black tracking-widest text-white/20">CVV</p>
                   <p className="font-mono font-bold text-[10px] text-yellow-500/80">
                     {previewCard ? previewCard.cvv : '•••'}
                   </p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});