import React, { memo } from 'react';
import { Wifi, Copy, Check, Landmark, ShieldCheck, Cpu } from 'lucide-react';
import { GeneratedCard } from '../types';

interface VisualCardProps {
  bin: string;
  previewCard?: GeneratedCard | null;
  className?: string;
  onClick?: () => void;
  isCopied?: boolean;
  bankName?: string;
}

const MastercardLogo = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-auto drop-shadow-md" fill="none">
    <circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.9"/>
    <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9"/>
    <path d="M12 16.6C13.5 15.5 14.5 13.9 14.5 12C14.5 10.1 13.5 8.5 12 7.4C10.5 8.5 9.5 10.1 9.5 12C9.5 13.9 10.5 15.5 12 16.6Z" fill="#FF5F00"/>
  </svg>
);

const VisaLogo = () => (
  <svg viewBox="0 0 36 12" className="h-5 w-auto drop-shadow-md" fill="none">
    <path d="M13.6 0.2L9 11.2H6L3.7 2.6C3.5 2 3.4 1.8 3 1.6C2.2 1.2 1.1 0.8 0.1 0.6L0.2 0.2H4.8C5.4 0.2 6 0.6 6.1 1.3L7.3 7.6L10.3 0.2H13.6ZM25.7 7.7C25.7 4.7 21.6 4.5 21.6 3.3C21.6 2.9 22 2.5 22.9 2.4C23.3 2.4 24.5 2.3 25.7 2.9L26.2 0.7C25.6 0.5 24.8 0.3 23.8 0.3C20.9 0.3 18.9 1.8 18.9 4.3C18.9 6.2 20.6 7.2 21.9 7.9C23.2 8.5 23.6 8.9 23.6 9.5C23.6 10.3 22.6 10.7 21.7 10.7C20.2 10.7 19.3 10.3 18.6 10L18.1 12.2C18.8 12.5 20.1 12.8 21.4 12.8C24.5 12.8 26.5 11.2 26.5 8.7L25.7 7.7ZM33.5 0.2H30.4C29.5 0.2 28.8 0.5 28.5 1.1L24.4 11.2H27.7L28.3 9.4H31.9L32.2 11.2H35.1L33.5 0.2ZM29.2 7L30.8 2.5L31.6 7H29.2ZM17.2 0.2L15 11.2H17.8L20 0.2H17.2Z" fill="white"/>
  </svg>
);

const AmexLogo = () => (
  <div className="bg-emerald-600 px-2.5 py-1 rounded text-[10px] font-black italic tracking-widest text-white border border-emerald-400/30 shadow-lg">AMEX</div>
);

export const VisualCard = memo(({ bin, previewCard, className = "", onClick, isCopied, bankName }: VisualCardProps) => {
  let gradient = "bg-gradient-to-br from-slate-800 via-slate-900 to-black";
  let LogoComponent = () => <span className="font-bold tracking-widest text-lg uppercase opacity-80 font-mono">GENERIC</span>;
  
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
      onClick={onClick}
      className={`relative w-full aspect-[1.586] rounded-[1.2rem] md:rounded-[1.6rem] text-white shadow-2xl transition-all duration-500 ${gradient} border border-white/10 overflow-hidden group ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    >
      {/* Click Feedback */}
      {isCopied && (
        <div className="absolute inset-0 bg-sky-500/90 z-50 flex flex-col items-center justify-center animate-fade-in backdrop-blur-xl">
            <Check className="w-12 h-12 text-white animate-bounce" />
            <span className="font-black text-xs uppercase tracking-[0.3em] mt-3">Node Synced</span>
        </div>
      )}

      {/* Holographic Overlays */}
      <div className="absolute inset-0 holo-sheen opacity-30 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8 select-none">
        
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="h-8 flex items-center gap-3">
             <div className="p-1.5 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
                <LogoComponent />
             </div>
             {bankName && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-black/30 rounded-md border border-white/5 text-[9px] font-bold uppercase text-white/60 tracking-wider">
                   <Landmark className="w-3 h-3 text-sky-400" /> {bankName}
                </div>
             )}
          </div>
          <div className="flex flex-col items-end gap-1">
             <Wifi className="w-7 h-7 opacity-30 rotate-90" />
             <div className="flex gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-400 opacity-40" />
                <div className="w-2 h-2 rounded-full bg-sky-500/20 animate-pulse"></div>
             </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative w-12 h-9 md:w-14 md:h-10">
               <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 rounded-lg border border-yellow-200/30 shadow-inner"></div>
               <div className="absolute inset-0 opacity-20 mix-blend-multiply flex flex-wrap gap-0.5 p-1">
                  {[...Array(9)].map((_, i) => <div key={i} className="flex-1 min-w-[30%] h-[30%] border-[0.5px] border-black"></div>)}
               </div>
               <Cpu className="absolute inset-0 m-auto w-6 h-6 text-black/20" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          <div className="font-mono font-bold tracking-[0.15em] text-white/95 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" 
               style={{ fontSize: 'clamp(1rem, 4vw, 1.4rem)' }}>
             {displayNumber}
          </div>

          {/* Bottom Data */}
          <div className="flex justify-between items-end border-t border-white/5 pt-4">
            <div className="space-y-1.5 max-w-[60%]">
              <p className="text-[9px] uppercase font-black tracking-[0.25em] text-white/30">Node Operator</p>
              <p className="font-extrabold tracking-widest text-xs md:text-sm uppercase text-white truncate drop-shadow-md">
                {previewCard ? previewCard.holderName : 'QUANTUM GHOST'}
              </p>
            </div>
            
            <div className="flex gap-6 md:gap-8">
                <div className="text-right">
                   <p className="text-[9px] uppercase font-black tracking-[0.25em] text-white/30">Validity</p>
                   <p className="font-mono font-bold text-xs md:text-sm text-sky-300">
                     {previewCard ? `${previewCard.expiryMonth}/${previewCard.expiryYear.slice(-2)}` : 'XX/XX'}
                   </p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] uppercase font-black tracking-[0.25em] text-white/30">Auth</p>
                   <p className="font-mono font-bold text-xs md:text-sm text-yellow-500">
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