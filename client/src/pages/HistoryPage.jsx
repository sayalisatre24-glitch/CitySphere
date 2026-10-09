import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Eye,
  Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const HistoryPage = () => {
  const { currentCity, places, setSelectedPlaceDetail } = useApp();
  const navigate = useNavigate();

  const heritagePlaces = places.filter(
    p => p.category === 'Heritage' || p.category === 'Historical' || p.tags?.some(t => t.toLowerCase().includes('heritage') || t.toLowerCase().includes('history'))
  );

  const [selectedPlaceStory, setSelectedPlaceStory] = useState(heritagePlaces[0] || places[0] || null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <BookOpen size={14} /> Heritage & Cultural Archival Intelligence
          </div>
          <h1 className="section-title">History & Cultural Heritage of {currentCity}</h1>
          <p className="section-subtitle">
            Uncover the architectural significance, Maratha history, and curated heritage sites across {currentCity} and Maharashtra.
          </p>
        </div>
      </div>

      {/* Featured Heritage Spotlight */}
      {selectedPlaceStory && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            border: '2px solid #fde68a',
            padding: '28px 32px',
            position: 'relative',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-amber" style={{ fontSize: '0.8rem', padding: '5px 12px', fontWeight: 700 }}>
                <Sparkles size={13} /> Heritage Spotlight
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={13} /> Verified Landmark
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', color: 'var(--amber-dark)', fontWeight: 700 }}>
              Location: {selectedPlaceStory.neighbourhood ? `${selectedPlaceStory.neighbourhood}, ` : ''}{selectedPlaceStory.city}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 6 }}>
              {selectedPlaceStory.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 14 }}>
              <MapPin size={14} color="var(--emerald)" />
              <span>{selectedPlaceStory.address || `${selectedPlaceStory.neighbourhood}, ${selectedPlaceStory.city}`}</span>
            </div>

            <p style={{ fontSize: '0.94rem', color: '#78350f', lineHeight: 1.65, marginBottom: 16 }}>
              {selectedPlaceStory.description}
            </p>

            {selectedPlaceStory.tags && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {selectedPlaceStory.tags.map(t => (
                  <span key={t} className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedPlaceDetail(selectedPlaceStory)}
                className="btn btn-primary btn-sm"
              >
                <Eye size={14} /> View Historical Details
              </button>
              <button
                onClick={() => navigate(`/map?destLat=${selectedPlaceStory.lat}&destLng=${selectedPlaceStory.lng}&destName=${encodeURIComponent(selectedPlaceStory.name)}`)}
                className="btn btn-secondary btn-sm"
              >
                <MapPin size={14} color="var(--emerald)" /> Locate on Spatial Map
              </button>
              <a
                href={selectedPlaceStory.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${selectedPlaceStory.lat},${selectedPlaceStory.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', textDecoration: 'none' }}
              >
                <Navigation size={13} /> Google Maps ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Historical Landmarks Grid (Bold and Bright Names) */}
      <div>
        <div className="section-header">
          <div>
            <h2 className="section-title">Historical & Cultural Landmarks</h2>
            <p className="section-subtitle">Select any monument or fort to load its details and narrative</p>
          </div>
        </div>

        <div className="grid-3">
          {(heritagePlaces.length > 0 ? heritagePlaces : places).map(place => {
            const isSelected = selectedPlaceStory?.id === place.id;

            return (
              <div
                key={place.id}
                onClick={() => setSelectedPlaceStory(place)}
                className="card card-interactive"
                style={{
                  border: isSelected ? '2px solid var(--amber)' : '1px solid var(--border-color)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: isSelected ? '#fffbeb' : 'white',
                  borderRadius: 'var(--radius-xl)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em', margin: 0 }}>
                      {place.name}
                    </h3>
                    <span className="badge badge-amber" style={{ fontSize: '0.68rem', flexShrink: 0 }}>
                      {place.category || 'Heritage'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8 }}>
                    <MapPin size={12} color="var(--emerald)" /> {place.neighbourhood ? `${place.neighbourhood}, ` : ''}{place.city}
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {place.description}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 10 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-dark)' }}>
                    📖 Heritage Record
                  </span>
                  <button className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    Select &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
