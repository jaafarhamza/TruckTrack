import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as trailerService from '../services/trailerService';
import Sidebar from '../components/common/Sidebar';
import TrailerFormModal from '../components/common/TrailerFormModal';
import ProfileModal from '../components/common/ProfileModal';
import './TrailersPage.css';

const TrailersPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [trailers, setTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, trailer: null });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTrailer, setEditingTrailer] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchTrailers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await trailerService.getAllTrailers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
      });
      if (response.success) {
        setTrailers(response.data.trailers);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load trailers');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTrailers();
  }, [fetchTrailers]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddTrailer = () => {
    setEditingTrailer(null);
    setIsFormModalOpen(true);
  };

  const handleEditTrailer = (trailer) => {
    setEditingTrailer(trailer);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (trailerData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingTrailer) {
        response = await trailerService.updateTrailer(editingTrailer._id, trailerData);
        if (response.success) {
          setTrailers(trailers.map(t => t._id === editingTrailer._id ? response.data.trailer : t));
          showToast('Trailer updated successfully');
        }
      } else {
        response = await trailerService.createTrailer(trailerData);
        if (response.success) {
          fetchTrailers();
          showToast('Trailer created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingTrailer(null);
    } catch (err) {
      showToast(err.message || 'Failed to save trailer', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (trailerId) => {
    setActionLoading(trailerId);
    try {
      const response = await trailerService.deleteTrailer(trailerId);
      if (response.success) {
        setTrailers(trailers.map(t => t._id === trailerId ? { ...t, status: 'OUT_OF_SERVICE' } : t));
        showToast('Trailer deleted successfully (set to OUT_OF_SERVICE)');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete trailer', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, trailer: null });
    }
  };

  const openConfirmDialog = (action, trailer) => {
    setConfirmDialog({ isOpen: true, action, trailer });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'AVAILABLE': 'status-available',
      'ON_TRIP': 'status-on-trip',
      'UNDER_MAINTENANCE': 'status-under-maintenance',
      'OUT_OF_SERVICE': 'status-out-of-service'
    };
    return statusMap[status] || 'status-default';
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Trailer Management</h1>
            <p>Manage your fleet of trailers</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{trailers.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{trailers.filter(t => t.status === 'AVAILABLE').length}</span>
                <span className="stat-label">Available</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{trailers.filter(t => t.status === 'ON_TRIP').length}</span>
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
            <select
              className="status-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="FLATBED">Flatbed</option>
              <option value="REFRIGERATED">Refrigerated</option>
              <option value="TANKER">Tanker</option>
              <option value="CONTAINER">Container</option>
              <option value="LOWBOY">Lowboy</option>
              <option value="DRY_VAN">Dry Van</option>
            </select>
            <button className="btn btn-sm btn-ghost" onClick={fetchTrailers}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
            <button className="btn btn-sm btn-primary" onClick={handleAddTrailer}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Trailer
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Type</th>
                    <th>Brand & Model</th>
                    <th>Year</th>
                    <th>Dimensions</th>
                    <th>Capacity</th>
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
              <h3>Failed to Load Trailers</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchTrailers}>
                Try Again
              </button>
            </div>
          ) : trailers.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <h3>No Trailers Found</h3>
              <p>Get started by adding your first trailer</p>
              <button className="btn btn-md btn-primary" onClick={handleAddTrailer}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Trailer
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Type</th>
                      <th>Brand & Model</th>
                      <th>Year</th>
                      <th>Dimensions (L×W×H)</th>
                      <th>Capacity (kg)</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trailers.map((trailer) => (
                      <tr key={trailer._id}>
                        <td>
                          <div className="plate-number">{trailer.plateNumber}</div>
                        </td>
                        <td>
                          <span className="trailer-type">{trailer.type.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <div className="brand-model">
                            <div className="brand">{trailer.brand}</div>
                            <div className="model">{trailer.model}</div>
                          </div>
                        </td>
                        <td>{trailer.year}</td>
                        <td>
                          <span className="dimensions">
                            {trailer.length}m × {trailer.width}m × {trailer.height}m
                          </span>
                        </td>
                        <td>{formatNumber(trailer.loadCapacity)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(trailer.status)}`}>
                            {trailer.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-icon-primary"
                              onClick={() => handleEditTrailer(trailer)}
                              disabled={actionLoading === trailer._id}
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => openConfirmDialog('delete', trailer)}
                              disabled={actionLoading === trailer._id}
                              title="Delete"
                            >
                              {actionLoading === trailer._id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!loading && !error && pagination && pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} trailers
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
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              className={`pagination-page ${pageNum === currentPage ? 'active' : ''}`}
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
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
            </>
          )}
        </div>
      </main>

      <TrailerFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTrailer(null);
        }}
        onSubmit={handleFormSubmit}
        trailer={editingTrailer}
        loading={actionLoading === 'form'}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, trailer: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Trailer</h3>
            <p>
              Are you sure you want to delete trailer <strong>{confirmDialog.trailer?.plateNumber}</strong>? 
              This will set its status to OUT_OF_SERVICE.
              {confirmDialog.trailer?.status === 'ON_TRIP' && (
                <span className="warning-text"> Note: This trailer is currently on a trip and cannot be deleted.</span>
              )}
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, trailer: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-danger"
                onClick={() => handleDelete(confirmDialog.trailer._id)}
                disabled={confirmDialog.trailer?.status === 'ON_TRIP'}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toast toast-${toast.type}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {toast.type === 'success' ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            ) : (
              <circle cx="12" cy="12" r="10"/>
            )}
            {toast.type === 'success' ? (
              <polyline points="22 4 12 14.01 9 11.01"/>
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </>
            )}
          </svg>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default TrailersPage;
