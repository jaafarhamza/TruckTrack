import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as tripService from '../services/tripService';
import * as truckService from '../services/truckService';
import * as trailerService from '../services/trailerService';
import Sidebar from '../components/common/Sidebar';
import TripFormModal from '../components/common/TripFormModal';
import ProfileModal from '../components/common/ProfileModal';
import './TripsPage.css';

const TRIP_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const TripsPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [trips, setTrips] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, trip: null });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({ total: 0, planned: 0, inProgress: 0, completed: 0, cancelled: 0 });
  
  // For start/complete modals
  const [startModal, setStartModal] = useState({ isOpen: false, trip: null, startKm: '' });
  const [completeModal, setCompleteModal] = useState({ isOpen: false, trip: null, endKm: '', remarks: '' });

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await tripService.getAllTrips({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
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
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await tripService.getTripStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      const [trucksRes, trailersRes] = await Promise.all([
        truckService.getAllTrucks({ limit: 100 }),
        trailerService.getAllTrailers({ limit: 100 }),
      ]);
      if (trucksRes.success) setTrucks(trucksRes.data.trucks);
      if (trailersRes.success) setTrailers(trailersRes.data.trailers);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
    fetchStats();
    fetchVehicles();
  }, [fetchTrips, fetchStats, fetchVehicles]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddTrip = () => {
    setEditingTrip(null);
    setIsFormModalOpen(true);
  };

  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (tripData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingTrip) {
        response = await tripService.updateTrip(editingTrip._id, tripData);
        if (response.success) {
          setTrips(trips.map(t => t._id === editingTrip._id ? response.data.trip : t));
          showToast('Trip updated successfully');
        }
      } else {
        response = await tripService.createTrip(tripData);
        if (response.success) {
          fetchTrips();
          fetchStats();
          fetchVehicles();
          showToast('Trip created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingTrip(null);
    } catch (err) {
      showToast(err.message || 'Failed to save trip', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartTrip = async () => {
    if (!startModal.startKm) {
      showToast('Please enter start km', 'error');
      return;
    }
    setActionLoading(startModal.trip._id);
    try {
      const response = await tripService.startTrip(startModal.trip._id, parseInt(startModal.startKm));
      if (response.success) {
        setTrips(trips.map(t => t._id === startModal.trip._id ? response.data.trip : t));
        fetchStats();
        fetchVehicles();
        showToast('Trip started successfully');
        setStartModal({ isOpen: false, trip: null, startKm: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to start trip', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTrip = async () => {
    if (!completeModal.endKm) {
      showToast('Please enter end km', 'error');
      return;
    }
    setActionLoading(completeModal.trip._id);
    try {
      const response = await tripService.completeTrip(
        completeModal.trip._id, 
        parseInt(completeModal.endKm),
        completeModal.remarks
      );
      if (response.success) {
        setTrips(trips.map(t => t._id === completeModal.trip._id ? response.data.trip : t));
        fetchStats();
        fetchVehicles();
        showToast('Trip completed successfully');
        setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' });
      }
    } catch (err) {
      showToast(err.message || 'Failed to complete trip', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelTrip = async () => {
    setActionLoading(confirmDialog.trip._id);
    try {
      const response = await tripService.cancelTrip(confirmDialog.trip._id, 'Cancelled by admin');
      if (response.success) {
        setTrips(trips.map(t => t._id === confirmDialog.trip._id ? response.data.trip : t));
        fetchStats();
        fetchVehicles();
        showToast('Trip cancelled successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel trip', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, trip: null });
    }
  };

  const handleDeleteTrip = async () => {
    setActionLoading(confirmDialog.trip._id);
    try {
      const response = await tripService.deleteTrip(confirmDialog.trip._id);
      if (response.success) {
        fetchTrips();
        fetchStats();
        showToast('Trip deleted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete trip', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, trip: null });
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

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Trip Management</h1>
            <p>Plan, track, and manage fleet trips</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item stat-planned">
                <span className="stat-value">{stats.planned}</span>
                <span className="stat-label">Planned</span>
              </div>
              <div className="stat-item stat-in-progress">
                <span className="stat-value">{stats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
              <div className="stat-item stat-completed">
                <span className="stat-value">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            <div className="user-menu" onClick={() => setIsProfileModalOpen(true)}>
              <div className="user-avatar">
                {getInitials(currentUser?.firstName, currentUser?.lastName)}
              </div>
              <div className="user-info">
                <div className="user-name">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="user-role">{currentUser?.role}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="admin-toolbar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by trip number, city, cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="PLANNED">Planned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button className="btn btn-sm btn-ghost" onClick={() => { fetchTrips(); fetchStats(); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleAddTrip}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Trip
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-badge"></div></td>
                      <td><div className="skeleton skeleton-actions"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <h3>Failed to Load Trips</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchTrips}>
                Try Again
              </button>
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3>{searchTerm || statusFilter ? 'No Trips Found' : 'No Trips Yet'}</h3>
              <p>{searchTerm || statusFilter ? 'Try adjusting your filters' : 'Create your first trip to get started'}</p>
              {!searchTerm && !statusFilter && (
                <button className="btn btn-md btn-primary" onClick={handleAddTrip}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Create First Trip
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table trips-table">
                <thead>
                  <tr>
                    <th>Trip</th>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Vehicle</th>
                    <th>Schedule</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr key={trip._id}>
                      <td>
                        <div className="trip-number" onClick={() => setSelectedTrip(trip)} style={{ cursor: 'pointer' }}>
                          <span className="trip-id">{trip.tripNumber}</span>
                          {trip.cargo && <span className="trip-cargo">{trip.cargo}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="route-cell">
                          <span className="origin">{trip.origin?.city}</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                          <span className="destination">{trip.destination?.city}</span>
                        </div>
                      </td>
                      <td>
                        <div className="driver-cell">
                          <div className="driver-avatar small">
                            {getInitials(trip.driver?.firstName, trip.driver?.lastName)}
                          </div>
                          <span>{trip.driver?.firstName} {trip.driver?.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-cell">
                          <span className="truck-plate">{trip.truck?.plateNumber}</span>
                          {trip.trailer && <span className="trailer-plate">+ {trip.trailer?.plateNumber}</span>}
                        </div>
                      </td>
                      <td>
                        <div className="schedule-cell">
                          <span className="departure">{formatDate(trip.departureDate)}</span>
                          <span className="arrival">{formatDate(trip.arrivalDate)}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(trip.status)}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {trip.status === TRIP_STATUS.PLANNED && (
                            <>
                              <button
                                className="btn-icon btn-icon-success"
                                onClick={() => setStartModal({ isOpen: true, trip, startKm: trip.truck?.mileage || '' })}
                                disabled={actionLoading === trip._id}
                                title="Start trip"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                              </button>
                              <button
                                className="btn-icon btn-icon-primary"
                                onClick={() => handleEditTrip(trip)}
                                disabled={actionLoading === trip._id}
                                title="Edit trip"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                              </button>
                              <button
                                className="btn-icon btn-icon-warning"
                                onClick={() => setConfirmDialog({ isOpen: true, action: 'cancel', trip })}
                                disabled={actionLoading === trip._id}
                                title="Cancel trip"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="15" y1="9" x2="9" y2="15"/>
                                  <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                              </button>
                            </>
                          )}
                          {trip.status === TRIP_STATUS.IN_PROGRESS && (
                            <>
                              <button
                                className="btn-icon btn-icon-success"
                                onClick={() => setCompleteModal({ isOpen: true, trip, endKm: '', remarks: '' })}
                                disabled={actionLoading === trip._id}
                                title="Complete trip"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              </button>
                              <button
                                className="btn-icon btn-icon-warning"
                                onClick={() => setConfirmDialog({ isOpen: true, action: 'cancel', trip })}
                                disabled={actionLoading === trip._id}
                                title="Cancel trip"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="15" y1="9" x2="9" y2="15"/>
                                  <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                              </button>
                            </>
                          )}
                          {(trip.status === TRIP_STATUS.COMPLETED || trip.status === TRIP_STATUS.CANCELLED) && (
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => setConfirmDialog({ isOpen: true, action: 'delete', trip })}
                              disabled={actionLoading === trip._id}
                              title="Delete trip"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          )}
                          {actionLoading === trip._id && <div className="action-spinner"></div>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} trips
              </div>
              
              <div className="pagination-controls">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination.hasPrevPage}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Previous
                </button>

                <div className="pagination-pages">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-page ${pageNum === pagination.currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === pagination.currentPage - 2 ||
                      pageNum === pagination.currentPage + 2
                    ) {
                      return <span key={pageNum} className="pagination-ellipsis">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={!pagination.hasNextPage}
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>

              <div className="items-per-page">
                <label htmlFor="itemsPerPage">Items per page:</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Start Trip Modal */}
      {startModal.isOpen && (
        <div className="modal-overlay" onClick={() => setStartModal({ isOpen: false, trip: null, startKm: '' })}>
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
              />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-md btn-ghost" onClick={() => setStartModal({ isOpen: false, trip: null, startKm: '' })}>
                Cancel
              </button>
              <button className="btn btn-md btn-success" onClick={handleStartTrip} disabled={actionLoading}>
                {actionLoading ? 'Starting...' : 'Start Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {completeModal.isOpen && (
        <div className="modal-overlay" onClick={() => setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Complete Trip</h3>
            <p>Enter the ending mileage for trip <strong>{completeModal.trip?.tripNumber}</strong></p>
            <div className="form-group">
              <label htmlFor="endKm">End Km *</label>
              <input
                type="number"
                id="endKm"
                value={completeModal.endKm}
                onChange={(e) => setCompleteModal(prev => ({ ...prev, endKm: e.target.value }))}
                placeholder="Enter end km"
                min={completeModal.trip?.startKm || 0}
              />
            </div>
            <div className="form-group">
              <label htmlFor="tripRemarks">Remarks</label>
              <textarea
                id="tripRemarks"
                value={completeModal.remarks}
                onChange={(e) => setCompleteModal(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="Any notes about the trip..."
                rows="3"
              />
            </div>
            <div className="dialog-actions">
              <button className="btn btn-md btn-ghost" onClick={() => setCompleteModal({ isOpen: false, trip: null, endKm: '', remarks: '' })}>
                Cancel
              </button>
              <button className="btn btn-md btn-success" onClick={handleCompleteTrip} disabled={actionLoading}>
                {actionLoading ? 'Completing...' : 'Complete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, trip: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmDialog.action === 'cancel' ? 'Cancel Trip' : 'Delete Trip'}</h3>
            <p>
              Are you sure you want to {confirmDialog.action} trip <strong>{confirmDialog.trip?.tripNumber}</strong>?
              {confirmDialog.action === 'cancel' && confirmDialog.trip?.status === TRIP_STATUS.IN_PROGRESS && (
                <span className="warning-text"> This will release the assigned vehicles.</span>
              )}
              {confirmDialog.action === 'delete' && (
                <span className="warning-text"> This action cannot be undone.</span>
              )}
            </p>
            <div className="dialog-actions">
              <button className="btn btn-md btn-ghost" onClick={() => setConfirmDialog({ isOpen: false, action: null, trip: null })}>
                Cancel
              </button>
              <button
                className={`btn btn-md ${confirmDialog.action === 'delete' ? 'btn-danger' : 'btn-warning'}`}
                onClick={confirmDialog.action === 'cancel' ? handleCancelTrip : handleDeleteTrip}
              >
                {confirmDialog.action === 'cancel' ? 'Cancel Trip' : 'Delete Trip'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                <h3>Assignment</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Driver</span>
                    <span className="info-value">{selectedTrip.driver?.firstName} {selectedTrip.driver?.lastName}</span>
                  </div>
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
                      <span className="info-value">{selectedTrip.distanceTraveled.toLocaleString()} km</span>
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
          </div>
        </div>
      )}

      {/* Trip Form Modal */}
      <TripFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTrip(null);
        }}
        onSubmit={handleFormSubmit}
        trip={editingTrip}
        loading={actionLoading === 'form'}
        trucks={trucks}
        trailers={trailers}
      />

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

export default TripsPage;
