import { useState, useEffect } from "react";
import { Loader2, Sparkles, MapPin, Navigation, Compass } from "lucide-react";
import { motion } from "motion/react";

export function LoadingSkeleton() {
  const [percent, setPercent] = useState(0);
  const [activeTelemetry, setActiveTelemetry] = useState(0);

  const telemetryLines = [
    { label: "Checking GPS connection", status: "READY", color: "text-success" },
    { label: "Locating busy ride areas", status: "DONE", color: "text-success" },
    { label: "Calculating daily earnings helper", status: "READY", color: "text-success" },
    { label: "Connecting to active customer network", status: "CONNECTED", color: "text-accent" },
    { label: "Fetching weather and traffic updates", status: "DONE", color: "text-success" },
    { label: "Preparing your driving guide dashboard", status: "READY", color: "text-success" },
  ];

  useEffect(() => {
    // Elegant steady boost up to 100%
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Small variable steps for realistic network feel
        const step = Math.floor(Math.random() * 8) + 12;
        return Math.min(prev + step, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cycle the telemetry reports based on percentage completion
    const step = Math.floor(100 / telemetryLines.length);
    const index = Math.min(Math.floor(percent / step), telemetryLines.length - 1);
    setActiveTelemetry(index);
  }, [percent]);

  return (
    <div className="fixed inset-0 z-50 bg-[#07070F] text-white flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
      
      {/* Ambient background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-danger/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center text-center relative z-10">
        
        {/* 1. FUTURISTIC LOGO GRAPHIC WITH ROTATING HUD RINGS & LIVE RADAR RIPPLES */}
        <motion.div 
          className="relative mb-12 w-40 h-40 flex items-center justify-center select-none"
          initial={{ scale: 0.3, opacity: 0, rotate: -45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 70, 
            damping: 12, 
            mass: 1.1,
            delay: 0.1
          }}
        >
          
          {/* Ripple Radar 1 (Accent Green) */}
          <motion.div
            className="absolute rounded-full border border-accent/40 bg-accent/5 pointer-events-none"
            initial={{ width: 60, height: 60, opacity: 0.8 }}
            animate={{ width: 160, height: 160, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
          />

          {/* Ripple Radar 2 (Danger Red - Passenger Search Signals) */}
          <motion.div
            className="absolute rounded-full border border-[#EF4444]/40 bg-[#EF4444]/5 pointer-events-none"
            initial={{ width: 60, height: 60, opacity: 0.8 }}
            animate={{ width: 160, height: 160, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", delay: 0.7 }}
          />

          {/* Ripple Radar 3 (Accent Bright) */}
          <motion.div
            className="absolute rounded-full border border-accent/20 pointer-events-none"
            initial={{ width: 60, height: 60, opacity: 0.6 }}
            animate={{ width: 200, height: 200, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut", delay: 1.4 }}
          />

          {/* Animated Tech Ring Outer: Dashed */}
          <motion.div 
            className="absolute inset-4 rounded-full border-2 border-dashed border-accent/30 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          />
          
          {/* Animated Tech Ring Inner: Dotted */}
          <motion.div 
            className="absolute inset-7 rounded-full border border-dotted border-[#EF4444]/40 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
          />
          
          {/* Central Shiny Core Platform */}
          <motion.div 
            className="absolute inset-10 rounded-full bg-slate-950 border-2 border-accent/30 shadow-[0_0_35px_rgba(0,245,212,0.25)] flex items-center justify-center"
            animate={{ scale: [0.97, 1.05, 0.97] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            {/* Pulsing center search icon with bounce */}
            <motion.div 
              className="relative z-10 flex items-center justify-center text-accent"
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            >
              <MapPin size={34} className="text-accent filter drop-shadow-[0_0_12px_var(--accent-glow-strong)]" />
              <motion.div
                className="absolute text-white"
                style={{ y: -2 }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              >
                <Compass size={14} className="opacity-95" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 2. GRAND APPLICATION BRAND */}
        <motion.div 
          className="flex flex-col gap-1 select-none"
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={16} className="text-accent animate-bounce" />
            <h1 className="font-display font-black text-3xl tracking-tight text-white">
              CAPTAIN<span className="text-accent font-black">ASSISTANT</span>
            </h1>
          </div>
          <p className="text-slate-400 text-[10px] font-mono tracking-widest uppercase mt-1">
            Bengaluru Taxi & Auto Captain App
          </p>
        </motion.div>

        {/* 3. HARDWARE SIMUTATED PROGRESS PANEL */}
        <motion.div 
          className="w-full mt-10 p-5 bg-gradient-to-b from-[#111122]/90 to-[#0B0B14]/90 border border-border-card rounded-2xl flex flex-col gap-4 shadow-2xl relative overflow-hidden"
          initial={{ y: 35, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, damping: 15, delay: 0.6 }}
        >
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-pulse" />

          {/* Telemetry log tickers (High contrast monospace) */}
          <div className="flex flex-col gap-1.5 text-left border-b border-border-card/45 pb-3.5 select-none font-mono text-[10px] text-slate-400 min-h-[58px]">
            {telemetryLines.slice(0, activeTelemetry + 1).map((line, idx) => (
              <div key={line.label} className="flex justify-between items-center tracking-wide">
                <span className="flex items-center gap-1.5">
                  <span className="text-accent">❯</span> {line.label}
                </span>
                <span className={`font-bold ${line.color}`}>[{line.status}]</span>
              </div>
            ))}
          </div>

          {/* Core progress tracker */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-end font-mono text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin text-accent" />
                STARTING COMPANION APP...
              </span>
              <span className="font-bold text-accent text-sm">{percent}%</span>
            </div>
            
            {/* Fine custom gauge line */}
            <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-border-card flex p-[1.5px]">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* 4. PLATFORM FOOTER SIGN OFF */}
        <div className="mt-10 flex flex-col gap-1 text-[9px] font-mono text-slate-500 uppercase tracking-widest select-none">
          <span>SAFE CONNECTION ESTABLISHED</span>
          <span className="mt-1 text-slate-600">Stable Update • Bengaluru, India</span>
        </div>

      </div>
    </div>
  );
}
