'use client';

import { useEffect, useRef } from 'react';

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    // Farenin anlık hedef konumu ve auranın yumuşak takip konumu
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // VİBE RENKLERİ: Mor, Pembe, Zümrüt Yeşili ve Turkuaz (AI Estetiği)
    const orbs = [
      { rgb: '147, 51, 234', radius: 450, speed: 0.015, angleOffset: 0, distance: 100 },       // Mor
      { rgb: '236, 72, 153', radius: 400, speed: 0.02, angleOffset: Math.PI / 2, distance: 80 },   // Pembe
      { rgb: '16, 185, 129', radius: 500, speed: 0.01, angleOffset: Math.PI, distance: 120 },      // Yeşil
      { rgb: '6, 182, 212',  radius: 420, speed: 0.025, angleOffset: Math.PI * 1.5, distance: 90 } // Turkuaz
    ];

    handleResize();

    const animate = () => {
      time += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aura, fareye anında yapışmaz; çok pürüzsüz ve ağır bir şekilde (smooth) süzülerek takip eder
      current.x += (mouse.x - current.x) * 0.04;
      current.y += (mouse.y - current.y) * 0.04;

      // Renklerin birbiriyle karışıp parlaması (Neon/Aura efekti için kritik)
      ctx.globalCompositeOperation = 'screen';

      orbs.forEach((orb) => {
        const angle = time * orb.speed + orb.angleOffset;
        
        // Aura baloncukları merkezin (farenin) etrafında yumuşakça döner ve "nefes alır"
        const breathe = Math.sin(time * 0.02) * 30; 
        const x = current.x + Math.cos(angle) * (orb.distance + breathe);
        const y = current.y + Math.sin(angle) * (orb.distance + breathe);

        // Radial gradient ile içten dışa yumuşak bir parlama yaratıyoruz
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, orb.radius);
        gradient.addColorStop(0, `rgba(${orb.rgb}, 0.35)`);  // Merkezde renk belirgin
        gradient.addColorStop(0.4, `rgba(${orb.rgb}, 0.1)`); // Ortada dumanlaşıyor
        gradient.addColorStop(1, `rgba(${orb.rgb}, 0)`);     // Uçlarda tamamen eriyor

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(x, y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none opacity-90 transition-opacity duration-1000"
    />
  );
}