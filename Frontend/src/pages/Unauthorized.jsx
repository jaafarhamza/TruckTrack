import { Link } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1 className="error-code">403</h1>
        <h2 className="error-title">Access Denied</h2>
        <p className="error-message">
          You don't have permission to access this page.
        </p>
        <p className="error-description">
          Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="action-buttons">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/" className="btn btn-secondary">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
