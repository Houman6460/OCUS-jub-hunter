import dotenv from 'dotenv';
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import registerRoutes from "./routes";
import { initializeDb } from './db';
import { setupVite, serveStatic, log } from "./vite";
import { configurePassport, passport } from './socialAuth';
import { DatabaseStorage } from './storage';

const app = express();
app.set('trust proxy', 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

(async () => {
  const db = await initializeDb();
  const storage = new DatabaseStorage(db);

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'a-secure-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  await configurePassport(storage);

  const server = await registerRoutes(app, db);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5001', 10);
  server.listen({
    port,
    host: "0.0.0.0",
  }, () => {
    log(`serving on port ${port}`);
  });
})();
