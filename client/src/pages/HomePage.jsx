import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Globe,
  Search,
  Sparkles,
  MapPin,
  CloudSun,
  ArrowRight,
  Compass,
  Utensils,
  BookOpen,
  Trees,
  ShoppingBag,
  Landmark,
  ShieldAlert,
  Car,
  Star,
  Eye,
  Navigation,
  CheckCircle2,
  CalendarCheck,
  Building2,
  Maximize2,
  LogIn,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import PlaceCard from '../components/PlaceCard';
import InteractiveMapComponent from '../components/InteractiveMapComponent';

// Available Main Cities with Cover Photos and Highlights
const availableMainCities = [
  {
    id: 'Pune',
    name: 'Pune',
    state: 'Maharashtra',
    tagline: 'Oxford of the East & Maratha Heritage',
    coverImage: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    placesCount: '8+ Highlights'
  },
  {
    id: 'Mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    tagline: 'City of Dreams & Coastal Promenades',
    coverImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80',
    placesCount: '6+ Highlights'
  },
  {
    id: 'Delhi',
    name: 'Delhi',
    state: 'NCR',
    tagline: 'Imperial Capital & Historic Monuments',
    coverImage: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
    placesCount: '5+ Highlights'
  },
  {
    id: 'Bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    tagline: 'Silicon Valley & Garden City',
    coverImage: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
    placesCount: '5+ Highlights'
  }
];

const quickCategories = [
  { id: 'Attractions', name: 'Attractions', icon: Compass, color: '#4f46e5', bg: '#eef2ff' },
  { id: 'Cafés & Food', name: 'Food & Cafés', icon: Utensils, color: '#f43f5e', bg: '#fff1f2' },
  { id: 'Heritage', name: 'Heritage Sites', icon: BookOpen, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'Nature & Parks', name: 'Parks & Nature', icon: Trees, color: '#10b981', bg: '#ecfdf5' },
  { id: 'Shopping', name: 'Shopping', icon: ShoppingBag, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'Nightlife', name: 'Nightlife', icon: Landmark, color: '#0ea5e9', bg: '#f0f9ff' }
];

