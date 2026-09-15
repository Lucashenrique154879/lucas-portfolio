import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// Block cross-site state-changing requests (CSRF defense). Browsers send an
// Origin/Referer header on POST/PUT/PATCH/DELETE; non-browser clients (curl,
// tests, server-to-server) do not and are allowed through.
function csrfOriginGuard(req: express.Request, res: express.Response, next: express.NextFunction) {
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  let sourceUrl: string | null = null;
  if (origin) sourceUrl = origin;
  else if (typeof referer === "string") sourceUrl = referer;

  if (!sourceUrl) return next();

  let sourceHost: string;
  try {
    sourceHost = new URL(sourceUrl).host;
  } catch {
    return res.status(403).json({ error: "Origem inválida." });
  }

  const requestHost = req.headers.host || "";
  if (sourceHost !== requestHost) {
    return res.status(403).json({ error: "Origem não permitida." });
  }
  return next();
}

export function createApp() {
  const app = express();
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(csrfOriginGuard);
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  return app;
}

async function startServer() {
  const server = createServer();
  const app = createApp();
  server.on("request", app);
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer().catch(console.error);
}
