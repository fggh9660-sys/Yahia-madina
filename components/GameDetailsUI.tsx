import React, { useEffect, useRef } from 'react';

interface GameDetailsUIProps {
    onNext: () => void;
}

export const GameDetailsUI: React.FC<GameDetailsUIProps> = ({ onNext }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, []);
    
    const items = [
        {
            text: "اجمع النجوم +10",
            icon: "⭐",
            bg: "bg-[#1e1b2e]",
            border: "border-yellow-500/30",
            iconBg: "bg-yellow-500/20 text-yellow-400",
            glow: "shadow-yellow-500/10"
        },
        {
            text: "افتح البوابات السحرية",
            icon: "🚪", 
            bg: "bg-[#1e1b2e]",
            border: "border-purple-500/30",
            iconBg: "bg-purple-500/20 text-purple-400",
            glow: "shadow-purple-500/10"
        },
        {
            text: "احذر من العقبات!",
            icon: "⚠️",
            bg: "bg-[#1e1b2e]",
            border: "border-red-500/30",
            iconBg: "bg-red-500/20 text-red-400",
            glow: "shadow-red-500/10"
        }
    ];

    return (
        <div
            ref={scrollRef}
            className="absolute inset-0 z-50 overflow-y-auto bg-[#151120] font-['Cairo']"
            dir="rtl"
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
            }}
        >

            {/* Background Atmosphere */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
                 <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse"></div>
                 <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto px-5 py-6 md:py-10 min-h-full flex flex-col">

                {/* Title Section */}
                <div className="text-center mb-5 md:mb-8 shrink-0 animate-in zoom-in duration-500">
                    <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#ff9100] drop-shadow-sm mb-2 md:mb-3 tracking-tight">
                        مغامرة العلم
                    </h1>
                    <p className="text-gray-400 text-xs md:text-base font-bold leading-relaxed max-w-xs mx-auto">
                        اجري في شوارع المدينة القديمة واجمع المعرفة!
                    </p>
                </div>

                {/* Legend Items List */}
                <div className="w-full space-y-3 md:space-y-4 mb-6 md:mb-10">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className={`relative ${item.bg} border ${item.border} rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4 shadow-lg ${item.glow} animate-in slide-in-from-right-8 transition-transform hover:scale-[1.02]`}
                            style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'backwards' }}
                        >
                             <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${item.iconBg} flex items-center justify-center text-lg md:text-xl shrink-0 shadow-inner`}>
                                {item.icon}
                            </div>

                            <div className="flex-1">
                                <h3 className="text-white text-base md:text-lg font-bold tracking-wide">
                                    {item.text}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    className="mt-auto w-full py-3.5 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-[#1a1625] text-lg md:text-xl font-black shadow-[0_4px_20px_rgba(255,165,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 delay-500 cursor-pointer touch-manipulation"
                >
                    ابدأ المغامرة
                </button>

            </div>
        </div>
    );
};