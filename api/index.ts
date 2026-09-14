import type { Request, Response } from "express";

let appPromise: Promise<((req: Request, res: Response) => unknown)> | null = null;

function loadApp() {
  if (!appPromise) {
    appPromise = import("../server/_core/index").then(({ createApp }) => createApp());
  }
  return appPromise;
}

export default async function handler(req: Request, res: Response) {
  try {
    const app = await loadApp();
    return app(req, res);
  } catch (error) {
    console.error("[Vercel] Server initialization failed", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server initialization failed" });
    }
    return undefined;
  }
}
