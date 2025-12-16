import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as tripService from '../services/tripService';
import Sidebar from '../components/common/Sidebar';
import ProfileModal from '../components/common/ProfileModal';
import './DriverDashboard.css';

const TRIP_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const DriverDashboard = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, planned: 0, inProgress: 0, completed: 0, totalDistance: 0 });
  
  // Trip status update modals
  const [startModal, setStartModal] = useState({ isOpen: false, trip: null, startKm: '' });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, trip: null, endKm: '', remarks: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tripService.getMyTrips({
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setTrips(response.data.trips);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await tripService.getMyTripStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchStats();
  }, [fetchTrips, fetchStats]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleStartTrip = async () => {
    if (!startModal.startKm) {
      showToast('Please enter start km', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const response = await tripService.startMyTrip(startModal.trip._id, parseInt(startModal.startKm));
      if (response.success) {
        setTrips(trips.map(t => t._id === startModal.trip._id ? response.data.trip : t));
        fetchStats();
        showToast('Trip started successfully!');
        setStartModal({ isOpen: false, trip: null, startKm: '' });
        setSelectedTrip(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to start trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTrip = async () => {
    if (!completeModal.endKm) {
      showToast('Please enter end km', 'error');
      return;
    }
    if (parseInt(completeModal.endKm) <= completeModal.trip.startKm) {
      showToast('End km must be greater than start km', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const response = await tripService.completeMyTrip(
        completeModal.trip._id, 
        parseInt(completeModal.endKm),
        completeModal.remarks
      );
      if (response.success) {
        setTrips(trips.map(t => t._id === completeModal.trip._id ? response.data.trip : t));
        fetchStats();
        showToast('Trip completed successfully!');
        setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' });
        setSelectedTrip(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete trip', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getCurrentTrip = () => {
    return trips.find(t => t.status === TRIP_STATUS.IN_PROGRESS);
  };

  const getUpcomingTrips = () => {
    return trips.filter(t => t.status === TRIP_STATUS.PLANNED);
  };

  const currentTrip = getCurrentTrip();
  const upcomingTrips = getUpcomingTrips();

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Driver Dashboard</h1>
            <p>View your assigned trips and schedule</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item stat-planned">
                <span className="stat-value">{stats.planned}</span>
                <span className="stat-label">Upcoming</span>
              </div>
              <div className="stat-item stat-in-progress">
                <span className="stat-value">{stats.inProgress}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item stat-completed">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.totalDistance?.toLocaleString()}</span>
                <span className="stat-label">km Driven</span>
              </div>
            </div>
            <div className="user-menu" onClick={() => setIsProfileModalOpen(true)}>
              <div className="user-avatar">
                {getInitials(currentUser?.firstName, currentUser?.lastName)}
              </div>
              <div className="user-info">
                <div className="user-name">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="user-role">Driver</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          {/* Current Trip Card */}
          {currentTrip && (
            <div className="current-trip-section">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                Active Trip
              </h2>
              <div className="current-trip-card" onClick={() => setSelectedTrip(currentTrip)}>
                <div className="trip-header">
                  <span className="trip-number">{currentTrip.tripNumber}</span>
                  <span className={`status-badge ${getStatusClass(currentTrip.status)}`}>
                    IN PROGRESS
                  </span>
                </div>
                <div className="trip-route-large">
                  <div className="route-point">
                    <div className="route-marker origin"></div>
                    <div className="route-info">
                      <span className="city">{currentTrip.origin?.city}</span>
                      <span className="country">{currentTrip.origin?.country}</span>
                    </div>
                  </div>
                  <div className="route-line-vertical"></div>
                  <div className="route-point">
                    <div className="route-marker destination"></div>
                    <div className="route-info">
                      <span className="city">{currentTrip.destination?.city}</span>
                      <span className="country">{currentTrip.destination?.country}</span>
                    </div>
                  </div>
                </div>
                <div className="trip-details-row">
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" rx="2"/>
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    <span>{currentTrip.truck?.plateNumber}</span>
                  </div>
                  {currentTrip.cargo && (
                    <div className="detail-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                      </svg>
                      <span>{currentTrip.cargo}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>Start: {currentTrip.startKm?.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Trips */}
          {upcomingTrips.length > 0 && (
            <div className="upcoming-trips-section">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Upcoming Trips ({upcomingTrips.length})
              </h2>
              <div className="upcoming-trips-list">
                {upcomingTrips.slice(0, 3).map(trip => (
                  <div key={trip._id} className="upcoming-trip-card" onClick={() => setSelectedTrip(trip)}>
                    <div className="trip-date">
                      <span className="day">{new Date(trip.departureDate).getDate()}</span>
                      <span className="month">{new Date(trip.departureDate).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="trip-info">
                      <span className="trip-number">{trip.tripNumber}</span>
                      <div className="trip-route-inline">
                        {trip.origin?.city} → {trip.destination?.city}
                      </div>
                    </div>
                    <div className="trip-vehicle">
                      {trip.truck?.plateNumber}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Trips Section */}
          <div className="all-trips-section">
            <div className="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="6" r="3"/>
                  <circle cx="18" cy="18" r="3"/>
                  <path d="M6 9v4c0 1.1.9 2 2 2h4"/>
                  <path d="M14 15l4 4"/>
                </svg>
                All Trips
              </h2>
              <div className="section-toolbar">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="status-filter"
                >
                  <option value="">All Status</option>
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <button className="btn btn-sm btn-ghost" onClick={() => { fetchTrips(); fetchStats(); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="trips-loading">
                <div className="spinner"></div>
                <p>Loading trips...</p>
              </div>
            ) : error ? (
              <div className="trips-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{error}</p>
                <button className="btn btn-sm btn-primary" onClick={fetchTrips}>Try Again</button>
              </div>
            ) : trips.length === 0 ? (
              <div className="trips-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="6" cy="6" r="3"/>
                  <circle cx="18" cy="18" r="3"/>
                  <path d="M6 9v4c0 1.1.9 2 2 2h4"/>
                  <path d="M14 15l4 4"/>
                </svg>
                <h3>No Trips Found</h3>
                <p>{statusFilter ? 'Try adjusting your filter' : 'You have no assigned trips yet'}</p>
              </div>
            ) : (
              <div className="trips-list">
                {trips.map(trip => (
                  <div key={trip._id} className="trip-list-card" onClick={() => setSelectedTrip(trip)}>
                    <div className="trip-main">
                      <div className="trip-number-badge">{trip.tripNumber}</div>
                      <div className="trip-route">
                        <span className="origin">{trip.origin?.city}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        <span className="destination">{trip.destination?.city}</span>
                      </div>
                      <span className={`status-badge ${getStatusClass(trip.status)}`}>
                        {trip.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="trip-meta">
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(trip.departureDate)}
                      </span>
                      <span className="meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="1" y="3" width="15" height="13" rx="2"/>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                          <circle cx="5.5" cy="18.5" r="2.5"/>
                          <circle cx="18.5" cy="18.5" r="2.5"/>
                        </svg>
                        {trip.truck?.plateNumber}
                      </span>
                      {trip.distanceTraveled != null && (
                        <span className="meta-item distance">
                          {trip.distanceTraveled.toLocaleString()} km
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && pagination && pagination.totalPages > 1 && (
              <div className="pagination-simple">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="modal-content trip-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTrip(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="trip-details-header">
              <div>
                <h2>{selectedTrip.tripNumber}</h2>
                <span className={`status-badge ${getStatusClass(selectedTrip.status)}`}>
                  {selectedTrip.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="trip-details-body">
              <div className="details-section">
                <h3>Route</h3>
                <div className="route-display">
                  <div className="route-point">
                    <div className="route-marker origin-marker"></div>
                    <div>
                      <strong>{selectedTrip.origin?.city}, {selectedTrip.origin?.country}</strong>
                      {selectedTrip.origin?.street && <span>{selectedTrip.origin.street}</span>}
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <div className="route-marker destination-marker"></div>
                    <div>
                      <strong>{selectedTrip.destination?.city}, {selectedTrip.destination?.country}</strong>
                      {selectedTrip.destination?.street && <span>{selectedTrip.destination.street}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Vehicle</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Truck</span>
                    <span className="info-value">{selectedTrip.truck?.plateNumber} ({selectedTrip.truck?.brand} {selectedTrip.truck?.model})</span>
                  </div>
                  {selectedTrip.trailer && (
                    <div className="info-item">
                      <span className="info-label">Trailer</span>
                      <span className="info-value">{selectedTrip.trailer?.plateNumber} ({selectedTrip.trailer?.type})</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h3>Schedule & Mileage</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Departure</span>
                    <span className="info-value">{formatDate(selectedTrip.departureDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Arrival</span>
                    <span className="info-value">{formatDate(selectedTrip.arrivalDate)}</span>
                  </div>
                  {selectedTrip.startKm != null && (
                    <div className="info-item">
                      <span className="info-label">Start Km</span>
                      <span className="info-value">{selectedTrip.startKm.toLocaleString()} km</span>
                    </div>
                  )}
                  {selectedTrip.endKm != null && (
                    <div className="info-item">
                      <span className="info-label">End Km</span>
                      <span className="info-value">{selectedTrip.endKm.toLocaleString()} km</span>
                    </div>
                  )}
                  {selectedTrip.distanceTraveled != null && (
                    <div className="info-item">
                      <span className="info-label">Distance</span>
                      <span className="info-value highlight">{selectedTrip.distanceTraveled.toLocaleString()} km</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedTrip.cargo || selectedTrip.weight || selectedTrip.remarks) && (
                <div className="details-section">
                  <h3>Cargo & Notes</h3>
                  <div className="info-grid">
                    {selectedTrip.cargo && (
                      <div className="info-item">
                        <span className="info-label">Cargo</span>
                        <span className="info-value">{selectedTrip.cargo}</span>
                      </div>
                    )}
                    {selectedTrip.weight && (
                      <div className="info-item">
                        <span className="info-label">Weight</span>
                        <span className="info-value">{selectedTrip.weight.toLocaleString()} kg</span>
                      </div>
                    )}
                  </div>
                  {selectedTrip.remarks && (
                    <div className="info-item full-width">
                      <span className="info-label">Remarks</span>
                      <span className="info-value">{selectedTrip.remarks}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {selectedTrip.status === TRIP_STATUS.PLANNED && (
              <div className="trip-actions">
                <button 
                  className="btn btn-md btn-success"
                  onClick={() => {
                    setStartModal({ isOpen: true, trip: selectedTrip, startKm: selectedTrip.truck?.mileage || '' });
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Start Trip
                </button>
              </div>
            )}

            {selectedTrip.status === TRIP_STATUS.IN_PROGRESS && (
              <div className="trip-actions">
                <button 
                  className="btn btn-md btn-success"
                  onClick={() => {
                    setCompleteModal({ isOpen: true, trip: selectedTrip, endKm: '', remarks: '' });
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Complete Trip
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Start Trip Modal */}
      {startModal.isOpen && (
        <div className="modal-overlay" onClick={() => !actionLoading && setStartModal({ isOpen: false, trip: null, startKm: '' })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Start Trip</h3>
            <p>Enter the starting mileage for trip <strong>{startModal.trip?.tripNumber}</strong></p>
            <div className="form-group">
              <label htmlFor="startKm">Start Km *</label>
              <input
                type="number"
                id="startKm"
                value={startModal.startKm}
                onChange={(e) => setStartModal(prev => ({ ...prev, startKm: e.target.value }))}
                placeholder="Enter start km"
                min="0"
                disabled={actionLoading}
              />
            </div>
            <div className="dialog-actions">
              <button 
                className="btn btn-md btn-ghost" 
                onClick={() => setStartModal({ isOpen: false, trip: null, startKm: '' })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-md btn-success" 
                onClick={handleStartTrip} 
                disabled={actionLoading}
              >
                {actionLoading ? 'Starting...' : 'Start Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completeModal.isOpen && (
        <div className="modal-overlay" onClick={() => !actionLoading && setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Trip</h3>
            <p>Enter the ending mileage for trip <strong>{completeModal.trip?.tripNumber}</strong></p>
            <div className="form-group">
              <label htmlFor="endKm">End Km * (Start was {completeModal.trip?.startKm?.toLocaleString()} km)</label>
              <input
                type="number"
                id="endKm"
                value={completeModal.endKm}
                onChange={(e) => setCompleteModal(prev => ({ ...prev, endKm: e.target.value }))}
                placeholder="Enter end km"
                min={completeModal.trip?.startKm || 0}
                disabled={actionLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tripRemarks">Remarks (Optional)</label>
              <textarea
                id="tripRemarks"
                value={completeModal.remarks}
                onChange={(e) => setCompleteModal(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Any notes about the trip..."
                rows="3"
                disabled={actionLoading}
              />
            </div>
            <div className="dialog-actions">
              <button 
                className="btn btn-md btn-ghost" 
                onClick={() => setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-md btn-success" 
                onClick={handleCompleteTrip} 
                disabled={actionLoading}
              >
                {actionLoading ? 'Completing...' : 'Complete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={currentUser}
      />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {toast.type === 'success' ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/>
            ) : (
              <>
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </>
            )}
          </svg>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
