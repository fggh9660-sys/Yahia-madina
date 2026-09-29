import React from 'react';
import { StageResultsData } from '../types';
import { t as translate } from '../i18n';
import { useLanguage } from '../i18n/useLanguage';

interface StageResultsUIProps {
  data: StageResultsData;
  onContinue: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? translate('time.minutesSeconds', { m, s }) : translate('time.seconds', { s });
}

export const StageResultsUI: React.FC<StageResultsUIProps> = ({ data, onContinue }) => {
  const { t, dir } = useLanguage();

  return (
    <div dir={dir} className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm font-['Cairo'] p-4 animate-in fade-in duration-500">
      <div className="bg-[#1a1625] border-2 border-[#ffd700]/60 rounded-3xl shadow-[0_0_60px_rgba(255,215,0,0.2)] max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#ffd700]/20 to-transparent px-6 py-5 border-b border-[#ffd700]/30">
          <h2 className="text-[#ffd700] text-xl font-black tracking-wide text-center">
            {t('results.complete')}
          </h2>
          <p className="text-white/90 text-lg font-bold text-center mt-1">
            {t(data.stageNameKey)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center">
            <span className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">{t('results.distance')}</span>
            <span className="text-white text-2xl font-black font-mono">{Math.floor(data.distance)}<span className="text-sm text-white/60 ms-0.5">{t('hud.meters')}</span></span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center">
            <span className="text-yellow-400/70 text-xs uppercase tracking-wider font-bold mb-1">{t('results.stars')}</span>
            <span className="text-yellow-400 text-2xl font-black">{data.stars}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center">
            <span className="text-green-400/70 text-xs uppercase tracking-wider font-bold mb-1">{t('results.correct')}</span>
            <span className="text-green-400 text-2xl font-black">{data.correctAnswers}</span>
          </div>
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center">
            <span className="text-red-400/70 text-xs uppercase tracking-wider font-bold mb-1">{t('results.wrong')}</span>
            <span className="text-red-400 text-2xl font-black">{data.wrongAnswers}</span>
          </div>
          <div className="col-span-2 bg-white/5 rounded-xl p-4 border border-white/10 flex flex-col items-center">
            <span className="text-white/50 text-xs uppercase tracking-wider font-bold mb-1">{t('results.time')}</span>
            <span className="text-white text-xl font-black">{formatTime(data.timeSeconds)}</span>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onContinue}
            className="w-full py-4 bg-[#ffd700] hover:bg-[#ffe44d] text-[#1a1625] font-black text-lg rounded-2xl transition-all duration-200 shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('results.continue')}
          </button>
        </div>
      </div>
    </div>
  );
};
