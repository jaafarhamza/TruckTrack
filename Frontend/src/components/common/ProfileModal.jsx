import { useState, useEffect } from 'react';
import { getUserProfile } from '../../services/profileService';
import './ProfileModal.css';

const ProfileModal = ({ isOpen, onClose, initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserProfile();
      if (response.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      setError('Failed to load profile');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        ) : error ? (
          <div className="modal-error">
            <p>{error}</p>
            <button className="btn btn-sm btn-primary" onClick={fetchProfile}>
              Retry
            </button>
          </div>
        ) : user ? (
          <>
            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(user.firstName, user.lastName)}
              </div>
              <div className="profile-header-info">
                <h2>{user.firstName} {user.lastName}</h2>
                <p className="profile-username">@{user.username}</p>
                <span className={`role-badge ${user.role?.toLowerCase()}`}>
                  {user.role}
                </span>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{user.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {user.role === 'DRIVER' && user.license && (
                <div className="profile-section">
                  <h3>Driver Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">License Number</span>
                      <span className="info-value">{user.license}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="profile-section">
                <h3>Account Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Hire Date</span>
                    <span className="info-value">{formatDate(user.hireDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Status</span>
                    <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileModal;
