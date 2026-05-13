import React, { useState } from 'react';
import './LoginModal.css';
import { loginUser } from '../../api/api';

const LoginModal = ({ onClose, onSubmit, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      // Store JWT tokens
      localStorage.setItem('token', data.access);
      localStorage.setItem('refresh', data.refresh);

      // Store full user object returned by the backend
      if (data.user) {
        const appUser = {
          fullName: data.user.full_name,
          email: data.user.email,
          phone: data.user.phone,
          userId: `HCU-${data.user.id}`,
        };
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('harariCourtUser', JSON.stringify(appUser));
      }

      // Notify App.jsx — it reads harariCourtUser from localStorage
      onSubmit();
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-modal-header">
          <div className="login-modal-logo">
            <div className="login-court-icon">⚖️</div>
            <div className="login-logo-text">
              <span>Harari Court</span>
              <span>Services Portal</span>
            </div>
          </div>
          <button className="login-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="login-modal-body">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Sign in to access court services</p>

          {error && <p className="login-error" style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your registered email"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <div className="password-options">
                <label className="remember-me">
                  <input type="checkbox" /> Remember me
                </label>
                <button type="button" className="forgot-password">
                  Forgot Password?
                </button>
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="alternative-login">
            <button className="alt-login-btn">
              <span className="alt-icon">📱</span>
              Sign in with OTP
            </button>
          </div>

          <p className="register-link">
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister}>
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
