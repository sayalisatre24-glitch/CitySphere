import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  MapPin,
  Filter,
  Plus,
  Info,
  ShieldCheck,
  AlertOctagon,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import InteractiveMapComponent from '../components/InteractiveMapComponent';

const SafetyPage = () => {
  const { currentCity, reports, setReports } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [upvotingId, setUpvotingId] = useState(null);

  const filteredReports = reports.filter(r => {
    if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false;
    return true;
  });

  const handleUpvote = async (id) => {
    setUpvotingId(id);
    try {
      const res = await api.upvoteReport(id);
      if (res.success) {
        setReports(prev =>
          prev.map(r => (r.id === id ? { ...r, upvotes: res.upvotes } : r))
        );
      }
    } catch (err) {
      console.error('Error upvoting report:', err);
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--rose-light)', color: 'var(--rose-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <ShieldAlert size={14} /> Evidence-Based Civic & Road Safety
          </div>
          <h1 className="section-title">Safety & Security Insights — {currentCity}</h1>
          <p className="section-subtitle">
            Verified road hazards, waterlogging incidents, and municipal infrastructure alerts.
          </p>
        </div>

        <Link to="/report" className="btn btn-rose btn-sm">
          <Plus size={15} />
          <span>Report New Hazard</span>
        </Link>
      </div>

      {/* Responsible Safety Notice Banner */}
      <div
        style={{
          background: 'var(--sky-light)',
          border: '1px solid #bae6fd',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12
        }}
      >
        <Info size={20} color="var(--sky-dark)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.85rem', color: '#0369a1', lineHeight: 1.5 }}>
          <strong>Responsible Safety Disclaimer:</strong> CityLife AI displays verified community submissions and public municipal notices. An absence of reports does not indicate zero hazard, and individual reports do not reflect the safety of an entire district. Always follow local road signals and emergency municipal bulletins.
        </div>
      </div>

      {/* Safety Map with Hazard Overlay */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={18} color="var(--primary)" /> Civic Hazard Map ({filteredReports.length} incidents plotted)
        </h3>
        <InteractiveMapComponent mapHeight="420px" />
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.88rem' }}>
            <Filter size={16} color="var(--primary)" /> Filter Hazards:
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="All">All Categories</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Waterlogging">Waterlogging</option>
            <option value="Traffic Obstruction">Traffic Obstruction</option>
            <option value="Accessibility Issues">Accessibility Issues</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
          >
            <option value="All">All Statuses</option>
            <option value="Verified">Verified Only</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: 130 }}
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredReports.length > 0 ? (
          filteredReports.map(report => {
            const isHigh = report.severity === 'High';
            const isResolved = report.status === 'Resolved';
            const isVerified = report.status === 'Verified';

            return (
              <div
                key={report.id}
                className="card"
                style={{
                  borderLeft: `5px solid ${isResolved ? 'var(--emerald)' : (isHigh ? 'var(--rose)' : 'var(--amber)')}`,
                  padding: '20px 24px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className={`badge ${isResolved ? 'badge-emerald' : (isVerified ? 'badge-sky' : 'badge-amber')}`}>
                        {isResolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {report.status}
                      </span>
                      <span className={`badge ${isHigh ? 'badge-rose' : 'badge-amber'}`}>
                        {report.severity} Severity
                      </span>
                      <span className="badge badge-gray">{report.category}</span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{report.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 3 }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{report.neighbourhood}, {report.city || currentCity}</span>
                      <span>•</span>
                      <span>Reported {new Date(report.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Upvote & Verification Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      onClick={() => handleUpvote(report.id)}
                      disabled={upvotingId === report.id}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem' }}
                      title="Confirm / Upvote this hazard report"
                    >
                      <ThumbsUp size={13} color="var(--primary)" />
                      <span>{report.upvotes || 0} Upvotes</span>
                    </button>
                  </div>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 12 }}>
                  {report.description}
                </p>

                {/* AI Summary / Moderation Note */}
                {report.aiSummary && (
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <strong>🤖 AI Impact Summary:</strong> {report.aiSummary}
                  </div>
                )}

                {report.moderationNotes && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--emerald-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShieldCheck size={14} color="var(--emerald)" />
                    <span><strong>Moderator Action:</strong> {report.moderationNotes}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '48px 20px' }}>
            <CheckCircle2 size={42} color="var(--emerald)" style={{ margin: '0 auto 10px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No reports matching your criteria</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              All clear in this category, or try resetting the filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyPage;
