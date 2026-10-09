import React, { useState } from 'react';
import {
  AlertCircle,
  MapPin,
  Camera,
  Mic,
  Send,
  Sparkles,
  CheckCircle2,
  Navigation,
  FileText,
  Upload,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import { useNavigate } from 'react-router-dom';

const categories = [
  'Road Damage',
  'Waterlogging',
  'Waste and Cleanliness',
  'Traffic Obstruction',
  'Accessibility Issues',
  'Public Infrastructure Problems',
  'Other Local Concerns'
];

const CitizenReportPage = () => {
  const { currentCity, currentCoords, refreshData, user, requireAuth } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [lat, setLat] = useState(currentCoords.lat);
  const [lng, setLng] = useState(currentCoords.lng);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [locating, setLocating] = useState(false);

  // Browser Geolocation Trigger
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        alert('Could not obtain GPS coordinates. Using city default coordinates.');
      },
      { timeout: 8000 }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photo size cannot exceed 10MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const performSubmit = async () => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('city', currentCity);
      formData.append('neighbourhood', neighbourhood.trim() || 'Central District');
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('submittedBy', user?.name ? `${user.name} (${user.role || 'Citizen'})` : 'Citizen Explorer');

      if (photoFile) {
        formData.append('photo', photoFile);
      }
      if (audioBlob) {
        formData.append('audio', audioBlob, 'voicenote.webm');
      }

      const res = await api.submitReport(formData);
      if (res.success && res.data) {
        setSubmittedReport(res.data);
        await refreshData();
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please provide both a title and description.');
      return;
    }

    if (!user) {
      requireAuth('Sign in or create an account to submit and track your civic hazard reports.', () => {
        performSubmit();
      });
      return;
    }

    await performSubmit();
  };

  if (submittedReport) {
    return (
      <div className="card" style={{ maxWidth: 650, margin: '40px auto', textAlign: 'center', padding: '40px 32px' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald-light)', color: 'var(--emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle2 size={36} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          Report Submitted Successfully!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: 20 }}>
          Thank you for contributing to {currentCity}’s safety and live urban intelligence. Your report ID is <strong>#{submittedReport.id}</strong>.
        </p>

        {/* AI NLP Analysis Breakdown */}
        <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', textAlign: 'left', marginBottom: 24, border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem', color: 'var(--violet-dark)', marginBottom: 6 }}>
            <Sparkles size={16} /> Automated AI NLP Triage & Tags
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            <strong>Summary:</strong> {submittedReport.aiSummary}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="badge badge-amber">Severity: {submittedReport.severity}</span>
            <span className="badge badge-sky">Status: Pending Review</span>
            {submittedReport.aiTags?.map(tag => (
              <span key={tag} className="badge badge-gray">#{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => setSubmittedReport(null)} className="btn btn-secondary btn-sm">
            Submit Another Report
          </button>
          <button onClick={() => navigate('/safety')} className="btn btn-primary btn-sm">
            View Live Safety Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 840, margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--rose-light)', color: 'var(--rose-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <AlertCircle size={14} /> Citizen Civic Engagement
          </div>
          <h1 className="section-title">Report a Civic Hazard or Road Issue</h1>
          <p className="section-subtitle">
            Report road damage, waterlogging, accessibility barriers, or traffic disruptions in {currentCity}.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card" style={{ padding: '32px' }}>
        {/* Category & Title */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, marginBottom: 16 }}>
          <div className="form-group">
            <label className="form-label">Report Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Short Title / Subject *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole near bridge exit, or flooded underpass"
              className="form-input"
              required
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="form-group">
          <label className="form-label">Detailed Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the severity, lane blockage, safety risk for pedestrians or two-wheelers..."
            rows={4}
            className="form-textarea"
            required
          />
        </div>

        {/* Location Selector */}
        <div className="form-group">
          <label className="form-label">Location / Neighbourhood *</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            <input
              type="text"
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              placeholder={`e.g. Shaniwar Peth, FC Road, ${currentCity}`}
              className="form-input"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="btn btn-secondary btn-sm"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Navigation size={14} color="var(--primary)" />
              <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
            </button>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Coordinates: Lat {lat.toFixed(4)}, Lng {lng.toFixed(4)}
          </div>
        </div>

        {/* Media Attachments: Photo & Voice Note */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, margin: '20px 0', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          {/* Photograph Upload */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Camera size={16} color="var(--primary)" /> Photograph (Optional)
            </label>
            <div style={{ marginTop: 8 }}>
              {photoPreview ? (
                <div style={{ position: 'relative', height: 120, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 110, border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'var(--bg-subtle)' }}>
                  <Upload size={20} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>Click to upload image</span>
                  <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

          {/* Voice Note Recorder */}
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Mic size={16} color="var(--rose)" /> Voice Note Recording (Optional)
            </label>
            <div style={{ marginTop: 8 }}>
              <VoiceRecorder
                onAudioReady={(blob) => setAudioBlob(blob)}
                onAudioClear={() => setAudioBlob(null)}
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-rose btn-lg"
            style={{ width: '100%' }}
          >
            <Send size={18} />
            <span>{submitting ? 'Submitting & Analyzing with AI...' : 'Submit Citizen Report for Review'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CitizenReportPage;
