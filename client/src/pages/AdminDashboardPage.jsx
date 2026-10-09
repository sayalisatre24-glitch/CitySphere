import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
  Plus,
  BarChart3,
  TrendingUp,
  Filter,
  Eye,
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { DonutChart, BarChart } from '../components/ChartComponents';

const AdminDashboardPage = () => {
  const { currentCity, user, reports, setReports, refreshData } = useApp();

  const [analytics, setAnalytics] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);
  const [modNote, setModNote] = useState('');
  const [actionStatus, setActionStatus] = useState('Verified');
  const [submittingMod, setSubmittingMod] = useState(false);

  // New Place modal state
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [newPlaceData, setNewPlaceData] = useState({
    name: '',
    city: currentCity,
    neighbourhood: '',
    category: 'Tourist Attraction',
    description: '',
    address: '',
    lat: '18.5204',
    lng: '73.8567',
    cost: 'Free'
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [currentCity]);

  const loadAnalyticsData = async () => {
    try {
      const res = await api.getAnalytics(currentCity);
      if (res.success) {
        setAnalytics(res);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

  const handleModerationSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportForAction) return;

    setSubmittingMod(true);
    try {
      const res = await api.updateReportStatus(selectedReportForAction.id, {
        status: actionStatus,
        moderationNotes: modNote.trim() || `Status updated to ${actionStatus} by ${user.name}.`,
        moderatorName: user.name
      });

      if (res.success) {
        setReports(prev =>
          prev.map(r => (r.id === selectedReportForAction.id ? res.data : r))
        );
        setSelectedReportForAction(null);
        setModNote('');
        loadAnalyticsData();
      }
    } catch (err) {
      console.error('Moderation action failed:', err);
      alert('Failed to update report status.');
    } finally {
      setSubmittingMod(false);
    }
  };

  const handleAddPlaceSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.addPlace(newPlaceData);
      if (res.success) {
        alert('Place added successfully!');
        setShowAddPlaceModal(false);
        refreshData();
      }
    } catch (err) {
      console.error('Failed to add place:', err);
    }
  };

  const filteredReports = reports.filter(r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    return true;
  });

  // Doughnut Chart Data for Report Statuses
  const doughnutData = {
    labels: ['Verified Hazards', 'Resolved', 'Under Review', 'Pending'],
    datasets: [
      {
        data: [
          reports.filter(r => r.status === 'Verified').length,
          reports.filter(r => r.status === 'Resolved').length,
          reports.filter(r => r.status === 'Under Review').length,
          reports.filter(r => r.status === 'Pending').length
        ],
        backgroundColor: ['#dc2626', '#10b981', '#f59e0b', '#3b82f6'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--amber-light)', color: 'var(--amber-dark)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, marginBottom: 8 }}>
            <ShieldCheck size={14} /> Municipal & Admin Moderation Center
          </div>
          <h1 className="section-title">Admin Dashboard & Report Moderation</h1>
          <p className="section-subtitle">
            Review community incident submissions, update hazard verification lifecycles, and manage curated city places.
          </p>
        </div>

        <button
          onClick={() => setShowAddPlaceModal(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={14} /> <span>Add Curated Place</span>
        </button>
      </div>

      {/* Overview Metric Stats Bar */}
      <div className="grid-4">
        <div className="card" style={{ padding: '18px 20px', background: 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL REPORTS</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {reports.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Civic submissions</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--rose-dark)' }}>PENDING REVIEW</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--rose)', marginTop: 4 }}>
            {reports.filter(r => r.status === 'Pending').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Awaiting officer triage</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-dark)' }}>VERIFIED ACTIVE HAZARDS</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--amber-dark)', marginTop: 4 }}>
            {reports.filter(r => r.status === 'Verified').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Displayed on Live Radar</div>
        </div>

        <div className="card" style={{ padding: '18px 20px', background: 'white' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-dark)' }}>RESOLVED ISSUES</div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--emerald)', marginTop: 4 }}>
            {reports.filter(r => r.status === 'Resolved').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>Successfully repaired</div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Report Status Breakdown</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <DonutChart
              labels={['Verified Hazards', 'Resolved Issues', 'Under Review', 'Pending Moderation']}
              data={[
                reports.filter(r => r.status === 'Verified').length,
                reports.filter(r => r.status === 'Resolved').length,
                reports.filter(r => r.status === 'Under Review').length,
                reports.filter(r => r.status === 'Pending').length
              ]}
              colors={['#dc2626', '#10b981', '#f59e0b', '#3b82f6']}
            />
          </div>
        </div>

        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>Responsible Moderation Policy</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              CityLife AI adheres to strict civic moderation principles:
            </p>
            <ul style={{ paddingLeft: 18, fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.6 }}>
              <li>Never label entire neighborhoods unsafe based on isolated reports.</li>
              <li>Verify road hazards with field reports, traffic cameras, or municipal data before publishing.</li>
              <li>Provide transparent audit trails and timestamps for all verified actions.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Logged in as: <strong>{user.name}</strong> ({user.role})
          </div>
        </div>
      </div>

      {/* Report Moderation Table */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Civic Incident Moderation Queue</h3>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: 160, fontSize: '0.85rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Only</option>
            <option value="Under Review">Under Review Only</option>
            <option value="Verified">Verified Only</option>
            <option value="Resolved">Resolved Only</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 14px' }}>ID & Title</th>
                <th style={{ padding: '10px 14px' }}>Category</th>
                <th style={{ padding: '10px 14px' }}>Severity</th>
                <th style={{ padding: '10px 14px' }}>Current Status</th>
                <th style={{ padding: '10px 14px' }}>Submitted</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{report.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{report.neighbourhood}, {report.city}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className="badge badge-gray">{report.category}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${report.severity === 'High' ? 'badge-rose' : 'badge-amber'}`}>
                      {report.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span className={`badge ${report.status === 'Verified' ? 'badge-sky' : (report.status === 'Resolved' ? 'badge-emerald' : 'badge-amber')}`}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {new Date(report.submittedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedReportForAction(report);
                        setActionStatus(report.status === 'Pending' ? 'Verified' : report.status);
                        setModNote(report.moderationNotes || '');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                    >
                      Moderate &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Action Modal */}
      {selectedReportForAction && (
        <div className="modal-overlay" onClick={() => setSelectedReportForAction(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 8 }}>
              Moderate Report #{selectedReportForAction.id}
            </h3>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
              {selectedReportForAction.title}
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
              {selectedReportForAction.description}
            </p>

            {selectedReportForAction.aiSummary && (
              <div style={{ background: 'var(--bg-subtle)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', marginBottom: 16 }}>
                <strong>🤖 AI Analysis:</strong> {selectedReportForAction.aiSummary}
              </div>
            )}

            <form onSubmit={handleModerationSubmit}>
              <div className="form-group">
                <label className="form-label">Update Status</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="form-select"
                >
                  <option value="Verified">Verified (Confirmed Civic Hazard)</option>
                  <option value="Under Review">Under Review (Checking with field unit)</option>
                  <option value="Resolved">Resolved (Repair completed)</option>
                  <option value="Rejected">Rejected (Inaccurate / duplicate)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Moderation Officer Notes</label>
                <textarea
                  value={modNote}
                  onChange={(e) => setModNote(e.target.value)}
                  placeholder="e.g. Verified by zone traffic officer; crew scheduled."
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setSelectedReportForAction(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMod}
                  className="btn btn-emerald btn-sm"
                >
                  {submittingMod ? 'Saving...' : 'Apply Moderation Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Curated Place Modal */}
      {showAddPlaceModal && (
        <div className="modal-overlay" onClick={() => setShowAddPlaceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 14 }}>
              Add New Curated Destination to {currentCity}
            </h3>

            <form onSubmit={handleAddPlaceSubmit}>
              <div className="form-group">
                <label className="form-label">Place Name *</label>
                <input
                  type="text"
                  value={newPlaceData.name}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, name: e.target.value })}
                  placeholder="e.g. Pataleshwar Cave Temple"
                  className="form-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={newPlaceData.category}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, category: e.target.value })}
                    className="form-select"
                  >
                    <option value="Historical">Historical</option>
                    <option value="Tourist Attraction">Tourist Attraction</option>
                    <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                    <option value="Museum">Museum</option>
                    <option value="Park & Recreation">Park & Recreation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Neighbourhood</label>
                  <input
                    type="text"
                    value={newPlaceData.neighbourhood}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, neighbourhood: e.target.value })}
                    placeholder="e.g. Shivajinagar"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newPlaceData.description}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, description: e.target.value })}
                  rows={3}
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    type="text"
                    value={newPlaceData.lat}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, lat: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    type="text"
                    value={newPlaceData.lng}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, lng: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
