import React from 'react';

export const OrientationLockUI: React.FC = () => {
    return (
        <div
            className="absolute inset-0 z-[100] flex items-center justify-center bg-[#1a1625] font-['Cairo']"
            dir="rtl"
            style={{
                paddingTop: 'env(safe-area-inset-top)',
                paddingBottom: 'env(safe-area-inset-bottom)',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
            }}
        >
            <div className="text-center px-6 max-w-sm">
                <div className="mb-6 flex items-center justify-center">
                    <svg
                        viewBox="0 0 100 100"
                        className="w-24 h-24 text-[#ffd700] animate-pulse"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                    >
                        <rect x="20" y="10" width="40" height="70" rx="6" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="40" cy="72" r="2" fill="currentColor" />
                        <path
                            d="M 70 50 Q 85 50 85 65 L 85 78"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-pulse"
                        />
                        <polyline
                            points="80 73 85 78 90 73"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-black text-white mb-2">اقلب الشاشة</h2>
                <p className="text-white/70 text-sm font-bold mb-4">
                    يرجى استخدام الوضع الأفقي للحصول على أفضل تجربة لعب
                </p>
                <p className="text-white/40 text-xs">
                    Rotate your device to landscape for the best gameplay experience
                </p>
            </div>
        </div>
    );
};
