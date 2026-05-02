import React from 'react';

export const Logo = () => (
  <div className="relative flex items-center justify-center w-10 h-10 group">
    <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all duration-1000"></div>
    
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
      <defs>
        <radialGradient id="nebula_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(45)">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#a855f7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
        </radialGradient>

        <filter id="liquid_vibe" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="1">
            <animate attributeName="seed" values="1;50;1" dur="10s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="15" />
        </filter>

        {/* Kayan Yıldız (Meteor) İzi İçin Gradient */}
        <linearGradient id="meteor_trail" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="80%" stopColor="white" stopOpacity="0.8" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* NEBULA GÖVDESİ */}
      <circle cx="50" cy="50" r="35" fill="url(#nebula_grad)" filter="url(#liquid_vibe)" className="animate-pulse" />

      {/* GERÇEK KAYAN YILDIZ (Çapraz Meteor) */}
      <line 
        x1="100" y1="0" 
        x2="0" y2="100" 
        stroke="url(#meteor_trail)" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeDasharray="150" 
        strokeDashoffset="150"
      >
        {/* 5 saniyede bir, çok hızlı bir şekilde (0.75 saniyede) akıp geçecek */}
        <animate 
          attributeName="stroke-dashoffset" 
          values="150; -150; -150" 
          keyTimes="0; 0.15; 1" 
          dur="3s" 
          repeatCount="indefinite" 
        />
      </line>

      {/* İNCE HAREKETLİ HALKA */}
      <path 
        d="M25 50C25 36.1929 36.1929 25 50 25C63.8071 25 75 36.1929 75 50" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeOpacity="0.3" 
        strokeLinecap="round"
        style={{ transformOrigin: '50% 50%', animation: 'spin 12s linear infinite' }} 
      />
    </svg>
  </div>
);