
import React, { useState } from 'react';
import { Prize } from '../types';
import { COLORS } from '../constants';

interface PrizeManagerProps {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
  isSpinning: boolean;
  spinDuration: number;
  onSpinDurationChange: (duration: number) => void;
}

const PrizeManager: React.FC<PrizeManagerProps> = ({ 
  prizes, 
  onChange, 
  isSpinning, 
  spinDuration, 
  onSpinDurationChange 
}) => {
  const [newName, setNewName] = useState('');
  const [newRatio, setNewRatio] = useState(1);

  const addPrize = () => {
    if (!newName.trim()) return;
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: newName,
      ratio: newRatio,
      color: COLORS[prizes.length % COLORS.length],
    };
    onChange([...prizes, newPrize]);
    setNewName('');
    setNewRatio(1);
  };

  const removePrize = (id: string) => {
    if (prizes.length <= 2) return;
    onChange(prizes.filter(p => p.id !== id));
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    onChange(prizes.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const totalRatio = prizes.reduce((sum, p) => sum + p.ratio, 0);

  // 将毫秒转换为更直观的速度描述
  const getSpeedLabel = (ms: number) => {
    if (ms <= 1000) return '极致狂飙';
    if (ms <= 2000) return '飞速旋转';
    if (ms <= 3500) return '标准速度';
    return '平稳匀速';
  };

  return (
    <div className="glass-panel p-6 rounded-[2rem] w-full max-w-md flex flex-col max-h-[850px] relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-lg text-sm">
            ⚙️
          </span>
          控制台
        </h2>
        <span className="text-[10px] font-black text-slate-500 bg-black/40 px-3 py-1 rounded-full border border-white/5 uppercase">
          Items: {prizes.length}
        </span>
      </div>

      {/* 旋转速度配置 */}
      <div className="mb-6 bg-white/[0.03] p-4 rounded-2xl border border-white/5">
        <div className="flex justify-between items-center mb-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            旋转时长: <span className="text-indigo-400">{spinDuration}ms</span>
          </label>
          <span className="text-[10px] font-bold text-indigo-300/80 bg-indigo-500/10 px-2 py-0.5 rounded">
            {getSpeedLabel(spinDuration)}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="5000"
          step="100"
          value={spinDuration}
          onChange={(e) => onSpinDurationChange(Number(e.target.value))}
          disabled={isSpinning}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between mt-1 px-0.5">
          <span className="text-[9px] text-slate-600 font-bold uppercase">快</span>
          <span className="text-[9px] text-slate-600 font-bold uppercase">慢</span>
        </div>
      </div>
      
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {prizes.map((prize) => (
          <div key={prize.id} className="group flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.07] p-3 rounded-xl border border-white/5 transition-all">
            <input
              type="color"
              value={prize.color}
              onChange={(e) => updatePrize(prize.id, { color: e.target.value })}
              className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer transition-transform group-hover:scale-105"
              disabled={isSpinning}
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={prize.name}
                onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                className="bg-transparent border-0 outline-none w-full text-sm font-bold text-slate-200 placeholder:text-slate-600 truncate"
                placeholder="奖项名称"
                disabled={isSpinning}
              />
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-slate-500 font-black uppercase">权重:</span>
                <input
                  type="number"
                  min="1"
                  value={prize.ratio}
                  onChange={(e) => updatePrize(prize.id, { ratio: Number(e.target.value) || 1 })}
                  className="bg-transparent text-indigo-400 text-[10px] w-8 font-black outline-none"
                  disabled={isSpinning}
                />
                <div className="h-0.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500/50" 
                    style={{ width: `${(prize.ratio / totalRatio) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              onClick={() => removePrize(prize.id)}
              disabled={isSpinning || prizes.length <= 2}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-600 transition-all disabled:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
        <input
          type="text"
          placeholder="新奖项名称..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
          disabled={isSpinning}
          onKeyPress={(e) => e.key === 'Enter' && addPrize()}
        />
        <button
          onClick={addPrize}
          disabled={isSpinning || !newName.trim()}
          className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-20 border border-white/5"
        >
          添加新项
        </button>
      </div>
    </div>
  );
};

export default PrizeManager;
