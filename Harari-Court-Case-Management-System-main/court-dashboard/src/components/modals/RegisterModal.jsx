import React, { useState } from 'react';
import './RegisterModal.css';
import { registerUser, loginUser } from '../../api/api';

const RegisterModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      // 1. Register the user
      await registerUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // 2. Auto-login to get JWT tokens
      const loginData = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('token', loginData.access);
      localStorage.setItem('refresh', loginData.refresh);

      const appUser = {
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        userId: loginData.user ? `HCU-${loginData.user.id}` : 'HCU-NEW',
      };

      if (loginData.user) {
        localStorage.setItem('user', JSON.stringify(loginData.user));
      }
      localStorage.setItem('harariCourtUser', JSON.stringify(appUser));

      // 3. Notify App.jsx
      onSubmit(appUser);
      onClose();
    } catch (err) {
      setError('Registration failed. The email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-modal-overlay">
      <div className="register-modal">
        <div className="register-modal-header">
          <h2>Register for Court Services</h2>
          <button className="register-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="register-modal-body">
          {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                placeholder="Enter your full name as per ID"
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                minLength="6"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </div>
            <p className="terms-agreement">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