const HomePage = () => {
  const navigate = useNavigate();
  const {
    currentCity,
    setCurrentCity,
    places,
    weather,
    setSelectedPlaceDetail,
    user,
    setAuthModalOpen,
    setAuthModalMode,
    continueAsGuest
  } = useApp();
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchInput.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleExploreAsGuest = () => {
    continueAsGuest();
    navigate('/explore');
  };

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const cityPlaces = places.filter(p => p.city.toLowerCase() === currentCity.toLowerCase());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* 1. HERO BANNER — CITYSPHERE (Laptop Optimized 2-Column Balance) */}
      <section
        style={{
          position: 'relative',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          padding: '32px 36px',
          background: 'linear-gradient(135deg, #0b1329 0%, #111c38 60%, #064e3b 100%)',
          color: 'white',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)', gap: 28, alignItems: 'center' }}>
          {/* Left Column: Title, Actions & Search */}
          <div>
            {/* App Name Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#6ee7b7', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 800, marginBottom: 10 }}>
              <Sparkles size={13} />
              <span>CitySphere · Intelligent Exploration Platform</span>
            </div>

            {/* Main Title & Tagline */}
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 6 }}>
              CitySphere
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#6ee7b7', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: 10 }}>
              Explore Smarter. Travel Safer. Experience More.
            </p>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: 18, maxWidth: 560 }}>
              Discover real-time urban telemetry, verified attractions, local culinary gems, historical architecture, safety insights, and interactive multi-layer city maps.
            </p>

            {/* Action Buttons: Explore as Guest & Login / Sign Up */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
              <button
                onClick={handleExploreAsGuest}
                className="btn btn-emerald"
                style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)' }}
              >
                <Compass size={16} />
                <span>Explore as Guest</span>
                <ArrowRight size={14} />
              </button>

              {!user ? (
                <button
                  onClick={handleOpenLogin}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(8px)' }}
                >
                  <LogIn size={16} />
                  <span>Login / Sign Up</span>
                </button>
              ) : (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '8px 14px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <UserCheck size={15} color="#6ee7b7" />
                  <span style={{ fontSize: '0.82rem', color: 'white', fontWeight: 600 }}>{user.name}</span>
                </div>
              )}
            </div>

            {/* Quick Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '5px 6px 5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                maxWidth: 540,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}
            >
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`Search landmarks or cafes in ${currentCity}...`}
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.86rem', color: '#0f172a' }}
              />
              <button
                type="button"
                onClick={() => {
                  if (searchInput.trim()) {
                    navigate(`/map?destName=${encodeURIComponent(searchInput.trim())}`);
                  } else {
                    navigate('/map');
                  }
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px 8px', fontSize: '0.75rem' }}
              >
                <MapPin size={12} color="var(--emerald)" />
                <span>Map</span>
              </button>
              <button type="submit" className="btn btn-emerald btn-sm" style={{ padding: '7px 14px', fontSize: '0.78rem', fontWeight: 700 }}>
                <span>Search</span>
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

          {/* Right Column: Live Telemetry & Fast Navigation Snapshot */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 22px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CloudSun size={18} color="#6ee7b7" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'white' }}>
                  {currentCity} Live Telemetry
                </span>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>
                Active Radar
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {weather?.current?.temperature || 31}°C
              </div>
              <div style={{ fontSize: '0.88rem', color: '#6ee7b7', fontWeight: 600 }}>
                {weather?.current?.condition || 'Clear Sky ☀️'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 10 }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>HUMIDITY</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{weather?.current?.humidity || 34}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>WIND SPEED</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>{weather?.current?.windSpeed || 11} km/h</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <Link to="/explore" className="btn btn-emerald btn-sm" style={{ flex: 1, fontSize: '0.76rem', fontWeight: 700 }}>
                <Compass size={13} /> <span>Explore {currentCity}</span>
              </Link>
              <Link to="/weather" className="btn btn-secondary btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', fontSize: '0.76rem' }}>
                Forecast ↗
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SELECT DESTINATION CITY */}
      {/* 2. SELECT DESTINATION CITY */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Select Destination City</h2>
            <p className="section-subtitle">Switch cities to instantly view curated places, weather, and spatial maps</p>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Active: <strong>📍 {currentCity}</strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {availableMainCities.map(city => {
            const isActive = currentCity.toLowerCase() === city.id.toLowerCase();
            return (
              <div
                key={city.id}
                onClick={() => setCurrentCity(city.id)}
                className="card card-interactive"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  position: 'relative',
                  height: 160,
                  borderRadius: 'var(--radius-xl)',
                  border: isActive ? '3px solid var(--emerald)' : '1px solid var(--border-color)',
                  boxShadow: isActive ? '0 8px 20px rgba(16, 185, 129, 0.25)' : 'var(--shadow-sm)'
                }}
              >
                <img
                  src={city.coverImage}
                  alt={city.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: isActive
                      ? 'linear-gradient(to top, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.4) 100%)'
                      : 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.3) 100%)',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    color: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: 0 }}>
                        {city.name}
                      </h3>
                      <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginTop: 2 }}>{city.state}</div>
                    </div>
                    {isActive ? (
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '3px 8px' }}>
                        ✓ Active
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{city.placesCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. QUICK CATEGORIES */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {quickCategories.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.id)}`)}
                className="card card-interactive"
                style={{
                  padding: '14px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'white',
                  borderRadius: 'var(--radius-lg)'
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: cat.bg,
                    color: cat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} />
                </div>
                <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TOP PLACES IN THE SELECTED CITY */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">
              Top Places to Explore in {currentCity}
            </h2>
            <p className="section-subtitle">
              Verified historical monuments, heritage cafés, nature trails, and attractions across {currentCity}
            </p>
          </div>
          <Link to="/explore" className="btn btn-emerald btn-sm">
            <span>Explore All Places</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Small compact destination cards in 4-column responsive grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 18
          }}
        >
          {cityPlaces.map(place => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </div>
      </section>

      {/* 5. LIVE SPATIAL MAP PREVIEW */}
      <section
        style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={20} color="var(--emerald)" /> {currentCity} Live Spatial Map
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Click any place pin to preview details and calculate driving routes
            </span>
          </div>
          <Link to="/explore" className="btn btn-primary btn-sm">
            <Maximize2 size={13} />
            <span>Open Interactive Map</span>
          </Link>
        </div>

        <InteractiveMapComponent mapHeight="440px" />
      </section>
    </div>
  );
};

export default HomePage;
