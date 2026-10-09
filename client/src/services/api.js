import axios from 'axios';

const API_BASE = '/api';

export const cityCoordinates = {
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Mumbai': { lat: 18.9220, lng: 72.8347 },
  'Maharashtra': { lat: 18.9750, lng: 74.3000 },
  'Nashik': { lat: 19.9975, lng: 73.7898 },
  'Chhatrapati Sambhaji Nagar': { lat: 19.8762, lng: 75.3433 },
  'Mahabaleshwar': { lat: 17.9307, lng: 73.6477 },
  'Lonavala': { lat: 18.7557, lng: 73.4091 },
  'Kolhapur': { lat: 16.7050, lng: 74.2433 },
  'Shirdi': { lat: 19.7667, lng: 74.4766 },
  'Alibaug': { lat: 18.6415, lng: 72.8722 },
  'Satara': { lat: 17.6805, lng: 73.9934 },
  'Ratnagiri': { lat: 16.9902, lng: 73.3120 },
  'Sindhudurg': { lat: 16.0592, lng: 73.4614 },
  'Nagpur': { lat: 21.1458, lng: 79.0882 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 }
};

export const api = {
  // Places & Multi-API Search
  getPlaces: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/places`, { params });
    return res.data;
  },
  getPlaceById: async (id) => {
    const res = await axios.get(`${API_BASE}/places/${id}`);
    return res.data;
  },
  searchCityLocations: async (query, city) => {
    const res = await axios.get(`${API_BASE}/city/search`, { params: { q: query, city } });
    return res.data;
  },
  scanLandmark: async (query, coordinates) => {
    const res = await axios.post(`${API_BASE}/places/scan`, { query, coordinates });
    return res.data;
  },
  addPlace: async (placeData) => {
    const res = await axios.post(`${API_BASE}/places`, placeData);
    return res.data;
  },

  // Weather (Open-Meteo API)
  getWeather: async (lat, lng, city) => {
    const res = await axios.get(`${API_BASE}/weather`, { params: { lat, lng, city } });
    return res.data;
  },

  // Routes (OSRM Routing API)
  getRoute: async (startLat, startLng, endLat, endLng, mode = 'driving') => {
    const res = await axios.get(`${API_BASE}/routes`, {
      params: { startLat, startLng, endLat, endLng, mode }
    });
    return res.data;
  },

  // Citizen Reports
  getReports: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/reports`, { params });
    return res.data;
  },
  getReportById: async (id) => {
    const res = await axios.get(`${API_BASE}/reports/${id}`);
    return res.data;
  },
  submitReport: async (formData) => {
    const res = await axios.post(`${API_BASE}/reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  updateReportStatus: async (id, statusData) => {
    const res = await axios.patch(`${API_BASE}/reports/${id}/status`, statusData);
    return res.data;
  },
  upvoteReport: async (id) => {
    const res = await axios.post(`${API_BASE}/reports/${id}/upvote`);
    return res.data;
  },

  // AI Assistant & NLP
  askAiAssistant: async (message, city, conversationHistory, customApiKey) => {
    const apiKey = customApiKey || localStorage.getItem('gemini_api_key') || '';
    const res = await axios.post(`${API_BASE}/ai/chat`, {
      message,
      city,
      conversationHistory,
      customApiKey: apiKey
    });
    return res.data;
  },
  getAiRecommendations: async (preferences) => {
    const res = await axios.post(`${API_BASE}/ai/recommendations`, preferences);
    return res.data;
  },

  // Place Comparison
  comparePlaces: async (placeIds, weights, userPersona) => {
    const res = await axios.post(`${API_BASE}/places/compare`, {
      placeIds,
      weights,
      userPersona
    });
    return res.data;
  },

  // Itineraries
  getItineraries: async (city, userId) => {
    const res = await axios.get(`${API_BASE}/itineraries`, { params: { city, userId } });
    return res.data;
  },
  createItinerary: async (itineraryData) => {
    const res = await axios.post(`${API_BASE}/itineraries`, itineraryData);
    return res.data;
  },
  deleteItinerary: async (id) => {
    const res = await axios.delete(`${API_BASE}/itineraries/${id}`);
    return res.data;
  },

  // Analytics
  getAnalytics: async (city) => {
    const res = await axios.get(`${API_BASE}/analytics`, { params: { city } });
    return res.data;
  }
};
