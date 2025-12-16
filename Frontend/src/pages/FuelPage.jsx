import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as fuelService from '../services/fuelService';
import Sidebar from '../components/common/Sidebar';
import FuelFormModal from '../components/common/FuelFormModal';
import FuelStatistics from '../components/common/FuelStatistics';
import ProfileModal from '../components/common/ProfileModal';
import './FuelPage.css';

const FuelPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [fuelRecords, setFuelRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleModelFilter, setVehicleModelFilter] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('');
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, fuel: null });
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFuel, setEditingFuel] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchFuelRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (vehicleModelFilter) params.vehicleModel = vehicleModelFilter;
      if (fuelTypeFilter) params.fuelType = fuelTypeFilter;
      
      if (startMonth) {
        const [year, month] = startMonth.split('-');
        params.startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      }
      if (endMonth) {
        const [year, month] = endMonth.split('-');
        params.endDate = new Date(year, month, 0).toISOString().split('T')[0];
      }

      const response = await fuelService.getAllFuelRecords(params);
      if (response.success) {
        setFuelRecords(response.data.fuelRecords);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load fuel records');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, vehicleModelFilter, fuelTypeFilter, startMonth, endMonth]);

  const fetchStatistics = useCallback(async () => {
    try {
      const params = {};
      if (vehicleModelFilter) params.vehicleModel = vehicleModelFilter;
      
      if (startMonth) {
        const [year, month] = startMonth.split('-');
        params.startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      }
      if (endMonth) {
        const [year, month] = endMonth.split('-');
        params.endDate = new Date(year, month, 0).toISOString().split('T')[0];
      }

      const response = await fuelService.getFuelStatistics(params);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, [vehicleModelFilter, startMonth, endMonth]);

  useEffect(() => {
    fetchFuelRecords();
    fetchStatistics();
  }, [fetchFuelRecords, fetchStatistics]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleAddFuel = () => {
    setEditingFuel(null);
    setIsFormModalOpen(true);
  };

  const handleEditFuel = (fuel) => {
    setEditingFuel(fuel);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (fuelData) => {
    setActionLoading('form');
    try {
      let response;
      if (editingFuel) {
        response = await fuelService.updateFuelRecord(editingFuel._id, fuelData);
        if (response.success) {
          setFuelRecords(fuelRecords.map(f => f._id === editingFuel._id ? response.data.fuel : f));
          showToast('Fuel record updated successfully');
        }
      } else {
        response = await fuelService.createFuelRecord(fuelData);
        if (response.success) {
          fetchFuelRecords();
          fetchStatistics();
          showToast('Fuel record created successfully');
        }
      }
      setIsFormModalOpen(false);
      setEditingFuel(null);
    } catch (err) {
      showToast(err.message || 'Failed to save fuel record', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (fuelId) => {
    setActionLoading(fuelId);
    try {
      const response = await fuelService.deleteFuelRecord(fuelId);
      if (response.success) {
        setFuelRecords(fuelRecords.filter(f => f._id !== fuelId));
        fetchStatistics();
        showToast('Fuel record deleted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete fuel record', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, fuel: null });
    }
  };

  const openConfirmDialog = (action, fuel) => {
    setConfirmDialog({ isOpen: true, action, fuel });
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount?.toFixed(2) || '0.00'}`;
  };

  const getFuelTypeColor = (type) => {
    const colors = {
      'DIESEL': '#3b82f6',
      'GASOLINE': '#f59e0b',
      'ELECTRIC': '#10b981',
      'HYBRID': '#a855f7',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Fuel Management</h1>
            <p>Track and analyze fuel consumption</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{fuelRecords.length}</span>
                <span className="stat-label">Records</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatCurrency(statistics?.totalCost || 0)}</span>
                <span className="stat-label">Total Cost</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{formatNumber(statistics?.totalVolume || 0)} L</span>
                <span className="stat-label">Total Volume</span>
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
          {/* Statistics Widget */}
          {statistics && <FuelStatistics statistics={statistics} />}

          {/* Toolbar */}
          <div className="admin-toolbar">
            <div className="search-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by station, city, or invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="status-filter"
              value={vehicleModelFilter}
              onChange={(e) => setVehicleModelFilter(e.target.value)}
            >
              <option value="">All Vehicles</option>
              <option value="Truck">Trucks</option>
              <option value="Trailer">Trailers</option>
            </select>

            <select
              className="status-filter"
              value={fuelTypeFilter}
              onChange={(e) => setFuelTypeFilter(e.target.value)}
            >
              <option value="">All Fuel Types</option>
              <option value="DIESEL">Diesel</option>
              <option value="GASOLINE">Gasoline</option>
              <option value="ELECTRIC">Electric</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <input
              type="month"
              className="date-filter"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              placeholder="Start Month"
              title="Start Month"
            />

            <input
              type="month"
              className="date-filter"
              value={endMonth}
              onChange={(e) => setEndMonth(e.target.value)}
              placeholder="End Month"
              title="End Month"
            />

            <button className="btn btn-sm btn-ghost" onClick={() => {
              fetchFuelRecords();
              fetchStatistics();
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>

            <button className="btn btn-sm btn-primary" onClick={handleAddFuel}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Fuel Record
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Vehicle</th>
                    <th>Station</th>
                    <th>Volume</th>
                    <th>Cost/L</th>
                    <th>Total</th>
                    <th>KM</th>
                    <th>Type</th>
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
              <h3>Failed to Load Fuel Records</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchFuelRecords}>
                Try Again
              </button>
            </div>
          ) : fuelRecords.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              <h3>No Fuel Records Found</h3>
              <p>Get started by adding your first fuel record</p>
              <button className="btn btn-md btn-primary" onClick={handleAddFuel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Fuel Record
              </button>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Vehicle</th>
                      <th>Station / City</th>
                      <th>Volume (L)</th>
                      <th>Cost/L</th>
                      <th>Total Cost</th>
                      <th>KM</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fuelRecords.map((fuel) => (
                      <tr key={fuel._id}>
                        <td>
                          <div className="fuel-date" onClick={() => setSelectedFuel(fuel)} style={{ cursor: 'pointer' }}>
                            {formatDate(fuel.date)}
                          </div>
                        </td>
                        <td>
                          <div className="vehicle-cell">
                            {fuel.vehicle ? (
                              <Link 
                                to={`/admin/${fuel.vehicleModel?.toLowerCase()}s?search=${encodeURIComponent(fuel.vehicle.plateNumber)}`}
                                className="vehicle-plate-link"
                                title={`View ${fuel.vehicleModel} - ${fuel.vehicle.plateNumber}`}
                              >
                                {fuel.vehicle.plateNumber}
                              </Link>
                            ) : (
                              <div className="vehicle-plate">N/A</div>
                            )}
                            <span className={`vehicle-type-badge type-${fuel.vehicleModel?.toLowerCase()}`}>
                              {fuel.vehicleModel}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="location-cell">
                            <div className="station-name">{fuel.station}</div>
                            <div className="city-name">{fuel.city}</div>
                          </div>
                        </td>
                        <td>{formatNumber(fuel.volume)}</td>
                        <td>{formatCurrency(fuel.unitCost)}</td>
                        <td><strong>{formatCurrency(fuel.totalCost)}</strong></td>
                        <td>{formatNumber(fuel.currentKm)}</td>
                        <td>
                          <span 
                            className="fuel-type-badge" 
                            style={{ 
                              backgroundColor: `${getFuelTypeColor(fuel.fuelType)}20`,
                              color: getFuelTypeColor(fuel.fuelType),
                              border: `1px solid ${getFuelTypeColor(fuel.fuelType)}40`
                            }}
                          >
                            {fuel.fuelType}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-icon-primary"
                              onClick={() => handleEditFuel(fuel)}
                              disabled={actionLoading === fuel._id}
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => openConfirmDialog('delete', fuel)}
                              disabled={actionLoading === fuel._id}
                              title="Delete"
                            >
                              {actionLoading === fuel._id ? (
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

              {/* Pagination */}
              {!loading && !error && pagination && pagination.totalPages > 1 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} records
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

      {/* Fuel Form Modal */}
      <FuelFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingFuel(null);
        }}
        onSubmit={handleFormSubmit}
        fuel={editingFuel}
        loading={actionLoading === 'form'}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, fuel: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Fuel Record</h3>
            <p>
              Are you sure you want to delete this fuel record from <strong>{confirmDialog.fuel?.station}</strong> on {formatDate(confirmDialog.fuel?.date)}?
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, fuel: null })}
              >
                Cancel
              </button>
              <button
                className="btn btn-md btn-danger"
                onClick={() => handleDelete(confirmDialog.fuel._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Details Modal */}
      {selectedFuel && (
        <div className="modal-overlay" onClick={() => setSelectedFuel(null)}>
          <div className="modal-content fuel-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedFuel(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <h2>Fuel Record Details</h2>

            <div className="details-content">
              <div className="details-section">
                <h3>Vehicle Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Plate Number</span>
                    {selectedFuel.vehicle ? (
                      <Link 
                        to={`/admin/${selectedFuel.vehicleModel?.toLowerCase()}s?search=${encodeURIComponent(selectedFuel.vehicle.plateNumber)}`}
                        className="info-value-link"
                        title={`View ${selectedFuel.vehicleModel} - ${selectedFuel.vehicle.plateNumber}`}
                      >
                        {selectedFuel.vehicle.plateNumber}
                      </Link>
                    ) : (
                      <span className="info-value">N/A</span>
                    )}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{selectedFuel.vehicleModel}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Refueling Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Date</span>
                    <span className="info-value">{formatDate(selectedFuel.date)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Station</span>
                    <span className="info-value">{selectedFuel.station}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">City</span>
                    <span className="info-value">{selectedFuel.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Current KM</span>
                    <span className="info-value">{formatNumber(selectedFuel.currentKm)}</span>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h3>Fuel Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Fuel Type</span>
                    <span className="info-value">{selectedFuel.fuelType}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Volume</span>
                    <span className="info-value">{formatNumber(selectedFuel.volume)} L</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Unit Cost</span>
                    <span className="info-value">{formatCurrency(selectedFuel.unitCost)}/L</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total Cost</span>
                    <span className="info-value"><strong>{formatCurrency(selectedFuel.totalCost)}</strong></span>
                  </div>
                  {selectedFuel.invoice && (
                    <div className="info-item">
                      <span className="info-label">Invoice</span>
                      <span className="info-value">{selectedFuel.invoice}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
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

export default FuelPage;
