import './TirePositionDiagram.css';

const TirePositionDiagram = ({ vehicleType, tires = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return '#10b981';
      case 'GOOD': return '#14b8a6';
      case 'WORN': return '#f59e0b';
      case 'TO_REPLACE': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTireAtPosition = (position) => {
    return tires.find(t => t.position === position);
  };

  const renderTire = (x, y, position, label) => {
    const tire = getTireAtPosition(position);
    const color = tire ? getStatusColor(tire.status) : '#374151';
    const isEmpty = !tire;

    return (
      <g key={position}>
        <circle
          cx={x}
          cy={y}
          r="15"
          fill={isEmpty ? 'transparent' : color}
          stroke={color}
          strokeWidth="2"
          strokeDasharray={isEmpty ? '4 2' : '0'}
          opacity={isEmpty ? 0.3 : 1}
        />
        {!isEmpty && (
          <>
            <circle cx={x} cy={y} r="8" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <circle cx={x} cy={y} r="4" fill="none" stroke="white" strokeWidth="1" opacity="0.4" />
          </>
        )}
        <text
          x={x}
          y={y + 30}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize="10"
          fontWeight="500"
        >
          {label}
        </text>
      </g>
    );
  };

  if (vehicleType === 'Truck') {
    return (
      <div className="tire-position-diagram">
        <h4>Tire Positions</h4>
        <svg viewBox="0 0 300 200" className="diagram-svg">
          {/* Truck Body */}
          <rect x="50" y="60" width="200" height="80" rx="8" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="2" />
          
          {/* Truck Cab */}
          <path
            d="M 50 80 L 30 80 L 30 120 L 50 120"
            fill="var(--bg-elevated)"
            stroke="var(--border-default)"
            strokeWidth="2"
          />
          
          {/* Front Tires */}
          {renderTire(40, 60, 'FRONT_LEFT', 'FL')}
          {renderTire(40, 140, 'FRONT_RIGHT', 'FR')}
          
          {/* Rear Tires */}
          {renderTire(220, 60, 'REAR_LEFT', 'RL')}
          {renderTire(220, 140, 'REAR_RIGHT', 'RR')}
          
          {/* Spare (if exists) */}
          {getTireAtPosition('SPARE') && renderTire(150, 30, 'SPARE', 'SP')}
        </svg>
        <div className="diagram-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#10b981' }}></div>
            <span>New</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#14b8a6' }}></div>
            <span>Good</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#f59e0b' }}></div>
            <span>Worn</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: '#ef4444' }}></div>
            <span>Replace</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot empty"></div>
            <span>Empty</span>
          </div>
        </div>
      </div>
    );
  }

  // Trailer
  return (
    <div className="tire-position-diagram">
      <h4>Tire Positions</h4>
      <svg viewBox="0 0 300 200" className="diagram-svg">
        {/* Trailer Body */}
        <rect x="40" y="60" width="220" height="80" rx="8" fill="var(--bg-elevated)" stroke="var(--border-default)" strokeWidth="2" />
        
        {/* Hitch */}
        <path
          d="M 40 100 L 20 100"
          stroke="var(--border-default)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="20" cy="100" r="5" fill="var(--border-default)" />
        
        {/* Rear Tires */}
        {renderTire(220, 60, 'REAR_LEFT', 'RL')}
        {renderTire(220, 140, 'REAR_RIGHT', 'RR')}
        
        {/* Spare (if exists) */}
        {getTireAtPosition('SPARE') && renderTire(150, 30, 'SPARE', 'SP')}
      </svg>
      <div className="diagram-legend">
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#10b981' }}></div>
          <span>New</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#14b8a6' }}></div>
          <span>Good</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#f59e0b' }}></div>
          <span>Worn</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot" style={{ background: '#ef4444' }}></div>
          <span>Replace</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot empty"></div>
          <span>Empty</span>
        </div>
      </div>
    </div>
  );
};

export default TirePositionDiagram;
