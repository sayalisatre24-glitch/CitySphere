import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Mic,
  Sparkles,
  MapPin,
  Star,
  Eye,
  Navigation,
  ExternalLink,
  ChevronDown,
  Layers,
  Maximize2,
  Crosshair,
  SlidersHorizontal,
  Compass,
  Utensils,
  BookOpen,
  Trees,
  DollarSign,
  Accessibility,
  Heart,
  Scan,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import InteractiveMapComponent from '../components/InteractiveMapComponent';

const mainCategories = [
  { id: 'All', label: 'All Places' },
  { id: 'Cafés & Food', label: '☕ Cafés & Food' },
  { id: 'Temples & Spiritual', label: '🛕 Temples & Spiritual' },
  { id: 'Heritage', label: '🏰 Heritage & Forts' },
  { id: 'Nature & Parks', label: '🌳 Nature & Parks' },
  { id: 'Attractions', label: '🎡 Attractions' }
];

const quickSearchSuggestions = [
  'German Bakery',
  'Dagdusheth Ganpati',
  'Sinhagad Fort',
  'Gateway of India',
  'Shirdi Sai Baba',
  'Trimbakeshwar',
  'Ajanta Caves',
  'Sula Vineyards',
  'Mahabaleshwar'
];

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentCity,
    setCurrentCity,
    places,
    setSelectedPlaceDetail,
    savedPlaceIds,
    toggleSavePlace
  } = useApp();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [selectedBudget, setSelectedBudget] = useState('all');
  const [minRating, setMinRating] = useState('0');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);

  // Search Results from Live APIs (Nominatim, Wikipedia, Curated)
  const [apiSearchResults, setApiSearchResults] = useState(null);
  const [searchingApi, setSearchingApi] = useState(false);

  // Map focus and target location
  const [targetLocation, setTargetLocation] = useState(null);
  const [selectedMapPlace, setSelectedMapPlace] = useState(null);

  // AI Scanner Modal State
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanInput, setScanInput] = useState('');
  const [scanningStatus, setScanningStatus] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Voice search state
  const [isListening, setIsListening] = useState(false);

  // If queryParam exists on load, trigger search
  useEffect(() => {
    if (queryParam.trim()) {
      handleLiveSearch(queryParam.trim());
    }
  }, [queryParam]);

  // Debounced auto-search when user types
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setApiSearchResults(null);
      return;
    }

    const timer = setTimeout(() => {
      if (trimmed.length >= 2) {
        handleLiveSearch(trimmed);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Live Multi-API Search Handler
  const handleLiveSearch = async (queryText) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) {
      setApiSearchResults(null);
      return;
    }

    setSearchingApi(true);
    try {
      const res = await api.searchCityLocations(q, currentCity);
      if (res.success && res.results) {
        setApiSearchResults(res.results);

        if (res.results.length > 0) {
          const top = res.results[0];
          setTargetLocation({ lat: top.lat, lng: top.lng, name: top.name || top.displayName });
          setSelectedMapPlace(top);
        }
      }
    } catch (err) {
      console.error('Live search error:', err);
    } finally {
      setSearchingApi(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    handleLiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setApiSearchResults(null);
    setTargetLocation(null);
  };

  // Voice Search Handler
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in this browser. Please type your location query.');
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        handleLiveSearch(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // AI Landmark Scanner Submission
  const handleRunAiScan = async (e) => {
    if (e) e.preventDefault();
    const queryToScan = (scanInput.trim() || searchQuery.trim() || 'Sinhagad Fort');
    setScanningStatus(true);
    setScanResult(null);

    try {
      const res = await api.scanLandmark(queryToScan);
      if (res.success && res.data) {
        setScanResult(res.data);
        setTargetLocation({ lat: res.data.lat, lng: res.data.lng, name: res.data.name });
        setSelectedMapPlace(res.data);
      }
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanningStatus(false);
    }
  };

  // Base list of places: if API search returned results, use them; otherwise use local places
  const basePlaces = apiSearchResults !== null
    ? apiSearchResults
    : (searchQuery.trim()
        ? places.filter(p => {
            const q = searchQuery.toLowerCase().trim();
            return (
              (p.name && p.name.toLowerCase().includes(q)) ||
              (p.neighbourhood && p.neighbourhood.toLowerCase().includes(q)) ||
              (p.city && p.city.toLowerCase().includes(q)) ||
              (p.description && p.description.toLowerCase().includes(q)) ||
              (p.category && p.category.toLowerCase().includes(q)) ||
              (p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase().includes(q)))
            );
          })
        : places
      );

  // Apply filters to base places
  const filteredPlaces = basePlaces.filter(p => {
    // Category match
    if (activeCategory !== 'All') {
      const pCat = (p.category || '').toLowerCase();
      const actCat = activeCategory.toLowerCase();
      if (!pCat.includes(actCat) && !actCat.includes(pCat)) return false;
    }

    // Budget match
    if (selectedBudget === 'under200' && (p.priceValue > 200 || p.priceTier === 'luxury')) return false;
    if (selectedBudget === '200-500' && (p.priceValue < 200 || p.priceValue > 500)) return false;
    if (selectedBudget === '500+' && p.priceValue < 500) return false;

    // Rating match
    if (minRating === '4.5' && p.rating < 4.5) return false;

    // Accessibility
    if (wheelchairOnly && !p.accessibility?.wheelchairAccessible) return false;

    return true;
  });

  const handleCardClick = (place) => {
    setSelectedMapPlace(place);
    if (place.lat && place.lng) {
      setTargetLocation({ lat: place.lat, lng: place.lng, name: place.name });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 2-COLUMN WIDESCREEN WORKSPACE: LEFT SEARCH & PLACES (46%) / RIGHT INTERACTIVE MAP (54%) */}
      <div className="explore-workspace-grid">
        
        {/* ================= LEFT COLUMN: SEARCH, FILTERS & CARDS ================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          
          {/* 1. Multi-API Live Search Bar (Direct Search Without Dropdown List) */}
          <div className="card" style={{ padding: '10px 14px', background: 'white' }}>
            <form
              onSubmit={handleSearchSubmit}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <Search size={18} color="var(--text-muted)" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim().length === 0) {
                    setApiSearchResults(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                placeholder="Search any location in Maharashtra (e.g. Sinhagad, Mumbai, Lonavala, Ajanta)..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  flex: 1,
                  background: 'transparent'
                }}
              />

              {searchingApi && <Loader2 size={16} className="animate-spin" color="var(--emerald)" />}

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 4px' }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className="btn btn-secondary"
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  background: isListening ? 'var(--rose-light)' : 'var(--bg-subtle)',
                  color: isListening ? 'var(--rose)' : 'var(--text-secondary)'
                }}
                title="Voice Search"
              >
                <Mic size={14} />
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="btn btn-emerald btn-sm"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                <span>Search</span>
              </button>

              {/* AI Scan Button */}
              <button
                type="button"
                onClick={() => {
                  setScanInput(searchQuery || 'Sinhagad Fort');
                  setScannerOpen(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                title="AI Landmark Scanner"
              >
                <Scan size={14} color="var(--emerald)" />
                <span>AI Scan</span>
              </button>
            </form>
          </div>

          {/* 2. Popular Location Quick Suggestion Chips & Filter Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', paddingBottom: 2, alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                Quick:
              </span>
              {quickSearchSuggestions.slice(0, 5).map(suggest => (
                <button
                  key={suggest}
                  type="button"
                  onClick={() => {
                    setSearchQuery(suggest);
                    handleLiveSearch(suggest);
                  }}
                  style={{
                    border: '1px solid #e2e8f0',
                    background: searchQuery === suggest ? '#0f172a' : '#f8fafc',
                    color: searchQuery === suggest ? 'white' : '#334155',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {suggest}
                </button>
              ))}
            </div>

            {/* Quick Filter Chips */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setSelectedBudget(selectedBudget === 'under200' ? 'all' : 'under200')}
                className={`filter-chip ${selectedBudget === 'under200' ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                <DollarSign size={11} /> &lt; ₹200
              </button>

              <button
                onClick={() => setMinRating(minRating === '4.5' ? '0' : '4.5')}
                className={`filter-chip ${minRating === '4.5' ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                <Star size={11} /> 4.5+ ★
              </button>

              <button
                onClick={() => setWheelchairOnly(!wheelchairOnly)}
                className={`filter-chip ${wheelchairOnly ? 'active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                <Accessibility size={11} /> Accessible
              </button>
            </div>
          </div>

          {/* 3. Category Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {mainCategories.map(cat => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    border: 'none',
                    background: isActive ? 'var(--primary)' : 'white',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.25)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* 4. Discovered Locations Count & Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {searchQuery ? `Search Results for "${searchQuery}"` : 'Discovered Places'} ({filteredPlaces.length})
              </span>
              {searchQuery && (
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  Filtered
                </span>
              )}
            </div>

            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.72rem', padding: '3px 8px' }}
              >
                Show All Places
              </button>
            )}
          </div>

          {/* 5. Destination Cards List (Bold & Bright Location Names, Smooth Scroll) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: 'calc(100vh - 240px)',
              overflowY: 'auto',
              paddingRight: 4
            }}
          >
            {filteredPlaces.length === 0 ? (
              <div className="card" style={{ padding: '36px 24px', textAlign: 'center', background: 'white' }}>
                <Compass size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  No locations matching "{searchQuery}"
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4, maxWidth: 360, margin: '6px auto 14px' }}>
                  Try searching for famous spots like Sinhagad Fort, Gateway of India, Ajanta Caves, Sula Vineyards, or Mahabaleshwar.
                </p>
                <button onClick={handleClearSearch} className="btn btn-emerald btn-sm">
                  View All Maharashtra Places
                </button>
              </div>
            ) : (
              filteredPlaces.map(place => {
                const isSelected = selectedMapPlace?.id === place.id;
                const isSaved = savedPlaceIds.includes(place.id);

                return (
                  <div
                    key={place.id}
                    onClick={() => handleCardClick(place)}
                    className="card card-interactive"
                    style={{
                      padding: '16px 18px',
                      background: isSelected ? '#f0fdf4' : 'white',
                      border: isSelected ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: isSelected ? '0 4px 14px rgba(16, 185, 129, 0.15)' : 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="badge badge-indigo" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                            {place.category || 'Attractions'}
                          </span>
                          <span className="badge badge-gray" style={{ fontSize: '0.68rem' }}>
                            {place.city || 'Maharashtra'}
                          </span>
                        </div>

                        {/* Bold & Bright Place Name */}
                        <h4
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 900,
                            color: '#0f172a',
                            letterSpacing: '-0.02em',
                            margin: '3px 0',
                            lineHeight: 1.2
                          }}
                        >
                          {place.name}
                        </h4>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <MapPin size={13} color="var(--emerald)" />
                          <span>{place.neighbourhood ? `${place.neighbourhood}, ` : ''}{place.city || 'Maharashtra'}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--amber-dark)', fontSize: '0.84rem', fontWeight: 800, background: '#fffbeb', padding: '3px 8px', borderRadius: 'var(--radius-full)', border: '1px solid #fde68a' }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          <span>{place.rating || 4.7}</span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSavePlace(place.id);
                          }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: 30,
                            height: 30,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: isSaved ? 'var(--rose)' : 'var(--text-muted)'
                          }}
                          title="Save place"
                        >
                          <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '2px 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {place.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 10, marginTop: 4 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--emerald-dark)' }}>
                        💰 {place.cost || 'Free Entry'}
                      </span>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(place);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          <MapPin size={12} color="var(--emerald)" />
                          <span>Plot on Map</span>
                        </button>

                        <a
                          href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px', color: '#047857', background: '#ecfdf5', border: '1px solid #a7f3d0', textDecoration: 'none' }}
                        >
                          <span>Google Maps ↗</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPlaceDetail(place);
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: INTERACTIVE LEAFLET MAP ================= */}
        <div style={{ position: 'sticky', top: 76, height: 'calc(100vh - 100px)' }}>
          <div className="card" style={{ padding: '12px', background: 'white', borderRadius: 'var(--radius-xl)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                  <MapPin size={16} color="var(--emerald)" />
                  {searchQuery ? `Map: ${filteredPlaces.length} Results` : `${currentCity || 'Maharashtra'} Live Map`}
                </h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Interactive OpenStreetMap with live synced pins & routing
                </span>
              </div>

              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Globe size={11} /> {filteredPlaces.length} Locations Pinned
              </span>
            </div>

            {/* Interactive Leaflet Map Instance */}
            <div style={{ flex: 1, minHeight: '480px', position: 'relative' }}>
              <InteractiveMapComponent
                targetLocation={targetLocation}
                customPlaces={filteredPlaces}
                onPlaceClick={(place) => {
                  setSelectedMapPlace(place);
                }}
                mapHeight="100%"
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI SCANNER MODAL */}
      {scannerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2100,
            padding: '16px'
          }}
          onClick={() => setScannerOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 520,
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'linear-gradient(135deg, #0b1329 0%, #064e3b 100%)', color: 'white', padding: '20px 24px', position: 'relative' }}>
              <button
                onClick={() => setScannerOpen(false)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Scan size={18} color="#6ee7b7" />
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>AI Landmark & Location Scanner</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                Scan any monument, temple, fort, or city district in Maharashtra to resolve exact GPS coordinates and map layers.
              </p>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <form onSubmit={handleRunAiScan} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Enter landmark name (e.g. Ellora Kailasa Temple, Sinhagad Fort, Gateway of India)..."
                  className="form-input"
                  style={{ flex: 1, fontSize: '0.88rem' }}
                  required
                />
                <button
                  type="submit"
                  disabled={scanningStatus}
                  className="btn btn-emerald"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontWeight: 700 }}
                >
                  {scanningStatus ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  <span>{scanningStatus ? 'Scanning...' : 'Scan'}</span>
                </button>
              </form>

              {scanResult && (
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: 4 }}>
                    📍 {scanResult.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                    <strong>Region:</strong> {scanResult.city}, {scanResult.state || 'Maharashtra'} • <strong>GPS:</strong> {scanResult.lat?.toFixed(4)}, {scanResult.lng?.toFixed(4)}
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: 14 }}>
                    {scanResult.description}
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => {
                        setTargetLocation({ lat: scanResult.lat, lng: scanResult.lng, name: scanResult.name });
                        setSelectedMapPlace(scanResult);
                        setScannerOpen(false);
                      }}
                      className="btn btn-emerald btn-sm"
                      style={{ flex: 1 }}
                    >
                      <MapPin size={13} />
                      <span>Plot & Fly on Map</span>
                    </button>
                    <a
                      href={scanResult.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${scanResult.lat},${scanResult.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Google Maps ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
