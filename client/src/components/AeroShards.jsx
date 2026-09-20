import { useEffect, useRef, useState } from 'react';

import './AeroShards.css';

const colors = ['#896abd', '#a855f7', '#d9c7ff', '#6f56b5'];

function drawShard(context, shard, width, height, time, pointer) {
  const x = shard.x * width + Math.sin(time * shard.speed + shard.phase) * shard.drift * width;
  const y = shard.y * height + Math.cos(time * shard.speed * 0.8 + shard.phase) * shard.drift * height;
  const distance = Math.hypot(x - pointer.x, y - pointer.y);
  const influence = Math.max(0, 1 - distance / 220);
  const angle = shard.angle + Math.sin(time * 0.7 + shard.phase) * 0.18;
  const size = shard.size * (1 + influence * 0.35);
  const length = size * (1.8 + Math.sin(shard.phase) * 0.35);

  context.save();
  context.translate(x, y);
  context.rotate(angle + influence * 0.35);
  context.globalAlpha = shard.alpha;
  context.fillStyle = shard.color;
  context.beginPath();
  context.moveTo(0, -length);
  context.lineTo(size, length * 0.6);
  context.lineTo(-size * 0.7, length * 0.8);
  context.closePath();
  context.fill();
  context.restore();
}

export default function AeroShards({ className = '' }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return undefined;

    let animationFrame;
    let width = 0;
    let height = 0;
    let shards = [];
    const pointer = { x: 0, y: 0 };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.min(260, Math.max(100, Math.round((width * height) / 6500)));
      shards = Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        size: 3 + Math.random() * 9,
        angle: Math.random() * Math.PI * 2,
        phase: index * 0.73 + Math.random() * 6,
        speed: 0.08 + Math.random() * 0.18,
        drift: 0.015 + Math.random() * 0.045,
        alpha: 0.22 + Math.random() * 0.5,
        color: colors[index % colors.length],
      }));
    };

    const movePointer = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const render = (timestamp) => {
      const time = timestamp / 1000;
      context.clearRect(0, 0, width, height);
      const glow = context.createRadialGradient(width * 0.72, height * 0.2, 0, width * 0.72, height * 0.2, width * 0.8);
      glow.addColorStop(0, 'rgba(168, 85, 247, 0.12)');
      glow.addColorStop(1, 'rgba(18, 15, 23, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      shards.forEach((shard) => drawShard(context, shard, width, height, reduceMotion.matches ? 0 : time, pointer));
      if (!reduceMotion.matches) animationFrame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', movePointer, { passive: true });
    animationFrame = requestAnimationFrame(render);
    setReady(true);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', movePointer);
    };
  }, []);

  return (
    <div className={`aero-shards ${className}`} aria-hidden="true" data-ready={ready}>
      <canvas ref={canvasRef} className="aero-shards__canvas" />
    </div>
  );
}