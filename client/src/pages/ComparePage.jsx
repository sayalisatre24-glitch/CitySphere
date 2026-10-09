import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Star,
  DollarSign,
  Accessibility,
  Shield,
  Sparkles,
  Trophy,
  X,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

const personaPresets = {
  'Balanced': { budget: 20, rating: 20, cleanliness: 20, accessibility: 20, safety: 20 },
  'Budget Explorer': { budget: 45, rating: 20, cleanliness: 15, accessibility: 10, safety: 10 },
  'Mobility & Senior': { budget: 10, rating: 15, cleanliness: 20, accessibility: 40, safety: 15 },
  'Heritage & Culture': { budget: 15, rating: 35, cleanliness: 20, accessibility: 15, safety: 15 }
};

const ComparePage = () => {
  const { currentCity, places, comparePlaceIds, setComparePlaceIds, toggleComparePlace } = useApp();

  const [activePersona, setActivePersona] = useState('Balanced');
  const [weights, setWeights] = useState(personaPresets['Balanced']);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Available places for adding to comparison
  const availableToAdd = places.filter(p => !comparePlaceIds.includes(p.id));

  const handlePersonaSelect = (personaName) => {
    setActivePersona(personaName);
    setWeights(personaPresets[personaName]);
  };

  const handleWeightChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
    setActivePersona('Custom');
  };

  useEffect(() => {
    if (comparePlaceIds.length >= 2) {
      runComparison();
    } else {
      setComparisonResult(null);
    }
  }, [comparePlaceIds, weights]);

  const runComparison = async () => {
    if (comparePlaceIds.length < 2) return;
    setLoading(true);
    try {
      const res = await api.comparePlaces(comparePlaceIds, weights, activePersona);
      if (res.success) {
        setComparisonResult(res);
      }
    } catch (err) {
      console.error('Error comparing places:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--violet-light)', color: 'var(--violet-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <Scale size={14} /> Multi-Criteria Decision Engine
          </div>
          <h1 className="section-title">Best vs. Worst Place Comparison</h1>
          <p className="section-subtitle">
            Side-by-side evaluation weighted by your budget, accessibility requirements, cleanliness, and safety priorities.
          </p>
        </div>
      </div>

      {/* Staged Places Selector Toolbar */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            Staged Places for Comparison ({comparePlaceIds.length} / 4)
          </h3>
          {comparePlaceIds.length < 2 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--rose-dark)', fontWeight: 600 }}>
              Select at least 2 places below to compute the comparison.
            </span>
          )}
        </div>

        {/* Selected Pill Tags */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          {comparePlaceIds.map(id => {
            const place = places.find(p => p.id === id);
            if (!place) return null;
            return (
              <div
                key={id}
                style={{
                  background: 'var(--primary-light)',
                  border: '1px solid #c7d2fe',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--primary)'
                }}
              >
                <span>{place.name}</span>
                <button
                  onClick={() => toggleComparePlace(id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', display: 'flex' }}
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Add Dropdown */}
        {comparePlaceIds.length < 4 && availableToAdd.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Add another destination:</span>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  toggleComparePlace(e.target.value);
                  e.target.value = '';
                }
              }}
              className="form-select"
              style={{ width: 'auto', minWidth: 220, fontSize: '0.85rem' }}
            >
              <option value="">+ Choose place to compare...</option>
              {availableToAdd.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Persona Presets & Weight Sliders */}
      <div className="card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Personalized Evaluation Preferences</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Choose a persona or customize factor weights</span>
          </div>

          {/* Persona preset pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(personaPresets).map(preset => (
              <button
                key={preset}
                onClick={() => handlePersonaSelect(preset)}
                className={`btn btn-sm ${activePersona === preset ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.78rem' }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { key: 'budget', label: '💰 Affordability', val: weights.budget },
            { key: 'rating', label: '⭐ Visitor Rating', val: weights.rating },
            { key: 'cleanliness', label: '✨ Cleanliness', val: weights.cleanliness },
            { key: 'accessibility', label: '♿ Accessibility', val: weights.accessibility },
            { key: 'safety', label: '🛡️ Civic Safety', val: weights.safety }
          ].map(factor => (
            <div key={factor.key} style={{ background: 'white', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                <span>{factor.label}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{factor.val}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={factor.val}
                onChange={(e) => handleWeightChange(factor.key, e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Winner / Recommendation Callout Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #ecfdf5 0%, #eff6ff 100%)',
              border: '2px solid #a7f3d0',
              borderRadius: 'var(--radius-xl)',
              padding: '24px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Trophy size={26} />
              </div>
              <div>
                <span className="badge badge-emerald" style={{ fontSize: '0.72rem', marginBottom: 4 }}>
                  Personalized Best Match
                </span>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b' }}>
                  {comparisonResult.recommendationSummary.bestMatchTitle}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#065f46', marginTop: 2, maxWidth: 680 }}>
                  {comparisonResult.recommendationSummary.explanation}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>MATCH SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-dark)' }}>
                {comparisonResult.recommendationSummary.compositeScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${comparisonResult.comparedPlaces.length}, 1fr)`, gap: 20 }}>
            {comparisonResult.comparedPlaces.map(place => {
              const isBest = place.id === comparisonResult.bestMatchPlaceId;
              return (
                <div
                  key={place.id}
                  className="card"
                  style={{
                    border: isBest ? '2px solid var(--emerald)' : '1px solid var(--border-color)',
                    padding: '20px',
                    position: 'relative'
                  }}
                >
                  {isBest && (
                    <span className="badge badge-emerald" style={{ position: 'absolute', top: 12, right: 12, fontSize: '0.7rem' }}>
                      ⭐ Top Recommendation
                    </span>
                  )}

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{place.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{place.neighbourhood} • {place.category}</div>

                  {/* Overall Composite Score Bar */}
                  <div style={{ marginBottom: 16, background: 'var(--bg-subtle)', padding: '10px 12px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, marginBottom: 4 }}>
                      <span>Preference Match</span>
                      <span style={{ color: isBest ? 'var(--emerald-dark)' : 'var(--primary)' }}>{place.scores.composite} / 100</span>
                    </div>
                    <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${place.scores.composite}%`,
                          background: isBest ? 'var(--emerald)' : 'var(--primary)',
                          borderRadius: 4
                        }}
                      />
                    </div>
                  </div>

                  {/* Factor Breakdown Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.78rem', marginBottom: 16 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Visitor Rating (⭐ {place.rating})</span>
                        <strong>{place.scores.rating} / 100</strong>
                      </div>
                      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${place.scores.rating}%`, background: '#f59e0b', borderRadius: 3 }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Affordability ({place.cost})</span>
                        <strong>{place.scores.budget} / 100</strong>
                      </div>
                      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${place.scores.budget}%`, background: '#4f46e5', borderRadius: 3 }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span>Accessibility ({place.accessibilityStatus})</span>
                        <strong>{place.scores.accessibility} / 100</strong>
                      </div>
                      <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3 }}>
                        <div style={{ height: '100%', width: `${place.scores.accessibility}%`, background: '#10b981', borderRadius: 3 }} />
                      </div>
                    </div>
                  </div>

                  {/* Advantages List */}
                  <div style={{ marginBottom: 12 }}>
                    <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald-dark)', marginBottom: 4 }}>Key Advantages:</h5>
                    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.75rem', color: '#065f46' }}>
                      {place.advantages.map((adv, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CheckCircle2 size={12} color="var(--emerald)" /> {adv}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations List */}
                  {place.limitations.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--rose-dark)', marginBottom: 4 }}>Limitations:</h5>
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.75rem', color: '#9f1239' }}>
                        {place.limitations.map((lim, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <AlertCircle size={12} color="var(--rose)" /> {lim}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Transparent Scoring Rationale Note */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
            ⚖️ Scoring factors are normalized according to your customized weighting sliders. Ratings and accessibility data are derived directly from verified city records.
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;
