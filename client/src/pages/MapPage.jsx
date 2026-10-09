import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map as MapIcon, Navigation, Compass, Layers, ShieldAlert, Sparkles, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import InteractiveMapComponent from '../components/InteractiveMapComponent';

const MapPage = () => {
  const [searchParams] = useSearchParams();
  const { currentCity } = useApp();

  const initialDest = searchParams.get('destName') || searchParams.get('placeId') || searchParams.get('q') || '';
  const destLat = searchParams.get('destLat') || searchParams.get('lat');
  const destLng = searchParams.get('destLng') || searchParams.get('lng');

  const targetLocation = destLat && destLng ? {
    lat: parseFloat(destLat),
    lng: parseFloat(destLng),
    name: initialDest || 'Selected Location'
  } : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="section-title">
            <MapIcon size={24} color="var(--emerald)" />
            Interactive Map & Google Navigation — {currentCity}
          </h1>
          <p className="section-subtitle">
            Search any landmark, view clear street and satellite layers, locate exact coordinates, and get real-time directions.
          </p>
        </div>
      </div>

      {/* Main Interactive Map Component */}
      <InteractiveMapComponent
        initialDest={initialDest}
        targetLocation={targetLocation}
        mapHeight="680px"
      />
    </div>
  );
};

export default MapPage;
