import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import './FuelStatistics.css';

const FuelStatistics = ({ statistics }) =>{
  const [isExpanded, setIsExpanded] = useState(true);

  if (!statistics) return null;

  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  const formatNumber = (value) => value.toLocaleString();

  const fuelTypeColors = {
    'DIESEL': '#3b82f6',
    'GASOLINE': '#f59e0b',
    'ELECTRIC': '#10b981',
    'HYBRID': '#a855f7',
  };

  // Get fuel type statistics
  const fuelTypeData = statistics.fuelTypeDistribution 
    ? Object.entries(statistics.fuelTypeDistribution).map(([type, count]) => ({
        name: type.charAt(0) + type.slice(1).toLowerCase(),
        value: count,
        color: fuelTypeColors[type] || '#6b7280'
      })).filter(item => item.value > 0)
    : [];

  return (
    <div className="fuel-statistics">
      <div className="statistics-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-left">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="20" x2="12" y2="10"/>
            <line x1="18" y1="20" x2="18" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="16"/>
          </svg>
          <h3>Fuel Statistics</h3>
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
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{statistics.totalRecords || 0}</div>
                <div className="stat-label">Total Records</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(statistics.totalCost || 0)}</div>
                <div className="stat-label">Total Cost</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatNumber(statistics.totalVolume || 0)} L</div>
                <div className="stat-label">Total Volume</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(statistics.averageUnitCost || 0)}/L</div>
                <div className="stat-label">Avg Unit Cost</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(94, 234, 212, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{(statistics.averageConsumption || 0).toFixed(1)} L</div>
                <div className="stat-label">Avg Consumption (L/100km)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(statistics.costPerKm || 0)}/km</div>
                <div className="stat-label">Cost per KM</div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            {fuelTypeData.length > 0 && (
              <div className="chart-card">
                <h4>Fuel Type Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={fuelTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {fuelTypeData.map((entry, index) => (
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

export default FuelStatistics;
