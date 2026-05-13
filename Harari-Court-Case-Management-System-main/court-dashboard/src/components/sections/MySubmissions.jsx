import React, { useState, useEffect, useCallback } from 'react';
import { fetchMyRequests, deleteServiceRequest, updateServiceRequest } from '../../api/api';
import './MySubmissions.css';

const STATUS_COLORS = {
  submitted:    { bg: '#ebf8ff', text: '#2b6cb0' },
  under_review: { bg: '#fffbeb', text: '#b7791f' },
  approved:     { bg: '#f0fff4', text: '#276749' },
  rejected:     { bg: '#fff5f5', text: '#c53030' },
  completed:    { bg: '#f7fafc', text: '#4a5568' },
};

const SERVICE_ICON = {
  'Document Submission': '📄',
  'Arbitration Fee':     '💰',
  'Search Document':     '🔍',
  'Daily Appointment':   '📅',
  'Complaint Form':      '📝',
  'FeedBack':            '💬',
};

export default function MySubmissions({ onBack }) {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState('all');
  const [selected, setSelected]       = useState(null);   // detail view
  const [editNotes, setEditNotes]     = useState('');
  const [saving, setSaving]           = useState(false);
  const [deleteId, setDeleteId]       = useState(null);   // confirm dialog

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchMyRequests();
      setRequests(data);
    } catch {
      setError('Failed to load submissions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = filter === 'all'
    ? requests
    : requests.filter((r) => r.service_name === filter);

  const uniqueServices = [...new Set(requests.map((r) => r.service_name))];

  /* ── Delete ── */
  const handleDelete = async (id) => {
    try {
      await deleteServiceRequest(id);
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      alert('Delete failed. Please try again.');
    } finally {
      setDeleteId(null);
    }
  };

  /* ── Update notes ── */
  const handleSaveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('notes', editNotes);
      const updated = await updateServiceRequest(selected.id, fd);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelected(updated);
    } catch {
      alert('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openDetail = (req) => {
    setSelected(req);
    setEditNotes(req.notes || '');
  };

  /* ── Detail panel ── */
  if (selected) {
    const colors = STATUS_COLORS[selected.status] || STATUS_COLORS.submitted;
    return (
      <div className="submissions-container">
        <div className="submissions-header">
          <button className="back-btn" onClick={() => setSelected(null)}>← Back to list</button>
          <h2>{SERVICE_ICON[selected.service_name]} {selected.service_name}</h2>
          <span className="status-badge" style={{ background: colors.bg, color: colors.text }}>
            {selected.status.replace('_', ' ')}
          </span>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Submission Info</h3>
            <p><strong>ID:</strong> #{selected.id}</p>
            <p><strong>Submitted:</strong> {new Date(selected.created_at).toLocaleString()}</p>
            <p><strong>Last updated:</strong> {new Date(selected.updated_at).toLocaleString()}</p>
            <p><strong>Submitted by:</strong> {selected.user_name} ({selected.user_email})</p>
          </div>

          {/* Specialised detail */}
          {selected.document_submission && (
            <div className="detail-card">
              <h3>Document Details</h3>
              <p><strong>Case Number:</strong> {selected.document_submission.case_number || '—'}</p>
              <p><strong>Case Title:</strong> {selected.document_submission.case_title || '—'}</p>
              <p><strong>Type:</strong> {selected.document_submission.submission_type || '—'}</p>
              <p><strong>Description:</strong> {selected.document_submission.description || '—'}</p>
            </div>
          )}

          {selected.arbitration_fee && (
            <div className="detail-card">
              <h3>Fee Details</h3>
              <p><strong>Case Title:</strong> {selected.arbitration_fee.case_title}</p>
              <p><strong>Case Type:</strong> {selected.arbitration_fee.court_cause_type}</p>
              <p><strong>Claim Amount:</strong> ETB {Number(selected.arbitration_fee.claim_amount).toLocaleString()}</p>
              <p><strong>Court Fee:</strong> ETB {Number(selected.arbitration_fee.calculated_fee).toLocaleString()}</p>
              <p>
                <strong>Payment:</strong>{' '}
                <span style={{ color: selected.arbitration_fee.payment_status === 'paid' ? '#38a169' : '#d69e2e', fontWeight: 600 }}>
                  {selected.arbitration_fee.payment_status}
                </span>
              </p>
            </div>
          )}

          {selected.appointment && (
            <div className="detail-card">
              <h3>Appointment Details</h3>
              <p><strong>Date:</strong> {selected.appointment.appointment_date}</p>
              <p><strong>Time:</strong> {selected.appointment.appointment_time}</p>
              <p><strong>Purpose:</strong> {selected.appointment.purpose}</p>
              <p><strong>Department:</strong> {selected.appointment.department || '—'}</p>
              <p><strong>Notes:</strong> {selected.appointment.additional_notes || '—'}</p>
            </div>
          )}

          {selected.complaint && (
            <div className="detail-card">
              <h3>Complaint Details</h3>
              <p><strong>Subject:</strong> {selected.complaint.subject}</p>
              <p><strong>Type:</strong> {selected.complaint.complaint_type || '—'}</p>
              <p><strong>Against:</strong> {selected.complaint.against_whom || '—'}</p>
              <p><strong>Incident Date:</strong> {selected.complaint.incident_date || '—'}</p>
              <p><strong>Description:</strong> {selected.complaint.description}</p>
            </div>
          )}

          {selected.feedback && (
            <div className="detail-card">
              <h3>Feedback Details</h3>
              <p><strong>Service Rated:</strong> {selected.feedback.service_rated}</p>
              <p><strong>Rating:</strong> {'★'.repeat(selected.feedback.rating)}{'☆'.repeat(5 - selected.feedback.rating)}</p>
              <p><strong>Comment:</strong> {selected.feedback.comment || '—'}</p>
              <p><strong>Suggestions:</strong> {selected.feedback.suggestions || '—'}</p>
            </div>
          )}

          {/* Uploaded documents */}
          {selected.documents?.length > 0 && (
            <div className="detail-card full-width">
              <h3>Uploaded Documents</h3>
              <div className="doc-list">
                {selected.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.file_url || doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                  >
                    📎 {doc.document_type || 'Document'} — {new Date(doc.uploaded_at).toLocaleDateString()}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Editable notes */}
          <div className="detail-card full-width">
            <h3>Notes</h3>
            <textarea
              className="notes-textarea"
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add notes about this submission…"
              rows={3}
            />
            <button className="save-btn" onClick={handleSaveNotes} disabled={saving}>
              {saving ? 'Saving…' : 'Save Notes'}
            </button>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="delete-btn"
            onClick={() => setDeleteId(selected.id)}
          >
            🗑 Delete Submission
          </button>
        </div>

        {deleteId && (
          <ConfirmDialog
            message="Delete this submission? This cannot be undone."
            onConfirm={() => handleDelete(deleteId)}
            onCancel={() => setDeleteId(null)}
          />
        )}
      </div>
    );
  }

  /* ── List view ── */
  return (
    <div className="submissions-container">
      <div className="submissions-header">
        <div className="submissions-title-row">
          <h2>📋 My Submissions</h2>
          <button className="refresh-btn" onClick={load}>↻ Refresh</button>
        </div>
        <p className="submissions-subtitle">View, edit, and manage all your court service submissions</p>

        {/* Filter tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({requests.length})
          </button>
          {uniqueServices.map((s) => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {SERVICE_ICON[s]} {s}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="loading-state">Loading submissions…</div>}
      {error   && <div className="error-state">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No submissions found.</p>
          <small>Use a court service from the sidebar to create your first submission.</small>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="submissions-table-wrapper">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Service</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const colors = STATUS_COLORS[req.status] || STATUS_COLORS.submitted;
                return (
                  <tr key={req.id}>
                    <td className="id-cell">#{req.id}</td>
                    <td className="service-cell">
                      <span className="service-icon-sm">{SERVICE_ICON[req.service_name] || '⚖️'}</span>
                      {req.service_name}
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {req.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="date-cell">
                      {new Date(req.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </td>
                    <td className="actions-cell">
                      <button className="view-btn" onClick={() => openDetail(req)}>View</button>
                      <button className="delete-btn-sm" onClick={() => setDeleteId(req.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {deleteId && (
        <ConfirmDialog
          message="Delete this submission? This cannot be undone."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="confirm-yes" onClick={onConfirm}>Yes, Delete</button>
          <button className="confirm-no"  onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
