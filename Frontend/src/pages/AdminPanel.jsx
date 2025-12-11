import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';
import storage from '../utils/storage';
import * as adminService from '../services/adminService';
import ProfileModal from '../components/common/ProfileModal';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, user: null });
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.getAllUsers();
      if (response.success) {
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clear();
    dispatch(logout());
    navigate('/login');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleActivate = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await adminService.activateUser(userId);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, active: true } : u));
        showToast('User activated successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to activate user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await adminService.deactivateUser(userId);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, active: false } : u));
        showToast('User deactivated successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to deactivate user', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, user: null });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    try {
      const response = await adminService.updateUserRole(userId, newRole);
      if (response.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        showToast(`User role updated to ${newRole}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update role', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, user: null });
    }
  };

  const handleDelete = async (userId) => {
    setActionLoading(userId);
    try {
      const response = await adminService.deleteUser(userId);
      if (response.success) {
        setUsers(users.filter(u => u._id !== userId));
        showToast('User deleted successfully');
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, action: null, user: null });
    }
  };

  const openConfirmDialog = (action, user) => {
    setConfirmDialog({ isOpen: true, action, user });
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
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="3" width="15" height="13"/>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/>
            <circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span>TruckTrack</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Home
          </Link>

          <Link to="/dashboard" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </Link>
          
          <Link to="/admin" className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Admin Panel
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-title">
            <h1>User Management</h1>
            <p>Manage all users and their permissions</p>
          </div>
          <div className="header-actions">
            <div className="admin-stats-header">
              <div className="stat-item">
                <span className="stat-value">{users.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{users.filter(u => u.active).length}</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{users.filter(u => !u.active).length}</span>
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
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-sm btn-ghost" onClick={fetchUsers}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
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
                      <td><div className="skeleton skeleton-badge"></div></td>
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
              <h3>Failed to Load Users</h3>
              <p>{error}</p>
              <button className="btn btn-md btn-primary" onClick={fetchUsers}>
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <h3>{searchTerm ? 'No Users Found' : 'No Users Yet'}</h3>
              <p>{searchTerm ? 'Try adjusting your search' : 'Users will appear here once registered'}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Hire Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-cell" onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer' }}>
                          <div className="user-avatar-small">
                            {getInitials(user.firstName, user.lastName)}
                          </div>
                          <div>
                            <div className="user-name">{user.firstName} {user.lastName}</div>
                            <div className="user-username">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role?.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{formatDate(user.hireDate)}</td>
                      <td>
                        <div className="action-buttons">
                          {user._id !== currentUser?._id && (
                            <>
                              {user.active ? (
                                <button
                                  className="btn-icon btn-icon-danger"
                                  onClick={() => openConfirmDialog('deactivate', user)}
                                  disabled={actionLoading === user._id}
                                  title="Deactivate user"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                  </svg>
                                </button>
                              ) : (
                                <button
                                  className="btn-icon btn-icon-success"
                                  onClick={() => handleActivate(user._id)}
                                  disabled={actionLoading === user._id}
                                  title="Activate user"
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                  </svg>
                                </button>
                              )}
                              <button
                                className="btn-icon btn-icon-primary"
                                onClick={() => openConfirmDialog('role', user)}
                                disabled={actionLoading === user._id}
                                title="Change role"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                  <circle cx="9" cy="7" r="4"/>
                                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                              </button>
                              <button
                                className="btn-icon btn-icon-danger"
                                onClick={() => openConfirmDialog('delete', user)}
                                disabled={actionLoading === user._id}
                                title="Delete user"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                              </button>
                            </>
                          )}
                          {actionLoading === user._id && (
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
        </div>
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmDialog({ isOpen: false, action: null, user: null })}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>
              {confirmDialog.action === 'delete' && 'Delete User'}
              {confirmDialog.action === 'deactivate' && 'Deactivate User'}
              {confirmDialog.action === 'role' && 'Change User Role'}
            </h3>
            <p>
              {confirmDialog.action === 'delete' && `Are you sure you want to delete ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}? This action cannot be undone.`}
              {confirmDialog.action === 'deactivate' && `Are you sure you want to deactivate ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}?`}
              {confirmDialog.action === 'role' && `Change ${confirmDialog.user?.firstName} ${confirmDialog.user?.lastName}'s role to ${confirmDialog.user?.role === 'ADMIN' ? 'DRIVER' : 'ADMIN'}?`}
            </p>
            <div className="dialog-actions">
              <button
                className="btn btn-md btn-ghost"
                onClick={() => setConfirmDialog({ isOpen: false, action: null, user: null })}
              >
                Cancel
              </button>
              <button
                className={`btn btn-md ${confirmDialog.action === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => {
                  if (confirmDialog.action === 'delete') {
                    handleDelete(confirmDialog.user._id);
                  } else if (confirmDialog.action === 'deactivate') {
                    handleDeactivate(confirmDialog.user._id);
                  } else if (confirmDialog.action === 'role') {
                    handleRoleChange(confirmDialog.user._id, confirmDialog.user.role === 'ADMIN' ? 'DRIVER' : 'ADMIN');
                  }
                }}
              >
                {confirmDialog.action === 'delete' && 'Delete'}
                {confirmDialog.action === 'deactivate' && 'Deactivate'}
                {confirmDialog.action === 'role' && 'Change Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content user-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedUser(null)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className="profile-header">
              <div className="profile-avatar">
                {getInitials(selectedUser.firstName, selectedUser.lastName)}
              </div>
              <div className="profile-header-info">
                <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                <p className="profile-username">@{selectedUser.username}</p>
                <span className={`role-badge ${selectedUser.role?.toLowerCase()}`}>
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="profile-body">
              <div className="profile-section">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{selectedUser.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{selectedUser.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {selectedUser.role === 'DRIVER' && selectedUser.license && (
                <div className="profile-section">
                  <h3>Driver Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">License Number</span>
                      <span className="info-value">{selectedUser.license}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="profile-section">
                <h3>Account Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Hire Date</span>
                    <span className="info-value">{formatDate(selectedUser.hireDate)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Account Status</span>
                    <span className={`status-badge ${selectedUser.active ? 'active' : 'inactive'}`}>
                      {selectedUser.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Member Since</span>
                    <span className="info-value">{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>
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

export default AdminPanel;
