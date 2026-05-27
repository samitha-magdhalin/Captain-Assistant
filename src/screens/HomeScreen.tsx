import { useState, useEffect } from "react";
import { ZonePrediction, TransitionPrediction, EarningsEstimateResponse, SimEvent, CaptainProfile } from "../types.ts";
import { formatINR, formatShiftDuration } from "../utils/formatters.ts";
import { 
  Sparkles, 
  Map, 
  BarChart3, 
  Bell, 
  Clock, 
  Award, 
  Landmark, 
  Navigation2, 
  Compass, 
  User, 
  ShieldCheck, 
  Route, 
  CloudSun, 
  ArrowRight, 
  Activity, 
  CheckCircle,
  TrendingUp,
  Play,
  Pause,
  Zap,
  Info
} from "lucide-react";

interface HomeScreenProps {
  zones: ZonePrediction[];
  predictions: TransitionPrediction[];
  estimate: EarningsEstimateResponse | null;
  shiftDuration: number;
  todayEarnings: number;
  rideCount: number;
  signalsCount: number;
  onTabChange: (tab: 'home' | 'map' | 'dashboard' | 'signals') => void;
  connected: boolean;
  peakZone: string | null;
  simHour: number;
  simDay: number;
  simWeather: string;
  setSimHour: (h: number) => void;
  setSimDay: (d: number) => void;
  setSimWeather: (w: string) => void;
  isSimPlaying: boolean;
  setIsSimPlaying: (p: boolean) => void;
  simSpeed: number;
  setSimSpeed: (s: number) => void;
  simulationLog: SimEvent[];
  captainProfile: CaptainProfile;
  setCaptainProfile: (p: CaptainProfile) => void;
}

