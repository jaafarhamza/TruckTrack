import { useState, useEffect } from 'react';
import * as tripService from '../../services/tripService';
import './DriverTripHistoryModal.css';

const TRIP_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const DriverTripHistoryModal = ({ isOpen, onClose, driver }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (isOpen && driver?._id) {
      fetchTrips();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, driver?._id, statusFilter, currentPage]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
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

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tripService.getDriverTrips(driver._id, {
        status: statusFilter || undefined,
        page: currentPage,
        limit: 10,
      });
      if (response.success) {
        setTrips(response.data.trips);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load trip history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case TRIP_STATUS.PLANNED: return 'status-planned';
      case TRIP_STATUS.IN_PROGRESS: return 'status-in-progress';
      case TRIP_STATUS.COMPLETED: return 'status-completed';
      case TRIP_STATUS.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'D';
  };

  if (!isOpen) return null;

  const stats = {
    total: trips.length,
    completed: trips.filter(t => t.status === TRIP_STATUS.COMPLETED).length,
    totalDistance: trips.reduce((sum, t) => sum + (t.distanceTraveled || 0), 0),
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content driver-trip-history-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="history-header">
          <div className="driver-info-header">
            <div className="driver-avatar large">
              {getInitials(driver?.firstName, driver?.lastName)}
            </div>
            <div>
              <h2>{driver?.firstName} {driver?.lastName}</h2>
              <p className="driver-subtitle">Trip History</p>
            </div>
          </div>
          <div className="history-stats">
            <div className="history-stat">
              <span className="stat-value">{pagination?.totalItems || 0}</span>
              <span className="stat-label">Total Trips</span>
            </div>
            <div className="history-stat">
              <span className="stat-value">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="history-stat">
              <span className="stat-value">{stats.totalDistance.toLocaleString()}</span>
              <span className="stat-label">km Traveled</span>
            </div>
          </div>
        </div>

        <div className="history-toolbar">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter"
          >
            <option value="">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="history-loading">
              <div className="spinner"></div>
              <p>Loading trip history...</p>
            </div>
          ) : error ? (
            <div className="history-error">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{error}</p>
              <button className="btn btn-sm btn-primary" onClick={fetchTrips}>
                Retry
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="history-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3"/>
                <circle cx="18" cy="18" r="3"/>
                <path d="M6 9v4c0 1.1.9 2 2 2h4"/>
                <path d="M14 15l4 4"/>
              </svg>
              <p>No trips found {statusFilter && `with status "${statusFilter}"`}</p>
            </div>
          ) : (
            <div className="trip-history-list">
              {trips.map((trip) => (
                <div key={trip._id} className="trip-history-item">
                  <div className="trip-history-main">
                    <div className="trip-route-info">
                      <span className="trip-number">{trip.tripNumber}</span>
                      <div className="trip-route">
                        <span className="origin">{trip.origin?.city}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        <span className="destination">{trip.destination?.city}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusClass(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="trip-history-details">
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{formatDate(trip.departureDate)}</span>
                    </div>
                    <div className="detail-item">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" rx="2"/>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                      <span>{trip.truck?.plateNumber}</span>
                    </div>
                    {trip.distanceTraveled != null && (
                      <div className="detail-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{trip.distanceTraveled.toLocaleString()} km</span>
                      </div>
                    )}
                    {trip.cargo && (
                      <div className="detail-item cargo">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        <span>{trip.cargo}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="history-pagination">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTripHistoryModal;
