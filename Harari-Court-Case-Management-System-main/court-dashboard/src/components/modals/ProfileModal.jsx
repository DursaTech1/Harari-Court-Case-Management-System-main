import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../../api/api';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ full_name: '', phone: '' });
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setFetching(true);
    setError('');
    setSuccess('');
    getProfile()
      .then((data) => setFormData({ full_name: data.full_name || '', phone: data.phone || '' }))
      .catch(() => setError('Could not load profile.'))
      .finally(() => setFetching(false));
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateProfile(formData);
      // Sync localStorage
      const stored = JSON.parse(localStorage.getItem('harariCourtUser') || '{}');
      const merged = { ...stored, fullName: updated.full_name, phone: updated.phone };
      localStorage.setItem('harariCourtUser', JSON.stringify(merged));
      if (onUpdate) onUpdate(merged);
      setSuccess('Profile updated successfully!');
      setTimeout(onClose, 1200);
    } catch {
      setError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-left">
            <span className="profile-header-icon">👤</span>
            <div>
              <h2>Edit Profile</h2>
              <p>Update your account information</p>
            </div>
          </div>
          <button className="profile-close" onClick={onClose}>×</button>
        </div>

        {/* Body */}
        <div className="profile-body">
          {fetching ? (
            <div className="profile-loading">Loading profile…</div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              {error   && <div className="profile-alert error">{error}</div>}
              {success && <div className="profile-alert success">{success}</div>}

              <div className="profile-form-group">
                <label htmlFor="full_name">Full Name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="Your phone number"
                />
              </div>

              <div className="profile-form-group readonly-group">
                <label>Email Address</label>
                <div className="readonly-field">
                  {JSON.parse(localStorage.getItem('harariCourtUser') || '{}').email || '—'}
                  <span className="readonly-badge">Cannot change</span>
                </div>
              </div>

              <div className="profile-actions">
                <button type="button" className="profile-btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="profile-btn-save" disabled={loading}>
                  {loading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
