import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, cityCoordinates } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCity, setCurrentCity] = useState('Pune');
  const [places, setPlaces] = useState([]);
  const [reports, setReports] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);

  // Authentication & Guest State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('citysphere_user');
      return savedUser ? JSON.parse(savedUser) : null; // null = Guest mode
    } catch (e) {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState(() => {
    try {
      const guestMode = localStorage.getItem('citysphere_guest');
      return guestMode === 'true' || !localStorage.getItem('citysphere_user');
    } catch (e) {
      return true;
    }
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'signup'
  const [authModalReason, setAuthModalReason] = useState('');

  // Saved / Favourites state
  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    try {
      const saved = localStorage.getItem('citysphere_saved');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [comparePlaceIds, setComparePlaceIds] = useState([]);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState(null);

  useEffect(() => {
    loadCityData(currentCity);
  }, [currentCity]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('citysphere_user', JSON.stringify(user));
      localStorage.removeItem('citysphere_guest');
      setIsGuest(false);
    } else {
      localStorage.removeItem('citysphere_user');
      localStorage.setItem('citysphere_guest', 'true');
      setIsGuest(true);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('citysphere_saved', JSON.stringify(savedPlaceIds));
  }, [savedPlaceIds]);

  const loadCityData = async (city) => {
    setLoading(true);
    try {
      const coords = cityCoordinates[city] || cityCoordinates['Pune'];
      
      const [placesRes, reportsRes, weatherRes] = await Promise.allSettled([
        api.getPlaces({ city }),
        api.getReports({ city }),
        api.getWeather(coords.lat, coords.lng, city)
      ]);

      if (placesRes.status === 'fulfilled' && placesRes.value.success) {
        setPlaces(placesRes.value.data || []);
      }
      if (reportsRes.status === 'fulfilled' && reportsRes.value.success) {
        setReports(reportsRes.value.data || []);
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value.success) {
        setWeather(weatherRes.value);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auth helper methods
  const login = (userData) => {
    setUser(userData);
    setIsGuest(false);
    setAuthModalOpen(false);
  };

  const signup = (userData) => {
    setUser(userData);
    setIsGuest(false);
    setAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(true);
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    setAuthModalOpen(false);
  };

  const requireAuth = (actionReason, callback) => {
    if (!user) {
      setAuthModalReason(actionReason || 'Please sign in to access this feature.');
      setAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  const toggleSavePlace = (placeId) => {
    if (!user) {
      requireAuth('Sign in to save favourite places to your permanent collection.', () => {
        setSavedPlaceIds(prev =>
          prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
        );
      });
      return;
    }

    setSavedPlaceIds(prev =>
      prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
    );
  };

  const toggleComparePlace = (placeId) => {
    setComparePlaceIds(prev => {
      if (prev.includes(placeId)) return prev.filter(id => id !== placeId);
      if (prev.length >= 4) {
        alert('You can compare up to 4 places at a time.');
        return prev;
      }
      return [...prev, placeId];
    });
  };

  const currentCoords = cityCoordinates[currentCity] || cityCoordinates['Pune'];

  return (
    <AppContext.Provider
      value={{
        currentCity,
        setCurrentCity,
        currentCoords,
        places,
        setPlaces,
        reports,
        setReports,
        weather,
        loading,
        user,
        isGuest,
        login,
        signup,
        logout,
        continueAsGuest,
        requireAuth,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        authModalReason,
        savedPlaceIds,
        toggleSavePlace,
        comparePlaceIds,
        setComparePlaceIds,
        toggleComparePlace,
        selectedPlaceDetail,
        setSelectedPlaceDetail,
        refreshData: () => loadCityData(currentCity)
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
