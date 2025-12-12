import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as truckService from '../services/truckService';
import Sidebar from '../components/common/Sidebar';
import TruckFormModal from '../components/common/TruckFormModal';
import ProfileModal from '../components/common/ProfileModal';
import './TrucksPage.css';

const TrucksPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, truck: null });
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await truckService.getAllTrucks({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
      });
      if (response.success) {
        setTrucks(response.data.trucks);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load trucks');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddTruck = () => {
    setEditingTruck(null);
    setIsFormModalOpen(true);
  };

  const handleEditTruck = (truck) => {
    setEditingTruck(truck);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (truckData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingTruck) {
        response = await truckService.updateTruck(editingTruck._id, truckData);
        if (response.success) {
          setTrucks(trucks.map(t => t._id === editingTruck._id ? response.data.truck : t));
          showToast('Truck updated successfully');
        }
      } else {
        response = await truckService.createTruck(truckData);
        if (response.success) {
          setTrucks([...trucks, response.data.truck]);
          showToast('Truck created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingTruck(null);
    } catch (err) {
      showToast(err.message || 'Failed to save truck', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (truckId) => {
    setActionLoading(truckId);
    try {
      const response = await truckService.deleteTruck(truckId);
      if (response.success) {
        setTrucks(trucks.map(t => t._id === truckId ? { ...t, status: 'OUT_OF_SERVICE' } : t));
        showToast('Truck deleted successfully (set to OUT_OF_SERVICE)');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete truck', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, truck: null });
    }
  };

  const openConfirmDialog = (action, truck) => {
    setConfirmDialog({ isOpen: true, action, truck });
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

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Truck Management</h1>
            <p>Manage your fleet of trucks</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{trucks.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{trucks.filter(t => t.status === 'AVAILABLE').length}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{trucks.filter(t => t.status === 'ON_TRIP').length}</span>
                <span className="stat-label">On Trip</span>
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

        {/* Body */}
        <div className="dashboard-body">
          <div className="admin-toolbar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by plate number, brand, or model..."
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
              <option value="AVAILABLE">Available</option>
              <option value="ON_TRIP">On Trip</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
            <button className="btn btn-sm btn-ghost" onClick={fetchTrucks}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleAddTruck}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Truck
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Brand & Model</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Mileage</th>
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
              <h3>Failed to Load Trucks</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchTrucks}>
                Try Again
              </button>
            </div>
          ) : trucks.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3>{searchTerm || statusFilter ? 'No Trucks Found' : 'No Trucks Yet'}</h3>
              <p>{searchTerm || statusFilter ? 'Try adjusting your filters' : 'Add your first truck to get started'}</p>
              {!searchTerm && !statusFilter && (
                <button className="btn btn-md btn-primary" onClick={handleAddTruck}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add First Truck
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Brand & Model</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Mileage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trucks.map((truck) => (
                    <tr key={truck._id}>
                      <td>
                        <div className="truck-cell" onClick={() => setSelectedTruck(truck)} style={{ cursor: 'pointer' }}>
                          <div className="truck-plate">{truck.plateNumber}</div>
                          {truck.serialNumber && (
                            <div className="truck-serial">SN: {truck.serialNumber}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="truck-brand-model">
                          <div className="truck-brand">{truck.brand}</div>
                          <div className="truck-model">{truck.model}</div>
                        </div>
                      </td>
                      <td>{truck.year}</td>
                      <td>
                        <span className={`status-badge status-${truck.status.toLowerCase().replace(/_/g, '-')}`}>
                          {truck.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>{formatNumber(truck.mileage)} km</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-primary"
                            onClick={() => handleEditTruck(truck)}
                            disabled={actionLoading === truck._id}
                            title="Edit truck"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => openConfirmDialog('delete', truck)}
                            disabled={actionLoading === truck._id}
                            title="Delete truck"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                          {actionLoading === truck._id && (
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

          {/* Pagination Controls */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} trucks
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
                    // Show first page, last page, current page, and pages around current
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
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, truck: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Truck</h3>
            <p>
              Are you sure you want to delete truck <strong>{confirmDialog.truck?.plateNumber}</strong>? 
              This will set its status to OUT_OF_SERVICE.
              {confirmDialog.truck?.status === 'ON_TRIP' && (
                <span className="warning-text"> Note: This truck is currently on a trip and cannot be deleted.</span>
              )}
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, truck: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-danger"
                onClick={() => handleDelete(confirmDialog.truck._id)}
                disabled={confirmDialog.truck?.status === 'ON_TRIP'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Truck Details Modal */}
      {selectedTruck && (
        <div className="modal-overlay" onClick={() => setSelectedTruck(null)}>
          <div className="modal-content truck-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTruck(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="truck-details-header">
              <h2>{selectedTruck.brand} {selectedTruck.model}</h2>
              <span className={`status-badge status-${selectedTruck.status.toLowerCase().replace(/_/g, '-')}`}>
                {selectedTruck.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="truck-details-body">
              <div className="details-section">
                <h3>Vehicle Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Plate Number</span>
                    <span className="info-value">{selectedTruck.plateNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Serial Number</span>
                    <span className="info-value">{selectedTruck.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Year</span>
                    <span className="info-value">{selectedTruck.year}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Color</span>
                    <span className="info-value">{selectedTruck.color || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Performance</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Mileage</span>
                    <span className="info-value">{formatNumber(selectedTruck.mileage)} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Load Capacity</span>
                    <span className="info-value">{formatNumber(selectedTruck.loadCapacity)} kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Avg. Consumption</span>
                    <span className="info-value">{selectedTruck.averageConsumption || 'N/A'} L/100km</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Purchase Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Purchase Date</span>
                    <span className="info-value">{formatDate(selectedTruck.purchaseDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purchase Price</span>
                    <span className="info-value">${formatNumber(selectedTruck.purchasePrice)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{selectedTruck.age} years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Truck Form Modal */}
      <TruckFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTruck(null);
        }}
        onSubmit={handleFormSubmit}
        truck={editingTruck}
        loading={actionLoading === 'form'}
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

export default TrucksPage;
