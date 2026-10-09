import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Bus,
  Accessibility,
  CheckCircle2,
  BookOpen,
  Navigation,
  Heart,
  Share2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const PlaceDetailModal = () => {
  const { selectedPlaceDetail, setSelectedPlaceDetail, savedPlaceIds, toggleSavePlace } = useApp();
  const navigate = useNavigate();

  if (!selectedPlaceDetail) return null;

  const place = selectedPlaceDetail;
  const isSaved = savedPlaceIds.includes(place.id);

  const handleRouteClick = () => {
    setSelectedPlaceDetail(null);
    navigate(`/map?destLat=${place.lat}&destLng=${place.lng}&destName=${encodeURIComponent(place.name)}`);
  };

  return (
    <div className="modal-overlay" onClick={() => setSelectedPlaceDetail(null)}>
      <div className="modal-content" style={{ maxWidth: 780, padding: 0, overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {/* Header Image with Floating Close & Save buttons */}
        <div style={{ position: 'relative', height: 260 }}>
          <img
            src={place.imageUrl || 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80'}
            alt={place.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.2) 60%, rgba(15, 23, 42, 0.6) 100%)'
            }}
          />

          <button
            onClick={() => setSelectedPlaceDetail(null)}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: '50%',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              zIndex: 10
            }}
          >
            <X size={20} />
          </button>

          {/* Place Title Overlay */}
          <div style={{ position: 'absolute', bottom: 20, left: 24, right: 24, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>{place.category}</span>
              <span className="badge badge-sky" style={{ fontSize: '0.75rem' }}>{place.city}</span>
            </div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
              {place.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.85rem', marginTop: 4, opacity: 0.9 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={14} /> {place.address || `${place.neighbourhood}, ${place.city}`}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', maxHeight: 'calc(85vh - 260px)', overflowY: 'auto' }}>
          {/* Quick Metrics Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              background: 'var(--bg-subtle)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 20
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>RATING</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: 'var(--amber-dark)' }}>
                <Star size={15} fill="#f59e0b" color="#f59e0b" />
                <span>{place.rating} / 5</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>ENTRY COST</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{place.cost}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPEN HOURS</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{place.openingHours}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CLEANLINESS</div>
              <div style={{ fontWeight: 700, color: 'var(--emerald-dark)', fontSize: '0.88rem' }}>{place.cleanlinessScore || 4.5} / 5.0</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 6 }}>About this Destination</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>{place.description}</p>
          </div>

          {/* Accessibility & Public Transport Section */}
          <div
            style={{
              background: 'var(--emerald-light)',
              border: '1px solid #a7f3d0',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 18px',
              marginBottom: 20
            }}
          >
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--emerald-dark)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Accessibility size={18} /> Verified Accessibility & Transit Access
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', color: '#064e3b' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={15} color="var(--emerald)" />
                <strong>Wheelchair Access:</strong> {place.accessibility?.wheelchairAccessible ? 'Yes (Verified Step-Free / Ramp routes)' : 'Limited (Stairs or natural terrain)'}
              </li>
              {place.accessibility?.ramps && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="var(--emerald)" />
                  <strong>Ramps:</strong> {place.accessibility.ramps}
                </li>
              )}
              {place.publicTransport && (
                <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Bus size={15} color="var(--primary)" />
                  <strong>Public Transit:</strong> {place.publicTransport}
                </li>
              )}
            </ul>
          </div>

          {/* AI History & Story Feature (if available) */}
          {place.historyStory && (
            <div
              style={{
                background: 'var(--amber-light)',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 20px',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--amber-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={18} /> Discover the Story (AI Heritage Insight)
                </h4>
                <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                  <ShieldCheck size={12} /> Fact-Verified
                </span>
              </div>

              <div style={{ fontWeight: 600, color: '#78350f', fontSize: '0.88rem', marginBottom: 6 }}>
                Era: {place.historyStory.period}
              </div>
              <p style={{ color: '#78350f', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 12 }}>
                {place.historyStory.importance}
              </p>

              {place.historyStory.keyEvents && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#92400e', marginBottom: 4 }}>Key Historical Milestones:</div>
                  <ul style={{ paddingLeft: 18, color: '#92400e', fontSize: '0.82rem', lineHeight: 1.5 }}>
                    {place.historyStory.keyEvents.map((evt, idx) => (
                      <li key={idx}>{evt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {place.historyStory.sourceCitation && (
                <div style={{ fontSize: '0.72rem', color: '#b45309', borderTop: '1px dashed #fcd34d', paddingTop: 8, marginTop: 10 }}>
                  🏛️ Source Citation: {place.historyStory.sourceCitation}
                </div>
              )}
            </div>
          )}

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => toggleSavePlace(place.id)}
              className={`btn ${isSaved ? 'btn-rose' : 'btn-secondary'} btn-sm`}
              style={{ flex: 1 }}
            >
              <Heart size={15} fill={isSaved ? 'white' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <a
              href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ flex: 1.2, color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', textDecoration: 'none' }}
            >
              <MapPin size={14} color="#10b981" />
              <span>Google Maps ↗</span>
            </a>

            <button onClick={handleRouteClick} className="btn btn-primary btn-sm" style={{ flex: 1.5 }}>
              <Navigation size={14} />
              <span>Calculate Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailModal;
