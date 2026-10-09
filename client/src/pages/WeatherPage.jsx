import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Compass,
  AlertTriangle,
  RefreshCw,
  Sun,
  CloudRain,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, cityCoordinates } from '../services/api';

const WeatherPage = () => {
  const { currentCity, weather, refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!weather) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <RefreshCw size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 12px' }} />
        <h3>Loading Real-time Weather Data for {currentCity}...</h3>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--sky-light)', color: 'var(--sky-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <CloudSun size={14} /> Open-Meteo Verified Live Service
          </div>
          <h1 className="section-title">Weather & Travel Forecast — {currentCity}</h1>
          <p className="section-subtitle">
            Current meteorological metrics, hourly rain forecast, and dynamic weather-aware activity recommendations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          <span>Refresh Live Radar</span>
        </button>
      </div>

      {/* Main Current Weather Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 60%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          padding: '32px 36px'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 28, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-sky">{currentCity} Live Weather</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Updated {weather.current.lastUpdated}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <h2 style={{ fontSize: '3.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                {weather.current.temperature}°C
              </h2>
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--sky-dark)' }}>
                {weather.current.condition}
              </span>
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              Feels like {weather.current.feelsLike}°C
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Droplets size={18} color="var(--sky-dark)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>HUMIDITY</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{weather.current.humidity}%</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wind size={18} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>WIND SPEED</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{weather.current.windSpeed} km/h</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CloudRain size={18} color="var(--violet)" />
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRECIPITATION</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{weather.current.precipitation} mm</div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Weather-Aware Travel Advice Banner */}
          {weather.smartRecommendations && weather.smartRecommendations.length > 0 && (
            <div
              style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                border: '1px solid #bae6fd',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--sky-dark)', fontWeight: 700, fontSize: '0.92rem', marginBottom: 8 }}>
                <Sparkles size={16} /> Weather-Aware City Advice
              </div>
              <p style={{ fontSize: '0.88rem', color: '#0369a1', lineHeight: 1.6, marginBottom: 12 }}>
                {weather.smartRecommendations[0].advice}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {weather.smartRecommendations[0].recommendedCategories?.map(cat => (
                  <span key={cat} className="badge badge-sky" style={{ fontSize: '0.72rem' }}>
                    Recommended: {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hourly 8-12 Hour Forecast Cards */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} color="var(--primary)" /> Hourly Forecast (Next 12 Hours)
        </h3>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 10 }}>
          {weather.hourly?.map((hr, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                minWidth: 120,
                padding: '16px 14px',
                textAlign: 'center',
                flexShrink: 0,
                background: 'white'
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                {hr.time}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {hr.temp}°C
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                {hr.condition}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: hr.rainProb > 30 ? 'var(--rose)' : 'var(--emerald-dark)' }}>
                💧 {hr.rainProb}% rain
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Daily Forecast List */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={18} color="var(--primary)" /> 7-Day Extended Forecast
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          {weather.daily?.map((d, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'white'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{d.day}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.date}</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{d.condition}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--sky-dark)' }}>Rain: {d.rainProbMax}%</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{d.maxTemp}°</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 6 }}>{d.minTemp}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
