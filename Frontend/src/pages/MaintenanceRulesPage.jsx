import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as maintenanceRuleService from '../services/maintenanceRuleService';
import { MAINTENANCE_TYPES } from '../services/maintenanceRuleService';
import Sidebar from '../components/common/Sidebar';
import ProfileModal from '../components/common/ProfileModal';
import MaintenanceRuleFormModal from '../components/common/MaintenanceRuleFormModal';
import './MaintenanceRulesPage.css';

const MaintenanceRulesPage = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [stats, setStats] = useState(null);
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await maintenanceRuleService.getAllRules({
        page: currentPage,
        limit: 10,
        type: typeFilter || undefined,
        active: activeFilter || undefined,
      });
      if (response.success) {
        setRules(response.data.rules);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load maintenance rules');
    } finally {
      setLoading(false);
    }
  }, [currentPage, typeFilter, activeFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await maintenanceRuleService.getRuleStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchStats();
  }, [fetchRules, fetchStats]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleCreateRule = async (ruleData) => {
    setFormLoading(true);
    try {
      const response = await maintenanceRuleService.createRule(ruleData);
      if (response.success) {
        showToast('Maintenance rule created successfully!');
        setIsFormModalOpen(false);
        fetchRules();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to create rule', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateRule = async (ruleData) => {
    setFormLoading(true);
    try {
      const response = await maintenanceRuleService.updateRule(selectedRule._id, ruleData);
      if (response.success) {
        showToast('Maintenance rule updated successfully!');
        setIsFormModalOpen(false);
        setSelectedRule(null);
        fetchRules();
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update rule', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      const response = await maintenanceRuleService.toggleActive(rule._id);
      if (response.success) {
        setRules(rules.map(r => r._id === rule._id ? response.data.rule : r));
        showToast(`Rule ${response.data.rule.active ? 'activated' : 'deactivated'} successfully!`);
        fetchStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDeleteRule = async () => {
    try {
      await maintenanceRuleService.deleteRule(deleteConfirm._id);
      showToast('Maintenance rule deleted successfully!');
      setDeleteConfirm(null);
      fetchRules();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Failed to delete rule', 'error');
    }
  };

  const openEditModal = (rule) => {
    setSelectedRule(rule);
    setIsFormModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedRule(null);
    setIsFormModalOpen(true);
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'A';
  };

  const getTypeLabel = (type) => {
    const found = MAINTENANCE_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'TIRE':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>;
      case 'OIL_CHANGE':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 2v2M14 2v2M12 8c-3 0-6 2-6 6v4c0 2 2 4 6 4s6-2 6-4v-4c0-4-3-6-6-6z"/></svg>;
      case 'CHECKUP':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
      case 'BRAKES':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
      case 'FILTERS':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>;
      case 'BELT':
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4h8M6 8h12M4 12h16M6 16h12M8 20h8"/></svg>;
      default:
        return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Maintenance Rules</h1>
            <p>Configure maintenance schedules for your fleet</p>
          </div>
          <div className="header-actions">
            {stats && (
              <div className="admin-stats-header">
                <div className="stat-item">
                  <span className="stat-value">{stats.total}</span>
                  <span className="stat-label">Total Rules</span>
                </div>
                <div className="stat-item stat-success">
                  <span className="stat-value">{stats.active}</span>
                  <span className="stat-label">Active</span>
                </div>
                <div className="stat-item stat-muted">
                  <span className="stat-value">{stats.inactive}</span>
                  <span className="stat-label">Inactive</span>
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
          <div className="rules-section">
            <div className="section-header">
              <div className="section-filters">
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  {MAINTENANCE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={activeFilter}
                  onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <button className="btn btn-md btn-primary" onClick={openCreateModal}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Rule
              </button>
            </div>

            {loading ? (
              <div className="rules-loading">
                <div className="spinner"></div>
                <p>Loading rules...</p>
              </div>
            ) : error ? (
              <div className="rules-error">
                <p>{error}</p>
                <button className="btn btn-sm btn-primary" onClick={fetchRules}>Try Again</button>
              </div>
            ) : rules.length === 0 ? (
              <div className="rules-empty">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <h3>No Maintenance Rules</h3>
                <p>Create your first maintenance rule to get started</p>
                <button className="btn btn-md btn-primary" onClick={openCreateModal}>Add Rule</button>
              </div>
            ) : (
              <div className="rules-grid">
                {rules.map(rule => (
                  <div key={rule._id} className={`rule-card ${!rule.active ? 'inactive' : ''}`}>
                    <div className="rule-header">
                      <div className={`rule-type-icon type-${rule.type.toLowerCase()}`}>
                        {getTypeIcon(rule.type)}
                      </div>
                      <div className="rule-title">
                        <h3>{getTypeLabel(rule.type)}</h3>
                        <span className={`status-badge ${rule.active ? 'status-active' : 'status-inactive'}`}>
                          {rule.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="rule-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleToggleActive(rule)}
                          title={rule.active ? 'Deactivate' : 'Activate'}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {rule.active ? (
                              <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
                            ) : (
                              <>
                                <circle cx="12" cy="12" r="10"/>
                                <polygon points="10 8 16 12 10 16 10 8"/>
                              </>
                            )}
                          </svg>
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => openEditModal(rule)}
                          title="Edit"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="btn-icon btn-icon-danger"
                          onClick={() => setDeleteConfirm(rule)}
                          title="Delete"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="rule-description">{rule.description}</p>
                    <div className="rule-intervals">
                      {rule.kmInterval && (
                        <div className="interval-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          <span>Every {rule.kmInterval.toLocaleString()} km</span>
                        </div>
                      )}
                      {rule.monthInterval && (
                        <div className="interval-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          <span>Every {rule.monthInterval} month{rule.monthInterval > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {rule.estimatedCost && (
                        <div className="interval-item cost">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                          </svg>
                          <span>~€{rule.estimatedCost.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && pagination && pagination.totalPages > 1 && (
              <div className="pagination">
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

      {/* Form Modal */}
      <MaintenanceRuleFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedRule(null); }}
        onSubmit={selectedRule ? handleUpdateRule : handleCreateRule}
        rule={selectedRule}
        loading={formLoading}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Maintenance Rule</h3>
            <p>Are you sure you want to delete the <strong>{getTypeLabel(deleteConfirm.type)}</strong> rule?</p>
            <p className="confirm-warning">This action cannot be undone.</p>
            <div className="dialog-actions">
              <button className="btn btn-md btn-ghost" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-md btn-danger" onClick={handleDeleteRule}>
                Delete
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

export default MaintenanceRulesPage;
