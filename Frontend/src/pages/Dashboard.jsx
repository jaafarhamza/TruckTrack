import { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import ProfileModal from '../components/common/ProfileModal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
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
            <h1>Dashboard</h1>
            <p>Welcome back! Here&apos;s your overview.</p>
          </div>
          <div className="header-actions">
            <div className="user-menu" onClick={() => setIsProfileModalOpen(true)}>
              <div className="user-avatar">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="user-info">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.role}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Body */}
        <div className="dashboard-body">
          {/* Welcome Card */}
          <div className="welcome-card">
            <h2>Hello, {user?.firstName}! 👋</h2>
            <p>Ready to manage your fleet? Let&apos;s get started.</p>
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={user}
      />
    </div>
  );
};

export default Dashboard;
