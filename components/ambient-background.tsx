export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#030305]">
      {/* Dynamic Animated Gradient Orbs */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/30 blur-[150px] animate-pulse mix-blend-screen" 
        style={{ animationDuration: '8s' }} 
      />
      <div 
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/20 blur-[150px] animate-pulse mix-blend-screen" 
        style={{ animationDuration: '12s' }} 
      />
      <div 
        className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse mix-blend-screen" 
        style={{ animationDuration: '10s' }} 
      />
      <div 
        className="absolute bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px] animate-pulse mix-blend-screen" 
        style={{ animationDuration: '14s' }} 
      />
      
      {/* Subtle Tech Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)] opacity-50 pointer-events-none" 
      />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
