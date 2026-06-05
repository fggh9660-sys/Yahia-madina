import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    MiniChallenge,
    ColorMatchData,
    FruitMatchData,
    PairMatchData,
    ObjectOrderData,
    EVENT_META,
} from '../game/data/miniChallenges';

interface Props {
    challenge: MiniChallenge;
    onAnswer: (isCorrect: boolean) => void;
}

/**
 * M3A: shared modal shell for all 4 mini-challenge types.
 * Pauses gameplay (handled in MainScene before this renders) + tap-anywhere outside the
 * card does nothing (must complete the challenge to dismiss).
 */
export const MiniChallengeModal: React.FC<Props> = ({ challenge, onAnswer }) => {
    return (
        <div
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300"
            dir="rtl"
        >
            <div className="bg-gradient-to-b from-[#2a1d3a] to-[#1a1625] border-2 border-[#ffd700]/60 rounded-2xl p-4 md:p-5 max-w-md w-full max-h-[92vh] overflow-y-auto shadow-[0_0_60px_rgba(255,215,0,0.25)] animate-in zoom-in-95 duration-300">
                {challenge.event && (
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-xl">{EVENT_META[challenge.event].icon}</span>
                        <span className="text-[#ffd700]/80 text-[10px] md:text-xs font-bold tracking-wide uppercase">
                            {EVENT_META[challenge.event].label}
                        </span>
                    </div>
                )}
                <h3 className="text-[#ffd66b] text-base md:text-lg font-black text-center mb-3">
                    {challenge.prompt}
                </h3>
                {challenge.data.kind === 'COLOR_MATCH' && (
                    <ColorMatchUI data={challenge.data} onAnswer={onAnswer} />
                )}
                {challenge.data.kind === 'FRUIT_MATCH' && (
                    <FruitMatchUI data={challenge.data} onAnswer={onAnswer} />
                )}
                {challenge.data.kind === 'PAIR_MATCH' && (
                    <PairMatchUI data={challenge.data} onAnswer={onAnswer} />
                )}
                {challenge.data.kind === 'OBJECT_ORDER' && (
                    <ObjectOrderUI data={challenge.data} onAnswer={onAnswer} />
                )}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// COLOR MATCH — pick the swatch matching targetColor
// ─────────────────────────────────────────────────────────────
const ColorMatchUI: React.FC<{ data: ColorMatchData; onAnswer: (c: boolean) => void }> = ({ data, onAnswer }) => {
    const [picked, setPicked] = useState<string | null>(null);
    const handlePick = (color: string) => {
        if (picked) return;
        setPicked(color);
        setTimeout(() => onAnswer(color === data.targetColor), 600);
    };
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="text-white/80 text-sm mb-1">اللون المطلوب</div>
            <div
                className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg"
                style={{ background: data.targetColor }}
            />
            <div className="grid grid-cols-4 gap-3 mt-3 w-full">
                {data.options.map((c, i) => {
                    const isPicked = picked === c;
                    const isCorrect = c === data.targetColor;
                    const ring =
                        picked && isPicked
                            ? isCorrect
                                ? 'ring-4 ring-emerald-400'
                                : 'ring-4 ring-red-400'
                            : 'ring-2 ring-white/20';
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={!!picked}
                            onClick={() => handlePick(c)}
                            className={`aspect-square rounded-xl shadow-md ${ring} cursor-pointer touch-manipulation transition-transform active:scale-95`}
                            style={{ background: c }}
                            aria-label={`color-${i}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// FRUIT MATCH — drag the matching fruit onto its silhouette (M3B rework per Yahia ref).
// Pointer-event based (not HTML5 DnD) so it works on iOS Safari touch.
// ─────────────────────────────────────────────────────────────
const FruitMatchUI: React.FC<{ data: FruitMatchData; onAnswer: (c: boolean) => void }> = ({ data, onAnswer }) => {
    const [dragging, setDragging] = useState<{ fruit: string; x: number; y: number } | null>(null);
    const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
    const silRef = useRef<HTMLDivElement>(null);

    const startDrag = (fruit: string, e: React.PointerEvent) => {
        if (result) return;
        setDragging({ fruit, x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        if (!dragging) return;
        const move = (e: PointerEvent) =>
            setDragging(d => (d ? { ...d, x: e.clientX, y: e.clientY } : d));
        const up = (e: PointerEvent) => {
            const fruit = dragging.fruit;
            const sil = silRef.current?.getBoundingClientRect();
            const over =
                !!sil &&
                e.clientX >= sil.left && e.clientX <= sil.right &&
                e.clientY >= sil.top && e.clientY <= sil.bottom;
            setDragging(null);
            if (over) {
                const correct = fruit === data.targetFruit;
                setResult(correct ? 'correct' : 'wrong');
                setTimeout(() => onAnswer(correct), 750);
            }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
        };
    }, [dragging, data.targetFruit, onAnswer]);

    const placed = result !== null;

    return (
        <div className="flex flex-col items-center gap-5 select-none" style={{ touchAction: 'none' }}>
            <div className="text-white/80 text-sm">اسحب الفاكهة الصحيحة إلى الظل</div>

            {/* Silhouette drop target — shows the target fruit as a dark shadow until matched */}
            <div
                ref={silRef}
                className={`w-24 h-24 rounded-2xl border-2 border-dashed flex items-center justify-center text-6xl transition-all duration-200 ${
                    result === 'correct'
                        ? 'border-emerald-400 bg-emerald-400/10 scale-105'
                        : result === 'wrong'
                        ? 'border-red-400 bg-red-400/10'
                        : 'border-white/40 bg-white/5'
                }`}
            >
                {result === 'wrong' ? (
                    <span>❌</span>
                ) : (
                    <span
                        style={{
                            filter: result === 'correct' ? 'none' : 'brightness(0) invert(0.22)',
                            opacity: result === 'correct' ? 1 : 0.85,
                        }}
                    >
                        {data.targetFruit}
                    </span>
                )}
            </div>

            {/* Fruit options to drag */}
            <div className="grid grid-cols-4 gap-3 w-full">
                {data.options.map((f, i) => (
                    <button
                        key={i}
                        type="button"
                        disabled={placed}
                        onPointerDown={e => startDrag(f, e)}
                        className={`aspect-square rounded-xl bg-white/5 ring-2 ring-white/20 flex items-center justify-center text-4xl touch-manipulation transition-opacity ${
                            dragging?.fruit === f ? 'opacity-30' : ''
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Floating fruit that follows the pointer while dragging */}
            {dragging && (
                <div
                    className="fixed pointer-events-none text-5xl z-[70] drop-shadow-lg"
                    style={{ left: dragging.x, top: dragging.y, transform: 'translate(-50%, -50%)' }}
                >
                    {dragging.fruit}
                </div>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// PAIR MATCH — memory cards
// ─────────────────────────────────────────────────────────────
const PairMatchUI: React.FC<{ data: PairMatchData; onAnswer: (c: boolean) => void }> = ({ data, onAnswer }) => {
    const cards = useMemo(() => {
        const doubled = [...data.icons, ...data.icons];
        return doubled.sort(() => Math.random() - 0.5);
    }, [data.icons]);
    const [flipped, setFlipped] = useState<number[]>([]);
    const [matched, setMatched] = useState<number[]>([]);
    const [locked, setLocked] = useState(false);
    const totalPairs = data.icons.length;

    useEffect(() => {
        if (matched.length === totalPairs * 2) {
            setTimeout(() => onAnswer(true), 500);
        }
    }, [matched, totalPairs, onAnswer]);

    const handleFlip = (idx: number) => {
        if (locked || flipped.includes(idx) || matched.includes(idx)) return;
        const nextFlipped = [...flipped, idx];
        setFlipped(nextFlipped);
        if (nextFlipped.length === 2) {
            setLocked(true);
            const [a, b] = nextFlipped;
            if (cards[a] === cards[b]) {
                setTimeout(() => {
                    setMatched(m => [...m, a, b]);
                    setFlipped([]);
                    setLocked(false);
                }, 400);
            } else {
                setTimeout(() => {
                    setFlipped([]);
                    setLocked(false);
                }, 800);
            }
        }
    };

    const cols = data.gridSize === 2 ? 'grid-cols-2' : 'grid-cols-3';
    const gridMax = data.gridSize === 2 ? 'max-w-[240px]' : 'max-w-[300px]';
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="text-white/70 text-xs">ابحث عن الأزواج</div>
            <div className={`grid ${cols} gap-2 w-full ${gridMax} mx-auto`}>
                {cards.map((icon, i) => {
                    const isShown = flipped.includes(i) || matched.includes(i);
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={isShown || locked}
                            onClick={() => handleFlip(i)}
                            className={`aspect-square rounded-xl flex items-center justify-center text-2xl md:text-3xl cursor-pointer touch-manipulation transition-all duration-200 ${
                                isShown
                                    ? 'bg-[#ffd700]/15 border-2 border-[#ffd700]/60'
                                    : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                            }`}
                        >
                            {isShown ? icon : '❓'}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// OBJECT ORDER — tap items to add to the answer slot in order
// ─────────────────────────────────────────────────────────────
const ObjectOrderUI: React.FC<{ data: ObjectOrderData; onAnswer: (c: boolean) => void }> = ({ data, onAnswer }) => {
    const shuffledItems = useMemo(() => {
        const indexed = data.items.map((item, i) => ({ item, originalIndex: i }));
        return indexed.sort(() => Math.random() - 0.5);
    }, [data.items]);
    const [answer, setAnswer] = useState<number[]>([]); // stores originalIndex sequence

    const handlePick = (originalIndex: number) => {
        if (answer.includes(originalIndex)) return;
        const next = [...answer, originalIndex];
        setAnswer(next);
        if (next.length === data.items.length) {
            const isCorrect = next.every((idx, i) => idx === data.correctOrder[i]);
            setTimeout(() => onAnswer(isCorrect), 600);
        }
    };

    const handleReset = () => {
        setAnswer([]);
    };

    return (
        <div className="flex flex-col items-center gap-3">
            {data.hint && <div className="text-white/70 text-xs">{data.hint}</div>}
            {/* Answer slots */}
            <div className="flex gap-2 mb-2">
                {data.items.map((_, i) => {
                    const filled = answer[i] !== undefined ? data.items[answer[i]] : null;
                    return (
                        <div
                            key={i}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 flex items-center justify-center text-2xl md:text-3xl ${
                                filled ? 'bg-[#ffd700]/15 border-[#ffd700]/60' : 'bg-white/5 border-white/20'
                            }`}
                        >
                            {filled || ''}
                        </div>
                    );
                })}
            </div>
            {/* Pickable items */}
            <div className="flex gap-2 flex-wrap justify-center">
                {shuffledItems.map(({ item, originalIndex }) => {
                    const used = answer.includes(originalIndex);
                    return (
                        <button
                            key={originalIndex}
                            type="button"
                            disabled={used}
                            onClick={() => handlePick(originalIndex)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center text-2xl md:text-3xl cursor-pointer touch-manipulation transition-transform active:scale-95 ${
                                used
                                    ? 'bg-white/5 opacity-30'
                                    : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                            }`}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>
            {answer.length > 0 && answer.length < data.items.length && (
                <button
                    type="button"
                    onClick={handleReset}
                    className="mt-1 px-3 py-1 text-xs text-white/60 hover:text-white border border-white/20 rounded-full"
                >
                    إعادة
                </button>
            )}
        </div>
    );
};
