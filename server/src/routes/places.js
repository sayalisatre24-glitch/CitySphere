import express from 'express';
import axios from 'axios';
import { verifiedCityLocations } from '../data/curatedLocations.js';

const router = express.Router();
let placesStore = [...verifiedCityLocations];

// GET /api/places - List places with filtering
router.get('/', (req, res) => {
  const { city, state, category, search, budget, minRating, wheelchairOnly, sortBy = 'rating' } = req.query;

  let list = placesStore.filter(p => {
    // City / State filter
    if (city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'maharashtra') {
      if (p.city.toLowerCase() !== city.toLowerCase()) {
        return false;
      }
    } else if (state && state.toLowerCase() === 'maharashtra') {
      if (p.state && p.state.toLowerCase() !== 'maharashtra') {
        return false;
      }
    }

    if (category && category !== 'All') {
      const catLower = category.toLowerCase();
      const pCatLower = p.category.toLowerCase();
      if (!pCatLower.includes(catLower) && !catLower.includes(pCatLower)) {
        return false;
      }
    }
    if (budget && budget !== 'all' && p.priceTier !== budget) {
      return false;
    }
    if (wheelchairOnly === 'true' && !p.accessibility?.wheelchairAccessible) {
      return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.neighbourhood.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.state && p.state.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Sorting
  list.sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0);
    if (sortBy === 'price_low') return (a.priceValue || 0) - (b.priceValue || 0);
    if (sortBy === 'price_high') return (b.priceValue || 0) - (a.priceValue || 0);
    return 0;
  });

  res.json({
    success: true,
    city: city || 'All',
    count: list.length,
    data: list
  });
});