export function HomeScreen({
  zones,
  predictions,
  estimate,
  shiftDuration,
  todayEarnings,
  rideCount,
  signalsCount,
  onTabChange,
  connected,
  peakZone,
  simHour,
  simDay,
  simWeather,
  setSimHour,
  setSimDay,
  setSimWeather,
  isSimPlaying,
  setIsSimPlaying,
  simSpeed,
  setSimSpeed,
  simulationLog,
  captainProfile,
  setCaptainProfile
}: HomeScreenProps) {
  const [greeting, setGreeting] = useState("Hello");
  const [currentTime, setCurrentTime] = useState("");

  // Determine elegant greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting("Good Morning");
    else if (hours < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
    
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Daily target constants
  const dailyEarningsTarget = 2000;
  const earningsProgress = Math.min((todayEarnings / dailyEarningsTarget) * 100, 100);
  const ridesTarget = 15;
  const ridesProgress = Math.min((rideCount / ridesTarget) * 100, 100);

  // Best active slot/estimate right now
  const highestHourlyRate = estimate 
    ? `₹${estimate.estimate_min} - ₹${estimate.estimate_max}` 
    : "₹120 - ₹180";

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 pb-24 max-w-6xl mx-auto font-sans animate-fade-in select-none">
      
      {/* 1. PROFESSIONAL HEADER HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#171333] to-[#2B235A] border border-border-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-1 max-w-xl">
          <div className="flex items-center gap-2 text-accent">
            <CloudSun size={16} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Live in Bengaluru • {currentTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white tracking-tight mt-1">
            {greeting}, Captain!
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed mt-2 font-normal">
            Your daily helper to find more customers, plan earnings for the next few hours, and check active passenger requests nearby.
          </p>
        </div>

        {/* Quick Driver Card Overlay */}
        <div className="relative z-10 w-full md:w-auto shrink-0 flex items-center gap-4 bg-slate-950/45 backdrop-blur-md rounded-2xl border border-border-card/50 p-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-accent text-slate-950 flex items-center justify-center font-extrabold font-display text-base shadow-lg">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wide">CAPTAIN</span>
              <span className="bg-success text-[#05050A] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase leading-none font-mono tracking-wider animate-pulse">
                ONLINE
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-slate-400 text-xs">
              <span className="flex items-center gap-1">
                ⭐ <strong className="text-white font-bold">4.95</strong> Rating
              </span>
              <span className="h-3 w-px bg-slate-800" />
              <span>ID: <strong className="text-white">#9842</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME SYSTEM STATUS TRACKER (HUMBLE COMPOSURE INDICATORS) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Status A */}
        <div className="flex items-center gap-3 bg-bg-card/90 rounded-2xl border border-border-card p-4 shadow-sm">
          <div className="p-2 rounded-xl bg-success/15 border border-success/20 text-success shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">GPS CONNECTION</span>
            <span className="text-xs font-bold text-text-primary mt-1 block truncate">Active and Working</span>
          </div>
        </div>

        {/* Status B */}
        <div className="flex items-center gap-3 bg-bg-card/90 rounded-2xl border border-border-card p-4 shadow-sm">
          <div className="p-2 rounded-xl bg-accent/15 border border-accent/20 text-accent shrink-0">
            <Activity size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">LIVE RIDER MAP CONTROLS</span>
            <span className="text-xs font-bold text-text-primary mt-1 block truncate">
              {connected ? "Connected & Live" : "Connecting..."}
            </span>
          </div>
        </div>

        {/* Status C */}
        <div className="flex items-center gap-3 bg-bg-card/90 rounded-2xl border border-border-card p-4 shadow-sm">
          <div className="p-2 rounded-xl bg-danger/15 border border-danger/20 text-danger shrink-0">
            <Navigation2 size={18} className="rotate-45" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">BUSIEST RIDE AREA</span>
            <span className="text-xs font-bold text-text-primary mt-1 block truncate uppercase">
              {peakZone || "Searching..."}
            </span>
          </div>
        </div>

        {/* Status D */}
        <div className="flex items-center gap-3 bg-bg-card/90 rounded-2xl border border-border-card p-4 shadow-sm">
          <div className="p-2 rounded-xl bg-info/10 border border-info/20 text-info shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] text-text-muted font-mono uppercase block leading-none">HOURS WORKED TODAY</span>
            <span className="text-xs font-bold text-text-primary mt-1 block truncate font-mono">
              {formatShiftDuration(shiftDuration)}
            </span>
          </div>
        </div>

      </div>

        {/* ========================================================================= */}
      {/* EXTREMELY POLISHED PRO-LEVEL DYNAMIC SIMULATION & SCENARIO MANAGER PANEL */}
      {/* ========================================================================= */}
      <div className="card bg-[#0F0C1B]/95 border-2 border-border-card/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-widest leading-none">GEOSPATIAL OPERATIONAL CONTROL DECK</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white mt-1.5 flex items-center gap-2">
                Simulation & Scenario Engine
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 select-none">
                Adjust temporal variables, select simulated weather layers, and test how our probabilistic models calibrate ride matching dynamically.
              </p>
            </div>
            
            {/* Play/Pause clock toggle */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex bg-[#120E26] border border-border-card p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsSimPlaying(!isSimPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    isSimPlaying 
                      ? "bg-danger text-white shadow-lg font-black" 
                      : "bg-accent text-slate-950 font-black shadow-md hover:scale-105 hover:bg-yellow-400"
                  }`}
                >
                  {isSimPlaying ? (
                    <>
                      <Pause size={12} className="fill-white" />
                      <span>Pause Sim</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} className="fill-slate-950" />
                      <span>Auto Play Sim</span>
                    </>
                  )}
                </button>
                
                {isSimPlaying && (
                  <select
                    value={simSpeed}
                    onChange={(e) => setSimSpeed(parseInt(e.target.value))}
                    className="bg-[#181434] text-slate-200 border-none px-2 rounded-md mx-1 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-accent md:block hidden animate-fade-in"
                  >
                    <option value={2000}>2s / hr (Fast)</option>
                    <option value={4000}>4s / hr (Normal)</option>
                    <option value={8000}>8s / hr (Slow)</option>
                  </select>
                )}
              </div>

              <div className="flex items-center gap-2 bg-[#1A152E] px-3.5 py-1.5 rounded-xl border border-border-card font-mono text-[10px] text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                <span>Sim Engine: <strong className={isSimPlaying ? "text-accent font-black animate-pulse" : "text-success uppercase"}>{isSimPlaying ? "PLAYING TIMELINE" : "AWAITING TRIGGER"}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            
            {/* Control A: Presets or Hour Slider */}
            <div className="bg-[#141026] border border-border-card/65 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider block">1. Playback Timeline Clock</span>
              <div className="flex flex-col gap-2 font-sans overflow-visible">
                <div className="flex justify-between items-center text-xs text-white">
                  <span className="font-medium text-slate-300">Sim Hour:</span>
                  <span className="font-mono bg-accent/10 px-2 py-0.5 rounded text-accent font-bold">{simHour.toString().padStart(2, "0")}:00 hrs</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="23" 
                  value={simHour}
                  onChange={(e) => setSimHour(parseInt(e.target.value))}
                  className="w-full accent-accent h-1.5 bg-slate-950 rounded-lg cursor-pointer mt-1"
                />
              </div>

              {/* Scenario Quick Presets */}
              <div className="mt-2.5 pt-3 border-t border-border-card/35 flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 block mb-1">CITY SCENARIO PRESETS:</span>
                {[
                  { label: "🌅 Work Morning Shift", hour: 9, weather: "clear", day: 1 },
                  { label: "⛈️ Monsoon Gridlock", hour: 17, weather: "thunderstorm", day: 1 },
                  { label: "🍻 Friday Night Out", hour: 22, weather: "clear", day: 5 },
                  { label: "🏏 Stadium IPL Exit", hour: 21, weather: "clear", day: 0 }
                ].map((item) => {
                  const isActive = simHour === item.hour && simWeather === item.weather && simDay === item.day;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSimHour(item.hour);
                        setSimWeather(item.weather);
                        setSimDay(item.day);
                      }}
                      className={`text-[9px] font-mono border text-left px-2 border-border-card/45 py-1.5 rounded-lg transition-all cursor-pointer flex justify-between items-center select-none ${
                        isActive 
                          ? "bg-accent/15 text-accent border-accent/40 font-extrabold" 
                          : "bg-slate-950/40 text-slate-300 hover:bg-slate-950 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="text-[8px] bg-accent text-slate-950 px-1 rounded-sm">ACTIVE</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Control B: Simulated Weather Trigger */}
            <div className="bg-[#141026] border border-border-card/65 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider block">2. Injected Weather Signal</span>
              <div className="grid grid-cols-2 gap-2 flex-grow">
                {[
                  { id: "clear", label: "☀️ Clear Skies", desc: "No delays active" },
                  { id: "cloudy", label: "☁️ Overcast", desc: "Light matching surge" },
                  { id: "rain", label: "🌧️ Severe Rain", desc: "Slow speed. Waterlog" },
                  { id: "thunderstorm", label: "⛈️ Monsoon Jam", desc: "Flooded shortcuts" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSimWeather(item.id)}
                    className={`flex flex-col text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer h-full justify-between h-full select-none ${
                      simWeather === item.id 
                        ? "bg-accent/15 text-accent border-accent/40" 
                        : "bg-[#090712] text-slate-300 border-border-card/45 hover:bg-slate-950"
                    }`}
                  >
                    <span className="text-xs font-bold leading-none">{item.label}</span>
                    <span className="text-[8px] font-mono text-text-muted mt-1 truncate">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control C: Strategy Profiles */}
            <div className="bg-[#141026] border border-border-card/65 rounded-2xl p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider block">3. Captain Strategy Portrait</span>
              <div className="flex flex-col gap-1.5 flex-grow justify-center">
                {[
                  { id: "conservative" as const, label: "🛡️ Commuter Cruiser", desc: "Short, high-confidence trips" },
                  { id: "aggressive" as const, label: "🚀 Surge Maverick", desc: "Chases peak multipliers" },
                  { id: "eco" as const, label: "🌿 Green Eco Glider", desc: "Saves idle fuel. Stays local." },
                  { id: "airport" as const, label: "✈️ Airport Aviator", desc: "Dedicated highway runner" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCaptainProfile(item.id)}
                    className={`text-left p-2 rounded-xl border transition-all flex flex-col gap-0.5 cursor-pointer select-none ${
                      captainProfile === item.id 
                        ? "bg-accent/15 text-accent border-accent/40" 
                        : "bg-[#090712] text-slate-400 border-border-card/45 hover:bg-slate-950"
                    }`}
                  >
                    <span className="text-[10px] font-bold font-sans flex items-center justify-between">
                      {item.label}
                      {captainProfile === item.id && <span className="text-[7px] uppercase tracking-wide bg-accent text-slate-950 px-1 rounded-sm font-black font-mono animate-pulse">SELECTED</span>}
                    </span>
                    <span className="text-[8px] font-mono text-text-muted leading-none mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Control D: "What Changed?" Event Ticker Feed Panel */}
            <div className="bg-[#141026] border border-border-card/65 rounded-2xl p-4 flex flex-col gap-3 overflow-hidden h-[240px] lg:h-auto font-sans">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-semibold text-text-muted uppercase tracking-wider block">4. "What Changed?" Feed</span>
                <span className="text-[8px] font-mono bg-accent/10 border border-accent/20 px-1 bg-black text-accent rounded uppercase font-bold tracking-wider">Live Logs</span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 font-mono scrollbar-thin max-h-[160px] lg:max-h-[300px]">
                {simulationLog.map((log, index) => {
                  let alertBorder = "border-[#251D42]/60 text-slate-300";
                  if (log.type === "weather") alertBorder = "border-[#EF4444]/30 text-rose-400 font-bold";
                  if (log.type === "traffic") alertBorder = "border-[#FF6D00]/30 text-orange-400 font-bold";
                  if (log.type === "demand") alertBorder = "border-accent/30 text-accent font-extrabold";
                  return (
                    <div key={index} className={`p-1.5 rounded-lg border bg-slate-950/40 text-[9px] leading-relaxed relative ${alertBorder}`}>
                      <div className="flex justify-between font-extrabold text-[8px] opacity-75 mb-0.5 border-b border-[#251D42]/40 pb-0.5">
                        <span>🕒 {log.timeLabel}</span>
                        <span className="uppercase text-[7px] tracking-wider font-extrabold">{log.type}</span>
                      </div>
                      <p className="font-sans font-light mt-0.5 text-slate-200">{log.message}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Real-time Scenario Translation Dynamic Banner */}
          {(() => {
            const isMorning = simHour >= 8 && simHour <= 10;
            const isEvening = simHour >= 17 && simHour <= 21;
            const isNight = simHour >= 22 || simHour <= 2;
            const isWeekendDay = simDay === 0 || simDay === 6;
            const isFridayNight = simDay === 5 && isNight;

            let scenarioName = "🛣️ Balanced Urban Mobility Grid";
            let scenarioDesc = "Normal grid flow. Average transit speed 38 km/h. Highly predictable matching rate. Recommended standby at local hubs to preserve fuel.";
            let labelColor = "bg-[#251D42]/60 text-slate-300 border-[#392E63]";

            if (simWeather === "rain" || simWeather === "thunderstorm") {
              if (isEvening) {
                scenarioName = "⛈️ Monsoon Gridlock Work Peak Hour";
                scenarioDesc = "Underpass waterlogging risk heavily elevated near Marathahalli & Silk Board. Traffic speed drops to 12 km/h. Fare multipliers surge to 1.35x. Ride cancellation risk at 22%. Recommend back-road navigation.";
                labelColor = "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30";
              } else {
                scenarioName = "🌧️ Rainy Tarmac Traction Obstacle";
                scenarioDesc = "Rain traction reduction (0.82 grip). Captain safety limit advisories globally broadcasted. Phone search intent open rate elevated by 35%. Match probability highest near Indiranagar core.";
                labelColor = "bg-info/10 text-info border-info/20";
              }
            } else if (isFridayNight || (isWeekendDay && isNight)) {
              scenarioName = "🍻 Weekend Brewery Leisure Rush Surge";
              scenarioDesc = "Indiranagar 100ft Road and Koramangala bars oversaturated with exit bookings. Low driver supply detected. Surge multipliers set to 1.45x. Captains waiting near PG corridors will earn 18% higher payouts.";
              labelColor = "bg-accent/10 text-accent border-accent/20";
            } else if (isMorning && !isWeekendDay) {
              scenarioName = "🏢 Tech Park Morning Check-in Pipeline";
              scenarioDesc = "Symmetric office check-ins at Whitefield ITPL & Manyata. Passenger booking rates high. Transit model confidence rating reaches 94%. Position near metro junctions to capture rapid consecutive connections.";
              labelColor = "bg-success/10 text-success border-success/20";
            } else if (isEvening && !isWeekendDay) {
              scenarioName = "🌇 Evening Corporate Departure Surge";
              scenarioDesc = "Exit gates of massive tech parks clogged with demand. Extreme home-going radial commutes. Average ride duration 45 mins. High expected captain yield multipliers.";
              labelColor = "bg-warning/10 text-warning border-warning/20";
            }

            return (
              <div className={`mt-5 p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-start md:items-center ${labelColor}`}>
                <div className="shrink-0 text-xl md:text-2xl font-sans mt-0.5 md:mt-0 font-extrabold select-none">
                  ⚡
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono leading-none tracking-wider font-extrabold uppercase">ACTIVE SIMULATION GRID SCENARIO</div>
                  <strong className="text-sm font-sans font-black tracking-tight mt-1 mb-0.5 block">{scenarioName}</strong>
                  <p className="text-xs opacity-90 leading-relaxed font-normal">{scenarioDesc}</p>
                </div>
              </div>
            );
          })()}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIGH-FIDELITY GEOSPATIAL OPERATIONAL KPIS & SYSTEM PERFORMANCE METRICS */}
      {/* ========================================================================= */}
      {(() => {
        // Calculate interactive simulated metrics strictly corresponding to the values selected!
        const isPeak = (simHour >= 8 && simHour <= 10) || (simHour >= 17 && simHour <= 21);
        const isRain = simWeather === "rain" || simWeather === "thunderstorm";
        const isNight = simHour >= 22 || simHour <= 2;
        const isFriday = simDay === 5;

        let idleReduction = "26%";
        let capUtilization = "64%";
        let captureEfficiency = "93.4%";
        let avgEarnUplift = "₹120 / hr";
        let trackingStability = "HIGH";
        let stabilityColor = "text-success bg-success/11 border-success/20";

        if (isRain) {
          idleReduction = isPeak ? "46%" : "38%";
          capUtilization = "94% (Max Cap)";
          captureEfficiency = simWeather === "thunderstorm" ? "76.2%" : "84.1%";
          avgEarnUplift = simWeather === "thunderstorm" ? "₹390 / hr" : "₹280 / hr";
          trackingStability = "LOW (Storm Deviation)";
          stabilityColor = "text-danger bg-danger/10 border-danger/20";
        } else if (isPeak) {
          idleReduction = "39%";
          capUtilization = "86%";
          captureEfficiency = "95.1%";
          avgEarnUplift = "₹220 / hr";
          trackingStability = "HIGH";
          stabilityColor = "text-success bg-success/11 border-success/20";
        } else if (isFriday && isNight) {
          idleReduction = "42%";
          capUtilization = "91%";
          captureEfficiency = "89.3%";
          avgEarnUplift = "₹310 / hr";
          trackingStability = "MEDIUM";
          stabilityColor = "text-warning bg-warning/10 border-warning/20";
        }

        return (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* KPI 1 */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm hover:border-accent/25 transition-all">
              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase leading-none block">IDLE TIME REDUCTION</span>
                <span className="text-xl md:text-2xl font-display font-extrabold text-white mt-2 block tracking-tight">
                  {idleReduction}
                </span>
              </div>
              <span className="text-[9px] font-mono text-success mt-1 block">✓ Decreased Empty Cruising</span>
            </div>

            {/* KPI 2 */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm hover:border-accent/25 transition-all">
              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase leading-none block">CAPTAIN UTILIZ. RATE</span>
                <span className="text-xl md:text-2xl font-display font-extrabold text-accent mt-2 block tracking-tight">
                  {capUtilization}
                </span>
              </div>
              <span className="text-[9px] font-mono text-text-secondary mt-1 block">Live Competing Supply</span>
            </div>

            {/* KPI 3 */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm hover:border-accent/25 transition-all">
              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase leading-none block">RIDE CAPTURE EFFIC.</span>
                <span className="text-xl md:text-2xl font-display font-extrabold text-success mt-2 block tracking-tight">
                  {captureEfficiency}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">Instant Payout Success</span>
            </div>

            {/* KPI 4 */}
            <div className="bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm hover:border-accent/25 transition-all">
              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase leading-none block">AVG EARNING UPLIFT</span>
                <span className="text-xl md:text-2xl font-display font-extrabold text-[#10B981] mt-2 block tracking-tight">
                  {avgEarnUplift}
                </span>
              </div>
              <span className="text-[9px] font-mono text-success mt-1 block">vs Base Offline Earnings</span>
            </div>

            {/* KPI 5 */}
            <div className="col-span-2 lg:col-span-1 bg-bg-card border border-border-card rounded-2xl p-4 flex flex-col justify-between min-h-[90px] shadow-sm hover:border-accent/25 transition-all">
              <div>
                <span className="text-[9px] font-mono text-text-muted uppercase leading-none block">GPS GRID RELIABILITY</span>
                <div className={`text-xs font-bold px-2 py-1 border rounded-lg inline-block mt-3 ${stabilityColor}`}>
                  {trackingStability}
                </div>
              </div>
              <span className="text-[9px] font-mono text-text-secondary block mt-1">Spatial Sync Active</span>
            </div>

          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* EXPLAINABLE AI, DEVOPS, AND SYSTEM DESIGN FLOW PIPELINES PANEL */}
      {/* ========================================================================= */}
      {(() => {
        const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);
        return (
          <div className="card bg-bg-card hover:bg-bg-card-hover border border-border-card rounded-3xl p-6 transition-all shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent shadow-inner shrink-0">
                  ⚡
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    System Architecture & Research Foundations
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-normal">
                    Examine the probabilistic forecasting flow, spatial clustering metrics, and Docker deployment guidelines.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
                className="px-4 py-2 border border-border-card bg-bg-primary hover:bg-[#1D1832] text-[11px] font-mono font-bold tracking-wider text-slate-300 hover:text-accent rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm uppercase shrink-0"
              >
                {isDeepDiveOpen ? "Collapse Deep Dive [▲]" : "Expand System Architecture [▼]"}
              </button>
            </div>

            {isDeepDiveOpen && (
              <div className="mt-6 pt-6 border-t border-border-card/65 flex flex-col gap-6 animate-slide-up">
                
                {/* 1. Technical explanation (Research thinking) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-accent">I. Spatial & Probabilistic Mobility Forecasting</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Our intelligence platform maps real-time municipal demand using discrete **First-Order Markov Transition Chains** trained on historical driver telemetry (`rides.csv`). Instead of generating random location heatmaps, the system computes localized spatial coordinates using raw user intent telemetry (app opens, price glances, and booking failures) to construct a real-time demand score.
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                      By parsing variables like the current hour, day-of-week seasonality, and severe cloudburst friction, we dynamically recompute the **Expected Opportunity Cost Coefficient** of remaining in oversaturated segments.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-mono font-bold uppercase text-accent">II. Geospatial Dispatch Orchestration & Multi-Captain Crowd Metrics</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Our dispatch decision pipeline simulates the spatial distribution of 50-100 competing simulated captains operating within the Bengaluru perimeter. When too many captains aggregate inside a high-demand zone, the **Crowding Saturation Metric** triggers an immediate displacement notice: *"OVERSATURATED: Relocate around border margins."*
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                      This prevents supply imbalance and cannibalization, allowing taxi captains to maximize their earning potential while reducing idle search times during rain cascades.
                    </p>
                  </div>
                </div>

                {/* 2. ASCII system architecture diagram */}
                <div className="bg-slate-950/85 border border-border-card rounded-2xl p-5 font-mono text-[9px] sm:text-xs text-success leading-relaxed overflow-x-auto shadow-inner">
                  <div className="text-accent font-bold uppercase text-[10px] tracking-wide mb-3">📍 OPERATIONAL PIPELINE PIPELINE LIFECYCLE DIAGRAM:</div>
{`+-------------------------------------------------------------------------------------------------+
|                                 REAL-TIME DEVOPS OPERATIONAL FLOW                               |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
| [ USER INTENT FEEDS ]       [ ENV SIGNALS ]        [ SCENARIO PRESETS ]     [ HISTORY csv/json ] |
|  - Booking Attempts          - Precip Rate (Rain)   - Sliders (Hour)         - Markov telemetry |
|  - App Opens/Searches        - Waterlogging Jams    - Calendar (Weekend)     - Historical rides |
|        |                            |                        |                         |        |
|        +------------+---------------+------------------------+-------------------------+        |
|                     |                                                                           |
|                     v                                                                           |
|        [ GEOSPATIAL DECISION ENGINE /api/hotspots ]                                             |
|         - Recalibrates base demand with time weights                                            |
|         - Evaluates active sporting/tech summits surge coefficients                           |
|         - Computes competing captain density & crowd limits                                     |
|                     |                                                                           |
|                     v                                                                           |
|        [ PREDICTIONS PIPELINE ]                                                                 |
|         - Extracts top predicted transition nodes                                               |
|         - Invokes server-side Gemini flash models to synthesize plain-text driver advisors       |
|                     |                                                                           |
|                     +-------+-------------------------+                                         |
|                             |                         |                                         |
|                             v                         v                                         |
|                   [ OPERATIONAL MAP UI ]     [ EARTH VALUE DASHBOARD ]                          |
|                    - Heat circles (Leaflet)   - Expected Yield multipliers                      |
|                    - Multi-captain overlays    - Opportunity cost percentages                    |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+`}
                </div>

                {/* 3. Devops & Deployment specs */}
                <div className="border-t border-border-card/40 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-[10px] font-mono text-slate-400">
                  <div>
                    <span className="text-accent font-bold block mb-1">⚙️ DEVOPS CONFIGURATION</span>
                    <span>Docker Container Node • Gunicorn/PM2 Process Mgr • Continuous Integration Pipeline (GitHub Actions)</span>
                  </div>
                  <div className="flex gap-4">
                    <span>PORT: <strong className="text-white">3000</strong></span>
                    <span>ENV: <strong className="text-white">PRODUCTION-READY</strong></span>
                    <span>DATABASE: <strong className="text-info">SUPABASE/POSTGRES</strong></span>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })()}


      {/* 3. CORE APPLICATION LAUNCHPAD (BENTO GRID TILES) */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-mono text-text-muted uppercase tracking-wider font-bold">
          Primary Captain Tools
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Live Trip Map (Highlighted - taking 2/3 of desktop width) */}
          <button 
            onClick={() => onTabChange("map")}
            className="group text-left relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#1a163a]/90 to-bg-card/95 hover:to-[#221c4b]/95 border-2 border-border-card hover:border-accent rounded-3xl p-6 min-h-[300px] lg:col-span-2 transition-all duration-300 shadow-lg cursor-pointer hover:shadow-accent/10 hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-bl-full group-hover:bg-accent/10 transition-all pointer-events-none" />
            
            <div className="w-full">
              <div className="flex justify-between items-center w-full">
                <div className="p-3 bg-accent/10 border border-accent/25 text-accent rounded-2xl shadow-sm">
                  <Map size={24} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
                  <span className="badge bg-accent/20 text-accent text-[9px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 border border-accent/30 rounded-lg">
                    Tap to Open Live Map
                  </span>
                </div>
              </div>
              
              <div className="mt-5">
                <h3 className="text-2xl font-display font-black text-text-primary tracking-tight group-hover:text-accent transition-colors flex items-center gap-2.5">
                  Live Trip Map
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed max-w-xl font-sans">
                  The primary companion tool to check where passengers are currently searching for rides around Bengaluru. Avoid empty miles, check busy hotspots with extra bonuses, and get instant trip direction navigation.
                </p>
              </div>
            </div>

            {/* Injected active zone highlights directly in the launchpad to encourage map click! */}
            {zones && zones.length > 0 && (
              <div className="mt-5 w-full flex flex-col gap-2 bg-black/35 border border-border-card/35 rounded-2xl p-3.5">
                <span className="text-[10px] font-mono font-bold text-accent uppercase leading-none block">
                  🔥 Active Bengaluru Busy Spots right now:
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {zones.slice(0, 3).map((z, idx) => (
                    <span key={z.zone_id} className="text-[10px] font-mono bg-bg-card border border-border-card/75 rounded-lg px-2.5 py-1 text-slate-200 hover:text-accent transition-colors">
                      📍 {z.zone_name}
                    </span>
                  ))}
                  <span className="text-[10px] font-mono text-text-muted mt-1 ml-auto">+{zones.length - 3} more areas</span>
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-between border-t border-border-card/45 pt-3 mt-4 text-[11px] font-mono text-text-muted select-none">
              <span>GPS Tracking Active</span>
              <span className="flex items-center gap-1.5 text-accent font-bold group-hover:translate-x-1 transition-transform">
                Find Passengers Now <ArrowRight size={13} />
              </span>
            </div>
          </button>

          {/* Nearby Ride Searches (Highlighted - taking 1/3 of desktop width) */}
          <button 
            onClick={() => onTabChange("signals")}
            className="group text-left relative flex flex-col justify-between overflow-hidden bg-bg-card/85 hover:bg-bg-card/100 border-2 border-border-card hover:border-[#EF4444]/40 rounded-3xl p-6 min-h-[300px] lg:col-span-1 transition-all duration-300 shadow-lg cursor-pointer hover:shadow-[#EF4444]/5 hover:-translate-y-0.5"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EF4444]/5 rounded-bl-full group-hover:bg-[#EF4444]/10 transition-colors pointer-events-none" />
            
            <div className="w-full">
              <div className="flex justify-between items-start w-full">
                <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] rounded-2xl shadow-sm">
                  <Bell size={24} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="badge bg-danger/15 text-danger text-[9px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 border border-danger/30 rounded-lg animate-pulse">
                  Streaming Live
                </span>
              </div>
              
              <div className="mt-5">
                <h3 className="text-2xl font-display font-black text-text-primary tracking-tight group-hover:text-[#EF4444] transition-colors">
                  Nearby Ride Searches
                </h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed font-sans">
                  Watch live, second-by-second customer actions. See when users check bike / auto taxi fares near you before they even book!
                </p>
              </div>

              {/* Pulsing live passenger count indicator */}
              <div className="mt-5 flex items-center gap-3 bg-[#EF4444]/5 border border-[#EF4444]/15 px-3 py-2.5 rounded-xl text-[10px] font-mono text-[#FCA5A5]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>Bengaluru Customers Searching: <strong>{signalsCount} live events</strong></span>
              </div>
            </div>

            <div className="w-full flex items-center justify-between border-t border-border-card/45 pt-3 mt-4 text-[11px] font-mono text-text-muted select-none">
              <span>Signals updated 1s ago</span>
              <span className="flex items-center gap-1.5 text-danger font-bold group-hover:translate-x-1 transition-transform">
                Watch Live Feed <ArrowRight size={13} />
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* 4. PERFORMANCE TRACKER & GOAL SUMMARY RULER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        
        {/* Daily Progress Goals (col-span-8) */}
        <div className="lg:col-span-8 card bg-bg-card/90 border border-border-card p-6 flex flex-col justify-between gap-5 shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider block">Your Daily Target Progress</span>
            <p className="text-xs text-text-secondary mt-1">Track your daily ride count and target money easily.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Target 1: Earnings */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-text-primary font-mono uppercase">Daily Earnings Target</span>
                <span className="text-xs font-mono font-bold text-success">{formatINR(todayEarnings)} / {formatINR(dailyEarningsTarget)}</span>
              </div>
              <div className="h-3 w-full bg-bg-primary rounded-full overflow-hidden border border-border-card flex p-[1.5px]">
                <div 
                  className="bg-success rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${earningsProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-0.5">
                <span>{earningsProgress.toFixed(0)}% Finished</span>
                <span>Target: ₹2,000</span>
              </div>
            </div>

            {/* Target 2: Completed Rides */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-text-primary font-mono uppercase">Target Ride Count</span>
                <span className="text-xs font-mono font-bold text-accent">{rideCount} / {ridesTarget} Trips</span>
              </div>
              <div className="h-3 w-full bg-bg-primary rounded-full overflow-hidden border border-border-card flex p-[1.5px]">
                <div 
                  className="bg-accent rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${ridesProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-text-muted mt-0.5">
                <span>{ridesProgress.toFixed(0)}% Finished</span>
                <span>Target: 15 Rides</span>
              </div>
            </div>
          </div>

          <div className="bg-bg-primary/55 border border-border-card/50 px-4 py-3.5 rounded-2xl flex items-start gap-3 mt-1.5">
            <TrendingUp size={15} className="text-success mt-0.5 shrink-0" />
            <p className="text-xs leading-normal text-slate-300">
              <strong>Eays Tip to Earn More:</strong> Koramangala & Indiranagar currently have extra peak-hour cash bonuses. Head there if you are waiting too long between rides.
            </p>
          </div>
        </div>

        {/* Rapid summary side column (col-span-4) */}
        <div className="lg:col-span-4 card bg-bg-card/90 border border-border-card p-6 flex flex-col justify-between gap-4 shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wider block">Today's Earnings Balance</span>
            <h2 className="text-4xl font-display font-extrabold text-success tracking-tight mt-12 mb-1 text-center">
              {formatINR(todayEarnings)}
            </h2>
            <p className="text-[11px] font-mono text-text-secondary text-center">Direct net payout to your bank account</p>
          </div>

          <div className="border-t border-border-card/60 pt-4 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">Platform Fee Status</span>
              <span className="font-mono text-text-primary text-[11px] font-bold">15% fee already deducted</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">Successful Ride Rate</span>
              <span className="font-mono text-text-primary text-[11px] font-bold">100% (No cancellations)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-medium">Extra Peak Cash Earned</span>
              <span className="font-mono text-success text-[11px] font-bold">+ {formatINR(todayEarnings * 0.15)} surge value</span>
            </div>
          </div>

          {/* Low key shortcut link to primary Earnings Helper tabs */}
          <button 
            onClick={() => onTabChange("dashboard")}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 px-4 bg-bg-primary hover:bg-bg-card-hover border border-border-card hover:border-accent/30 rounded-xl text-[11px] font-bold text-slate-300 hover:text-accent transition-all cursor-pointer font-sans"
          >
            <span>Open Earnings Helper & Guide</span>
            <ArrowRight size={12} className="text-accent" />
          </button>
        </div>

      </div>

    </div>
  );
}
