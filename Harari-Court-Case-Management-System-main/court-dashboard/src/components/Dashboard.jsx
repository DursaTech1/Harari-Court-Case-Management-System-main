import React, { useState, useEffect, useCallback } from 'react';
import ServicesSidebar from './sections/ServicesSidebar';
import ServiceDetails from './sections/ServiceDetails';
import CaseAnalytics from './sections/CaseAnalytics';
import MySubmissions from './sections/MySubmissions';
import ProfileModal from './modals/ProfileModal';
import './Dashboard.css';
import { fetchDashboardData } from '../api/api';

const SERVICE_ICON = {
  'Document Submission': '📄',
  'Arbitration Fee':     '💰',
  'Search Document':     '🔍',
  'Daily Appointment':   '📅',
  'Complaint Form':      '📝',
  'FeedBack':            '💬',
};

const STATUS_COLOR = {
  submitted:    '#3182ce',
  under_review: '#d69e2e',
  approved:     '#38a169',
  rejected:     '#e53e3e',
  completed:    '#718096',
};

const ALL_SERVICES = [
  { id: 1, name: 'Document Submission', icon: '📄', description: 'Submit legal documents electronically',      tags: ['Digital', 'Official'],  duration: '15-30 mins' },
  { id: 2, name: 'Arbitration Fee',     icon: '💰', description: 'Pay arbitration and court fees online',      tags: ['Payment', 'Required'],  duration: '10-15 mins' },
  { id: 3, name: 'Search Document',     icon: '🔍', description: 'Search and retrieve court documents',        tags: ['Search', 'Records'],    duration: '5-20 mins'  },
  { id: 4, name: 'Daily Appointment',   icon: '📅', description: 'Schedule appointments with court officials', tags: ['Booking', 'Schedule'],  duration: '10-20 mins' },
  { id: 5, name: 'Complaint Form',      icon: '📝', description: 'File official complaints or grievances',     tags: ['Form', 'Legal'],        duration: '20-40 mins' },
  { id: 6, name: 'FeedBack',            icon: '💬', description: 'Provide feedback on court services',         tags: ['Feedback', 'Review'],   duration: '5-15 mins'  },
];

