import React, { memo } from 'react';
import { Wifi, Copy, Check } from 'lucide-react';
import { GeneratedCard } from '../types';

interface VisualCardProps {
  bin: string;
  previewCard?: GeneratedCard | null;
  className?: string;
  onClick?: () => void;
  isCopied?: boolean;
}

// --- Brand Logos ---

const MastercardLogo = () => (
  <svg viewBox="0 0 24 24" className="h-8 w-auto" fill="none">
    <circle cx="7" cy="12" r="7" fill="#EB001B" fillOpacity="0.9"/>
    <circle cx="17" cy="12" r="7" fill="#F79E1B" fillOpacity="0.9"/>
    <path d="M12 16.6C13.5 15.5 14.5 13.9 14.5 12C14.5 10.1 13.5 8.5 12 7.4C10.5 8.5 9.5 10.1 9.5 12C9.5 13.9 10.5 15.5 12 16.6Z" fill="#FF5F00"/>
  </svg>
);

const VisaLogo = () => (
  <svg viewBox="0 0 36 12" className="h-6 w-auto" fill="none">
    <path d="M13.6 0.2L9 11.2H6L3.7 2.6C3.5 2 3.4 1.8 3 1.6C2.2 1.2 1.1 0.8 0.1 0.6L0.2 0.2H4.8C5.4 0.2 6 0.6 6.1 1.3L7.3 7.6L10.3 0.2H13.6ZM25.7 7.7C25.7 4.7 21.6 4.5 21.6 3.3C21.6 2.9 22 2.5 22.9 2.4C23.3 2.4 24.5 2.3 25.7 2.9L26.2 0.7C25.6 0.5 24.8 0.3 23.8 0.3C20.9 0.3 18.9 1.8 18.9 4.3C18.9 6.2 20.6 7.2 21.9 7.9C23.2 8.5 23.6 8.9 23.6 9.5C23.6 10.3 22.6 10.7 21.7 10.7C20.2 10.7 19.3 10.3 18.6 10L18.1 12.2C18.8 12.5 20.1 12.8 21.4 12.8C24.5 12.8 26.5 11.2 26.5 8.7L25.7 7.7ZM33.5 0.2H30.4C29.5 0.2 28.8 0.5 28.5 1.1L24.4 11.2H27.7L28.3 9.4H31.9L32.2 11.2H35.1L33.5 0.2ZM29.2 7L30.8 2.5L31.6 7H29.2ZM17.2 0.2L15 11.2H17.8L20 0.2H17.2Z" fill="white"/>
  </svg>
);

const AmexLogo = () => (
  <svg viewBox="0 0 40 40" className="h-8 w-auto" fill="none">
    <rect width="40" height="40" rx="4" fill="#2E7D32" /> 
    <path d="M10 28H14L16 22H20L22 28H26L18 8H14L6 28H10ZM28 28H32V22H36V18H32V12H38V8H28V28Z" fill="white" fillOpacity="0.9"/>
    <path d="M20 20C20 20 18 15 16 12C14 15 12 20 12 20" stroke="white" strokeWidth="1"/>
  </svg>
);

const JCBLogo = () => (
  <svg viewBox="0 0 38 24" className="h-7 w-auto" fill="none">
    <rect x="0" y="0" width="12" height="24" rx="2" fill="#005CB9"/>
    <rect x="13" y="0" width="12" height="24" rx="2" fill="#CA001B"/>
    <rect x="26" y="0" width="12" height="24" rx="2" fill="#008D36"/>
    <path d="M19 6C17 6 16 7 16 9V15C16 17 17 18 19 18C21 18 22 17 22 15V13H19V11H24V15C24 19 22 20 19 20C16 20 14 19 14 15V9C14 5 16 4 19 4C22 4 24 5 24 9V10H22V9C22 7 21 6 19 6Z" fill="white"/>
    <path d="M6 6H9V9H11V11H9V15C9 16 9.5 16 10 16H11V18H10C8 18 7 17 7 15V11H5V9H7V6Z" fill="white"/>
    <path d="M32 6H29V20H32C34 20 35 19 35 16V14H32V16H31V8H32V12H35V10C35 7 34 6 32 6Z" fill="white"/>
  </svg>
);

