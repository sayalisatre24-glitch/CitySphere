import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PlaceDetailModal from './components/PlaceDetailModal';
import AuthModal from './components/AuthModal';

// Clean Pages
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import HistoryPage from './pages/HistoryPage';
import MapPage from './pages/MapPage';
import WeatherPage from './pages/WeatherPage';
import SafetyPage from './pages/SafetyPage';
import ComparePage from './pages/ComparePage';
import AiAssistantPage from './pages/AiAssistantPage';
import CitizenReportPage from './pages/CitizenReportPage';
import TripPlannerPage from './pages/TripPlannerPage';
import SavedPlacesPage from './pages/SavedPlacesPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/report" element={<CitizenReportPage />} />
              <Route path="/itinerary" element={<TripPlannerPage />} />
              <Route path="/saved" element={<SavedPlacesPage />} />
            </Routes>
          </main>

          <PlaceDetailModal />
          <AuthModal />
          <Footer />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
