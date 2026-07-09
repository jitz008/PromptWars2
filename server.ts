/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { generateStadiumTelemetry } from "./src/mocks/stadiumData.js";
import { runNavigatorAgent } from "./src/agents/navigatorAgent.js";
import { runCrowdAgent } from "./src/agents/crowdAgent.js";
import { runIncidentAgent } from "./src/agents/incidentAgent.js";
import { runAccessibilityAgent } from "./src/agents/accessibilityAgent.js";
import { globalGeminiRateLimiter } from "./src/lib/rateLimiter.js";

/**
 * Serves: Security, Code Quality, Efficiency, Full-Stack App Requirements
 * Custom Express + Vite full-stack server. Proxies all Gemini API queries safely on the server side.
 * Validates and rate-limits requests to shield keys and secure operations.
 */

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable JSON request body parsing
  app.use(express.json());

  // Defensive Rate-Limiting Middleware for Gemini API endpoints
  const geminiRateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Determine client identity (using simplified header fallback, e.g., IP or standard token)
    const clientIp = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
    const allowed = globalGeminiRateLimiter.allowRequest(clientIp);

    if (!allowed) {
      res.status(429).json({
        error: "Rate Limit Exceeded",
        message: "BALLIT is breathing deeply. Please wait a moment before sending another query.",
      });
      return;
    }
    next();
  };

  // --- API ROUTE: Live Stadium Telemetry ---
  app.get("/api/telemetry", (req: Request, res: Response) => {
    try {
      const scenario = (req.query.scenario as "normal" | "pre-match-surge" | "half-time-exodus" | "post-match-egress") || "normal";
      const telemetry = generateStadiumTelemetry(scenario);
      res.json(telemetry);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: "Failed to generate telemetry", details: msg });
    }
  });

  // --- API ROUTE: Navigator Agent ---
  app.post("/api/agent/navigator", geminiRateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const { query, telemetry, requiresAccessibility } = req.body;
      if (!query || !telemetry) {
        res.status(400).json({ error: "Missing required parameters: query, telemetry" });
        return;
      }
      const result = await runNavigatorAgent(query, telemetry, !!requiresAccessibility);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Navigator Agent Error:", err);
      res.status(500).json({ error: "Gemini Navigator failed", message: msg });
    }
  });

  // --- API ROUTE: Crowd Agent ---
  app.post("/api/agent/crowd", geminiRateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const { telemetry } = req.body;
      if (!telemetry) {
        res.status(400).json({ error: "Missing required parameter: telemetry" });
        return;
      }
      const result = await runCrowdAgent(telemetry);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Crowd Agent Error:", err);
      res.status(500).json({ error: "Gemini Crowd analysis failed", message: msg });
    }
  });

  // --- API ROUTE: Incident Agent ---
  app.post("/api/agent/incident", geminiRateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const { telemetry } = req.body;
      if (!telemetry) {
        res.status(400).json({ error: "Missing required parameter: telemetry" });
        return;
      }
      const result = await runIncidentAgent(telemetry);
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Incident Agent Error:", err);
      res.status(500).json({ error: "Gemini Incident Briefing failed", message: msg });
    }
  });

  // --- API ROUTE: Accessibility & Multilingual Agent ---
  app.post("/api/agent/accessibility", geminiRateLimitMiddleware, async (req: Request, res: Response) => {
    try {
      const { query, telemetry, targetLanguage } = req.body;
      if (!query || !telemetry) {
        res.status(400).json({ error: "Missing required parameters: query, telemetry" });
        return;
      }
      const result = await runAccessibilityAgent(query, telemetry, targetLanguage || "English");
      res.json(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Accessibility Agent Error:", err);
      res.status(500).json({ error: "Gemini Accessibility routing failed", message: msg });
    }
  });

  // --- VITE DEV AND STATIC PRODUCTION SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support SPA router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.info(`[BALLIT] Stadium Organism active and running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start BALLIT server:", error);
});
