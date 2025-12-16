import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as driverService from '../services/driverService';
import Sidebar from '../components/common/Sidebar';
import DriverFormModal from '../components/common/DriverFormModal';
import DriverTripHistoryModal from '../components/common/DriverTripHistoryModal';
import ProfileModal from '../components/common/ProfileModal';
import './DriversPage.css';

const DriversPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, driver: null });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [tripHistoryDriver, setTripHistoryDriver] = useState(null);

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await driverService.getAllDrivers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        active: statusFilter === '' ? undefined : statusFilter,
      });
      if (response.success) {
        setDrivers(response.data.drivers);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await driverService.getDriverStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
    fetchStats();
  }, [fetchDrivers, fetchStats]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddDriver = () => {
    setEditingDriver(null);
    setIsFormModalOpen(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (driverData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingDriver) {
        response = await driverService.updateDriver(editingDriver._id, driverData);
        if (response.success) {
          setDrivers(drivers.map(d => d._id === editingDriver._id ? response.data.driver : d));
          showToast('Driver updated successfully');
        }
      } else {
        response = await driverService.createDriver(driverData);
        if (response.success) {
          fetchDrivers();
          fetchStats();
          showToast('Driver created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingDriver(null);
    } catch (err) {
      showToast(err.message || 'Failed to save driver', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (driverId) => {
    setActionLoading(driverId);
    try {
      const response = await driverService.toggleDriverStatus(driverId);
      if (response.success) {
        setDrivers(drivers.map(d => d._id === driverId ? response.data.driver : d));
        fetchStats();
        showToast(response.message);
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, driver: null });
    }
  };

  const openConfirmDialog = (action, driver) => {
    setConfirmDialog({ isOpen: true, action, driver });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Driver Management</h1>
            <p>Manage your fleet drivers</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.active}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{stats.inactive}</span>
                <span className="stat-label">Inactive</span>
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
                placeholder="Search by name, email, or license..."
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
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <button className="btn btn-sm btn-ghost" onClick={() => { fetchDrivers(); fetchStats(); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleAddDriver}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Driver
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Contact</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
                      <td><div className="skeleton skeleton-badge"></div></td>
                      <td><div className="skeleton skeleton-text"></div></td>
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
              <h3>Failed to Load Drivers</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchDrivers}>
                Try Again
              </button>
            </div>
          ) : drivers.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h3>{searchTerm || statusFilter ? 'No Drivers Found' : 'No Drivers Yet'}</h3>
              <p>{searchTerm || statusFilter ? 'Try adjusting your filters' : 'Add your first driver to get started'}</p>
              {!searchTerm && !statusFilter && (
                <button className="btn btn-md btn-primary" onClick={handleAddDriver}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add First Driver
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Contact</th>
                    <th>License</th>
                    <th>Status</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver._id}>
                      <td>
                        <div className="driver-cell" onClick={() => setSelectedDriver(driver)} style={{ cursor: 'pointer' }}>
                          <div className="driver-avatar">
                            {getInitials(driver.firstName, driver.lastName)}
                          </div>
                          <div className="driver-info">
                            <div className="driver-name">{driver.firstName} {driver.lastName}</div>
                            <div className="driver-username">@{driver.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="driver-contact">
                          <div className="driver-email">{driver.email}</div>
                          {driver.phone && <div className="driver-phone">{driver.phone}</div>}
                        </div>
                      </td>
                      <td>
                        <span className="license-badge">{driver.license}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${driver.active ? 'active' : 'inactive'}`}>
                          {driver.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(driver.hireDate)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-primary"
                            onClick={() => handleEditDriver(driver)}
                            disabled={actionLoading === driver._id}
                            title="Edit driver"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className={`btn-icon ${driver.active ? 'btn-icon-warning' : 'btn-icon-success'}`}
                            onClick={() => openConfirmDialog('toggle', driver)}
                            disabled={actionLoading === driver._id}
                            title={driver.active ? 'Deactivate driver' : 'Activate driver'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              {driver.active ? (
                                <>
                                  <circle cx="12" cy="12" r="10"/>
                                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                </>
                              ) : (
                                <>
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </>
                              )}
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-icon-info"
                            onClick={() => setTripHistoryDriver(driver)}
                            disabled={actionLoading === driver._id}
                            title="View trip history"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="6" cy="6" r="3"/>
                              <circle cx="18" cy="18" r="3"/>
                              <path d="M6 9v4c0 1.1.9 2 2 2h4"/>
                              <path d="M14 15l4 4"/>
                            </svg>
                          </button>
                          {actionLoading === driver._id && (
                            <div className="action-spinner"></div>
                          )}
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
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} drivers
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

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, driver: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmDialog.driver?.active ? 'Deactivate' : 'Activate'} Driver</h3>
            <p>
              Are you sure you want to {confirmDialog.driver?.active ? 'deactivate' : 'activate'} driver <strong>{confirmDialog.driver?.firstName} {confirmDialog.driver?.lastName}</strong>?
              {confirmDialog.driver?.active && (
                <span className="warning-text"> This will prevent them from accessing the system.</span>
              )}
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, driver: null })}
              >
                Cancel
              </button>
              <button
                className={`btn btn-md ${confirmDialog.driver?.active ? 'btn-warning' : 'btn-success'}`}
                onClick={() => handleToggleStatus(confirmDialog.driver._id)}
              >
                {confirmDialog.driver?.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="modal-overlay" onClick={() => setSelectedDriver(null)}>
          <div className="modal-content driver-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDriver(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="driver-details-header">
              <div className="driver-avatar large">
                {getInitials(selectedDriver.firstName, selectedDriver.lastName)}
              </div>
              <div>
                <h2>{selectedDriver.firstName} {selectedDriver.lastName}</h2>
                <span className="driver-username">@{selectedDriver.username}</span>
              </div>
              <span className={`status-badge status-${selectedDriver.active ? 'active' : 'inactive'}`}>
                {selectedDriver.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="driver-details-body">
              <div className="details-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedDriver.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedDriver.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Employment Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">License Number</span>
                    <span className="info-value">{selectedDriver.license}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Hire Date</span>
                    <span className="info-value">{formatDate(selectedDriver.hireDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{formatDate(selectedDriver.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Driver Form Modal */}
      <DriverFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingDriver(null);
        }}
        onSubmit={handleFormSubmit}
        driver={editingDriver}
        loading={actionLoading === 'form'}
      />

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={currentUser}
      />

      {/* Driver Trip History Modal */}
      <DriverTripHistoryModal
        isOpen={!!tripHistoryDriver}
        onClose={() => setTripHistoryDriver(null)}
        driver={tripHistoryDriver}
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

export default DriversPage;
