import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { ZonePrediction, IntentSignal, TransitionPrediction, FuelStation, CaptainProfile, SimEvent } from "../types.ts";
import { formatDistance, formatETA } from "../utils/formatters.ts";
import { ConfidenceBar } from "../components/ConfidenceBar.tsx";
import { Crosshair, Navigation, Compass, ChevronRight, Sparkles } from "lucide-react";
import { NEARBY_FUEL_STATIONS } from "../utils/fuelStations.ts";

interface MapScreenProps {
  zones: ZonePrediction[];
  predictions: TransitionPrediction[];
  recommended: { zone_name: string; action: string; reasoning: string } | null;
  signals: IntentSignal[];
  driverLocation: { lat: number; lng: number };
  simHour: number;
  simDay: number;
  simWeather: string;
  isSimPlaying: boolean;
  setIsSimPlaying: (p: boolean) => void;
  simSpeed: number;
  setSimSpeed: (s: number) => void;
  simulationLog: SimEvent[];
  captainProfile: CaptainProfile;
  setCaptainProfile: (p: CaptainProfile) => void;
}

export function MapScreen({
  zones,
  predictions,
  recommended,
  signals,
  driverLocation,
  simHour,
  simDay,
  simWeather,
  isSimPlaying,
  setIsSimPlaying,
  simSpeed,
  setSimSpeed,
  simulationLog,
  captainProfile,
  setCaptainProfile
}: MapScreenProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  // Floating Layer toggles
  const [showHeat, setShowHeat] = useState<boolean>(true);
  const [showIntent, setShowIntent] = useState<boolean>(true);
  const [showFuelStations, setShowFuelStations] = useState<boolean>(true);
  const [fuelFilter, setFuelFilter] = useState<'all' | 'cng' | 'petrol' | 'diesel'>('all');
  const [selectedFuelStation, setSelectedFuelStation] = useState<FuelStation | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'peaks' | 'fuels'>('peaks');
  const [mapThemeLayer, setMapThemeLayer] = useState<'demand' | 'supply' | 'imbalance'>('demand');

  interface BotCaptain {
    id: string;
    name: string;
    profile: 'aggressive' | 'conservative' | 'eco' | 'airport';
    lat: number;
    lng: number;
    targetLat: number;
    targetLng: number;
    status: 'Cruising' | 'Dispatch Trip' | 'Heading into Hotspot';
    payoutToday: number;
    velocity: number;
  }

  // Live driver swarm state tracking
  const [botCaptains, setBotCaptains] = useState<BotCaptain[]>(() => [
    { id: "bot_1", name: "Captain Anand", profile: "aggressive", lat: 12.9340, lng: 77.6180, targetLat: 12.9718, targetLng: 77.6411, status: "Heading into Hotspot", payoutToday: 2150, velocity: 36 },
    { id: "bot_2", name: "Captain Vikram", profile: "conservative", lat: 12.9116, lng: 77.6388, targetLat: 12.9345, targetLng: 77.6200, status: "Cruising", payoutToday: 1820, velocity: 28 },
    { id: "bot_3", name: "Captain Sandeep", profile: "eco", lat: 12.9718, lng: 77.6411, targetLat: 12.9176, targetLng: 77.6244, status: "Dispatch Trip", payoutToday: 1420, velocity: 22 },
    { id: "bot_4", name: "Captain Priya", profile: "airport", lat: 12.9698, lng: 77.7500, targetLat: 13.0451, targetLng: 77.6210, status: "Cruising", payoutToday: 3100, velocity: 52 },
    { id: "bot_5", name: "Captain Ajay", profile: "aggressive", lat: 12.9756, lng: 77.6068, targetLat: 12.9718, targetLng: 77.6411, status: "Heading into Hotspot", payoutToday: 2240, velocity: 41 },
    { id: "bot_6", name: "Captain Lakshmi", profile: "conservative", lat: 12.9176, lng: 77.6244, targetLat: 12.9116, targetLng: 77.6388, status: "Dispatch Trip", payoutToday: 1950, velocity: 31 }
  ]);

  // Layers collection refs to manage dynamic additions/removals
  const heatLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const intentLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const fuelLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const botLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // Active highlighted prediction zone
  const [selectedPredictionIndex, setSelectedPredictionIndex] = useState<number>(0);
  const topPrediction = predictions[selectedPredictionIndex];

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log("[MapScreen] Initializing standard Leaflet native layer...");
    
    // Create map instance centered closely on user/driver location for instant context
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([driverLocation.lat, driverLocation.lng], 13.5);

    // CartoDB Dark Matter tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(map);

    // Initialise layergroups
    heatLayerGroupRef.current = L.layerGroup().addTo(map);
    intentLayerGroupRef.current = L.layerGroup().addTo(map);
    fuelLayerGroupRef.current = L.layerGroup().addTo(map);
    botLayerGroupRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    // Fix absolute popup bindings
    map.on("popupopen", (e) => {
      const px = map.project(e.target._popup._latlng);
      px.y -= e.target._popup._container.clientHeight / 2;
      map.panTo(map.unproject(px), { animate: true });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Render Driver Location Pulse Maker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (driverMarkerRef.current) {
      driverMarkerRef.current.remove();
    }

    const driverIcon = L.divIcon({
      className: "captain-pulsing-icon",
      html: `
        <div class="captain-marker-dot">
          <div class="captain-marker-pulse"></div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const marker = L.marker([driverLocation.lat, driverLocation.lng], { icon: driverIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; text-align: center;">
          <b style="color: #FFB300; font-size:13px;">🟢 Active Captain Node</b>
          <p style="margin: 4px 0 0; font-size: 11px; color:#A9B1D6;">ID: CAPTAIN_001 • Koramangala</p>
        </div>
      `)
      .addTo(map);

    driverMarkerRef.current = marker;
  }, [driverLocation]);

  // 3. Render Demand Heatmap Circles (Layer 1) supporting Demand, Supply, and Imbalance overlays
  useEffect(() => {
    const layerGroup = heatLayerGroupRef.current;
    if (!layerGroup) return;

    // Clear current circles
    layerGroup.clearLayers();

    if (!showHeat) return;

    zones.forEach((zone) => {
      // Build dynamic variables based on theme layers
      let color = "#FF1744"; // red
      let title = "Rider Demand";
      let detailsText = "";
      let radius = 600;
      let opacity = 0.35;

      // Derived supply densities mimicking competitor clusterings
      const derivedSupplyScore = Math.max(0.15, Math.min(0.9, (0.95 - zone.total_score) * 0.75 + (zone.lat % 0.05) * 5));
      const imbalanceScore = Math.max(0.05, Math.min(0.95, zone.total_score - derivedSupplyScore + 0.3));

      if (mapThemeLayer === "demand") {
        const isHigh = zone.demand_level === "HIGH";
        const isMedium = zone.demand_level === "MEDIUM";
        color = isHigh ? "#FF1744" : isMedium ? "#FF6D00" : "#FFB300";
        radius = isHigh ? 800 : isMedium ? 600 : 400;
        opacity = Math.max(0.15, Math.min(0.75, zone.total_score * 0.75));
        title = "Rider Search Intention";
        detailsText = `● Avg Multiplier: ${(1.0 + zone.total_score * 0.5).toFixed(2)}x surge<br/>● Expected Bookings: ~${zone.predicted_rides_next_30min}`;
      } else if (mapThemeLayer === "supply") {
        const isDense = derivedSupplyScore > 0.6;
        const isMod = derivedSupplyScore > 0.3;
        color = isDense ? "#00E676" : isMod ? "#00B0FF" : "#2979FF";
        radius = isDense ? 700 : isMod ? 550 : 400;
        opacity = Math.max(0.15, Math.min(0.7, derivedSupplyScore * 0.7));
        title = "Competing Driver Swarms";
        detailsText = `● Active Swarms: ${Math.round(derivedSupplyScore * 40)} Captain nodes<br/>● Congestion Rating: ${isDense ? "High Saturation" : "Moderate Capacity"}`;
      } else {
        // Imbalance layer
        const isExtreme = imbalanceScore > 0.55;
        color = isExtreme ? "#D500F9" : "#AA00FF";
        radius = isExtreme ? 900 : 650;
        opacity = Math.max(0.2, Math.min(0.85, imbalanceScore * 0.85));
        title = "Supply-Demand Imbalance Yield";
        detailsText = `● Recalculated Surge: +${(imbalanceScore * 0.6).toFixed(2)}x reward<br/>● Capture Ratio: ${Math.round((1.0 - imbalanceScore) * 100)}% Match Efficiency`;
      }

      const circle = L.circle([zone.lat, zone.lng], {
        radius,
        color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 1.5,
        opacity: 0.35
      });

      // Tooltip styling with upgraded styling
      circle.bindTooltip(`
        <div style="font-family: sans-serif; padding: 4px; border-radius:8px; line-height: 1.3;">
          <b style="color: #ffffff; font-size: 13px;">${zone.zone_name}</b>
          <span style="display: block; margin-top: 3px; font-size:11px; font-weight: bold; color: ${color}">
            ● ${title} Overlay
          </span>
          <span style="display: block; margin-top: 4px; font-size:10px; color:#A9B1D6; font-family: monospace;">
             ${detailsText}
          </span>
        </div>
      `, {
        direction: "top",
        sticky: true
      });

      circle.addTo(layerGroup);
    });
  }, [zones, showHeat, mapThemeLayer]);

  // 4. Render Live Intent Pulse Rings (Layer 2)
  useEffect(() => {
    const layerGroup = intentLayerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    if (!showIntent) return;

    // Capture the last 8 recent signals to avoid screen clutter
    const maxRecentSignals = signals.slice(0, 8);

    maxRecentSignals.forEach((signal) => {
      const signalIcon = L.divIcon({
        className: "pulse-ring-icon",
        html: `
          <div class="pulse-ring-container">
            <div class="pulse-ring-dot"></div>
            <div class="pulse-ring-wave"></div>
          </div>
        `,
        iconSize: [10, 10],
        iconAnchor: [5, 5]
      });

      const marker = L.marker([signal.lat, signal.lng], { icon: signalIcon })
        .bindTooltip(`
          <div style="font-family: monospace; font-size:10px; padding: 2px;">
            <b style="color:#FFB300;">💥 ${signal.event_type.replace("_", " ").toUpperCase()}</b>
            <br/><span style="color:#ffffff;">In ${signal.zone_name}</span>
          </div>
        `, { direction: "right", sticky: true });

      marker.addTo(layerGroup);
    });
  }, [signals, showIntent]);

  // 4.1 Timer-based Dynamic Bot Captain Positioning Loop to simulate pilot swarm agents
  useEffect(() => {
    const intervalTime = isSimPlaying ? Math.max(800, 2000 / simSpeed) : 3200;
    
    const interval = setInterval(() => {
      setBotCaptains((prevBots) => {
        return prevBots.map((bot) => {
          const dLat = bot.targetLat - bot.lat;
          const dLng = bot.targetLng - bot.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);

          // If reached target, assign a new target randomly
          if (dist < 0.002) {
            const randomZone = zones[Math.floor(Math.random() * zones.length)];
            const newTargetLat = randomZone ? randomZone.lat + (Math.random() - 0.5) * 0.008 : driverLocation.lat;
            const newTargetLng = randomZone ? randomZone.lng + (Math.random() - 0.5) * 0.008 : driverLocation.lng;
            
            const statuses: BotCaptain['status'][] = ["Cruising", "Dispatch Trip", "Heading into Hotspot"];
            const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            return {
              ...bot,
              lat: bot.targetLat,
              lng: bot.targetLng,
              targetLat: newTargetLat,
              targetLng: newTargetLng,
              status: newStatus,
              payoutToday: bot.payoutToday + Math.floor(Math.random() * 80) + 30,
              velocity: Math.floor(Math.random() * 25) + 18
            };
          }

          // Move bot towards target
          const stepPercent = Math.max(0.04, Math.random() * 0.12);
          const nextLat = bot.lat + dLat * stepPercent;
          const nextLng = bot.lng + dLng * stepPercent;

          return {
            ...bot,
            lat: nextLat,
            lng: nextLng
          };
        });
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [zones, isSimPlaying, simSpeed, driverLocation]);

  // 4.2 Bot Captain Marker Leaflet Injection Effect updating pilot swarms state
  useEffect(() => {
    const layerGroup = botLayerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    botCaptains.forEach((bot) => {
      let colorClass = "bg-[#FFB300] border-amber-300"; 
      let styleText = "🛡️ Commuter Cruiser";
      if (bot.profile === "aggressive") {
        colorClass = "bg-rose-500 border-rose-300 animate-pulse";
        styleText = "🚀 Surge Maverick";
      } else if (bot.profile === "eco") {
        colorClass = "bg-emerald-500 border-emerald-300";
        styleText = "🌿 Green Eco Glider";
      } else if (bot.profile === "airport") {
        colorClass = "bg-sky-500 border-sky-300";
        styleText = "✈️ Airport Aviator";
      }

      const botIcon = L.divIcon({
        className: "bot-captain-le-icon",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="h-4.5 w-4.5 rounded-full ${colorClass} border border-slate-900 shadow-2xl flex items-center justify-center text-[8px] text-slate-950 font-black">
              ⚡
            </div>
            <div class="absolute h-6 w-6 rounded-full border border-dashed border-accent/35 animate-spin pointer-events-none" style="animation-duration: 10s"></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = L.marker([bot.lat, bot.lng], { icon: botIcon })
        .bindTooltip(`
          <div style="font-family: sans-serif; padding: 4px; width:170px; background-color:#090514; color:#FFFFFF; border-radius:10px; line-height: 1.4;">
            <b style="color: #FFB300; font-size:11px; display:block; border-b: 1px solid #1E1A33; padding-bottom:3px; margin-bottom:4px;">🤖 Bot Operator Swarm</b>
            <span style="font-size:11px; font-weight:800; display:block;">${bot.name}</span>
            <span style="font-size:9px; color:#A9B1D6; display:block;">Style: <b>${styleText}</b></span>
            <span style="font-size:9px; color:#A9B1D6; display:block;">Status: <b style="color:#00E676;">${bot.status}</b></span>
            <span style="font-size:9px; color:#00B0FF; display:block;">Earnings Today: <b>₹${bot.payoutToday}</b></span>
          </div>
        `, { direction: "top", sticky: true });

      marker.addTo(layerGroup);
    });
  }, [botCaptains]);

  // 5. Render Fuel Stations (Layer 3)
  useEffect(() => {
    const layerGroup = fuelLayerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    if (!showFuelStations) return;

    const filteredStations = NEARBY_FUEL_STATIONS.filter((s) => {
      if (fuelFilter === "all") return true;
      if (fuelFilter === "cng") return !!s.fuels.cng?.available;
      if (fuelFilter === "petrol") return !!s.fuels.petrol?.available;
      if (fuelFilter === "diesel") return !!s.fuels.diesel?.available;
      return true;
    });

    filteredStations.forEach((station) => {
      const brandColors: Record<string, string> = {
        IOCL: "#FF6E00",
        HP: "#1E40AF",
        Shell: "#DC2626",
        BPCL: "#16A34A",
        GAIL: "#0D9488"
      };
      
      const color = brandColors[station.brand] || "#4B5563";

      const iconHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
          background-color: ${color};
          cursor: pointer;
          transition: transform 0.15s ease;
        ">
          <span style="font-size: 13px; line-height: 1;">⛽</span>
        </div>
      `;

      const fuelIcon = L.divIcon({
        className: "fuel-marker-div-icon",
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const textFuels = Object.entries(station.fuels)
        .filter(([_, value]) => value?.available)
        .map(([type, value]) => `<span style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 4px; padding: 1.5px 4px; font-size: 10px; font-family: monospace; color: #ffffff;">${type.toUpperCase()}: ₹${value?.price}</span>`)
        .join(' ');

      const marker = L.marker([station.lat, station.lng], { icon: fuelIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 180px; line-height: 1.4;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 4px; margin-bottom: 4px;">
              <span style="background: ${color}; color: #ffffff; padding: 2px 5px; font-size: 9px; font-weight: bold; border-radius: 4px; font-family: monospace;">${station.brand}</span>
              <span style="font-size: 10px; color: #F59E0B; font-weight: bold;">⭐ ${station.rating}</span>
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 11px; font-weight: bold; color: #ffffff;">${station.name}</h4>
            <p style="margin: 0; font-size: 9px; color: #8C99B4; line-height: 1.2;">${station.address}</p>
            <div style="margin: 5px 0; font-size: 10px; color: #34D399; font-weight: bold;">
              ⏱️ ${station.distance_km} km • ${station.eta_mins} mins away
            </div>
            <div style="font-size: 9px; color: #9CA3AF; margin-bottom: 6px;">
              Queue: <b style="color: ${station.has_queue === 'Low' ? '#34D399' : station.has_queue === 'Medium' ? '#F59E0B' : '#EF4444'}">${station.has_queue}</b>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 4px;">
              ${textFuels}
            </div>
          </div>
        `);

      marker.on("click", () => {
        setSelectedFuelStation(station);
      });
    });

  }, [showFuelStations, fuelFilter]);

  // Recenter on driver coordinates Helper
  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.setView([driverLocation.lat, driverLocation.lng], 14, { animate: true });
    }
  };

  // Pan to target zone coordinates helper
  const handleFocusZone = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 14.5, { animate: true });
    }
  };

  const filteredFuelStations = NEARBY_FUEL_STATIONS.filter((s) => {
    if (fuelFilter === "all") return true;
    if (fuelFilter === "cng") return !!s.fuels.cng?.available;
    if (fuelFilter === "petrol") return !!s.fuels.petrol?.available;
    if (fuelFilter === "diesel") return !!s.fuels.diesel?.available;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-bg-primary overflow-hidden">
      
      {/* A. DESKTOP ANALYTICS DOCK (Left bar, visible on md and up) */}
      <div className="hidden md:flex flex-col w-80 bg-bg-card border-r border-[#241F44] dark:border-border-card p-5 h-full overflow-y-auto shrink-0 select-none font-sans justify-between">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="border-b border-border-card/40 pb-3">
            <span className="text-[10px] tracking-widest font-mono text-accent uppercase font-bold">BUSY AREAS PLANNER</span>
            <h2 className="text-xl font-display font-extrabold text-text-primary tracking-tight mt-0.5">
              Where to go next
            </h2>
            <p className="text-[11px] text-text-secondary mt-1">
              Select any busy area below or find nearby CNG/Fuel stations with live pricing and queue indicators.
            </p>
          </div>

          {/* Controls Toggles right in the sidebar */}
          <div className="flex flex-col gap-2.5 bg-bg-primary/50 border border-border-card/45 p-3 rounded-2xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold block mb-1">
              Map Filters
            </span>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setShowHeat(!showHeat)}
                title="Toggle Passenger Demand Circles"
                className={`flex flex-col items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] transition-all font-mono border cursor-pointer ${
                  showHeat ? "bg-[#EF4444]/15 text-red-400 border-[#EF4444]/40" : "text-slate-500 bg-transparent border-border-card/45 hover:bg-bg-card-hover"
                }`}
              >
                <span>🌡️ Crowd</span>
                <span className="text-[8px] font-bold uppercase">{showHeat ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => setShowIntent(!showIntent)}
                title="Toggle Active Passenger Searches"
                className={`flex flex-col items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] transition-all font-mono border cursor-pointer ${
                  showIntent ? "bg-accent/15 text-accent border-accent/20" : "text-slate-500 bg-transparent border-border-card/45 hover:bg-bg-card-hover"
                }`}
              >
                <span>💥 Busy Spots</span>
                <span className="text-[8px] font-bold uppercase">{showIntent ? "ON" : "OFF"}</span>
              </button>

              <button
                onClick={() => setShowFuelStations(!showFuelStations)}
                title="Toggle CNG/Petrol/Diesel Stations"
                className={`flex flex-col items-center gap-0.5 justify-center py-1.5 rounded-lg text-[10px] transition-all font-mono border cursor-pointer ${
                  showFuelStations ? "bg-info/10 text-info border-info/20" : "text-slate-500 bg-transparent border-border-card/45 hover:bg-bg-card-hover"
                }`}
              >
                <span>⛽ Fuel Pumps</span>
                <span className="text-[8px] font-bold uppercase">{showFuelStations ? "ON" : "OFF"}</span>
              </button>
            </div>
          </div>

          {/* Sidebar Tab Selector */}
          <div className="flex border-b border-border-card/30 pb-0.5 gap-2 mt-2">
            <button
              onClick={() => setSidebarTab('peaks')}
              className={`flex-1 pb-1.5 text-center text-xs uppercase tracking-wider font-mono font-bold cursor-pointer transition-all border-b-2 ${
                sidebarTab === 'peaks' ? "text-accent border-accent font-black" : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              🔮 Peaks ({predictions.length})
            </button>
            <button
              onClick={() => setSidebarTab('fuels')}
              className={`flex-1 pb-1.5 text-center text-xs uppercase tracking-wider font-mono font-bold cursor-pointer transition-all border-b-2 ${
                sidebarTab === 'fuels' ? "text-accent border-accent font-black" : "text-slate-500 border-transparent hover:text-slate-300"
              }`}
            >
              ⛽ Fuels ({NEARBY_FUEL_STATIONS.length})
            </button>
          </div>

          {/* List content conditional on tab */}
          {sidebarTab === 'peaks' ? (
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider font-bold">
                Suggested Demand Hotspots
              </span>
              
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {predictions.map((p, idx) => {
                  const isSelected = selectedPredictionIndex === idx;
                  return (
                    <div
                      key={p.zone_id}
                      onClick={() => {
                        setSelectedPredictionIndex(idx);
                        setSelectedFuelStation(null); // Clear selected fuel pump to prioritize peak zone
                        handleFocusZone(p.lat, p.lng);
                      }}
                      className={`group text-left border rounded-xl p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-accent/15 border-accent/40 shadow-sm" 
                          : "bg-bg-primary/45 border-border-card/60 hover:bg-bg-primary hover:border-border-card"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-sm font-bold tracking-tight transition-colors ${isSelected ? "text-accent" : "text-white group-hover:text-accent"}`}>
                          {p.zone_name}
                        </h4>
                        <span className="text-[10px] font-bold font-mono text-success">
                          {p.confidence_pct}% Chance
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-0.5">
                          <Compass size={10} className="text-slate-500" />
                          {p.direction}
                        </span>
                        <span>•</span>
                        <span>{formatDistance(p.distance_km)}</span>
                        <span>•</span>
                        <span className="text-success font-semibold">ETA: {formatETA(p.eta_mins)}</span>
                      </div>

                      {/* Miniature confidence line */}
                      <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden mt-3 border border-slate-950">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${isSelected ? "bg-accent" : "bg-slate-600"}`} 
                          style={{ width: `${p.confidence_pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Type selector */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950/25 border border-border-card/30 rounded-xl">
                {(['all', 'cng', 'petrol', 'diesel'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFuelFilter(t)}
                    className={`py-1 rounded text-[9px] uppercase tracking-wider font-mono font-bold cursor-pointer transition-all text-center ${
                      fuelFilter === t 
                        ? "bg-info/20 text-info border border-info/30" 
                        : "text-slate-500 hover:text-slate-300 border border-transparent bg-transparent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Station Listing */}
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {filteredFuelStations.map((station) => {
                  const isSelected = selectedFuelStation?.id === station.id;
                  return (
                    <div
                      key={station.id}
                      onClick={() => {
                        setSelectedFuelStation(station);
                        handleFocusZone(station.lat, station.lng);
                      }}
                      className={`group text-left border rounded-xl p-3 cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-info/10 border-info/40 shadow-sm" 
                          : "bg-bg-primary/45 border-border-card/60 hover:bg-bg-primary hover:border-border-card"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-mono font-bold bg-[#0A0A14] border border-border-card text-info px-1 py-0.5 rounded shrink-0">
                            {station.brand}
                          </span>
                          <h4 className={`text-xs font-bold tracking-tight truncate transition-colors ${isSelected ? "text-info" : "text-white group-hover:text-info"}`}>
                            {station.name.replace("Station", "").replace("Pump", "")}
                          </h4>
                        </div>
                        <span className="text-[10px] text-warning font-semibold shrink-0">
                          ⭐ {station.rating}
                        </span>
                      </div>

                      <p className="text-[10px] text-slate-400 block truncate mt-1">
                        {station.address}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 border-t border-border-card/40 pt-2 leading-none">
                        <span>⏱️ {station.distance_km} km ({station.eta_mins}m)</span>
                        <span className={`font-bold ${
                          station.has_queue === 'Low' ? 'text-success' : station.has_queue === 'Medium' ? 'text-warning' : 'text-danger'
                        }`}>
                          {station.has_queue} Queue
                        </span>
                      </div>

                      {/* Display pricing tags at bottom of card */}
                      <div className="flex flex-wrap gap-1 mt-2 mb-0.5">
                        {station.fuels.cng?.available && (
                          <span className="text-[8px] font-mono bg-success/15 border border-success/30 text-success rounded px-1.5 py-0.5 font-bold">
                            CNG ₹{station.fuels.cng.price}
                          </span>
                        )}
                        {station.fuels.petrol?.available && (
                          <span className="text-[8px] font-mono bg-warning/15 border border-warning/30 text-warning rounded px-1.5 py-0.5 font-bold">
                            PET ₹{station.fuels.petrol.price}
                          </span>
                        )}
                        {station.fuels.diesel?.available && (
                          <span className="text-[8px] font-mono bg-info/10 border border-info/25 text-info rounded px-1.5 py-0.5 font-bold">
                            DSL ₹{station.fuels.diesel.price}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredFuelStations.length === 0 && (
                  <p className="text-center py-6 text-xs text-slate-500">
                    No matching fuel stations nearby.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Enriched Geospatial Hotspot Inspector Panels (Full-Stack Real-Time Telemetry Interface) */}
        {topPrediction && (() => {
          const matchingZone = zones.find((z) => z.zone_id === topPrediction.zone_id);
          if (!matchingZone) return null;

          const congestionText = matchingZone.traffic_state?.congestion_level || "LIGHT";
          const speedVal = matchingZone.traffic_state?.speed_kmph || 35;
          const roadName = matchingZone.traffic_state?.road_name || "Main Terminal Road";
          const waterlogRisk = matchingZone.weather_metrics?.waterlogging_risk || "NONE";
          const compCount = matchingZone.captain_density?.competing_count || 12;
          const satPct = matchingZone.captain_density?.saturation_pct || 65;
          const crowdStatus = matchingZone.captain_density?.status || "OPTIMAL";
          const opCost = matchingZone.dispatch_intelligence?.opportunity_cost_pct || 15;
          const expectedYield = matchingZone.dispatch_intelligence?.expected_yield_multiplier || 1.1;

          return (
            <div className="border-t border-border-card/45 pt-4 mt-4 flex flex-col gap-3 select-none">
              <span className="text-[9px] font-mono font-extrabold text-[#0F0A1F] bg-accent px-2 py-0.5 rounded uppercase self-start leading-none tracking-wider font-mono">
                Hotspot Telemetry Inspector
              </span>
              
              {/* Card Title */}
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-border-card/70 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono leading-none">
                  <span className="text-slate-400 uppercase font-black">DISPATCH CONFIDENCE</span>
                  <span className={matchingZone.confidence_metrics?.stability_rating === "LOW" ? "text-danger" : "text-success font-bold"}>
                    {matchingZone.confidence_metrics?.stability_rating || "HIGH"} STABILITY
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-sans font-black text-white">{matchingZone.zone_name}</span>
                  <span className="text-xl font-display font-extrabold text-accent">{matchingZone.confidence_metrics?.reliability_pct || topPrediction.confidence_pct}%</span>
                </div>
              </div>

              {/* Traffic & Safety Conditions */}
              <div className="bg-[#120E24] p-3 rounded-2xl border border-border-card">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                  <span>🛣️ ROAD CONGESTION INFLOW</span>
                  <span className={congestionText === "HEAVY" || congestionText === "BLOCKED" ? "text-danger font-bold" : "text-success font-bold"}>
                    {congestionText}
                  </span>
                </div>
                <div className="text-xs font-bold font-sans text-white mt-1 pr-1 truncate">
                  {roadName} Network
                </div>
                <div className="text-[10px] font-mono text-slate-300 mt-1 flex justify-between">
                  <span>Speed: {speedVal} km/h avg</span>
                  {waterlogRisk !== "NONE" && (
                    <span className="text-warning">⚠️ Waterlog: {waterlogRisk}</span>
                  )}
                </div>
              </div>

              {/* Captain Competing Saturation - Priority 5 Warning */}
              <div className="bg-[#120E24] p-3 rounded-2xl border border-border-card">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                  <span>👥 CAPTAIN DENSITY SENSORS</span>
                  <span className={`px-1 rounded text-[8px] font-bold ${
                    crowdStatus === "OVERSATURATED" ? "bg-danger/10 text-danger" : crowdStatus === "CROWDED" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                  }`}>
                    {crowdStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs font-bold text-white font-sans">{compCount} Competitive Captains</span>
                  <span className="text-xs font-mono font-bold text-accent">{satPct}% Filled</span>
                </div>
                {crowdStatus !== "OPTIMAL" && (
                  <p className="text-[9px] font-sans text-danger opacity-95 leading-normal mt-1 border-t border-[#231A33] pt-1">
                    ⚠️ <strong>Crowding Warn:</strong> Demand saturation possible. High competitor density nearby may increase ride search delays.
                  </p>
                )}
              </div>

              {/* Dispatch Intelligence Advice - Priority 6 */}
              <div className="bg-[#0A0D1F] p-3 rounded-2xl border-2 border-accent/25 relative overflow-hidden">
                <div className="top-0 right-0 py-0.5 px-2 bg-accent/15 border-b border-l border-accent/25 rounded-bl-xl text-[8px] font-mono text-accent absolute font-bold tracking-widest leading-none">DISPATCH RECOMMENDATION</div>
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-xs font-bold text-[#E2E8F0]">{matchingZone.dispatch_intelligence?.recommended_action || "Advance to area corridors."}</span>
                  <div className="flex justify-between text-[10px] font-mono text-slate-300 mt-1 border-t border-border-card/30 pt-1.5">
                    <span>Opp. Cost of Standing:</span>
                    <span className="text-danger font-extrabold">{opCost}% Payout Loss</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-300">
                    <span>Peak Yield Multiplier:</span>
                    <span className="text-[#10B981] font-extrabold">+{expectedYield}x multipliers</span>
                  </div>
                </div>
              </div>

              {/* Grounded Coach advisory tip */}
              {recommended && selectedPredictionIndex === 0 && (
                <div className="bg-slate-950/20 p-3 rounded-2xl border border-slate-950 flex flex-col gap-1">
                  <span className="text-[8px] font-mono font-bold text-success">📍 AI GROUNDED DRIVER ADVISOR:</span>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                    {recommended.reasoning}
                  </p>
                </div>
              )}

            </div>
          );
        })()}
      </div>

      {/* B. ADAPTIVE LIVE MAP DISPLAY FIELD LAYER */}
      <div className="flex-1 relative h-full w-full overflow-hidden">
        {/* 1. Leaflet element */}
        <div id="leaflet-map-element" ref={mapContainerRef} className="h-full w-full" />

        {/* 1.1 Supply vs Demand Interactive Map Overlay Theme Selector */}
        <div className="absolute top-4 left-4 z-40 bg-bg-card/95 backdrop-blur-md border border-border-card/85 rounded-2xl p-1.5 flex flex-wrap items-center gap-1 shadow-2xl">
          {[
            { id: "demand" as const, label: "🌡️ Rider Demand", style: "text-rose-400 font-bold" },
            { id: "supply" as const, label: "🛵 Captain Supply", style: "text-emerald-400 font-bold" },
            { id: "imbalance" as const, label: "💜 Imbalance Yield", style: "text-fuchsia-400 font-bold" }
          ].map((layer) => (
            <button
              key={layer.id}
              onClick={() => setMapThemeLayer(layer.id)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded-xl transition-all cursor-pointer select-none leading-none border ${
                mapThemeLayer === layer.id 
                  ? "bg-accent border-accent text-slate-950 font-black shadow-lg" 
                  : `bg-[#0D091A] border-transparent text-slate-400 hover:bg-slate-950 hover:text-white`
              }`}
            >
              <span className={mapThemeLayer === layer.id ? "text-slate-950" : layer.style}>{layer.label}</span>
            </button>
          ))}
        </div>

        {/* 1.2 Dedicated AI Dispatch HUD */}
        <div className="hidden lg:flex absolute bottom-4 right-4 z-40 bg-[#0C091D]/90 backdrop-blur-md border border-accent/20 rounded-2xl p-3 flex flex-col gap-1.5 shadow-2xl w-56 font-mono text-[9px] text-slate-300">
          <div className="flex justify-between items-center border-b border-[#251F42] pb-1">
            <span className="text-accent font-black tracking-widest text-[8px] uppercase">🛰️ DISPATCH GRID DATA</span>
            <span className="text-[7px] bg-[#110E34] border border-accent/30 text-accent px-1 rounded animate-pulse uppercase leading-none font-bold">CONNECTED</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span>Grid Latency:</span>
            <span className="text-success font-bold">42ms • Recalculated</span>
          </div>
          <div className="flex justify-between">
            <span>Active Swarms:</span>
            <span className="text-accent font-bold">6 pilot agents</span>
          </div>
          <div className="flex justify-between">
            <span>Strategy Style:</span>
            <span className="text-white font-bold uppercase">{captainProfile === "conservative" ? "Commuter" : captainProfile === "aggressive" ? "Maverick" : captainProfile === "eco" ? "Eco" : "Aviator"}</span>
          </div>
          <div className="flex justify-between">
            <span>Weather Drift:</span>
            <span className={simWeather === "clear" ? "text-slate-400" : "text-rose-400 font-extrabold"}>{simWeather === "clear" ? "0.0% Delay" : simWeather === "cloudy" ? "2.0% Drift" : "15.0% Waterlogged"}</span>
          </div>
        </div>

        {/* 2. Floating layers Control widgets (Top and overlay) */}
        <div className="absolute top-4 right-4 z-40 flex flex-col gap-2 select-none">
          {/* Recenter triggers */}
          <button
            onClick={handleRecenter}
            className="bg-bg-card/95 hover:bg-slate-900 border border-border-card text-white rounded-full p-2.5 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Recenter Map"
          >
            <Crosshair size={18} className="text-accent" />
          </button>

          {/* Quick controls panel shown on mobile ONLY */}
          <div className="md:hidden bg-bg-card/95 backdrop-blur-md border border-border-card rounded-lg p-2.5 flex flex-col gap-2 shadow-2xl min-w-[124px]">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 font-bold mb-1 border-b border-border-card pb-1">
              Filters
            </span>

            <button
              onClick={() => setShowHeat(!showHeat)}
              className={`flex items-center gap-2 text-left justify-between px-2 py-1 rounded text-xs transition-all font-mono cursor-pointer ${
                showHeat ? "bg-[#EF4444]/20 text-red-400 border border-[#EF4444]/55" : "text-slate-500 bg-transparent border border-transparent"
              }`}
            >
              <span>🌡️ Crowd</span>
              <span className="text-[8px] font-bold uppercase">{showHeat ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setShowIntent(!showIntent)}
              className={`flex items-center gap-2 text-left justify-between px-2 py-1 rounded text-xs transition-all font-mono cursor-pointer ${
                showIntent ? "bg-accent/20 text-accent border border-accent/40" : "text-slate-500 bg-transparent border border-transparent"
              }`}
            >
              <span>💥 Busy</span>
              <span className="text-[8px] font-bold uppercase">{showIntent ? "ON" : "OFF"}</span>
            </button>

            <button
              onClick={() => setShowFuelStations(!showFuelStations)}
              className={`flex items-center gap-2 text-left justify-between px-2 py-1 rounded text-xs transition-all font-mono cursor-pointer ${
                showFuelStations ? "bg-info/20 text-info border border-info/40" : "text-slate-500 bg-transparent border border-transparent"
              }`}
            >
              <span>⛽ Fuel</span>
              <span className="text-[8px] font-bold uppercase">{showFuelStations ? "ON" : "OFF"}</span>
            </button>
          </div>
        </div>

        {/* 3. Bottom Float Prediction slider Card (Visible on mobile only when NOT viewing a specific fuel pump) */}
        {topPrediction && !selectedFuelStation && (
          <div className="md:hidden absolute bottom-24 left-4 right-4 z-40 max-w-sm mx-auto animate-fade-in select-none">
            <div className="card border-accent/40 shadow-[0_4px_32px_var(--accent-glow)] relative overflow-hidden bg-bg-card/95 backdrop-blur-md p-4">
              {/* Ambient accent background glow */}
              <div className="absolute -top-[100px] -right-[100px] w-[200px] h-[200px] bg-accent blur-3xl rounded-full opacity-10"></div>
              
              {/* Recommended Badge Indicator */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="badge bg-accent/10 text-accent border border-accent/20 text-[9px]">
                  🔮 NEXT HIGH DEMAND AREA
                </span>
                <div className="flex items-center gap-1">
                  {predictions.map((p, idx) => (
                    <button
                      key={p.zone_id}
                      onClick={() => {
                        setSelectedPredictionIndex(idx);
                        handleFocusZone(p.lat, p.lng);
                      }}
                      className={`h-2 w-2 rounded-full transition-all ${
                        selectedPredictionIndex === idx ? "bg-accent w-4" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Prediction Area Primary Detail */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-display font-bold text-white tracking-tight">
                    {topPrediction.zone_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Compass size={11} className="text-slate-500" />
                      {topPrediction.direction}
                    </span>
                    <span>•</span>
                    <span>{formatDistance(topPrediction.distance_km)}</span>
                    <span>•</span>
                    <span className="text-success font-semibold">ETA: {formatETA(topPrediction.eta_mins)}</span>
                  </div>
                </div>

                {/* Pan to Map Indicator Button */}
                <button
                  onClick={() => handleFocusZone(topPrediction.lat, topPrediction.lng)}
                  className="btn-primary py-1 px-2.5 uppercase tracking-wider text-[9px] font-bold"
                >
                  <Navigation size={11} className="rotate-45 text-slate-950" />
                  <span className="text-slate-950">View</span>
                </button>
              </div>

              {/* Confidence bar metric */}
              <div className="border-t border-border-card/85 pt-2.5 mt-2.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1 leading-none">
                  <span>Likelihood of finding rides</span>
                </div>
                <ConfidenceBar value={topPrediction.confidence_pct} showLabel={true} animated={true} />
              </div>

              {/* Mini AI feedback reasoning statement */}
              {recommended && selectedPredictionIndex === 0 && (
                <p className="text-[10px] leading-relaxed text-slate-400 border-t border-border-card/80 pt-2.5 mt-2.5 bg-slate-950/20 rounded p-1.5 border border-slate-950 flex items-start gap-1">
                  <Sparkles size={11} className="text-accent shrink-0 mt-0.5" />
                  <span>{recommended.reasoning}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* 4. Bottom Float Fuel Station Details Card (Visible on mobile/desktop when a fuel pump is tapped/clicked) */}
        {selectedFuelStation && (
          <div className="absolute bottom-24 md:bottom-6 left-4 right-4 z-40 max-w-sm mx-auto animate-fade-in select-none">
            <div className="card border-info/40 shadow-[0_4px_32px_rgba(0,186,255,0.15)] relative overflow-hidden bg-bg-card/95 backdrop-blur-md p-4">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedFuelStation(null)}
                className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded-full bg-[#0A0A14] border border-border-card text-slate-400 hover:text-white cursor-pointer text-xs"
                title="Close"
              >
                ✕
              </button>

              {/* Badge info */}
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-info/10 text-info border border-info/20 text-[9px]">
                  ⛽ FUEL STATION INFO
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  selectedFuelStation.has_queue === 'Low' ? 'bg-success/10 text-success border-success/20' : selectedFuelStation.has_queue === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' : 'bg-danger/10 text-danger border-danger/25'
                }`}>
                  {selectedFuelStation.has_queue} Queue
                </span>
              </div>

              {/* Title & Brand */}
              <div className="flex items-start justify-between gap-3 mb-1.5 pr-6">
                <div>
                  <h3 className="text-base font-display font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span className="text-xs bg-[#0A0A14] px-1.5 py-0.5 rounded text-info border border-border-card font-mono">{selectedFuelStation.brand}</span>
                    {selectedFuelStation.name}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1 lines-2 leading-relaxed">
                    {selectedFuelStation.address}
                  </p>
                </div>
              </div>

              {/* Dist and rating row */}
              <div className="flex items-center gap-3 text-xs font-mono text-slate-300 py-2 border-t border-b border-border-card/40 my-3 font-sans">
                <span>⏱️ <b>{selectedFuelStation.distance_km} km</b> away ({selectedFuelStation.eta_mins} mins)</span>
                <span className="text-slate-600">•</span>
                <span className="text-warning">⭐ {selectedFuelStation.rating} Rating</span>
              </div>

              {/* Price Row details */}
              <div className="grid grid-cols-3 gap-2">
                {selectedFuelStation.fuels.cng?.available && (
                  <div className="bg-[#0A0A14]/40 border border-border-card p-2 rounded-xl text-center">
                    <span className="text-[8px] font-mono text-success uppercase block mb-0.5">CNG Price</span>
                    <span className="text-sm font-mono font-bold text-white">₹{selectedFuelStation.fuels.cng.price}</span>
                    <span className="text-[8px] text-slate-500 block">per kg</span>
                  </div>
                )}
                {selectedFuelStation.fuels.petrol?.available && (
                  <div className="bg-[#0A0A14]/40 border border-border-card p-2 rounded-xl text-center">
                    <span className="text-[8px] font-mono text-warning uppercase block mb-0.5">Petrol</span>
                    <span className="text-sm font-mono font-bold text-white">₹{selectedFuelStation.fuels.petrol.price}</span>
                    <span className="text-[8px] text-slate-500 block">per liter</span>
                  </div>
                )}
                {selectedFuelStation.fuels.diesel?.available && (
                  <div className="bg-[#0A0A14]/40 border border-border-card p-2 rounded-xl text-center">
                    <span className="text-[8px] font-mono text-info uppercase block mb-0.5">Diesel</span>
                    <span className="text-sm font-mono font-bold text-white">₹{selectedFuelStation.fuels.diesel.price}</span>
                    <span className="text-[8px] text-slate-500 block">per liter</span>
                  </div>
                )}
              </div>

              {/* Interactive Focus Action */}
              <button
                onClick={() => {
                  handleFocusZone(selectedFuelStation.lat, selectedFuelStation.lng);
                }}
                className="w-full mt-3 flex items-center justify-center gap-1 py-1.5 bg-info text-slate-950 font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Navigation size={11} className="rotate-45" />
                <span>Navigate & Select Station</span>
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