export default function Dashboard({ userData: initialUserData, onLogout }) {
  const [userData, setUserData]         = useState(initialUserData);
  const [selectedService, setSelectedService] = useState(null);
  const [currentTime, setCurrentTime]   = useState(new Date());
  const [viewMode, setViewMode]         = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [profileOpen, setProfileOpen]   = useState(false);

  /* clock */
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  /* dashboard stats */
  const loadDashboard = useCallback(async () => {
    try { setDashboardData(await fetchDashboardData()); } catch { /* silent */ }
  }, []);
  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const quickStats = {
    activeCases:       dashboardData?.active_cases       ?? 0,
    pendingPayments:   dashboardData?.pending_payments   ?? 0,
    upcomingHearings:  dashboardData?.upcoming_hearings  ?? 0,
    unreadMessages:    dashboardData?.unread_messages    ?? 0,
    completedServices: dashboardData?.completed_services ?? 0,
    totalSubmissions:  dashboardData?.total_submissions  ?? 0,
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setViewMode('dashboard');
  };

  const handleProfileUpdate = (updated) => {
    setUserData(updated);
  };

  const navTo = (mode) => {
    setViewMode(mode);
    setSelectedService(null);
  };

  return (
    <div className="dashboard-app">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="icon">⚖️</span>
            <div>
              <h2>Harari Court</h2>
              <span>Services Portal</span>
            </div>
          </div>
          <div className="time-box">
            <span>{currentTime.toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}</span>
            <strong>{currentTime.toLocaleTimeString()}</strong>
          </div>
        </div>

        <div className="header-right">
          {/* User avatar — click to open profile */}
          <button className="user-info user-info-btn" onClick={() => setProfileOpen(true)} title="Edit profile">
            <div className="user-avatar">{userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div className="user-details">
              <strong>{userData?.fullName}</strong>
              <span>ID: {userData?.userId}</span>
              <small>{userData?.userType || 'Citizen'}</small>
            </div>
            <span className="edit-profile-hint">✏️</span>
          </button>

          <div className="header-actions">
            <button className="header-btn notification-btn" title="Notifications">
              🔔
              {quickStats.unreadMessages > 0 && (
                <span className="notification-badge">{quickStats.unreadMessages}</span>
              )}
            </button>

            <button
              className={`header-btn ${viewMode === 'submissions' ? 'active-btn' : ''}`}
              onClick={() => navTo('submissions')}
            >
              📋 My Submissions
            </button>

            <button
              className={`header-btn ${viewMode === 'analytics' ? 'active-btn' : ''}`}
              onClick={() => navTo('analytics')}
            >
              📊 Analytics
            </button>

            <button className="logout-btn" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────── */}
      <main className="dashboard-main">
        <ServicesSidebar
          selectedService={selectedService}
          onServiceSelect={handleServiceSelect}
        />

        <section className="dashboard-content">
          {viewMode === 'analytics' ? (
            <CaseAnalytics quickStats={quickStats} userData={userData} />
          ) : viewMode === 'submissions' ? (
            <MySubmissions onBack={() => navTo('dashboard')} />
          ) : selectedService ? (
            <ServiceDetails
              service={selectedService}
              onBack={() => setSelectedService(null)}
              onSubmitted={loadDashboard}
            />
          ) : (
            <WelcomeSection
              userData={userData}
              allServices={ALL_SERVICES}
              onServiceSelect={handleServiceSelect}
              quickStats={quickStats}
              recentActivity={dashboardData?.recent_activity || []}
            />
          )}
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Harari Region Supreme Court — User: {userData?.userId}</p>
          <div className="footer-links">
            <a href="#help">Help Center</a>
            <a href="#terms">Terms of Service</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#contact">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* ── Profile Modal ───────────────────────────────────────── */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

/* ── Welcome Section ─────────────────────────────────────────────────────── */
function WelcomeSection({ userData, allServices, onServiceSelect, quickStats, recentActivity }) {
  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Welcome back, {userData?.fullName}!</h1>
        <p className="subtitle">Access court services, track cases, and manage your legal matters</p>
      </div>

      {/* Quick Stats */}
      <div className="stats-overview">
        {[
          { icon: '📋', value: quickStats.activeCases,       label: 'Active Cases',        accent: '#4299e1' },
          { icon: '💰', value: quickStats.pendingPayments,   label: 'Pending Payments',    accent: '#ed8936' },
          { icon: '📅', value: quickStats.upcomingHearings,  label: 'Upcoming Hearings',   accent: '#9f7aea' },
          { icon: '✅', value: quickStats.completedServices, label: 'Completed Services',  accent: '#48bb78' },
        ].map(({ icon, value, label, accent }) => (
          <div key={label} className="stat-card" style={{ borderLeftColor: accent }}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-info">
              <h3>{value}</h3>
              <p>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Services Grid */}
      <div className="services-section">
        <h2>Available Services</h2>
        <p className="section-description">Select a service to begin</p>
        <div className="services-grid">
          {allServices.map((service) => (
            <div key={service.id} className="service-card" onClick={() => onServiceSelect(service)}>
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.description}</p>
              <div className="service-tags">
                {service.tags?.map((tag) => <span key={tag} className="tag">{tag}</span>)}
              </div>
              <div className="service-footer">
                <span className="service-duration">⏱️ {service.duration}</span>
                <button className="service-select-btn">Select →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <div className="recent-activity-header">
          <h2>Recent Activity</h2>
          {recentActivity.length > 0 && (
            <span className="activity-count">{recentActivity.length} recent</span>
          )}
        </div>

        {recentActivity.length === 0 ? (
          <div className="activity-empty">
            <span>📭</span>
            <p>No submissions yet. Use a service above to get started.</p>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon-wrap">
                  {SERVICE_ICON[item.service_name] || '⚖️'}
                </div>
                <div className="activity-details">
                  <p><strong>{item.service_name}</strong></p>
                  <small>{item.created_at}</small>
                </div>
                <span
                  className="activity-status-badge"
                  style={{
                    background: (STATUS_COLOR[item.status] || '#718096') + '18',
                    color: STATUS_COLOR[item.status] || '#718096',
                  }}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