const UnionPayLogo = () => (
  <svg viewBox="0 0 45 28" className="h-7 w-auto" fill="none">
    <rect x="0" y="0" width="15" height="28" fill="#EB001B" transform="skewX(-10)"/>
    <rect x="16" y="0" width="15" height="28" fill="#007F3E" transform="skewX(-10)"/>
    <rect x="32" y="0" width="15" height="28" fill="#00A0E9" transform="skewX(-10)"/>
    <path d="M36 8C36 8 38 8 39 10C40 12 40 14 38 16C37 17 35 17 35 17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const RuPayLogo = () => (
  <svg viewBox="0 0 60 20" className="h-7 w-auto" fill="none">
    <path d="M10 2L15 10L10 18" stroke="#F58220" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 2L23 10L18 18" stroke="#009C3B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <text x="30" y="15" fill="white" fontSize="16" fontWeight="bold" fontFamily="sans-serif">RuPay</text>
  </svg>
);

// --- Component ---

export const VisualCard = memo(({ bin, previewCard, className = "", onClick, isCopied }: VisualCardProps) => {
  let gradient = "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900";
  let LogoComponent = () => <span className="font-bold tracking-widest text-lg uppercase opacity-80 font-mono">UNKNOWN</span>;
  let textColor = "text-white/90";
  
  const checkBin = previewCard ? previewCard.number : bin;

  // Determine Identity
  if (checkBin.startsWith('5')) {
    // Mastercard
    gradient = "bg-gradient-to-br from-[#1a1f35] via-[#2b1212] to-[#450a0a] border-t border-orange-500/20";
    LogoComponent = MastercardLogo;
  } else if (checkBin.startsWith('4')) {
    // Visa
    gradient = "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#172554] border-t border-blue-400/30";
    LogoComponent = VisaLogo;
  } else if (checkBin.startsWith('34') || checkBin.startsWith('37')) {
    // Amex
    gradient = "bg-gradient-to-br from-slate-800 via-[#354f41] to-[#1e2e26] border-t border-emerald-400/30";
    LogoComponent = AmexLogo;
  } else if (checkBin.startsWith('35')) {
     // JCB
     gradient = "bg-gradient-to-br from-indigo-950 via-slate-900 to-rose-950 border-t border-indigo-400/30";
     LogoComponent = JCBLogo;
  } else if (checkBin.startsWith('62')) {
     // UnionPay (China) - often holographic silver/blue/red mix
     gradient = "bg-gradient-to-br from-slate-800 via-cyan-900 to-blue-950 border-t border-cyan-400/30";
     LogoComponent = UnionPayLogo;
  } else if (checkBin.startsWith('60') || checkBin.startsWith('65') || checkBin.startsWith('81') || checkBin.startsWith('82') || checkBin.startsWith('508')) {
     // RuPay (India) - Vibrant Orange/Green/White hints
     gradient = "bg-gradient-to-br from-slate-900 via-orange-950 to-green-950 border-t border-orange-400/30";
     LogoComponent = RuPayLogo;
  }

  // Format Display Number
  let displayNumber = '•••• •••• •••• ••••';
  if (checkBin.startsWith('34') || checkBin.startsWith('37')) {
    // Amex spacing: 4-6-5 (Total 15)
    if (previewCard) {
      displayNumber = `${previewCard.number.slice(0,4)} ${previewCard.number.slice(4,10)} ${previewCard.number.slice(10,15)}`;
    } else {
      const padded = bin.padEnd(15, '•');
      displayNumber = `${padded.slice(0,4)} ${padded.slice(4,10)} ${padded.slice(10,15)}`;
    }
  } else {
    // Standard 16 spacing
    const source = previewCard ? previewCard.number : bin.padEnd(16, '•');
    displayNumber = source.match(/.{1,4}/g)?.join(' ') || displayNumber;
  }

  return (
    <div 
      onClick={onClick}
      className={`relative w-full aspect-[1.586] rounded-2xl text-white shadow-2xl transition-all duration-500 ${gradient} border border-white/10 overflow-hidden group hover:scale-[1.01] hover:shadow-primary-500/30 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    >
      
      {/* Click Overlay */}
      {onClick && (
        <div className={`absolute inset-0 bg-black/60 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]`}>
           <div className={`transform transition-transform duration-300 ${isCopied ? 'scale-110' : 'scale-90 group-hover:scale-100'}`}>
              {isCopied ? (
                <div className="flex flex-col items-center text-emerald-400">
                  <div className="p-3 bg-emerald-500/20 rounded-full border border-emerald-500/50 mb-2">
                    <Check className="w-8 h-8" />
                  </div>
                  <span className="font-bold text-sm tracking-wider uppercase">Copied!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-white">
                   <Copy className="w-8 h-8 mb-2 opacity-80" />
                   <span className="font-bold text-sm tracking-wider uppercase">Copy Identity</span>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Holographic Sheen */}
      <div className="absolute inset-0 holo-sheen opacity-40 pointer-events-none mix-blend-overlay group-hover:opacity-60 transition-opacity duration-500"></div>
      
      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

      <div className="relative z-10 h-full flex flex-col justify-between p-5 lg:p-6 select-none">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="filter drop-shadow-lg opacity-90 h-8 flex items-center">
            <LogoComponent />
          </div>
          <Wifi className="w-5 h-5 md:w-7 md:h-7 opacity-60 rotate-90 drop-shadow-sm text-white/80" />
        </div>

        {/* Core Card Content */}
        <div className="space-y-3 lg:space-y-5">
          <div className="flex items-center gap-3">
            {/* Realistic Chip */}
            <div className="w-10 h-7 lg:w-12 lg:h-9 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-600 rounded-md flex items-center justify-center shadow-lg border border-yellow-300/40 relative overflow-hidden">
               <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
               {/* Chip Lines */}
               <svg viewBox="0 0 40 30" className="w-full h-full opacity-60 mix-blend-multiply">
                 <path d="M0 15H40 M20 0V30 M10 15H30" stroke="#713f12" strokeWidth="0.5" fill="none"/>
                 <rect x="12" y="8" width="16" height="14" rx="2" stroke="#713f12" strokeWidth="0.5" fill="none" />
               </svg>
            </div>
            <div className="hidden lg:block">
                <Wifi className="w-4 h-4 opacity-30" />
            </div>
          </div>

          {/* Number Display */}
          <div className={`font-mono font-medium tracking-widest drop-shadow-lg ${textColor} whitespace-nowrap`} 
               style={{ 
                 textShadow: '0 2px 4px rgba(0,0,0,0.4)',
                 fontSize: 'clamp(1rem, 5cqw, 1.5rem)'
               }}>
             <span className="text-lg lg:text-2xl">{displayNumber}</span>
          </div>

          {/* Footer Info: User + Valid Thru + CVV */}
          <div className="flex justify-between items-end">
            <div className="space-y-0.5 overflow-hidden max-w-[50%]">
              <p className="text-[7px] lg:text-[9px] uppercase opacity-70 tracking-widest text-slate-200">Authorized Player</p>
              <p className="font-medium tracking-widest text-xs lg:text-sm uppercase text-white/95 shadow-black drop-shadow-md truncate" title={previewCard?.holderName || "NOVA IDENTITY"}>
                {previewCard ? previewCard.holderName : 'NOVA IDENTITY'}
              </p>
            </div>
            
            <div className="flex gap-4 md:gap-6 shrink-0">
                <div className="space-y-0.5 text-right">
                   <p className="text-[7px] lg:text-[9px] uppercase opacity-70 tracking-widest text-slate-200">Expiry</p>
                   <p className="font-mono font-bold tracking-wider text-xs lg:text-sm text-white/95 drop-shadow-md">
                     {previewCard ? `${previewCard.expiryMonth}/${previewCard.expiryYear.slice(-2)}` : 'MM/YY'}
                   </p>
                </div>
                <div className="space-y-0.5 text-right">
                   <p className="text-[7px] lg:text-[9px] uppercase opacity-70 tracking-widest text-slate-200">CVV</p>
                   <p className="font-mono font-bold tracking-wider text-xs lg:text-sm text-yellow-400 drop-shadow-md">
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