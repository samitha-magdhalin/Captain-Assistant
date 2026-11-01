# RapidoGuard Pro 🛵 • Geospatial Mobility Intelligence

An enterprise-grade, full-stack **Geospatial Mobility Intelligence & Predictive Dispatch Prototype** designed for taxi, bike-taxi, and auto captains. 

The platform optimizes driver utilization and reduces idle cruising by forecasting sudden urban demand hotspots, simulating competitive supply saturation (crowding limits), and delivering real-time transit recommendations.

Designed specifically to model the complex commuter flows of **Bengaluru, India** (covering major corridors like Koramangala, Indiranagar, ITPL Whitefield, and Hebbal), the system transitions ride-hailing from passive location dashboards to a proactive dispatch decision engine.

---

## 🚀 Key Architectural Pillars

### 1. Event-Driven Synthetic Mobility Simulation
Instead of relying on rigid, hardcoded mock data, RapidoGuard Pro features an **Event-Driven Simulation Engine**. Urban passenger demand fluctuates dynamically based on a series of real-time environmental input variables:
*   **Temporal Seasonality**: Adapts demand vectors based on hour-of-day and day-of-week presets (e.g., *9:00 AM Corporate Commutes* vs. *11:00 PM Weekend Pub Corridors*).
*   **Monsoon Friction Factors**: Integrates simulated precipitation and cloudburst events that instantly trigger waterlogging risk indexes, drop traffic speeds to 12 km/h on main arterials, and inflate fare multipliers to 1.35x.
*   **Event-Driven Spikes**: Inject localized demand surges representing major urban disruption events (e.g., Tech Summits at ITPL Whitefield, Crickets matches at MG Road Stadium, or Concerts).

### 2. Probabilistic Transition Models (Markov Chains)
Using historical captain ride logs (`rides.csv`), the backend runs custom **First-Order Markov Transition Probability Matrices** to predict where consecutive bookings are mathematically likely to materialize next, rather than displaying random noise.

### 3. Multi-Captain Density Saturation (Priority 5)
Spatially tracks 50–100 active simulated competitor captains in real-time. If the density of driver supply within a hotspot crosses the calculated threshold, the dashboard triggers a defensive **Crowding Warning** indicating that supply cannibalization is imminent, advising the driver to wait on the border margins.

### 4. Dispatch Decision Optimization (Priority 6)
Upgrades prediction models into an active financial advisory tool. It computes the **Expected Opportunity Cost Coefficient** (the mathematical penalty of remaining standby in an oversaturated zone) and visualizes the **Peak Yield Multiplier** for nearby empty segments.

### 5. Grounded Explainable AI (XAI) & LLM Advisors (Priority 7)
Leverages the **Gemini 2.5 Flash** server-side model to analyze multi-variable telemetry (congestions, active events, weather) and generate simple, plain-text driver guidelines. 
*   *Note: If the Gemini API key is missing, the system gracefully fallbacks to highly localized, deterministic rule-based advice, ensuring zero network failures, 100% offline compatibility, and zero API costs for demo runs.*

---

## 📊 System Architecture & Data Pipelines (Priority 8)

```
                                 REAL-TIME DEVOPS OPERATIONAL FLOW
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
| [ PASSENGER FEEDS ]         [ ENV SIGNALS ]        [ SCENARIO PRESETS ]     [ HISTORY CSV/JSON ] |
|  - App Opening Rate          - Rain Precip Gauge    - Hourly Toggles         - Driver Telemetry|
|  - Booking Failures          - Waterlog Congestion  - Weekend Seasonality    - Sequential Rides|
|        |                            |                        |                         |        |
|        +------------+---------------+------------------------+-------------------------+        |
|                     |                                                                           |
|                     v                                                                           |
|        [ GEOSPATIAL DECISION ENGINE /api/hotspots ]                                             |
|         - Recalibrates base demand with weather, temporal, and event disruption coefficients   |
|         - Computes competing captain density, crowding limits, and booking traction             |
|                     |                                                                           |
|                     v                                                                           |
|        [ PREDICTIONS PIPELINE ]                                                                 |
|         - Extracts top predicted transition nodes and Markov flow sequences                    |
|         - Invokes server-side Gemini Flash to synthesize explainable plain-text driver advisories|
|                     |                                                                           |
|                     +-------+-------------------------+                                         |
|                             |                         |                                         |
|                             v                         v                                         |
|                   [ OPERATIONAL MAP UI ]     [ DRIFT CONTROL DASHBOARD ]                        |
|                    - Heat circles (Leaflet)   - Expected Yield multipliers                      |
|                    - Multi-captain overlays    - Opportunity cost percentages                    |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack & Production Deployment

*   **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons, Leaflet (interactive operational map)
*   **Backend**: Node.js, Express Router, SSE (Server-Sent Events) live trigger streamer
*   **Algorithms**: Markov Chains, Expected Value Models, Synthetic Demand Heuristics
*   **Infrastructure**: Production-ready containerized structure via Docker, Node process bundling via `esbuild`.

---


**GitHub Repository / Live Preview**: [Insert Your Repo Link]

#Geospatial #SystemDesign #SoftwareEngineering #StartupEngineering #PredictiveAnalytics #ReactJS #NodeJS #SystemArchitecture #UberEngineering #GIS
