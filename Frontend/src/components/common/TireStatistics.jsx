import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import './TireStatistics.css';

const TireStatistics = ({ tires }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate statistics
  const stats = {
    total: tires.length,
    new: tires.filter(t => t.status === 'NEW').length,
    good: tires.filter(t => t.status === 'GOOD').length,
    worn: tires.filter(t => t.status === 'WORN').length,
    toReplace: tires.filter(t => t.status === 'TO_REPLACE').length,
    trucks: tires.filter(t => t.vehicleType === 'Truck').length,
    trailers: tires.filter(t => t.vehicleType === 'Trailer').length,
  };

  // Calculate average wear
  const avgWear = tires.length > 0
    ? Math.round(tires.reduce((sum, tire) => {
        const kmTraveled = tire.kmTraveled || 0;
        const wear = Math.min((kmTraveled / 80000) * 100, 100);
        return sum + wear;
      }, 0) / tires.length)
    : 0;

  // Prepare chart data
  const statusData = [
    { name: 'New', value: stats.new, color: '#10b981' },
    { name: 'Good', value: stats.good, color: '#14b8a6' },
    { name: 'Worn', value: stats.worn, color: '#f59e0b' },
    { name: 'To Replace', value: stats.toReplace, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const vehicleData = [
    { name: 'Trucks', value: stats.trucks, color: '#3b82f6' },
    { name: 'Trailers', value: stats.trailers, color: '#a855f7' },
  ].filter(item => item.value > 0);

  if (tires.length === 0) return null;

  return (
    <div className="tire-statistics">
      <div className="statistics-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
          <h3>Fleet Statistics</h3>
        </div>
        <button className="expand-toggle" type="button">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="statistics-body">
          <div className="stats-grid">
            {/* Quick Stats */}
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Tires</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{avgWear}%</div>
                <div className="stat-label">Avg. Wear</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.toReplace}</div>
                <div className="stat-label">Need Replacement</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.new + stats.good}</div>
                <div className="stat-label">Healthy Tires</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {statusData.length > 0 && (
              <div className="chart-card">
                <h4>Status Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {vehicleData.length > 0 && (
              <div className="chart-card">
                <h4>Vehicle Type</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vehicleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {vehicleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TireStatistics;
