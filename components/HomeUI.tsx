import React from 'react';

interface HomeUIProps {
    onStart: () => void;
}

export const HomeUI: React.FC<HomeUIProps> = ({ onStart }) => {
    return (
        <div
            className="absolute inset-0 overflow-y-auto z-20 font-['Cairo']"
            style={{
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                paddingLeft: 'max(1rem, env(safe-area-inset-left))',
                paddingRight: 'max(1rem, env(safe-area-inset-right))',
            }}
        >
            <div className="min-h-full flex flex-col items-center justify-center gap-3 [@media(max-height:500px)]:gap-2 md:gap-16 px-4 py-4 md:py-12">

                {/* Top Section: Title & Branding */}
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="relative mb-1 [@media(max-height:500px)]:mb-0 md:mb-4">
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-yellow-400 rounded-full blur-2xl opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                        <span className="text-2xl [@media(max-height:500px)]:text-xl md:text-4xl">🏰</span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl [@media(max-height:500px)]:text-3xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#fdb931] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tight">
                        مدينة العلم
                    </h1>
                </div>

                {/* Bottom Section: Call to Action */}
                <div className="flex flex-col items-center w-full max-w-md animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300 relative z-10">

                    {/* Instructions Bubble */}
                    <div className="relative bg-[#1a1625]/80 backdrop-blur-md border border-[#ffd700]/30 rounded-2xl p-3 [@media(max-height:500px)]:p-2 md:p-6 text-center mb-3 [@media(max-height:500px)]:mb-2 md:mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#1a1625] border-t border-l border-[#ffd700]/30 rotate-45"></div>
                        <p className="text-[#ffd700] text-sm [@media(max-height:500px)]:text-xs md:text-lg font-bold mb-1 dir-rtl">
                            ...افتح الكتاب السحري 📚
                        </p>
                        <p className="text-white/70 text-[10px] [@media(max-height:500px)]:hidden md:text-sm md:inline-block">
                            وانطلق في رحلة عبر مدينة مليئة بالأسرار
                        </p>
                    </div>

                    {/* Main Action Button */}
                    <button
                        type="button"
                        onClick={onStart}
                        className="group relative w-full py-3 [@media(max-height:500px)]:py-2 md:py-6 bg-gradient-to-r from-[#ffbf00] to-[#ff9100] rounded-full shadow-[0_0_40px_rgba(255,165,0,0.4)] overflow-hidden transition-transform transform hover:scale-105 active:scale-95 cursor-pointer touch-manipulation"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>

                        <div className="relative flex items-center justify-center gap-2 md:gap-4 pointer-events-none">
                            <span className="text-[#1a1625] text-base [@media(max-height:500px)]:text-sm md:text-2xl font-black uppercase tracking-wider">
                                ابدأ المغامرة
                            </span>
                            <span className="text-base [@media(max-height:500px)]:text-sm md:text-2xl group-hover:-translate-x-2 transition-transform">🚀</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};