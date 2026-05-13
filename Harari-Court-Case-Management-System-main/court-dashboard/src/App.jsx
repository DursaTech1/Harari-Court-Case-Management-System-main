import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import RegisterModal from './components/modals/RegisterModal';
import LoginModal from './components/modals/LoginModal';
import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen]   = useState(false);
  const [userData, setUserData]         = useState(null);

  /* Restore session on mount */
  useEffect(() => {
    const saved = localStorage.getItem('harariCourtUser');
    const token = localStorage.getItem('token');
    if (saved && token) {
      setUserData(JSON.parse(saved));
      setIsLoggedIn(true);
    }
  }, []);

  /* Called by RegisterModal — user object already saved to localStorage */
  const handleRegisterSubmit = (user) => {
    const appUser = {
      fullName: user.fullName || user.full_name,
      email:    user.email,
      phone:    user.phone,
      userId:   user.userId || 'HCU-NEW',
    };
    setUserData(appUser);
    localStorage.setItem('harariCourtUser', JSON.stringify(appUser));
    setIsLoggedIn(true);
    setIsRegisterOpen(false);
  };

  /* Called by LoginModal — harariCourtUser already saved to localStorage */
  const handleLoginSubmit = () => {
    const saved = localStorage.getItem('harariCourtUser');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
    setIsLoggedIn(true);
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    setIsLoggedIn(false);
    setUserData(null);
    ['harariCourtUser', 'token', 'refresh', 'user'].forEach((k) =>
      localStorage.removeItem(k)
    );
  };

  /* Called by ProfileModal after a successful update */
  const handleProfileUpdate = (updated) => {
    setUserData(updated);
  };

  return (
    <div className="app">
      {isLoggedIn ? (
        <Dashboard
          userData={userData}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
        />
      ) : (
        <LandingPage
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenRegister={() => setIsRegisterOpen(true)}
        />
      )}

      {isRegisterOpen && (
        <RegisterModal
          onClose={() => setIsRegisterOpen(false)}
          onSubmit={handleRegisterSubmit}
        />
      )}

      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onSubmit={handleLoginSubmit}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      )}
    </div>
  );
}
