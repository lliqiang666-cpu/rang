
import React, { useEffect, useRef } from 'react';
import { Prize } from '../types';

interface WheelProps {
  prizes: Prize[];
  isSpinning: boolean;
  onSpinEnd: (prize: Prize) => void;
  targetRotation?: number;
  spinDuration?: number; // 旋转时长（毫秒）
}

const Wheel: React.FC<WheelProps> = ({ prizes, targetRotation = 0, spinDuration = 2000 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 获取设备像素比，处理高清屏模糊问题
    const dpr = window.devicePixelRatio || 1;
    const logicalSize = 500;
    
    // 设置物理像素大小
    canvas.width = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    
    // 设置 CSS 显示大小
    canvas.style.width = `${logicalSize}px`;
    canvas.style.height = `${logicalSize}px`;

    // 缩放上下文以匹配逻辑坐标
    ctx.scale(dpr, dpr);

    const size = logicalSize;
    const center = size / 2;
    const radius = center - 30; // 预留外部灯珠空间
    const totalRatio = prizes.reduce((sum, p) => sum + p.ratio, 0);

    ctx.clearRect(0, 0, size, size);
    
    // 启用高质量文本渲染
    ctx.textBaseline = 'middle';
    
    // 1. 绘制外部发光环
    ctx.beginPath();
    ctx.arc(center, center, radius + 15, 0, Math.PI * 2);
    const outerGrad = ctx.createRadialGradient(center, center, radius, center, center, radius + 25);
    outerGrad.addColorStop(0, '#1e1b4b');
    outerGrad.addColorStop(0.8, '#4338ca');
    outerGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = outerGrad;
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. 绘制奖项扇区
    let currentAngle = 0;
    prizes.forEach((prize) => {
      const sliceAngle = (prize.ratio / totalRatio) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(center, center, 0, center, center, radius);
      grad.addColorStop(0, prize.color);
      grad.addColorStop(1, adjustColor(prize.color, -30));
      
      ctx.fillStyle = grad;
      ctx.fill();
      
      // 扇区边界线
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制文字
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(currentAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 16px "Noto Sans SC"';
      
      const displayName = prize.name.length > 8 ? prize.name.substring(0, 7) + '...' : prize.name;
      ctx.fillText(displayName, radius - 40, 0);
      ctx.restore();

      currentAngle += sliceAngle;
    });

    // 3. 内部装饰圈
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 4. 中心轴帽
    ctx.beginPath();
    ctx.arc(center, center, 35, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(center, center, 0, center, center, 35);
    hubGrad.addColorStop(0, '#ffffff');
    hubGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 15;
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(center, center, 25, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();

  }, [prizes]);

  function adjustColor(color: string, amount: number) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
  }

  const bulbs = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30) * (Math.PI / 180);
    return {
      x: 250 + Math.cos(angle) * 235,
      y: 250 + Math.sin(angle) * 235,
    };
  });

  return (
    <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] canvas-container">
      {/* 指针 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 z-20">
        <svg width="40" height="50" viewBox="0 0 40 50">
          <path d="M20 50 L0 10 Q0 0 20 0 Q40 0 40 10 Z" fill="#fbbf24" stroke="white" strokeWidth="2" />
          <circle cx="20" cy="15" r="5" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* 闪烁灯珠 */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {bulbs.map((pos, i) => (
          <div 
            key={i}
            className="light-dot absolute w-3 h-3 bg-yellow-200 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)] border border-white"
            style={{ 
              left: `${(pos.x / 500) * 100}%`, 
              top: `${(pos.y / 500) * 100}%`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
      
      <canvas
        ref={canvasRef}
        className="block mx-auto cubic-bezier(0.15, 0, 0.15, 1)"
        style={{ 
            transform: `rotate(${targetRotation}deg)`,
            transition: `transform ${spinDuration}ms cubic-bezier(0.15, 0, 0.15, 1)`,
            maxWidth: '100%',
            height: 'auto'
        }}
      />
    </div>
  );
};

export default Wheel;
