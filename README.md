# CitySphere — Intelligent Smart City Exploration & Trip Planning Platform

> **Explore Smarter. Travel Safer. Experience More.**  
> A full-stack web application combining real-world APIs, OpenStreetMap geographic information, AI conversational assistance, citizen hazard reporting, evidence-based safety insights, and interactive trip planning.

---

## 🌟 Key Application Features

1. **Smart City Exploration**: Real-time multi-source search by place name, neighborhood, cuisine, budget tier, and accessibility across Maharashtra (Pune, Mumbai, Nashik, Shirdi, Mahabaleshwar, Lonavala, Chhatrapati Sambhaji Nagar, and more).
2. **Interactive City Map**: Built with Leaflet & standard OpenStreetMap tiles, high-resolution satellite imagery, verified place markers, turn-by-turn OSRM route calculations, distance/travel-time estimates, and cycling/driving/walking modes.
3. **History & Cultural Heritage**: Curated heritage sites and Maratha forts with historical background, architectural significance, and verified GPS coordinates.
4. **Safety & Security Insights**: Responsible, evidence-based civic hazard reports (road damage, waterlogging, accessibility barriers, closures) with verification statuses, severity indicators, and upvoting.
5. **AI City & Weather Assistant**: Grounded Google Gemini natural language assistant paired with live Open-Meteo atmospheric radar to answer city queries, check live temperature and precipitation, and discover curated cafes, temples, and forts.
6. **Trip Planner & Itinerary Builder**: Interactive schedule builder with AI Auto-Scheduling, Route Distance Optimization (before/after comparison), and saved itineraries.
7. **Citizen Reporting System**: Civic submission form supporting categories, GPS / map location picking, photograph upload, and in-browser voice notes.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, React Router 6, Leaflet.js, OpenStreetMap, Lucide Icons.
* **Backend**: Node.js, Express.js (ES Modules), Multer, Axios, OSRM Routing Engine, Nominatim Geocoding, Open-Meteo Weather API, Google Generative AI (Gemini).
* **Database & Security**: Cloud Firestore & Firebase Storage Security Rules (`firestore.rules`, `storage.rules`), Firebase Auth.

---

## 🚀 Quickstart & Running Locally

### 1. Install Dependencies
```bash
# In project root
npm run install:all
```

### 2. Start Backend & Frontend
```bash
npm run dev
```

* **Frontend Application**: `http://localhost:5173`
* **Backend API Server**: `http://localhost:5000`
* **Health Check**: `http://localhost:5000/api/health`

---

## 📡 API Endpoint Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/places` | List/search places across Maharashtra |
| `GET` | `/api/city/search` | Multi-API live search (Curated + OSM Nominatim + Wikipedia) |
| `GET` | `/api/weather` | Open-Meteo live weather radar & forecasts |
| `GET` | `/api/routes` | OSRM route calculation & distance estimates |
| `GET` | `/api/reports` | Retrieve verified citizen hazard reports |
| `POST`| `/api/reports` | Submit civic incident report |
| `POST`| `/api/ai/chat` | Grounded Gemini AI chat & weather queries |
| `GET` | `/api/itineraries` | Retrieve saved travel itineraries |
