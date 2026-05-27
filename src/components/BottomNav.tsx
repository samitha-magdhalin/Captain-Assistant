import { Map, BarChart3, Bell, Fuel, Home } from "lucide-react";

interface BottomNavProps {
  activeTab: 'home' | 'map' | 'dashboard' | 'signals';
  setActiveTab: (tab: 'home' | 'map' | 'dashboard' | 'signals') => void;
  unreadSignalsCount?: number;
}

export function BottomNav({
  activeTab,
  setActiveTab,
  unreadSignalsCount = 0
}: BottomNavProps) {
  const tabs = [
    { id: "home" as const, label: "Home Hub", short: "Home", icon: Home },
    { id: "map" as const, label: "Live Map", short: "Live Map", icon: Map },
    { id: "signals" as const, label: "Riders Waiting", short: "Nearby Riders", icon: Bell, badge: true },
    { id: "dashboard" as const, label: "Earnings Helper", short: "Earnings", icon: BarChart3 }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-card/95 backdrop-blur-md border-t border-border-card shadow-lg select-none">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            const activeClass = isActive
              ? "text-accent border-t-2 border-accent -mt-[1px] font-semibold"
              : "text-text-muted hover:text-text-primary";

            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center w-20 h-full transition-all duration-200 outline-none cursor-pointer ${activeClass}`}
              >
                <div className="relative">
                  <Icon size={20} className={isActive ? "scale-110 drop-shadow-[0_0_8px_var(--accent-glow-strong)]" : ""} />
                  
                  {/* Signals Unread Notification Badge */}
                  {tab.badge && unreadSignalsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-bold text-white items-center justify-center font-mono font-extrabold flex">
                        {unreadSignalsCount > 9 ? "!" : unreadSignalsCount}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs mt-1 tracking-tight font-mono">
                  {tab.short}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
