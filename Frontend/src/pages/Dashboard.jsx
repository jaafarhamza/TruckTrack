import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import * as statisticsService from '../services/statisticsService';
import Sidebar from '../components/common/Sidebar';
import ProfileModal from '../components/common/ProfileModal';
import './Dashboard.css';

const COLORS = ['#5eead4', '#22d3ee', '#a78bfa', '#f472b6', '#fbbf24', '#34d399'];

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [tripStats, setTripStats] = useState(null);
  const [fuelStats, setFuelStats] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashboard, trips, fuel] = await Promise.all([
        statisticsService.getDashboardSummary(),
        statisticsService.getTripStatistics(),
        statisticsService.getFuelStatistics(),
      ]);

      if (dashboard.success) setDashboardData(dashboard.data);
      if (trips.success) setTripStats(trips.data);
      if (fuel.success) setFuelStats(fuel.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchData();
    }
  }, [user, fetchData]);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  // Prepare chart data
  const tripStatusData = tripStats ? [
    { name: 'Completed', value: tripStats.byStatus?.COMPLETED || 0 },
    { name: 'In Progress', value: tripStats.byStatus?.IN_PROGRESS || 0 },
    { name: 'Planned', value: tripStats.byStatus?.PLANNED || 0 },
    { name: 'Cancelled', value: tripStats.byStatus?.CANCELLED || 0 },
  ].filter(d => d.value > 0) : [];

  const tripMonthData = tripStats?.byMonth ? statisticsService.formatMonthData(tripStats.byMonth) : [];
  const fuelMonthData = fuelStats?.byMonth ? statisticsService.formatMonthData(fuelStats.byMonth) : [];

  // Admin Dashboard
  if (user?.role === 'ADMIN') {
    return (
      <div className="dashboard">
        <Sidebar />
        <main className="main-content">
          <header className="dashboard-header">
            <div className="header-title">
              <h1>Dashboard</h1>
              <p>Fleet performance overview and analytics</p>
            </div>
            <div className="header-actions">
              <div className="user-menu" onClick={() => setIsProfileModalOpen(true)}>
                <div className="user-avatar">
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.firstName} {user?.lastName}</div>
                  <div className="user-role">Administrator</div>
                </div>
              </div>
            </div>
          </header>

          <div className="dashboard-body">
            {loading ? (
              <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon trucks">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 3h15v13H1z"/>
                        <path d="M16 8h4l3 3v5h-7V8z"/>
                        <circle cx="5.5" cy="18.5" r="2.5"/>
                        <circle cx="18.5" cy="18.5" r="2.5"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">{dashboardData?.fleet?.totalVehicles || 0}</span>
                      <span className="stat-label">Total Vehicles</span>
                    </div>
                    <div className="stat-breakdown">
                      <span className="available">{dashboardData?.fleet?.trucksAvailable || 0} available</span>
                      <span className="on-trip">{dashboardData?.fleet?.trucksOnTrip || 0} on trip</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon trips">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="6" cy="6" r="3"/>
                        <circle cx="18" cy="18" r="3"/>
                        <path d="M6 9v4c0 1.1.9 2 2 2h4"/>
                        <path d="M14 15l4 4"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">{dashboardData?.trips?.completed || 0}</span>
                      <span className="stat-label">Completed Trips</span>
                    </div>
                    <div className="stat-breakdown">
                      <span>{dashboardData?.trips?.inProgress || 0} in progress</span>
                      <span>{(dashboardData?.trips?.totalDistance || 0).toLocaleString()} km</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon fuel">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 22V7l7-5 7 5v15"/>
                        <path d="M17 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/>
                        <path d="M21 14v4"/>
                        <rect x="5" y="12" width="8" height="6"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">€{(dashboardData?.fuel?.totalCost || 0).toLocaleString()}</span>
                      <span className="stat-label">Fuel Costs</span>
                    </div>
                    <div className="stat-breakdown">
                      <span>{(dashboardData?.fuel?.totalVolume || 0).toLocaleString()} L total</span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon maintenance">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82V15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.88 1 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-value">€{(dashboardData?.maintenance?.totalCost || 0).toLocaleString()}</span>
                      <span className="stat-label">Maintenance</span>
                    </div>
                    <div className="stat-breakdown">
                      <span>{dashboardData?.maintenance?.totalRecords || 0} records</span>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="charts-row">
                  {/* Trip Status Pie Chart */}
                  <div className="chart-card">
                    <h3>Trip Status Distribution</h3>
                    {tripStatusData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={tripStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {tripStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No trip data available</div>
                    )}
                  </div>

                  {/* Trips by Month Bar Chart */}
                  <div className="chart-card wide">
                    <h3>Trips by Month</h3>
                    {tripMonthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={tripMonthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="monthName" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Bar dataKey="completed" name="Completed" fill="#5eead4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="count" name="Total" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No monthly data available</div>
                    )}
                  </div>
                </div>

                {/* Second Charts Row */}
                <div className="charts-row">
                  {/* Fuel Cost Trend */}
                  <div className="chart-card wide">
                    <h3>Fuel Costs Trend</h3>
                    {fuelMonthData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={fuelMonthData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="monthName" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <Tooltip 
                            contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value) => [`€${value.toLocaleString()}`, 'Cost']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="cost" 
                            stroke="#f472b6" 
                            strokeWidth={3}
                            dot={{ fill: '#f472b6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="no-data">No fuel data available</div>
                    )}
                  </div>

                  {/* Top Drivers */}
                  <div className="chart-card">
                    <h3>Top Drivers</h3>
                    {tripStats?.topDrivers?.length > 0 ? (
                      <div className="top-drivers-list">
                        {tripStats.topDrivers.map((driver, idx) => (
                          <div key={driver.driverId} className="driver-item">
                            <span className="driver-rank">{idx + 1}</span>
                            <div className="driver-info">
                              <span className="driver-name">{driver.driverName}</span>
                              <span className="driver-stats">
                                {driver.tripCount} trips • {(driver.totalDistance || 0).toLocaleString()} km
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-data">No driver data available</div>
                    )}
                  </div>
                </div>

                {/* Top Routes */}
                {tripStats?.topRoutes?.length > 0 && (
                  <div className="routes-section">
                    <h3>Popular Routes</h3>
                    <div className="routes-grid">
                      {tripStats.topRoutes.map((route, idx) => (
                        <div key={idx} className="route-card">
                          <div className="route-path">
                            <span className="origin">{route.origin}</span>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                            <span className="destination">{route.destination}</span>
                          </div>
                          <div className="route-stats">
                            <span>{route.count} trips</span>
                            <span>~{route.avgDistance.toLocaleString()} km avg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <ProfileModal 
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          initialUser={user}
        />
      </div>
    );
  }

  // Driver Dashboard
  return (
    <div className="dashboard">
      <Sidebar />
      <main className="main-content">
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
        <div className="dashboard-body">
          <div className="welcome-card">
            <h2>Hello, {user?.firstName}! 👋</h2>
            <p>Ready to manage your trips? Check your assigned trips.</p>
          </div>
        </div>
      </main>
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialUser={user}
      />
    </div>
  );
};

export default Dashboard;
