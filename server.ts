import express from "express";
import path from "path";
import * as fs from "fs";
import { createServer as createViteServer } from "vite";

// Initialise models/data
import { generateDataFiles } from "./server/data/generate_data.ts";
generateDataFiles(); // run generator

import { hotspotModel, markovPredictor, intentScorer } from "./server/context.ts";

// Train the models
hotspotModel.train();

// Train Markov Chain from generated DRIVER_001 history
const historyPath = path.resolve(process.cwd(), "server/data_storage/driver_history.json");
if (fs.existsSync(historyPath)) {
  try {
    const content = fs.readFileSync(historyPath, "utf-8");
    const sequence = JSON.parse(content);
    markovPredictor.train(sequence);
    console.log(`[Server] Automatically trained Markov Predictor with ${sequence.length} driver transitions.`);
  } catch (err) {
    console.error("[Server] Critical error training Markov Predictor:", err);
  }
}

// Set up periodic cleanup for real-time user intent scorers
setInterval(() => {
  intentScorer.cleanup_old_events();
}, 60000);

// Import Routers
import hotspotsRouter from "./server/routers/hotspots.ts";
import predictionsRouter from "./server/routers/predictions.ts";
import signalsRouter from "./server/routers/signals.ts";
import earningsRouter from "./server/routers/earnings.ts";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // JSON parsing middleware
  app.use(express.json());

  // Health endpoint first
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      model_ready: true,
      timestamp: new Date().toISOString()
    });
  });

  // Mount API routers
  app.use("/api", hotspotsRouter);
  app.use("/api", predictionsRouter);
  app.use("/api", signalsRouter);
  app.use("/api", earningsRouter);

  // Serve static assets in production, or mount Vite Dev Server middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Launching in DEVELOPMENT mode with Vite Middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Launching in PRODUCTION mode serving static outputs.");
    const distPath = path.join(process.cwd(), "dist");
    
    // Check if build asset directory exists
    if (!fs.existsSync(distPath)) {
      console.warn("[Server] Warning: /dist folder not found. Please compile frontend prior to start.");
    }
    
    app.use(express.static(distPath));
    // Serve SPA index file
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[RapidoGuard Pro Server] Running and ready on http://localhost:${PORT}`);
  });
}

startServer();
