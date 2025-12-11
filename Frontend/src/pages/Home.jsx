import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import storage from '../utils/storage';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clear();
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="home">
      {/* Navigation */}
      <nav className="navbar glass-dark">
        <div className="navbar-container">
          <Link to="/" className="logo">
            <svg className="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span className="logo-text">TruckTrack</span>
          </Link>
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-btn nav-btn-ghost">Dashboard</Link>
                <button onClick={handleLogout} className="nav-btn nav-btn-primary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-btn nav-btn-ghost">Sign In</Link>
                <Link to="/register" className="nav-btn nav-btn-primary">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>Fleet Management Platform</span>
          </div>
          <h1 className="hero-title">
            Manage Your Fleet
            <span className="title-accent"> Smarter</span>
          </h1>
          <p className="hero-subtitle">
            Streamline operations, track vehicles in real-time, and optimize routes 
            with our powerful fleet management platform.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-accent btn-lg">
              <span>Start Free Trial</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-value">10K+</span>
              <span className="stat-label">Vehicles Tracked</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything You Need</h2>
            <p className="section-subtitle">Powerful tools to manage your entire fleet operations</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"/>
                </svg>
              </div>
              <h3>Real-Time Tracking</h3>
              <p>Monitor your fleet location in real-time with GPS precision tracking.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-orange">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Smart Scheduling</h3>
              <p>Optimize routes and schedules with intelligent algorithms.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10"/>
                  <line x1="12" y1="20" x2="12" y2="4"/>
                  <line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Get insights into fleet performance with detailed analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <svg className="logo-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <span>TruckTrack</span>
          </div>
          <p className="footer-text">© 2024 TruckTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
