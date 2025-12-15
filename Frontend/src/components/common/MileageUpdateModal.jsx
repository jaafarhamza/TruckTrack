import { useState, useEffect } from 'react';
import './MileageUpdateModal.css';

const MileageUpdateModal = ({ isOpen, onClose, onSubmit, tire, loading }) => {
  const [newMileage, setNewMileage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && tire) {
      setNewMileage(tire.currentKm || '');
      setError('');
    }
  }, [isOpen, tire]);

  const calculateWearPreview = (km) => {
    const traveled = km - (tire?.installationKm || 0);
    return Math.min(Math.round((traveled / 80000) * 100), 100);
  };

  const getStatusPreview = (km) => {
    const traveled = km - (tire?.installationKm || 0);
    if (traveled <= 30000) return 'NEW';
    if (traveled <= 60000) return 'GOOD';
    if (traveled <= 80000) return 'WORN';
    return 'TO_REPLACE';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const mileage = parseInt(newMileage);
    
    if (!mileage || mileage < 0) {
      setError('Please enter a valid mileage');
      return;
    }

    if (mileage < tire.installationKm) {
      setError(`Mileage cannot be less than installation KM (${tire.installationKm})`);
      return;
    }

    if (mileage < tire.currentKm) {
      setError(`Mileage cannot be less than current KM (${tire.currentKm})`);
      return;
    }

    onSubmit(tire._id, mileage);
  };

  const handleEscape = (e) => {
    if (e.key === 'Escape' && !loading) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, loading]);

  if (!isOpen || !tire) return null;

  const currentWear = calculateWearPreview(tire.currentKm);
  const newWear = newMileage ? calculateWearPreview(parseInt(newMileage)) : currentWear;
  const newStatus = newMileage ? getStatusPreview(parseInt(newMileage)) : tire.status;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div className="modal-content mileage-update-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>Update Tire Mileage</h2>

        <div className="tire-info-summary">
          <div className="info-row">
            <span className="label">Tire:</span>
            <span className="value">{tire.reference}</span>
          </div>
          <div className="info-row">
            <span className="label">Vehicle:</span>
            <span className="value">{tire.vehicle?.plateNumber || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Current KM:</span>
            <span className="value">{tire.currentKm?.toLocaleString()} km</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mileage-form">
          <div className="form-group">
            <label htmlFor="newMileage">New Mileage (km) *</label>
            <input
              type="number"
              id="newMileage"
              value={newMileage}
              onChange={(e) => {
                setNewMileage(e.target.value);
                setError('');
              }}
              className={error ? 'error' : ''}
              disabled={loading}
              min={tire.currentKm}
              placeholder={`Minimum: ${tire.currentKm}`}
              autoFocus
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          {newMileage && parseInt(newMileage) !== tire.currentKm && (
            <div className="preview-section">
              <h3>Preview Changes</h3>
              
              <div className="preview-grid">
                <div className="preview-item">
                  <span className="preview-label">Wear</span>
                  <div className="preview-change">
                    <span className="old-value">{currentWear}%</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <span className="new-value">{newWear}%</span>
                  </div>
                </div>

                <div className="preview-item">
                  <span className="preview-label">Status</span>
                  <div className="preview-change">
                    <span className={`status-badge status-${tire.status?.toLowerCase().replace(/_/g, '-')}`}>
                      {tire.status?.replace(/_/g, ' ')}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                    <span className={`status-badge status-${newStatus?.toLowerCase().replace(/_/g, '-')}`}>
                      {newStatus?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-md btn-ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-md btn-primary"
              disabled={loading || !newMileage || parseInt(newMileage) === tire.currentKm}
            >
              {loading ? 'Updating...' : 'Update Mileage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MileageUpdateModal;
