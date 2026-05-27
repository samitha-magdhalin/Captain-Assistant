import { useState, useEffect } from "react";
import { useHotspots } from "./hooks/useHotspots.ts";
import { useSignals } from "./hooks/useSignals.ts";
import { usePrediction } from "./hooks/usePrediction.ts";
import { useEarnings } from "./hooks/useEarnings.ts";
import { SimEvent, CaptainProfile } from "./types.ts";

// Components
import { BottomNav } from "./components/BottomNav.tsx";
import { LiveBadge } from "./components/LiveBadge.tsx";
import { LoadingSkeleton } from "./components/LoadingSkeleton.tsx";

// Screens
import { MapScreen } from "./screens/MapScreen.tsx";
import { Dashboard } from "./screens/Dashboard.tsx";
import { Signals } from "./screens/Signals.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";

// Icons
import { Sparkles, Sun, Moon, Map, BarChart3, Bell, Clock, Award, Landmark, Home } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'map' | 'dashboard' | 'signals'>("home");
  const [currentZoneId, setCurrentZoneId] = useState<string>("koramangala");
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem("rapido-theme");
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // Sync theme with document root
  useEffect(() => {
    try {
      localStorage.setItem("rapido-theme", theme);
    } catch (e) {
      console.warn("Storage restricted", e);
    }
    if (theme === "light") {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }, [theme]);

  // Simulation Engine State Control (Full-Stack Pipeline)
  const [simHour, setSimHour] = useState<number>(() => new Date().getHours());
  const [simDay, setSimDay] = useState<number>(() => new Date().getDay());
  const [simWeather, setSimWeather] = useState<string>("clear");

  // Playback clock states
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(4000); // 4 seconds per simulated hour

  // Real-time Event simulation roll log
  const [simulationLog, setSimulationLog] = useState<SimEvent[]>(() => [
    { timeLabel: "08:15", message: "Core Mobility Grid initialized. GPS synchronization verified with 120 pilot agents active across Bengaluru.", type: "system" },
    { timeLabel: "09:00", message: "Symmetric office check-ins at Manyata Tech Park & Whitefield ITPL. Demand multipliers rising to 1.30x.", type: "demand" },
    { timeLabel: "14:30", message: "Afternoon temperature normal. Localized traffic bottlenecks reported on Old Airport road.", type: "traffic" }
  ]);

  // Strategy Profile Selector
  const [captainProfile, setCaptainProfile] = useState<CaptainProfile>("conservative");

  // Playback Clock Autoplay Mechanism
  useEffect(() => {
    if (!isSimPlaying) return;

    const interval = setInterval(() => {
      setSimHour((prevHour) => {
        const nextHour = (prevHour + 1) % 24;
        if (nextHour === 0) {
          // Wrap day on rollover: 1 (Weekday) -> 5 (Friday Peak) -> 0 (Sunday) -> 1 (Weekday)
          setSimDay((prevDay) => {
            if (prevDay === 1) return 5;
            if (prevDay === 5) return 0;
            return 1;
          });
        }
        return nextHour;
      });
    }, simSpeed);

    return () => clearInterval(interval);
  }, [isSimPlaying, simSpeed]);

  // Dynamic log append on hour or weather transitions
  useEffect(() => {
    const timeLabel = `${simHour.toString().padStart(2, "0")}:00`;
    let message = "";
    let type: SimEvent["type"] = "system";

    const isMorning = simHour >= 8 && simHour <= 10;
    const isEvening = simHour >= 17 && simHour <= 21;
    const isNight = simHour >= 22 || simHour <= 2;
    const isWeekendDay = simDay === 0 || simDay === 6;

    if (simWeather === "rain" || simWeather === "thunderstorm") {
      message = `Severe storm update: Rain accumulation is causing significant waterlogging issues on the Outer Ring Road and adjacent service lanes. Speeds reduced to 12 km/h. Expected ride dispatch demand peaks +35%.`;
      type = "weather";
    } else if (isMorning && !isWeekendDay) {
      message = `Morning rush active: Heavy peak congestion around ITPL Whitefield & Manyata blocks. Driver supply is struggling to meet high ride search intent. Dynamic fare surge is enabled.`;
      type = "demand";
    } else if (isEvening && !isWeekendDay) {
      message = `Corporate egress peak: Massive outbound travel flows detected towards Outer Ring Road and Marathahalli bottlenecks. Commute duration is elevated by 14 mins.`;
      type = "traffic";
    } else if (isNight && (simDay === 5 || isWeekendDay)) {
      message = `Nightlife weekend surge: Low driver supply detected near central nightlife corridors of Koramangala 80ft road and Indiranagar. Surge pricing multiplier stands at 1.45x yield.`;
      type = "demand";
    } else {
      message = `Engine Update: Grid coordinates re-surveyed. Global demand averages are stable. Multi-agent taxi swarm showing uniform distribution.`;
      type = "system";
    }

    setSimulationLog((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].message === message) return prev;
      const newEvent: SimEvent = { timeLabel, message, type };
      return [...prev.slice(-14), newEvent]; // Keep maximum 15 items
    });
  }, [simHour, simDay, simWeather]);

  // Load custom hooks with simulation inputs
  const { zones, loading: densityLoading, peakZone } = useHotspots(simHour, simDay, simWeather);
  const { signals, recentCount, hottestZone, connected } = useSignals();
  const { predictions, recommended, loading: predictionLoading } = usePrediction(currentZoneId);
  const {
    estimate,
    loading: earningsLoading,
    shiftDuration,
    todayEarnings,
    rideCount
  } = useEarnings(currentZoneId);

  // Unread signals counter tracking
  const [unreadSignalsCount, setUnreadSignalsCount] = useState<number>(0);
  const lastSignalsLengthRef = useState<number>(0);

  // Trigger loading bootstrap sequence
  const [isBootstrapping, setIsBootstrapping] = useState<boolean>(true);

  useEffect(() => {
    // Artificial minimum delay of 1.8s to show premium bootstrap loading messages
    const timer = setTimeout(() => {
      setIsBootstrapping(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Sync unread notification signal counters
  useEffect(() => {
    if (activeTab === "signals") {
      setUnreadSignalsCount(0);
    } else {
      setUnreadSignalsCount((prev) => prev + 1);
    }
  }, [signals]);

  const globalLoading = densityLoading || predictionLoading || earningsLoading || isBootstrapping;

  if (globalLoading) {
    return <LoadingSkeleton />;
  }

  const tabsConfig = [
    { id: "home" as const, label: "Captain Hub", short: "Home", icon: Home },
    { id: "map" as const, label: "Live Map", short: "Live Map", icon: Map },
    { id: "signals" as const, label: "Riders Waiting", short: "Nearby Riders", icon: Bell, badge: true },
    { id: "dashboard" as const, label: "Earnings Helper", short: "Earnings", icon: BarChart3 }
  ];

  const formatShiftTimer = () => {
    const hrs = Math.floor(shiftDuration / 3600);
    const mins = Math.floor((shiftDuration % 3600) / 60);
    const secs = shiftDuration % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex md:flex-row flex-col font-sans select-none overflow-x-hidden">
      
      {/* 1. PREMIUM DESKTOP SIDEBAR COCKPIT (Shown on md and up) */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 bg-bg-card border-r border-[#241F44] dark:border-border-card h-screen sticky top-0 z-40 select-none overflow-y-auto">
        
        {/* Elegant Sidebar Brand Title Header */}
        <div className="p-6 border-b border-border-card flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-lg bg-accent/10 border border-accent/20">
              <Sparkles size={18} className="text-accent animate-pulse" />
            </div>
            <div className="text-xl font-extrabold text-text-primary tracking-tight font-display select-none">
              CAPTAIN ASSISTANT
            </div>
          </div>
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest font-extrabold mt-1">
            EASY CAPTAIN HELPER
          </span>
        </div>

        {/* Live Active Profile Card */}
        <div className="p-4 mx-4 mt-5 bg-bg-primary/45 rounded-2xl border border-border-card/60 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-extrabold text-[#0A0A12] font-display text-sm relative shadow-sm shrink-0">
              C
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-bg-card animate-pulse"></span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-text-primary uppercase tracking-wide truncate">CAPTAIN</div>
              <p className="text-[10px] font-mono text-success uppercase font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 bg-success rounded-full animate-ping"></span>
                ACTIVE
              </p>
            </div>
          </div>
          <LiveBadge connected={connected} />
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-sans text-xs uppercase tracking-wider font-bold cursor-pointer relative group ${
                  isActive
                    ? "bg-accent/10 text-accent border border-accent/25 shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-card-hover border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    className={`transition-transform duration-300 ${isActive ? "scale-110 text-accent" : "text-text-muted group-hover:text-text-secondary"}`}
                  />
                  <span>{tab.label}</span>
                </div>

                {/* Badge Notification indicator */}
                {tab.badge && unreadSignalsCount > 0 && (
                  <span className="bg-danger/10 text-danger border border-danger/30 font-mono text-[9px] px-2 py-0.5 rounded-full font-bold">
                    {unreadSignalsCount > 9 ? "9+" : unreadSignalsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Sidebar Bottom Session Widgets */}
        <div className="p-4 border-t border-border-card/70 flex flex-col gap-3 shrink-0">
          
          {/* Working shift Timer widget */}
          <div className="bg-bg-primary/50 border border-border-card/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-text-muted" />
              <span className="text-[10px] text-text-muted font-mono uppercase">SHIFT TIME</span>
            </div>
            <span className="text-xs font-mono font-bold text-text-primary tracking-tight">
              {formatShiftTimer()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {/* Quick stats miniature */}
            <div className="text-[10px] font-mono text-text-muted uppercase">
              REVENUE: <span className="text-success font-bold">OK ({rideCount} r)</span>
            </div>

            {/* Desktop Theme Switcher */}
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="flex items-center justify-center p-2 rounded-xl border border-border-card bg-bg-card hover:bg-bg-card-hover text-text-muted hover:text-accent transition-all cursor-pointer active:scale-95 shadow-sm"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun size={15} className="text-accent" />
              ) : (
                <Moon size={15} className="text-accent" />
              )}
            </button>
          </div>

        </div>
      </aside>

      {/* 2. ADAPTIVE MOBILE TOP NAVIGATION HEADER (Shown on mobile, screen-cleared on desktop md) */}
      <header className="md:hidden flex items-center justify-between px-3 sm:px-4 h-14 bg-bg-card border-b border-border-card select-none sticky top-0 z-50">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse shrink-0 shadow-[0_0_8px_var(--accent-glow-strong)]"></span>
          <div className="text-xs sm:text-sm md:text-base font-black text-text-primary tracking-tight font-display truncate">
            CAPTAIN ASSISTANT
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Active Shift Duration */}
          <span className="text-[9px] sm:text-[11px] font-mono font-bold bg-bg-primary/85 border border-border-card px-1.5 sm:px-2.5 py-1 rounded-lg text-text-primary">
            ⏱️ {formatShiftTimer()}
          </span>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="p-1.5 sm:p-2 rounded-lg border border-border-card bg-bg-card text-text-muted hover:text-accent cursor-pointer active:scale-95 transition-all"
          >
            {theme === "dark" ? <Sun size={13} className="text-accent" /> : <Moon size={13} className="text-accent" />}
          </button>
        </div>
      </header>

      {/* 3. CORE VIEWPORT CONTAINER SHEET */}
      <main className={`flex-1 relative ${activeTab === 'map' ? 'h-[calc(100vh-3.75rem)] md:h-screen overflow-hidden' : 'min-h-screen bg-bg-primary'}`}>
        
        {/* Home Screen Tab Panel */}
        {activeTab === "home" && (
          <div className="pt-4 md:pt-8 pb-28">
            <HomeScreen
              zones={zones}
              predictions={predictions}
              estimate={estimate}
              shiftDuration={shiftDuration}
              todayEarnings={todayEarnings}
              rideCount={rideCount}
              signalsCount={signals.length}
              onTabChange={setActiveTab}
              connected={connected}
              peakZone={peakZone}
              simHour={simHour}
              simDay={simDay}
              simWeather={simWeather}
              setSimHour={setSimHour}
              setSimDay={setSimDay}
              setSimWeather={setSimWeather}
              isSimPlaying={isSimPlaying}
              setIsSimPlaying={setIsSimPlaying}
              simSpeed={simSpeed}
              setSimSpeed={setSimSpeed}
              simulationLog={simulationLog}
              captainProfile={captainProfile}
              setCaptainProfile={setCaptainProfile}
            />
          </div>
        )}

        {/* Tab Map screen frame */}
        {activeTab === "map" && (
          <div className="absolute inset-0">
            <MapScreen
              zones={zones}
              predictions={predictions}
              recommended={recommended}
              signals={signals}
              driverLocation={{ lat: 12.9352, lng: 77.6245 }}
              simHour={simHour}
              simDay={simDay}
              simWeather={simWeather}
              isSimPlaying={isSimPlaying}
              setIsSimPlaying={setIsSimPlaying}
              simSpeed={simSpeed}
              setSimSpeed={setSimSpeed}
              simulationLog={simulationLog}
              captainProfile={captainProfile}
              setCaptainProfile={setCaptainProfile}
            />
          </div>
        )}

        {/* Dashboard Tab Panel */}
        {activeTab === "dashboard" && (
          <div className="pt-4 md:pt-8 pb-28">
            <Dashboard
              zones={zones}
              predictions={predictions}
              recommended={recommended}
              estimate={estimate}
              shiftDuration={shiftDuration}
              todayEarnings={todayEarnings}
              rideCount={rideCount}
              onTabChange={setActiveTab}
              loading={globalLoading}
            />
          </div>
        )}

        {/* Signals Tab Panel */}
        {activeTab === "signals" && (
          <div className="pt-4 md:pt-8 pb-28">
            <Signals
              signals={signals}
              recentCount={recentCount}
              hottestZone={hottestZone}
              connected={connected}
              byZoneStats={zones.map((z) => {
                const zoneSignals = signals.filter((s) => s.zone_name === z.zone_name);
                
                // Determine dominant type based on counts of different event types
                const counts: Record<string, number> = {
                  app_open: 0,
                  price_check: 0,
                  route_preview: 0,
                  booking_attempt: 0,
                };
                zoneSignals.forEach((s) => {
                  if (counts[s.event_type] !== undefined) {
                    counts[s.event_type]++;
                  }
                });
                
                let dominant_type = "app_open";
                let maxCount = -1;
                for (const type in counts) {
                  if (counts[type] > maxCount) {
                    maxCount = counts[type];
                    dominant_type = type;
                  }
                }
                if (maxCount === 0) {
                  dominant_type = "app_open";
                }

                return {
                  zone_id: z.zone_id,
                  zone_name: z.zone_name,
                  count: zoneSignals.length,
                  dominant_type,
                  score: z.total_score || 0.5
                };
              })}
            />
          </div>
        )}

      </main>

      {/* 4. MOBILE BOTTOM ADAPTIVE NAV BAR (Hidden on desktop md) */}
      <div className="md:hidden">
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadSignalsCount={unreadSignalsCount}
        />
      </div>

    </div>
  );
}
