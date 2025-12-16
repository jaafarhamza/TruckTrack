import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as tireService from '../services/tireService';
import Sidebar from '../components/common/Sidebar';
import TireFormModal from '../components/common/TireFormModal';
import MileageUpdateModal from '../components/common/MileageUpdateModal';
import TireStatistics from '../components/common/TireStatistics';
import TirePositionDiagram from '../components/common/TirePositionDiagram';
import ProfileModal from '../components/common/ProfileModal';
import './TiresPage.css';

const TiresPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [tires, setTires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, tire: null });
  const [selectedTire, setSelectedTire] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTire, setEditingTire] = useState(null);
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [updatingTire, setUpdatingTire] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchTires = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Build params object, only including non-empty values
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      // Only add filters if they have values
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      if (vehicleTypeFilter) params.vehicleType = vehicleTypeFilter;

      const response = await tireService.getAllTires(params);
      if (response.success) {
        setTires(response.data.tires);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load tires');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, vehicleTypeFilter]);

  useEffect(() => {
    fetchTires();
  }, [fetchTires]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddTire = () => {
    setEditingTire(null);
    setIsFormModalOpen(true);
  };

  const handleEditTire = (tire) => {
    setEditingTire(tire);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (tireData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingTire) {
        response = await tireService.updateTire(editingTire._id, tireData);
        if (response.success) {
          setTires(tires.map(t => t._id === editingTire._id ? response.data.tire : t));
          showToast('Tire updated successfully');
        }
      } else {
        response = await tireService.createTire(tireData);
        if (response.success) {
          fetchTires(); // Refresh to get updated list
          showToast('Tire created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingTire(null);
    } catch (err) {
      showToast(err.message || 'Failed to save tire', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (tireId) => {
    setActionLoading(tireId);
    try {
      const response = await tireService.deleteTire(tireId);
      if (response.success) {
        setTires(tires.filter(t => t._id !== tireId));
        showToast('Tire deleted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete tire', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, tire: null });
    }
  };

  const openConfirmDialog = (action, tire) => {
    setConfirmDialog({ isOpen: true, action, tire });
  };

  const handleUpdateMileage = (tire) => {
    setUpdatingTire(tire);
    setIsMileageModalOpen(true);
  };

  const handleMileageSubmit = async (tireId, newMileage) => {
    setActionLoading('mileage');
    try {
      const response = await tireService.updateTireMileage(tireId, newMileage);
      if (response.success) {
        setTires(tires.map(t => t._id === tireId ? response.data.tire : t));
        showToast('Mileage updated successfully');
        setIsMileageModalOpen(false);
        setUpdatingTire(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update mileage', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReplacementAlertClick = () => {
    setStatusFilter('TO_REPLACE');
    setCurrentPage(1);
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

  const getWearPercentage = (tire) => {
    const kmTraveled = tire.kmTraveled || 0;
    return Math.min(Math.round((kmTraveled / 80000) * 100), 100);
  };

  const getWearColor = (status) => {
    switch (status) {
      case 'NEW': return '#10b981';
      case 'GOOD': return '#14b8a6';
      case 'WORN': return '#f59e0b';
      case 'TO_REPLACE': return '#ef4444';
      default: return '#6b7280';
    }
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
            <h1>Tire Management</h1>
            <p>Track and manage tire inventory and wear</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{tires.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{tires.filter(t => t.status === 'GOOD' || t.status === 'NEW').length}</span>
                <span className="stat-label">Good</span>
              </div>
              <div 
                className="stat-item stat-item-clickable" 
                onClick={handleReplacementAlertClick}
                title="Click to filter tires needing replacement"
              >
                <span className="stat-value stat-alert">
                  {tires.filter(t => t.status === 'TO_REPLACE').length}
                  {tires.filter(t => t.status === 'TO_REPLACE').length > 0 && (
                    <span className="alert-pulse"></span>
                  )}
                </span>
                <span className="stat-label">Replace</span>
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
          {/* Statistics Widget */}
          {!loading && !error && tires.length > 0 && (
            <TireStatistics tires={tires} />
          )}

          <div className="admin-toolbar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by reference, brand, or model..."
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
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="WORN">Worn</option>
              <option value="TO_REPLACE">To Replace</option>
            </select>
            <select
              className="status-filter"
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
            >
              <option value="">All Vehicles</option>
              <option value="Truck">Trucks</option>
              <option value="Trailer">Trailers</option>
            </select>
            <button className="btn btn-sm btn-ghost" onClick={fetchTires}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleAddTire}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Tire
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Vehicle</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Wear</th>
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
              <h3>Failed to Load Tires</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchTires}>
                Try Again
              </button>
            </div>
          ) : tires.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              <h3>{searchTerm || statusFilter || vehicleTypeFilter ? 'No Tires Found' : 'No Tires Yet'}</h3>
              <p>{searchTerm || statusFilter || vehicleTypeFilter ? 'Try adjusting your filters' : 'Add your first tire to get started'}</p>
              {!searchTerm && !statusFilter && !vehicleTypeFilter && (
                <button className="btn btn-md btn-primary" onClick={handleAddTire}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add First Tire
                </button>
              )}
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Vehicle</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Wear</th>
                    <th>Mileage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tires.map((tire) => {
                    const wearPercentage = getWearPercentage(tire);
                    const wearColor = getWearColor(tire.status);
                    
                    return (
                      <tr key={tire._id}>
                        <td>
                          <div className="tire-cell" onClick={() => setSelectedTire(tire)} style={{ cursor: 'pointer' }}>
                            <div className="tire-reference">{tire.reference}</div>
                            <div className="tire-brand">{tire.brand} {tire.model}</div>
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-cell">
                            {tire.vehicle ? (
                              <Link 
                                to={`/admin/${tire.vehicleType?.toLowerCase()}s?search=${encodeURIComponent(tire.vehicle.plateNumber)}`}
                                className="vehicle-plate-link"
                                title={`View ${tire.vehicleType} - ${tire.vehicle.plateNumber}`}
                              >
                                {tire.vehicle.plateNumber}
                              </Link>
                            ) : (
                              <div className="vehicle-plate">N/A</div>
                            )}
                            <span className={`vehicle-type-badge type-${tire.vehicleType?.toLowerCase()}`}>
                              {tire.vehicleType}
                            </span>
                          </div>
                        </td>
                        <td>{tire.position?.replace(/_/g, ' ')}</td>
                        <td>
                          <span className={`status-badge status-${tire.status?.toLowerCase().replace(/_/g, '-')}`}>
                            {tire.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="wear-indicator-container">
                            <div className="wear-bar-wrapper">
                              <div 
                                className="wear-bar" 
                                style={{ 
                                  width: `${wearPercentage}%`,
                                  backgroundColor: wearColor
                                }}
                              />
                            </div>
                            <span className="wear-percentage">{wearPercentage}%</span>
                          </div>
                        </td>
                        <td>{formatNumber(tire.kmTraveled)} km</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-icon-primary"
                              onClick={() => handleEditTire(tire)}
                              disabled={actionLoading === tire._id}
                              title="Edit tire"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-success"
                              onClick={() => handleUpdateMileage(tire)}
                              disabled={actionLoading === tire._id}
                              title="Update mileage"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => openConfirmDialog('delete', tire)}
                              disabled={actionLoading === tire._id}
                              title="Delete tire"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                            {actionLoading === tire._id && (
                              <div className="action-spinner"></div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && pagination && pagination.totalPages > 1 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} tires
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
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, tire: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Tire</h3>
            <p>
              Are you sure you want to delete tire <strong>{confirmDialog.tire?.reference}</strong>?
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, tire: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-danger"
                onClick={() => handleDelete(confirmDialog.tire._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tire Details Modal */}
      {selectedTire && (
        <div className="modal-overlay" onClick={() => setSelectedTire(null)}>
          <div className="modal-content tire-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedTire(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="tire-details-header">
              <h2>{selectedTire.brand} {selectedTire.model}</h2>
              <span className={`status-badge status-${selectedTire.status?.toLowerCase().replace(/_/g, '-')}`}>
                {selectedTire.status?.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="tire-details-body">
              <div className="details-section">
                <h3>Tire Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Reference</span>
                    <span className="info-value">{selectedTire.reference}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Position</span>
                    <span className="info-value">{selectedTire.position?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dimension</span>
                    <span className="info-value">{selectedTire.dimension}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Pressure</span>
                    <span className="info-value">{selectedTire.pressure || 'N/A'} PSI</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Vehicle</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Plate Number</span>
                    {selectedTire.vehicle ? (
                      <Link 
                        to={`/admin/${selectedTire.vehicleType?.toLowerCase()}s?search=${encodeURIComponent(selectedTire.vehicle.plateNumber)}`}
                        className="info-value-link"
                        title={`View ${selectedTire.vehicleType} - ${selectedTire.vehicle.plateNumber}`}
                      >
                        {selectedTire.vehicle.plateNumber}
                      </Link>
                    ) : (
                      <span className="info-value">N/A</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{selectedTire.vehicleType}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Mileage & Wear</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Installation KM</span>
                    <span className="info-value">{formatNumber(selectedTire.installationKm)} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Current KM</span>
                    <span className="info-value">{formatNumber(selectedTire.currentKm)} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">KM Traveled</span>
                    <span className="info-value">{formatNumber(selectedTire.kmTraveled)} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Wear</span>
                    <span className="info-value">{getWearPercentage(selectedTire)}%</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Purchase Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Installation Date</span>
                    <span className="info-value">{formatDate(selectedTire.installationDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Purchase Price</span>
                    <span className="info-value">${formatNumber(selectedTire.purchasePrice)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{selectedTire.age} days</span>
                  </div>
                </div>
              </div>

              {/* Tire Position Diagram */}
              {selectedTire.vehicle && (
                <div className="details-section">
                  <TirePositionDiagram 
                    vehicleType={selectedTire.vehicleType}
                    tires={tires.filter(t => t.vehicle?._id === selectedTire.vehicle._id)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tire Form Modal */}
      <TireFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTire(null);
        }}
        onSubmit={handleFormSubmit}
        tire={editingTire}
        loading={actionLoading === 'form'}
      />

      {/* Mileage Update Modal */}
      <MileageUpdateModal
        isOpen={isMileageModalOpen}
        onClose={() => {
          setIsMileageModalOpen(false);
          setUpdatingTire(null);
        }}
        onSubmit={handleMileageSubmit}
        tire={updatingTire}
        loading={actionLoading === 'mileage'}
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

export default TiresPage;
