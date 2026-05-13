import React, { useState, useEffect } from 'react';
import './CaseAnalytics.css';
import { fetchMyRequests, fetchAppointments } from '../../api/api';

const STATUS_COLOR = {
  submitted:    '#3182ce',
  under_review: '#d69e2e',
  approved:     '#38a169',
  rejected:     '#e53e3e',
  completed:    '#718096',
};

const SERVICE_ICON = {
  'Document Submission': '📄',
  'Arbitration Fee':     '💰',
  'Search Document':     '🔍',
  'Daily Appointment':   '📅',
  'Complaint Form':      '📝',
  'FeedBack':            '💬',
};

export default function CaseAnalytics({ quickStats, userData }) {
  const [requests, setRequests]         = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.all([fetchMyRequests(), fetchAppointments()])
      .then(([reqs, apts]) => { setRequests(reqs); setAppointments(apts); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Derived stats ── */
  const statusCounts = requests.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const serviceCounts = requests.reduce((acc, r) => {
    acc[r.service_name] = (acc[r.service_name] || 0) + 1;
    return acc;
  }, {});

  const caseStats = [
    { name: 'Active Cases',       count: quickStats.activeCases,       color: '#4299e1', icon: '📋' },
    { name: 'Pending Payments',   count: quickStats.pendingPayments,   color: '#ed8936', icon: '💰' },
    { name: 'Upcoming Hearings',  count: quickStats.upcomingHearings,  color: '#9f7aea', icon: '📅' },
    { name: 'Completed Services', count: quickStats.completedServices, color: '#48bb78', icon: '✅' },
  ];

  const upcomingApts = appointments
    .filter((a) => a.status !== 'completed' && a.status !== 'rejected')
    .slice(0, 5);

  return (
    <div className="simple-analytics">
      {/* Header */}
      <div className="analytics-header">
        <h1>Case Overview</h1>
        <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>
          {userData?.fullName} — {requests.length} total submission{requests.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#718096', padding: '40px', textAlign: 'center' }}>Loading analytics…</p>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="stats-grid">
            {caseStats.map((stat) => (
              <div key={stat.name} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: stat.color + '20' }}>{stat.icon}</div>
                <div className="stat-info">
                  <h3>{stat.count}</h3>
                  <p>{stat.name}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="main-content">
            {/* Left — Service breakdown */}
            <div className="content-left">
              <div className="card">
                <h2>Submissions by Service</h2>
                {Object.keys(serviceCounts).length === 0 ? (
                  <p style={{ color: '#718096', fontSize: '14px' }}>No submissions yet.</p>
                ) : (
                  <div className="case-types">
                    {Object.entries(serviceCounts).map(([name, count]) => (
                      <div key={name} className="case-type-item">
                        <div className="type-info">
                          <span className="type-dot" style={{ backgroundColor: '#4299e1' }} />
                          <span className="type-name">{SERVICE_ICON[name]} {name}</span>
                        </div>
                        <div className="type-count">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card" style={{ marginTop: '16px' }}>
                <h2>Status Breakdown</h2>
                {Object.keys(statusCounts).length === 0 ? (
                  <p style={{ color: '#718096', fontSize: '14px' }}>No data.</p>
                ) : (
                  <div className="case-types">
                    {Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="case-type-item">
                        <div className="type-info">
                          <span className="type-dot" style={{ backgroundColor: STATUS_COLOR[status] || '#718096' }} />
                          <span className="type-name" style={{ textTransform: 'capitalize' }}>
                            {status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="type-count">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Upcoming appointments */}
            <div className="content-right">
              <div className="card">
                <h2>Upcoming Appointments</h2>
                {upcomingApts.length === 0 ? (
                  <p style={{ color: '#718096', fontSize: '14px' }}>No upcoming appointments.</p>
                ) : (
                  <div className="hearings-list">
                    {upcomingApts.map((apt) => (
                      <div key={apt.id} className="hearing-item">
                        <div className="hearing-date">
                          <strong>{apt.appointment_date}</strong>
                          <span>{apt.appointment_time}</span>
                        </div>
                        <div className="hearing-details">
                          <p>{apt.purpose}</p>
                          {apt.department && <span className="courtroom">{apt.department}</span>}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: STATUS_COLOR[apt.status] || '#718096',
                            textTransform: 'capitalize',
                          }}
                        >
                          {apt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent submissions */}
              <div className="card" style={{ marginTop: '16px' }}>
                <h2>Recent Submissions</h2>
                {requests.slice(0, 5).length === 0 ? (
                  <p style={{ color: '#718096', fontSize: '14px' }}>No submissions yet.</p>
                ) : (
                  <div className="hearings-list">
                    {requests.slice(0, 5).map((req) => (
                      <div key={req.id} className="hearing-item">
                        <div className="hearing-date">
                          <strong>{SERVICE_ICON[req.service_name]}</strong>
                        </div>
                        <div className="hearing-details">
                          <p>{req.service_name}</p>
                          <span className="courtroom">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: STATUS_COLOR[req.status] || '#718096',
                            textTransform: 'capitalize',
                          }}
                        >
                          {req.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-card">
            <div className="summary-item">
              <h3>Total Submissions</h3>
              <p>{requests.length}</p>
            </div>
            <div className="summary-item">
              <h3>Completed</h3>
              <p>{statusCounts.completed || 0}</p>
            </div>
            <div className="summary-item">
              <h3>Under Review</h3>
              <p>{statusCounts.under_review || 0}</p>
            </div>
            <div className="summary-item">
              <h3>Appointments</h3>
              <p>{appointments.length}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
