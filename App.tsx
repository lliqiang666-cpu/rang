
import React, { useState, useRef, useEffect } from 'react';
import Wheel from './components/Wheel';
import PrizeManager from './components/PrizeManager';
import { Prize } from './types';
import { DEFAULT_PRIZES } from './constants';

declare const confetti: any;

const App: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetRotation, setTargetRotation] = useState(0);
  const [winner, setWinner] = useState<Prize | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  // 旋转时长（毫秒），默认 2000ms
  const [spinDuration, setSpinDuration] = useState(2000);
  // 动态派发奖品计数
  const [distributedCount, setDistributedCount] = useState(1284);
  
  const currentRotationRef = useRef(0);

  // 初始化一些模拟的中奖历史
  useEffect(() => {
    const initialHistory = Array.from({ length: 6 }).map(() => 
      `恭喜获得 ${DEFAULT_PRIZES[Math.floor(Math.random() * DEFAULT_PRIZES.length)].name}`
    );
    setHistory(initialHistory);
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setWinner(null);

    const totalRatio = prizes.reduce((sum, p) => sum + p.ratio, 0);
    const random = Math.random() * totalRatio;
    
    let cumulativeRatio = 0;
    let winnerIndex = -1;
    
    for (let i = 0; i < prizes.length; i++) {
      cumulativeRatio += prizes[i].ratio;
      if (random <= cumulativeRatio) {
        winnerIndex = i;
        break;
      }
    }

    const winningPrize = prizes[winnerIndex];
    let startAngle = 0;
    for (let i = 0; i < winnerIndex; i++) {
      startAngle += (prizes[i].ratio / totalRatio) * 360;
    }
    const sliceWidth = (winningPrize.ratio / totalRatio) * 360;
    const randomOffset = sliceWidth * 0.15 + Math.random() * (sliceWidth * 0.7);
    const winnerAngleOnWheel = startAngle + randomOffset;
    const rotationGoal = (270 - winnerAngleOnWheel + 360) % 360;
    
    const rotations = Math.max(10, Math.floor(spinDuration / 100) * 2);
    const baseExtraCircles = (rotations + Math.floor(Math.random() * 5)) * 360;
    
    const currentMod = currentRotationRef.current % 360;
    const delta = (rotationGoal - currentMod + 360) % 360;
    const nextRotation = currentRotationRef.current + baseExtraCircles + delta;
    
    setTargetRotation(nextRotation);
    currentRotationRef.current = nextRotation;

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(winningPrize);
      setHistory(prev => [`恭喜获得 ${winningPrize.name}`, ...prev.slice(0, 19)]);
      setDistributedCount(prev => prev + 1);
      
      // 触发五彩纸屑
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [winningPrize.color, '#ffffff', '#fbbf24']
      });
    }, spinDuration);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 flex flex-col items-center">
      <header className="text-center mb-8 relative w-full max-w-7xl">
        <h1 className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-300 to-white mb-2 drop-shadow-lg tracking-tighter">
          至尊锦鲤转盘
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-2"></div>
        <p className="text-indigo-400 font-bold tracking-[0.3em] uppercase text-xs opacity-80">EXPERIENCE YOUR LUCK TODAY</p>
      </header>

      <main className="w-full max-w-[1600px] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Stats & History */}
        <div className="hidden md:flex md:col-span-3 flex-col gap-6 sticky top-8">
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-sm font-black text-indigo-400 mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              实时播报
            </h3>
            <div className="h-64 overflow-hidden relative">
              <div className="winner-ticker flex flex-col gap-3">
                {[...history, ...history].map((item, i) => (
                  <div key={i} className="text-xs text-slate-400 bg-white/5 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                    <span className="text-indigo-400">●</span>
                    {item}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0f172a] to-transparent pointer-events-none"></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 text-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1 relative z-10">今日已派发奖品</p>
            <p className="text-3xl font-black text-white tabular-nums relative z-10 transition-all duration-300">
              {distributedCount.toLocaleString()} <span className="text-sm font-medium text-slate-400">份</span>
            </p>
            {isSpinning && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 transition-all duration-1000 animate-[loading_2s_infinite]" style={{width: '100%'}}></div>
            )}
          </div>
        </div>

        {/* Middle Column: Wheel */}
        <div className="md:col-span-6 flex flex-col items-center space-y-10">
          <div className="relative group floating">
            <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-[120px] transition-all duration-1000 ${isSpinning ? 'opacity-100 scale-125' : 'opacity-40 scale-100'}`}></div>
            <Wheel 
              prizes={prizes} 
              isSpinning={isSpinning} 
              onSpinEnd={(p) => setWinner(p)}
              targetRotation={targetRotation}
              spinDuration={spinDuration}
            />
          </div>
          
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className={`
                relative group overflow-hidden w-full py-6 rounded-2xl text-2xl font-black tracking-[0.4em] shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all duration-300
                ${isSpinning 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed scale-95' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 hover:shadow-[0_25px_60px_rgba(79,70,229,0.6)]'
                }
              `}
            >
              {!isSpinning && (
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></span>
              )}
              {isSpinning ? '幸运降临中...' : '立即开奖'}
            </button>

            {/* Winner Card */}
            <div className={`w-full transition-all duration-700 transform ${winner ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
              {winner && (
                <div className="glass-panel p-8 rounded-[2rem] text-center relative overflow-hidden ring-2 ring-indigo-500/30">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                  <div className="mb-2 text-yellow-500 text-[10px] font-black tracking-[0.5em] uppercase">Congratulations</div>
                  <h3 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 via-white to-yellow-500">
                    {winner.name}
                  </h3>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="md:col-span-3 flex justify-center sticky top-8">
          <PrizeManager 
            prizes={prizes} 
            onChange={setPrizes} 
            isSpinning={isSpinning}
            spinDuration={spinDuration}
            onSpinDurationChange={setSpinDuration}
          />
        </div>
      </main>

      <footer className="mt-auto py-12 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-4">
        <div className="h-px w-12 bg-slate-800"></div>
        至尊锦鲤 · 幸运工坊 · PRESTIGE WHEEL
        <div className="h-px w-12 bg-slate-800"></div>
      </footer>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes loading {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default App;
