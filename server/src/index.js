import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import placesRouter from './routes/places.js';
import weatherRouter from './routes/weather.js';
import routesRouter from './routes/routes.js';
import reportsRouter from './routes/reports.js';
import aiRouter from './routes/ai.js';
import compareRouter from './routes/compare.js';
import itinerariesRouter from './routes/itineraries.js';
import analyticsRouter from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middleware
app.use(cors({
  origin: '*', // for local dev and preview
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads serving for citizen media
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/places', placesRouter);
app.use('/api/city', placesRouter); // supports /api/city/search
app.use('/api/weather', weatherRouter);
app.use('/api/routes', routesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/places/compare', compareRouter);
app.use('/api/itineraries', itinerariesRouter);
app.use('/api/analytics', analyticsRouter);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'CityLife AI Backend API',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    integrations: {
      openMeteo: 'active',
      osrmRouting: 'active',
      nominatimGeocoding: 'active',
      geminiAi: process.env.GEMINI_API_KEY ? 'active (API key)' : 'intelligent-grounded-fallback',
      firebase: 'ready'
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CityLife AI Server running on http://localhost:${PORT}`);
});
