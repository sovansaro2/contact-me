import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { apiRouter } from './src/api.js';

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT) || 3000;

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  app.use(express.json({ limit: "10mb" }));

  // Mount backend API routes
  app.use('/api', apiRouter);

  // Health route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Backend is ready!" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