// GET /api/city/search - Multi-API Location Search (Curated + OSM Nominatim + Wikipedia Places)
router.get('/search', async (req, res) => {
  const { q, city } = req.query;
  if (!q || !q.trim()) {
    return res.status(400).json({ success: false, message: 'Query is required' });
  }

  const query = q.trim();
  const queryLower = query.toLowerCase();

  // 1. First search in local curated places across all Maharashtra & beyond
  const localMatches = placesStore.filter(p =>
    p.name.toLowerCase().includes(queryLower) ||
    p.neighbourhood.toLowerCase().includes(queryLower) ||
    p.city.toLowerCase().includes(queryLower) ||
    (p.state && p.state.toLowerCase().includes(queryLower)) ||
    p.description.toLowerCase().includes(queryLower) ||
    (p.address && p.address.toLowerCase().includes(queryLower))
  ).map(p => ({
    id: p.id,
    displayName: `${p.name}, ${p.neighbourhood}, ${p.city}`,
    name: p.name,
    city: p.city,
    state: p.state || 'Maharashtra',
    neighbourhood: p.neighbourhood,
    lat: p.lat,
    lng: p.lng,
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    cost: p.cost,
    description: p.description,
    placeId: p.id,
    imageUrl: p.imageUrl,
    source: 'curated',
    googleMapsUrl: p.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`
  }));

  // 2. Query Live OpenStreetMap Nominatim API for Maharashtra / India
  let apiResults = [];
  try {
    const nominatimQuery = queryLower.includes('maharashtra') || queryLower.includes('india')
      ? query
      : `${query}, Maharashtra, India`;

    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nominatimQuery)}&format=json&addressdetails=1&countrycodes=in&limit=8`;
    const osmRes = await axios.get(osmUrl, {
      headers: { 'User-Agent': 'CitySphere-App/3.0 (info@citysphere.ai)' },
      timeout: 4000
    });

    if (osmRes.data && Array.isArray(osmRes.data)) {
      apiResults = osmRes.data.map(item => {
        const addr = item.address || {};
        const detectedCity = addr.city || addr.town || addr.village || addr.county || addr.state_district || 'Maharashtra';
        const detectedState = addr.state || 'Maharashtra';
        const displayName = item.display_name;
        const name = item.name || displayName.split(',')[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        return {
          id: `osm_${item.osm_id || Math.random().toString(36).substring(2, 9)}`,
          displayName: displayName,
          name: name,
          city: detectedCity,
          state: detectedState,
          neighbourhood: addr.suburb || addr.neighbourhood || addr.road || detectedCity,
          lat,
          lng,
          category: item.type === 'attraction' || item.type === 'tourism' ? 'Attractions' : (item.type === 'place_of_worship' ? 'Heritage' : 'Attractions'),
          rating: 4.6,
          cost: 'Free Public Area',
          description: `Location discovered in ${detectedCity}, ${detectedState} via OpenStreetMap Geocoding API.`,
          imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
          source: 'osm_nominatim',
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
        };
      });
    }
  } catch (osmErr) {
    console.warn('OSM Nominatim search warning:', osmErr.message);
  }

  // 3. Query Wikipedia Geo / Search API for rich landmark summaries
  let wikiResults = [];
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query + ' Maharashtra')}&format=json&origin=*&srlimit=4`;
    const wikiRes = await axios.get(wikiUrl, {
      headers: { 'User-Agent': 'CitySphereSmartCity/1.0 (https://citysphere.ai; contact@citysphere.ai)' },
      timeout: 3500
    });
    if (wikiRes.data?.query?.search) {
      wikiResults = wikiRes.data.query.search.map((w, idx) => ({
        id: `wiki_${w.pageid || idx}`,
        name: w.title,
        displayName: `${w.title}, Maharashtra, India`,
        city: 'Maharashtra',
        state: 'Maharashtra',
        description: w.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
        source: 'wikipedia'
      }));
    }
  } catch (wErr) {
    console.warn('Wikipedia search warning:', wErr.message);
  }

  // Combine and deduplicate
  const combined = [...localMatches];
  for (const item of apiResults) {
    const exists = combined.some(c =>
      Math.abs(c.lat - item.lat) < 0.005 && Math.abs(c.lng - item.lng) < 0.005 ||
      c.name.toLowerCase() === item.name.toLowerCase()
    );
    if (!exists) {
      combined.push(item);
    }
  }

  res.json({
    success: true,
    query,
    count: combined.length,
    results: combined,
    wikiHighlights: wikiResults
  });
});

// POST /api/places/scan - AI Landmark Scanner API
router.post('/scan', async (req, res) => {
  const { query, landmarkText, coordinates } = req.body;
  const target = (query || landmarkText || '').trim();

  if (!target && !coordinates) {
    return res.status(400).json({ success: false, message: 'Landmark name, text or coordinates required for scanning' });
  }

  try {
    // 1. Search in placesStore
    let matchedPlace = placesStore.find(p =>
      target && (
        p.name.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(p.name.toLowerCase())
      )
    );

    // 2. If not found locally, query Nominatim
    if (!matchedPlace && target) {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(target + ', Maharashtra, India')}&format=json&addressdetails=1&limit=1`;
      const osmRes = await axios.get(osmUrl, {
        headers: { 'User-Agent': 'CitySphere-App/3.0 (info@citysphere.ai)' },
        timeout: 4000
      });

      if (osmRes.data && osmRes.data[0]) {
        const item = osmRes.data[0];
        const addr = item.address || {};
        matchedPlace = {
          id: `scan_${Date.now()}`,
          name: item.name || target,
          city: addr.city || addr.town || addr.state_district || 'Maharashtra',
          state: addr.state || 'Maharashtra',
          neighbourhood: addr.suburb || addr.road || 'City Center',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: 'Attractions',
          rating: 4.7,
          cost: 'Free Public Area',
          description: `Identified landmark in ${addr.state || 'Maharashtra'} via AI Scan & OpenStreetMap telemetry.`,
          imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lon}`
        };
      }
    }

    res.json({
      success: true,
      scannedLandmark: target,
      data: matchedPlace || {
        name: target,
        city: 'Maharashtra',
        lat: 18.5204,
        lng: 73.8567,
        description: 'Scanned location coordinates mapped to Maharashtra central grid.',
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=18.5204,73.8567`
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Scan failed: ' + err.message });
  }
});

// GET /api/places/:id
router.get('/:id', (req, res) => {
  const place = placesStore.find(p => p.id === req.params.id);
  if (!place) return res.status(404).json({ success: false, message: 'Place not found' });
  res.json({ success: true, data: place });
});

// POST /api/places - Add custom place
router.post('/', (req, res) => {
  const newPlace = {
    id: `place_${Date.now()}`,
    ...req.body,
    rating: req.body.rating || 4.5,
    reviewCount: req.body.reviewCount || 1,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${req.body.lat},${req.body.lng}`
  };
  placesStore.unshift(newPlace);
  res.status(201).json({ success: true, data: newPlace });
});

export { placesStore };
export default router;
