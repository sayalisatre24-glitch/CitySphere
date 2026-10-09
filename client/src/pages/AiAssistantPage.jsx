import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  MapPin,
  Star,
  DollarSign,
  ArrowRight,
  RefreshCw,
  Eye,
  Key,
  CloudSun,
  Utensils,
  BookOpen,
  Trees,
  Check,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const quickCategoryPills = [
  { label: '🌤️ Live Weather', query: 'What is the current live weather, temperature and rain forecast in Pune?' },
  { label: '☕ Cafés & Bakeries', query: 'Suggest top iconic cafes and bakeries with good ambiance' },
  { label: '🛕 Temples & Spiritual', query: 'Show revered temples, Ganesha shrines, and spiritual places in Maharashtra' },
  { label: '🏰 Historical Forts', query: 'List top historical Maratha forts and heritage monuments to visit' },
  { label: '🌳 Nature & Hills', query: 'Find scenic nature spots, hill stations, and Sahyadri viewpoints' }
];

const AiAssistantPage = () => {
  const { currentCity, setSelectedPlaceDetail } = useApp();
  const navigate = useNavigate();

  // Gemini API Key State (stored in localStorage)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);
  const [keySavedMessage, setKeySavedMessage] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: `### Welcome to CitySphere AI Assistant 🏙️\n\nI provide **grounded atmospheric telemetry, live weather forecasts**, and curated discoveries across **${currentCity} and Maharashtra**.\n\nAsk me about:\n• 🌤️ **Live Weather & Forecasts** for any city/district\n• ☕ **Iconic Cafés & Bakeries**\n• 🛕 **Temples & Spiritual Sanctuaries**\n• 🏰 **Historical Forts & Maratha Heritage**\n• 🌳 **Nature Trails & Sahyadri Viewpoints**`,
      recommendations: [],
      suggestedFollowUps: [
        `What is the live weather in ${currentCity}?`,
        `Top cafes in ${currentCity}`,
        `Show revered temples in Maharashtra`,
        `Historical forts near ${currentCity}`
      ]
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSaveApiKey = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('gemini_api_key', tempKeyInput.trim());
    setApiKey(tempKeyInput.trim());
    setKeySavedMessage(true);
    setTimeout(() => {
      setKeySavedMessage(false);
      setShowKeyDrawer(false);
    }, 1500);
  };

  const handleSendMessage = async (msgToSend) => {
    const text = msgToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.askAiAssistant(text.trim(), currentCity, messages, apiKey);
      if (res.success && res.data) {
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          source: res.data.source,
          weather: res.data.weather,
          recommendations: res.data.recommendations || [],
          suggestedFollowUps: res.data.suggestedFollowUps || []
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: `⚠️ I encountered a temporary network glitch. Please try again or check the live **Explore & Map** page.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 120px)', minHeight: 620 }}>
      {/* Page Header & Gemini Key Config Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--emerald-light)', color: 'var(--emerald-dark)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.74rem', fontWeight: 700, marginBottom: 4 }}>
            <Sparkles size={13} /> Gemini AI & Live Open-Meteo Engine
          </div>
          <h1 className="section-title" style={{ fontSize: '1.4rem', margin: 0 }}>
            AI City & Weather Assistant — {currentCity}
          </h1>
        </div>

        {/* Gemini API Key Toggle Button */}
        <button
          onClick={() => setShowKeyDrawer(!showKeyDrawer)}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.76rem',
            padding: '5px 12px',
            background: apiKey ? '#ecfdf5' : '#f8fafc',
            borderColor: apiKey ? '#a7f3d0' : '#cbd5e1',
            color: apiKey ? '#047857' : 'var(--text-secondary)'
          }}
        >
          <Key size={13} color={apiKey ? '#10b981' : 'var(--text-muted)'} />
          <span>{apiKey ? '✓ Gemini Key Active' : '+ Add Gemini API Key'}</span>
        </button>
      </div>

      {/* Expandable Gemini Key Configuration Drawer */}
      {showKeyDrawer && (
        <div
          className="card"
          style={{
            padding: '14px 18px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <form onSubmit={handleSaveApiKey} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Enter Google Gemini API Key (Optional — Grounded Open-Meteo & OpenStreetMap Engine works by default):
              </div>
              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '6px 10px', background: 'white' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-emerald btn-sm"
              style={{ marginTop: 18, padding: '7px 14px', fontWeight: 700 }}
            >
              {keySavedMessage ? '✓ Saved!' : 'Save Key'}
            </button>
            {apiKey && (
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('gemini_api_key');
                  setApiKey('');
                  setTempKeyInput('');
                }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 18, padding: '7px 10px', color: 'var(--rose-dark)' }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      )}

      {/* Main Chat Box Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Messages Scroll Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 12,
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: msg.sender === 'user' ? '75%' : '88%'
              }}
            >
              {msg.sender === 'ai' && (
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 'var(--radius-md)',
                    background: msg.source === 'gemini-ai' ? 'linear-gradient(135deg, #059669, #0284c7)' : 'linear-gradient(135deg, #0f172a, #059669)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)'
                  }}
                >
                  <Bot size={17} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Text Bubble */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-lg)',
                    background: msg.sender === 'user' ? '#0f172a' : '#f8fafc',
                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                    boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(15, 23, 42, 0.15)' : 'none'
                  }}
                >
                  {msg.text}
                </div>

                {/* Grounded Recommendation Place Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginTop: 4 }}>
                    {msg.recommendations.map(place => (
                      <div
                        key={place.id}
                        className="card card-interactive"
                        style={{ padding: '12px 14px', background: 'white', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-lg)' }}
                      >
                        <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#0f172a', marginBottom: 2 }}>
                          {place.name}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                          <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{place.category}</span> • {place.cost}
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <button
                            onClick={() => navigate(`/map?destLat=${place.lat}&destLng=${place.lng}&destName=${encodeURIComponent(place.name)}`)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', flex: 1 }}
                          >
                            <MapPin size={11} color="var(--emerald)" /> Plot
                          </button>
                          <a
                            href={place.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#047857', background: '#ecfdf5', textDecoration: 'none', textAlign: 'center' }}
                          >
                            Maps ↗
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Follow up suggestions */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.74rem',
                          background: 'white',
                          borderColor: '#cbd5e1',
                          color: 'var(--text-primary)',
                          padding: '3px 10px'
                        }}
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', background: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Bot size={17} />
              </div>
              <div style={{ padding: '10px 16px', borderRadius: 'var(--radius-lg)', background: '#f8fafc', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e2e8f0' }}>
                <RefreshCw size={13} className="animate-spin" color="var(--emerald)" />
                Querying live atmospheric data & places...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Category Chips Bar */}
        <div style={{ padding: '8px 16px', background: '#f8fafc', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {quickCategoryPills.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="btn btn-secondary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                fontSize: '0.73rem',
                padding: '3px 10px',
                flexShrink: 0,
                background: 'white',
                borderColor: '#e2e8f0',
                fontWeight: 600
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ padding: '12px 18px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10, background: 'white' }}
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask about weather, cafes, temples, forts or routes in ${currentCity}...`}
            className="form-input"
            style={{ flex: 1, fontSize: '0.88rem' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="btn btn-emerald"
            style={{ padding: '8px 18px', fontWeight: 700 }}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantPage;
