import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as maintenanceAlertService from '../services/maintenanceAlertService';
import { MAINTENANCE_TYPES } from '../services/maintenanceRuleService';
import Sidebar from '../components/common/Sidebar';
import ProfileModal from '../components/common/ProfileModal';
import './MaintenanceAlertsPage.css';

const VEHICLE_TYPES = [
  { value: 'Truck', label: 'Trucks' },
  { value: 'Trailer', label: 'Trailers' },
];

const MaintenanceAlertsPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [alertsData, setAlertsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('');
  const [maintenanceTypeFilter, setMaintenanceTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await maintenanceAlertService.getAllAlerts({
        vehicleType: vehicleTypeFilter || undefined,
        maintenanceType: maintenanceTypeFilter || undefined,
        status: statusFilter || undefined,
      });
      if (response.success) {
        setAlertsData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load maintenance alerts');
    } finally {
      setLoading(false);
    }
  }, [vehicleTypeFilter, maintenanceTypeFilter, statusFilter]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'A';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'OVERDUE': return 'status-overdue';
      case 'DUE_SOON': return 'status-due-soon';
      default: return 'status-ok';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return 'priority-low';
    }
  };

  const getTypeLabel = (type) => {
    const found = MAINTENANCE_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Maintenance Alerts</h1>
            <p>Monitor fleet maintenance status and upcoming service needs</p>
          </div>
          <div className="header-actions">
            {alertsData?.summary && (
              <div className="admin-stats-header">
                <div className="stat-item stat-danger">
                  <span className="stat-value">{alertsData.summary.overdue}</span>
                  <span className="stat-label">Overdue</span>
                </div>
                <div className="stat-item stat-warning">
                  <span className="stat-value">{alertsData.summary.dueSoon}</span>
                  <span className="stat-label">Due Soon</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{alertsData.summary.total}</span>
                  <span className="stat-label">Total Alerts</span>
                </div>
                <div className="stat-item stat-cost">
                  <span className="stat-value">€{alertsData.summary.estimatedTotalCost?.toLocaleString() || 0}</span>
                  <span className="stat-label">Est. Cost</span>
                </div>
              </div>
            )}
            <div className="user-menu" onClick={() => setIsProfileModalOpen(true)}>
              <div className="user-avatar">
                {getInitials(currentUser?.firstName, currentUser?.lastName)}
              </div>
              <div className="user-info">
                <div className="user-name">{currentUser?.firstName} {currentUser?.lastName}</div>
                <div className="user-role">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-body">
          <div className="alerts-section">
            <div className="section-header">
              <div className="section-filters">
                <select
                  value={vehicleTypeFilter}
                  onChange={(e) => setVehicleTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Vehicles</option>
                  {VEHICLE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={maintenanceTypeFilter}
                  onChange={(e) => setMaintenanceTypeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="DUE_SOON">Due Soon</option>
                </select>
              </div>
              <button className="btn btn-md btn-ghost" onClick={fetchAlerts}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="alerts-loading">
                <div className="spinner"></div>
                <p>Checking maintenance status...</p>
              </div>
            ) : error ? (
              <div className="alerts-error">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p>{error}</p>
                <button className="btn btn-sm btn-primary" onClick={fetchAlerts}>Try Again</button>
              </div>
            ) : alertsData?.alerts?.length === 0 ? (
              <div className="alerts-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <h3>All Clear!</h3>
                <p>No maintenance alerts at this time. Your fleet is in good condition.</p>
              </div>
            ) : (
              <>
                {/* High Priority Section */}
                {alertsData?.grouped?.high?.length > 0 && (
                  <div className="alerts-priority-section">
                    <h3 className="priority-header priority-high">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      Overdue ({alertsData.grouped.high.length})
                    </h3>
                    <div className="alerts-grid">
                      {alertsData.grouped.high.map((alert, idx) => (
                        <div 
                          key={`high-${idx}`} 
                          className={`alert-card ${getStatusClass(alert.status)} ${getPriorityClass(alert.priority)}`}
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <div className="alert-header">
                            <div className="alert-vehicle">
                              <span className="plate-number">{alert.plateNumber}</span>
                              <span className="vehicle-type">{alert.vehicleType}</span>
                            </div>
                            <span className={`status-badge ${getStatusClass(alert.status)}`}>
                              {alert.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="alert-type">
                            {getTypeLabel(alert.maintenanceType)}
                          </div>
                          <div className="alert-details">
                            {alert.kmOverdue && (
                              <div className="detail-item overdue">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span>{alert.kmOverdue.toLocaleString()} km overdue</span>
                              </div>
                            )}
                            {alert.monthsOverdue && (
                              <div className="detail-item overdue">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span>{alert.monthsOverdue} months overdue</span>
                              </div>
                            )}
                            {alert.estimatedCost && (
                              <div className="detail-item cost">
                                ~€{alert.estimatedCost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medium Priority Section */}
                {alertsData?.grouped?.medium?.length > 0 && (
                  <div className="alerts-priority-section">
                    <h3 className="priority-header priority-medium">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Due Soon ({alertsData.grouped.medium.length})
                    </h3>
                    <div className="alerts-grid">
                      {alertsData.grouped.medium.map((alert, idx) => (
                        <div 
                          key={`medium-${idx}`} 
                          className={`alert-card ${getStatusClass(alert.status)} ${getPriorityClass(alert.priority)}`}
                          onClick={() => setSelectedAlert(alert)}
                        >
                          <div className="alert-header">
                            <div className="alert-vehicle">
                              <span className="plate-number">{alert.plateNumber}</span>
                              <span className="vehicle-type">{alert.vehicleType}</span>
                            </div>
                            <span className={`status-badge ${getStatusClass(alert.status)}`}>
                              {alert.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="alert-type">
                            {getTypeLabel(alert.maintenanceType)}
                          </div>
                          <div className="alert-details">
                            {alert.kmRemaining != null && (
                              <div className="detail-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                  <circle cx="12" cy="10" r="3"/>
                                </svg>
                                <span>{alert.kmRemaining.toLocaleString()} km remaining</span>
                              </div>
                            )}
                            {alert.monthsRemaining != null && (
                              <div className="detail-item">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                  <line x1="16" y1="2" x2="16" y2="6"/>
                                  <line x1="8" y1="2" x2="8" y2="6"/>
                                  <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                <span>{Math.round(alert.monthsRemaining)} months remaining</span>
                              </div>
                            )}
                            {alert.estimatedCost && (
                              <div className="detail-item cost">
                                ~€{alert.estimatedCost.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="modal-content alert-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedAlert(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="alert-modal-header">
              <div className={`alert-status-icon ${getStatusClass(selectedAlert.status)}`}>
                {selectedAlert.status === 'OVERDUE' ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                )}
              </div>
              <div>
                <h2>{selectedAlert.plateNumber}</h2>
                <p>{selectedAlert.vehicleInfo}</p>
              </div>
              <span className={`status-badge large ${getStatusClass(selectedAlert.status)}`}>
                {selectedAlert.status.replace('_', ' ')}
              </span>
            </div>

            <div className="alert-modal-body">
              <div className="info-section">
                <h3>Maintenance Required</h3>
                <div className="maintenance-type-display">
                  {getTypeLabel(selectedAlert.maintenanceType)}
                </div>
                <p className="maintenance-description">{selectedAlert.description}</p>
              </div>

              <div className="info-section">
                <h3>Mileage Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Current Mileage</span>
                    <span className="info-value">{selectedAlert.currentKm?.toLocaleString()} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Maintenance</span>
                    <span className="info-value">{selectedAlert.lastMaintenanceKm?.toLocaleString() || 'N/A'} km</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Km Since Last</span>
                    <span className="info-value">{selectedAlert.kmSinceLastMaintenance?.toLocaleString()} km</span>
                  </div>
                  {selectedAlert.kmOverdue ? (
                    <div className="info-item highlight-danger">
                      <span className="info-label">Km Overdue</span>
                      <span className="info-value">{selectedAlert.kmOverdue.toLocaleString()} km</span>
                    </div>
                  ) : selectedAlert.kmRemaining != null && (
                    <div className="info-item">
                      <span className="info-label">Km Remaining</span>
                      <span className="info-value">{selectedAlert.kmRemaining.toLocaleString()} km</span>
                    </div>
                  )}
                </div>
              </div>

              {(selectedAlert.lastMaintenanceDate || selectedAlert.nextMaintenanceDate) && (
                <div className="info-section">
                  <h3>Schedule</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Last Maintenance Date</span>
                      <span className="info-value">{formatDate(selectedAlert.lastMaintenanceDate)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Next Due Date</span>
                      <span className="info-value">{formatDate(selectedAlert.nextMaintenanceDate)}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedAlert.estimatedCost && (
                <div className="info-section">
                  <h3>Estimated Cost</h3>
                  <div className="cost-display">
                    €{selectedAlert.estimatedCost.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={currentUser}
      />
    </div>
  );
};

export default MaintenanceAlertsPage;
