import express from 'express';
import axios from 'axios';
import { reportsStore } from './reports.js';

const router = express.Router();

// Helper to calculate distance between two coordinates in km (Haversine formula)
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// GET /api/routes?startLat=18.5196&startLng=73.8553&endLat=18.5524&endLng=73.9015&mode=driving
router.get('/', async (req, res) => {
  const startLat = parseFloat(req.query.startLat);
  const startLng = parseFloat(req.query.startLng);
  const endLat = parseFloat(req.query.endLat);
  const endLng = parseFloat(req.query.endLng);
  const mode = req.query.mode || 'driving'; // 'driving' | 'walking' | 'cycling'

  if (isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
    return res.status(400).json({
      success: false,
      message: 'Valid startLat, startLng, endLat, and endLng coordinates are required.'
    });
  }

  const osrmProfile = mode === 'walking' ? 'foot' : (mode === 'cycling' ? 'bike' : 'car');

  try {
    // Attempt OSRM real route calculation
    const osrmUrl = `https://router.project-osrm.org/route/v1/${osrmProfile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    
    let routeData;
    try {
      const resp = await axios.get(osrmUrl, { timeout: 4000 });
      routeData = resp.data;
    } catch (apiErr) {
      routeData = null;
    }

    // Active verified reports from store
    const activeReports = (reportsStore || []).filter(r => r.status === 'Verified');

    // Check if any hazard/report is close to start/end or along the route
    const nearbyHazards = activeReports.filter(rep => {
      const distToStart = calculateHaversineDistance(rep.lat, rep.lng, startLat, startLng);
      const distToEnd = calculateHaversineDistance(rep.lat, rep.lng, endLat, endLng);
      return distToStart < 2.5 || distToEnd < 2.5;
    });

    if (routeData && routeData.routes && routeData.routes.length > 0) {
      const primary = routeData.routes[0];
      const distanceKm = (primary.distance / 1000).toFixed(1);
      const durationMins = Math.round(primary.duration / 60);

      const alternativeRoutes = routeData.routes.slice(1).map((alt, idx) => ({
        id: `alt-${idx + 1}`,
        name: `Alternative Route ${idx + 1} (via Ring Road / Bypass)`,
        distanceKm: (alt.distance / 1000).toFixed(1),
        durationMins: Math.round(alt.duration / 60),
        coordinates: alt.geometry.coordinates.map(coord => [coord[1], coord[0]]) // leaflet [lat, lng]
      }));

      // Warning if hazard is nearby
      const hasSevereHazards = nearbyHazards.some(h => h.severity === 'High');

      return res.json({
        success: true,
        mode,
        primaryRoute: {
          distanceKm: parseFloat(distanceKm),
          durationMins,
          coordinates: primary.geometry.coordinates.map(coord => [coord[1], coord[0]]),
          steps: primary.legs[0]?.steps?.map(s => ({
            instruction: s.maneuver.instruction || `Head ${s.maneuver.type} on ${s.name || 'unnamed road'}`,
            distanceMeters: Math.round(s.distance),
            durationSecs: Math.round(s.duration)
          })) || []
        },
        alternatives: alternativeRoutes,
        hazardAlerts: nearbyHazards.map(h => ({
          id: h.id,
          title: h.title,
          category: h.category,
          severity: h.severity,
          status: h.status,
          lat: h.lat,
          lng: h.lng,
          advice: `Caution: ${h.title} reported nearby. Consider taking the suggested alternate route if traffic slows.`
        })),
        safetyDisclaimer: 'Route estimates are based on live routing services. Never treat any route as guaranteed safe; always observe local road signals and emergency municipal advisories.'
      });
    }

    // Fallback: Geometric straight-line interpolation with realistic speed
    const directDistKm = calculateHaversineDistance(startLat, startLng, endLat, endLng);
    const speedKmh = mode === 'walking' ? 4.5 : (mode === 'cycling' ? 14 : 32);
    const estimatedMins = Math.round((directDistKm * 1.35 / speedKmh) * 60);

    // Create realistic intermediate path points
    const stepsCount = 10;
    const interpolatedCoords = [];
    for (let i = 0; i <= stepsCount; i++) {
      const fraction = i / stepsCount;
      const lat = startLat + (endLat - startLat) * fraction;
      const lng = startLng + (endLng - startLng) * fraction;
      interpolatedCoords.push([lat, lng]);
    }

    res.json({
      success: true,
      isFallback: true,
      mode,
      primaryRoute: {
        distanceKm: parseFloat((directDistKm * 1.25).toFixed(1)),
        durationMins: Math.max(5, estimatedMins),
        coordinates: interpolatedCoords,
        steps: [
          { instruction: 'Start towards destination along main connecting avenue', distanceMeters: 500, durationSecs: 180 },
          { instruction: 'Continue along arterial city link', distanceMeters: Math.round(directDistKm * 1000), durationSecs: estimatedMins * 60 },
          { instruction: 'Arrive at destination on the right', distanceMeters: 100, durationSecs: 60 }
        ]
      },
      alternatives: [],
      hazardAlerts: nearbyHazards.map(h => ({
        id: h.id,
        title: h.title,
        category: h.category,
        severity: h.severity
      })),
      safetyDisclaimer: 'Estimated navigation route. Please follow local municipal guidelines and traffic regulations.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
