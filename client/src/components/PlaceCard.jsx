import React from 'react';
import { Heart, Star, MapPin, Navigation, Eye, Check, BookOpen, Accessibility, DollarSign, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const categoryColors = {
  'Historical': 'badge-amber',
  'Heritage': 'badge-amber',
  'Tourist Attraction': 'badge-indigo',
  'Attractions': 'badge-indigo',
  'Restaurant & Cafe': 'badge-rose',
  'Cafés & Food': 'badge-rose',
  'Museum': 'badge-violet',
  'Park & Recreation': 'badge-emerald',
  'Nature & Parks': 'badge-emerald',
  'Hotel & Stay': 'badge-sky',
  'Nightlife': 'badge-indigo'
};

const PlaceCard = ({ place, onSelect }) => {
  const { savedPlaceIds, toggleSavePlace, comparePlaceIds, toggleComparePlace, setSelectedPlaceDetail } = useApp();
  const navigate = useNavigate();

  const isSaved = savedPlaceIds.includes(place.id);
  const isCompared = comparePlaceIds.includes(place.id);
  const badgeClass = categoryColors[place.category] || 'badge-indigo';

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(place);
    } else {
      setSelectedPlaceDetail(place);
    }
  };

  return (
    <div
      className="card card-interactive"
      style={{
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-xl)',
        background: 'white',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={handleCardClick}
    >
      {/* Top Header: Category Badge & Save Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`badge ${badgeClass}`} style={{ fontSize: '0.74rem', padding: '3px 10px', fontWeight: 700 }}>
            {place.category || 'Attractions'}
          </span>
          <span className="badge badge-gray" style={{ fontSize: '0.7rem' }}>
            {place.city}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleComparePlace(place.id);
            }}
            className={`btn btn-sm ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}
            title={isCompared ? 'Remove from comparison' : 'Add to Compare'}
          >
            {isCompared ? <Check size={11} /> : '+ Compare'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSavePlace(place.id);
            }}
            style={{
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isSaved ? 'var(--rose)' : 'var(--text-secondary)'
            }}
            title={isSaved ? 'Remove from Saved' : 'Save Place'}
          >
            <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      {/* Bold & Bright Place Name */}
      <h3
        style={{
          fontSize: '1.3rem',
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          lineHeight: 1.25,
          marginBottom: 6
        }}
      >
        {place.name}
      </h3>

      {/* Rating and Neighbourhood Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600 }}>
          <MapPin size={14} color="var(--emerald)" />
          <span>{place.neighbourhood ? `${place.neighbourhood}, ` : ''}{place.city}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--amber-dark)', fontWeight: 800, fontSize: '0.9rem', background: '#fffbeb', padding: '2px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span>{place.rating || 4.7}</span>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {place.description}
      </p>

      {/* Features & Cost Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--emerald-dark)', background: 'var(--emerald-light)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
          💰 {place.cost || 'Free Entry'}
        </span>
        {place.accessibility?.wheelchairAccessible && (
          <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
            <Accessibility size={11} /> Accessible
          </span>
        )}
        {place.tags?.slice(0, 2).map(tag => (
          <span key={tag} className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Card Footer Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/map?destLat=${place.lat}&destLng=${place.lng}&destName=${encodeURIComponent(place.name)}`);
          }}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1, fontSize: '0.78rem', padding: '6px 8px' }}
        >
          <MapPin size={13} color="var(--emerald)" />
          <span>Locate</span>
        </button>

        <a
          href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1.2, fontSize: '0.78rem', padding: '6px 8px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', textDecoration: 'none', textAlign: 'center' }}
        >
          <span>Google Maps ↗</span>
        </a>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPlaceDetail(place);
          }}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, fontSize: '0.78rem', padding: '6px 8px' }}
        >
          <Eye size={13} />
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};

export default PlaceCard;
