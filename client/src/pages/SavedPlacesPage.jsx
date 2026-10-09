import React from 'react';
import { Bookmark, Heart, MapPin, Trash2, Compass, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PlaceCard from '../components/PlaceCard';
import { Link } from 'react-router-dom';

const SavedPlacesPage = () => {
  const { places, savedPlaceIds, currentCity } = useApp();

  const savedPlaces = places.filter(p => savedPlaceIds.includes(p.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--rose-light)', color: 'var(--rose-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <Bookmark size={14} /> Personal Collection
          </div>
          <h1 className="section-title">Saved Places & Favourites</h1>
          <p className="section-subtitle">
            Your saved destinations, historical monuments, and culinary spots in {currentCity}.
          </p>
        </div>
      </div>

      {savedPlaces.length > 0 ? (
        <div className="grid-3">
          {savedPlaces.map(place => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Heart size={44} color="var(--rose)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No saved places yet in {currentCity}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            Click the heart icon on any place card while exploring to save it to your personal favourites.
          </p>
          <Link to="/explore" className="btn btn-primary btn-sm">
            <Compass size={14} /> <span>Explore {currentCity} Places</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SavedPlacesPage;
