// LandingPage.jsx 

import React, { useState, useEffect } from 'react';
import './LandingPage.css';
import { fetchCourtServices } from '../api/api';

const LandingPage = ({ onOpenLogin, onOpenRegister, courtServices }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeService, setActiveService] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [courtServicesData, setCourtServicesData] = useState(courtServices || []);
  const [activeCourtInfoTab, setActiveCourtInfoTab] = useState('contacts'); // Changed default to contacts

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchCourtServices();
        setCourtServicesData(data);
      } catch (err) {
        console.error('Failed to load services', err);
      }
    };
    loadServices();
  }, []);

  const importantContacts = [
    { id: 1, department: "Chief Registrar", phone: "+251-XXX-XXX-XXX", email: "registrar@hararicourt.et" },
    { id: 2, department: "Public Prosecutor", phone: "+251-XXX-XXX-XXX", email: "prosecutor@hararicourt.et" },
    { id: 3, department: "Legal Aid Office", phone: "+251-XXX-XXX-XXX", email: "legalaid@hararicourt.et" },
    { id: 4, department: "Records Department", phone: "+251-XXX-XXX-XXX", email: "records@hararicourt.et" },
    { id: 5, department: "IT Support", phone: "+251-XXX-XXX-XXX", email: "support@hararicourt.et" },
  ];

  // Important announcements
  const announcements = [
    { id: 1, title: "New E-Filing System Launch", date: "2024-03-15", description: "Complete digital filing now available for all case types" },
    { id: 2, title: "Court Holiday Schedule", date: "2024-03-10", description: "Upcoming court closures and working hours" },
    { id: 3, title: "Privacy Policy Update", date: "2024-03-05", description: "Updated data protection and privacy regulations" },
    { id: 4, title: "Mobile App Beta Testing", date: "2024-02-28", description: "Join our mobile application beta testing program" },
  ];

  // Format time and date
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle service click
  const handleServiceClick = (service) => {
    setActiveService(service);
  };

  // Close modal
  const closeServiceModal = () => {
    setActiveService(null);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <div className="logo-icon">⚖️</div>
            <div className="logo-text">
              <h1>Harari Court</h1>
              <p>Digital Services Portal</p>
            </div>
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className={`nav-right ${showMobileMenu ? 'show' : ''}`}>
           
            
            <div className="nav-clock">
              <div className="clock-icon">🕐</div>
              <div className="clock-content">
                <div className="clock-time">{formatTime(currentTime)}</div>
                <div className="clock-date">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-image-container">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <div className="hero-tag">Trusted & Secure</div>
            <h1 className="hero-title">
              የሀረሪ ክልል ጠቅላይ ፍርድ ቤት
              <span className="hero-title-highlight">HARARI REGION SUPREME COURT </span>
            </h1>
            <p className="hero-description">
              "ቀልጣፋና ዉጤታማ ለሆነ የዳኝነት አገልግሎት እንተጋለን!" <br />
              " We strive for efficient and effective judicial services"
            </p>
            
            <div className="hero-actions">
              <button className="hero-action-btn primary-btn" onClick={onOpenRegister}>
                <span></span> Register
              </button>
              <button className="hero-action-btn secondary-btn" onClick={onOpenLogin}>
                <span></span> Login
              </button>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">⚖️</div>
                <div className="stat-value">15,000+</div>
                <div className="stat-label">Cases Processed</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-value">50,000+</div>
                <div className="stat-label">Registered Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📄</div>
                <div className="stat-value">98%</div>
                <div className="stat-label">Digital Transactions</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">60%</div>
                <div className="stat-label">Faster Processing</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Services Section */}
      <section className="services-section">
        <div className="services-container">
          <div className="services-header">
            <div className="services-tag">Digital Services</div>
            <h1 className="services-title">Services</h1>
            <p className="services-subtitle">
              Access our comprehensive suite of digital court services
            </p>
          </div>
          
          {/* Search and Filter */}
          
          
          {/* Services Grid */}
          <div className="services-grid">
            {courtServicesData.map(service => (
              <div key={service.id} className="service-card" onClick={() => handleServiceClick(service)}>
                <div className="service-icon">{service.icon}</div>
                <h3 className="service-title">{service.name}</h3>
                <p className="service-description">{service.description}</p>
                <div className="service-footer">
                  <button className="service-btn">
                    Learn More <span className="service-arrow"></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
     
          
        </div>
      </section>
      {/* Court Information Hub - NEW SECTION */}
      <section className="court-info-section">
        <div className="court-info-container">
          <div className="section-header">
            <div className="section-tag">Court Information Hub</div>
            <h2 className="section-title">Court Resources & Information</h2>
            <p className="section-subtitle">
              Essential information about court contacts and announcements
            </p>
          </div>
          
          <div className="court-info-tabs">
            <button 
              className={`tab-btn ${activeCourtInfoTab === 'contacts' ? 'active' : ''}`}
              onClick={() => setActiveCourtInfoTab('contacts')}
            >
              <span className="tab-icon">📞</span> Important Contacts
            </button>
            <button 
              className={`tab-btn ${activeCourtInfoTab === 'announcements' ? 'active' : ''}`}
              onClick={() => setActiveCourtInfoTab('announcements')}
            >
              <span className="tab-icon">📢</span> Announcements
            </button>
          </div>
          
          <div className="tab-content">
            {activeCourtInfoTab === 'contacts' && (
              <div className="contacts-table-container">
                <table className="contacts-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Phone Number</th>
                      <th>Email Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importantContacts.map(contact => (
                      <tr key={contact.id}>
                        <td>{contact.department}</td>
                        <td>{contact.phone}</td>
                        <td>{contact.email}</td>
                        <td>
                          <button className="contact-action-btn">
                            Contact Now
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {activeCourtInfoTab === 'announcements' && (
              <div className="announcements-list">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="announcement-card">
                    <div className="announcement-date">
                      {new Date(announcement.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="announcement-content">
                      <h3 className="announcement-title">{announcement.title}</h3>
                      <p className="announcement-description">{announcement.description}</p>
                    </div>
                    <div className="announcement-badge">New</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-header">
            <h2 className="about-title">About Harari Court</h2>
            <div className="about-tag">Our Mission & Vision</div>
          </div>
          
          <div className="about-content">
            <div className="about-text">
              <h3>የሀረሪ ፍርድ ቤት</h3>
              <p>
                The Harari Region Supreme Court is committed to delivering accessible, efficient, 
                and transparent judicial services through digital innovation. As a pioneer in 
                Ethiopia's digital court transformation, we serve the community with integrity 
                and excellence.
              </p>
              
              <div className="about-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <div className="feature-content">
                    <h4>Our Mission</h4>
                    <p>To provide efficient, accessible, and transparent judicial services through technology.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">📜</span>
                  <div className="feature-content">
                    <h4>Our Vision</h4>
                    <p>To be Ethiopia's leading digital court system, setting standards for judicial excellence.</p>
                  </div>
                </div>
                
                <div className="feature-item">
                  <span className="feature-icon">⚖️</span>
                  <div className="feature-content">
                    <h4>Our Values</h4>
                    <p>Integrity, Transparency, Accessibility, Innovation, and Justice.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="about-image">
              <div className="image-placeholder">🏛️</div>
              <div className="image-caption">Harari Supreme Court</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Access Court Services?</h2>
            <p>
              Join thousands who have streamlined their court proceedings with our digital platform.
            </p>
            <div className="cta-actions">
              <button className="cta-btn primary-cta" onClick={onOpenRegister}>
                Create Your Account
              </button>
              <button className="cta-btn secondary-cta" onClick={onOpenLogin}>
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-logo-section">
              <div className="footer-logo">
                <div className="logo-icon">⚖️</div>
                <div className="logo-text">
                  <h3>Harari Court</h3>
                  <p>Digital Services Portal</p>
                </div>
              </div>
              <p className="footer-mission">
                Providing accessible and efficient court services through digital innovation.
              </p>
            </div>
            
            <div className="footer-services">
              <h4>Core Services</h4>
              <div className="service-links">
                {courtServicesData.slice(0, 4).map(service => (
                  <a key={service.id} href="#">{service.name}</a>
                ))}
              </div>
            </div>
            
            <div className="footer-contact">
              <h4>Contact Court</h4>
              <div className="contact-info">
                <p><span className="contact-icon">📍</span> Harari High Court, Harar, Ethiopia</p>
                <p><span className="contact-icon">📞</span> +251-XXX-XXX-XXX</p>
                <p><span className="contact-icon">✉️</span> digitalcourt@harari.gov.et</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="copyright">
              © {new Date().getFullYear()} Harari Court Judicial System. All rights reserved.
            </div>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Accessibility</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Service Details Modal */}
      {activeService && (
        <div className="service-modal-overlay" onClick={closeServiceModal}>
          <div className="service-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeServiceModal}>✕</button>
            
            <div className="modal-header">
              <div className="modal-icon">{activeService.icon}</div>
              <div className="modal-title-section">
                <h2>{activeService.name}</h2>
                <p className="modal-description">{activeService.description}</p>
              </div>
            </div>
            
            <div className="modal-body">
              {activeService.requirements && (
                <div className="requirements-section">
                  <h4>Requirements:</h4>
                  <ul>
                    {activeService.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button className="modal-action-btn primary-action" onClick={() => {
                closeServiceModal();
                onOpenRegister();
              }}>
                Access Service
              </button>
              <button className="modal-action-btn secondary-action" onClick={closeServiceModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;