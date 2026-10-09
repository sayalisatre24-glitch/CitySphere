import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Navigation,
  Layers,
  MapPin,
  Car,
  PersonStanding,
  Bike,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle2,
  Crosshair,
  Maximize2
} from 'lucide-react';

const categoryColors = {
  'Historical': '#f59e0b',
  'Heritage': '#f59e0b',
  'Tourist Attraction': '#4f46e5',
  'Attractions': '#4f46e5',
  'Restaurant & Cafe': '#f43f5e',
  'Cafés & Food': '#f43f5e',
  'Museum': '#8b5cf6',
  'Nature & Parks': '#10b981',
  'Park & Recreation': '#10b981',
  'Hotel & Stay': '#0ea5e9',
  'Nightlife': '#6366f1'
};

const createCustomPinIcon = (color, isSelected = false, label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        background: ${color};
        width: ${isSelected ? '38px' : '30px'};
        height: ${isSelected ? '38px' : '30px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2.5px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: 800;
          font-size: 12px;
        ">
          📍
        </div>
        ${isSelected ? `<div style="
          position: absolute;
          inset: -6px;
          border: 2px solid ${color};
          border-radius: 50%;
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const InteractiveMapComponent = ({ initialDest, targetLocation, onPlaceClick, mapHeight = '100%', customPlaces }) => {
  const { currentCity, currentCoords, places: contextPlaces, setSelectedPlaceDetail } = useApp();
  const places = customPlaces !== undefined ? customPlaces : contextPlaces;

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const searchMarkerRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('standard'); // 'standard' | 'satellite'
  const [transportMode, setTransportMode] = useState('driving');
  const [startPlaceId, setStartPlaceId] = useState('');
  const [destPlaceId, setDestPlaceId] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // In-map search input state
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapSearchResults, setMapSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [focusedPlace, setFocusedPlace] = useState(null);

  // Reliable Map Tile Layers Configuration (Free of API Key Watermarks)
  const tileLayers = {
    standard: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    }
  };

  // Initialize Map on container mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = currentCoords?.lat || 18.5204;
      const initialLng = currentCoords?.lng || 73.8567;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      L.tileLayer(tileLayers.standard.url, {
        attribution: tileLayers.standard.attribution,
        maxZoom: tileLayers.standard.maxZoom
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      routeLayerRef.current = L.layerGroup().addTo(map);
      searchMarkerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to guarantee immediate crisp render without blank tiles
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center when currentCoords changes and no custom target
  useEffect(() => {
    if (mapInstanceRef.current && currentCoords && currentCoords.lat && currentCoords.lng && !targetLocation) {
      mapInstanceRef.current.setView([currentCoords.lat, currentCoords.lng], 12);
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [currentCoords]);

  // Handle map style switch
  const handleMapStyleChange = (styleKey) => {
    setMapStyle(styleKey);
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    const target = tileLayers[styleKey] || tileLayers.standard;
    L.tileLayer(target.url, {
      attribution: target.attribution,
      maxZoom: target.maxZoom
    }).addTo(mapInstanceRef.current);

    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 100);
  };

  // Render markers strictly for current places list
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (places.length === 0) return;

    const bounds = L.latLngBounds();

    places.forEach((place) => {
      if (!place.lat || !place.lng) return;

      bounds.extend([place.lat, place.lng]);

      const isSelected = focusedPlace?.id === place.id;
      const color = categoryColors[place.category] || '#4f46e5';
      const icon = createCustomPinIcon(color, isSelected, place.name);
      const marker = L.marker([place.lat, place.lng], { icon });

      const googleMapsLink = place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;

      marker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px; max-width: 260px; padding: 4px;">
          <div style="font-weight: 900; font-size: 14px; color: #0f172a; line-height: 1.2; margin-bottom: 3px;">${place.name}</div>
          <div style="font-size: 11px; color: #047857; font-weight: 700; margin-bottom: 4px;">
            ${place.category || 'Attractions'} • ⭐ ${place.rating || 4.7} (${place.city || 'Maharashtra'})
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 8px; line-height: 1.35; max-height: 48px; overflow: hidden;">
            ${place.description || 'Verified destination.'}
          </div>
          <div style="display: flex; gap: 6px;">
            <button id="btn-popup-${place.id}" style="
              flex: 1;
              background: #0f172a;
              color: white;
              border: none;
              border-radius: 5px;
              padding: 5px 8px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
            ">Details</button>
            <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" style="
              display: flex;
              align-items: center;
              justify-content: center;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              border-radius: 5px;
              padding: 5px 8px;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
            ">Google Maps ↗</a>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-popup-${place.id}`);
        if (btn) btn.onclick = () => setSelectedPlaceDetail(place);
      });

      marker.on('click', () => {
        setFocusedPlace(place);
        if (onPlaceClick) onPlaceClick(place);
      });

      markersLayerRef.current.addLayer(marker);
    });

    // Auto-fit map bounds if multiple places are searched/filtered
    if (places.length > 1 && bounds.isValid() && !targetLocation) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [places, focusedPlace]);

  // Handle Target Location / Fly to target
  useEffect(() => {
    if (targetLocation && targetLocation.lat && targetLocation.lng && mapInstanceRef.current) {
      focusOnCoordinate(targetLocation.lat, targetLocation.lng, targetLocation.name);
    }
  }, [targetLocation]);

  // Handle Initial destination query
  useEffect(() => {
    if (initialDest && places.length > 0) {
      const match = places.find(p => p.name.toLowerCase().includes(initialDest.toLowerCase()) || p.id === initialDest);
      if (match) {
        focusOnCoordinate(match.lat, match.lng, match.name);
        setDestPlaceId(match.id);
        if (places[0] && places[0].id !== match.id) setStartPlaceId(places[0].id);
      }
    }
  }, [initialDest, places]);

  const focusOnCoordinate = (lat, lng, label = 'Searched Location') => {
    if (!mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 1.0 });

    if (searchMarkerRef.current) {
      searchMarkerRef.current.clearLayers();
      const searchPin = createCustomPinIcon('#10b981', true, label);
      const marker = L.marker([lat, lng], { icon: searchPin })
        .bindPopup(`
          <div style="padding: 4px; font-family: inherit; min-width: 200px;">
            <strong style="color: #047857; font-size: 13px; display: block;">📍 ${label}</strong>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="
              display: inline-block;
              margin-top: 6px;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              text-decoration: none;
            ">Navigate via Google Maps ↗</a>
          </div>
        `)
        .openPopup();

      searchMarkerRef.current.addLayer(marker);
    }
  };

  // In-map search handler
  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.searchCityLocations(mapSearchQuery.trim(), currentCity);
      if (res.success && res.results && res.results.length > 0) {
        setMapSearchResults(res.results);
        const topResult = res.results[0];
        focusOnCoordinate(topResult.lat, topResult.lng, topResult.name || topResult.displayName);
      } else {
        alert(`Location "${mapSearchQuery}" not found. Try searching landmark names like Sinhagad, Sula, Ajanta, Gateway...`);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  // Route Calculation
  const calculateRoute = async () => {
    if (!startPlaceId || !destPlaceId) {
      alert('Please select both Origin and Destination places.');
      return;
    }

    const start = places.find(p => p.id === startPlaceId);
    const dest = places.find(p => p.id === destPlaceId);
    if (!start || !dest) return;

    setRouteLoading(true);
    setRouteInfo(null);
    if (routeLayerRef.current) routeLayerRef.current.clearLayers();

    try {
      const res = await api.getRoute(start.lat, start.lng, dest.lat, dest.lng, transportMode);
      if (res.success && res.primaryRoute) {
        setRouteInfo(res);
        const polyline = L.polyline(res.primaryRoute.coordinates, {
          color: '#10b981',
          weight: 6,
          opacity: 0.9,
          dashArray: transportMode === 'walking' ? '8, 8' : null
        });

        routeLayerRef.current.addLayer(polyline);
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    } catch (err) {
      console.error('Route error:', err);
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%', width: '100%' }}>
      {/* Top Map Control Bar */}
      <div className="card" style={{ padding: '10px 14px', background: 'white', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          {/* Map Layer Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Layers size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Style:</span>
            {[
              { id: 'standard', label: 'Street (OSM)' },
              { id: 'satellite', label: 'Satellite (Esri)' }
            ].map(m => (
              <button
                key={m.id}
                onClick={() => handleMapStyleChange(m.id)}
                className={`btn btn-sm ${mapStyle === m.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.72rem', padding: '3px 8px', fontWeight: 700 }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            📍 {places.length} Locations Pinned
          </span>
        </div>

        {/* Route Planner Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 8, flexWrap: 'wrap' }}>
          <select
            value={startPlaceId}
            onChange={(e) => setStartPlaceId(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.75rem', padding: '4px 6px', flex: 1, minWidth: 120, height: 30 }}
          >
            <option value="">Origin Place...</option>
            {places.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={destPlaceId}
            onChange={(e) => setDestPlaceId(e.target.value)}
            className="form-select"
            style={{ fontSize: '0.75rem', padding: '4px 6px', flex: 1, minWidth: 120, height: 30 }}
          >
            <option value="">Destination Place...</option>
            {places.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Transport mode buttons */}
          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { id: 'driving', icon: Car, title: 'Drive' },
              { id: 'walking', icon: PersonStanding, title: 'Walk' },
              { id: 'cycling', icon: Bike, title: 'Bicycle' }
            ].map(m => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setTransportMode(m.id)}
                  className={`btn btn-sm ${transportMode === m.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '3px 6px', height: 30 }}
                  title={m.title}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>

          <button
            onClick={calculateRoute}
            disabled={routeLoading || !startPlaceId || !destPlaceId}
            className="btn btn-emerald btn-sm"
            style={{ height: 30, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            {routeLoading ? <RefreshCw size={12} className="animate-spin" /> : <Navigation size={12} />}
            <span>Get Route</span>
          </button>
        </div>

        {/* Route Details and Google Maps Link */}
        {routeInfo && routeInfo.primaryRoute && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, background: '#ecfdf5', padding: '6px 10px', borderRadius: 'var(--radius-md)', fontSize: '0.76rem', color: '#047857' }}>
            <span>
              🧭 <strong>{routeInfo.primaryRoute.distanceKm} km</strong> • <strong>{routeInfo.primaryRoute.durationMins} mins</strong> ({transportMode})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <a
                href={`https://www.google.com/maps/dir/?api=1&origin=${places.find(p=>p.id===startPlaceId)?.lat},${places.find(p=>p.id===startPlaceId)?.lng}&destination=${places.find(p=>p.id===destPlaceId)?.lat},${places.find(p=>p.id===destPlaceId)?.lng}&travelmode=${transportMode}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontWeight: 700, color: '#047857', textDecoration: 'underline' }}
              >
                Google Maps ↗
              </a>
              <button
                onClick={() => {
                  setRouteInfo(null);
                  if (routeLayerRef.current) routeLayerRef.current.clearLayers();
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                title="Clear route"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: mapHeight,
          minHeight: '480px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
          zIndex: 1,
          flex: 1
        }}
      />
    </div>
  );
};

export default InteractiveMapComponent;
