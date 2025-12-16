import { useState, useEffect } from 'react';
import './DriverFormModal.css';

const DriverFormModal = ({ isOpen, onClose, onSubmit, driver, loading }) => {
  const getInitialFormData = () => {
    if (driver) {
      return {
        username: driver.username || '',
        email: driver.email || '',
        password: '',
        firstName: driver.firstName || '',
        lastName: driver.lastName || '',
        phone: driver.phone || '',
        license: driver.license || '',
        hireDate: driver.hireDate ? driver.hireDate.split('T')[0] : '',
        active: driver.active ?? true,
      };
    } else {
      return {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        license: '',
        hireDate: new Date().toISOString().split('T')[0],
        active: true,
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, driver?._id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!driver && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (!driver && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    if (!formData.license.trim()) {
      newErrors.license = 'License is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = { ...formData };
      
      // Remove password for updates if empty
      if (driver && !submitData.password) {
        delete submitData.password;
      }
      
      // Remove empty optional fields
      if (!submitData.phone) delete submitData.phone;
      if (!submitData.hireDate) delete submitData.hireDate;

      onSubmit(submitData);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div className="modal-content driver-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>{driver ? 'Edit Driver' : 'Add New Driver'}</h2>

        <form onSubmit={handleSubmit} className="driver-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
                disabled={loading}
                placeholder="John"
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
                disabled={loading}
                placeholder="Doe"
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                disabled={loading}
                placeholder="johndoe"
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                disabled={loading}
                placeholder="john@example.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          {!driver && (
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                  placeholder="Minimum 6 characters"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="license">License Number *</label>
              <input
                type="text"
                id="license"
                name="license"
                value={formData.license}
                onChange={handleChange}
                className={errors.license ? 'error' : ''}
                disabled={loading}
                placeholder="DL-123456"
              />
              {errors.license && <span className="error-message">{errors.license}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hireDate">Hire Date</label>
              <input
                type="date"
                id="hireDate"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {driver && (
              <div className="form-group">
                <label htmlFor="active">Status</label>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="active" className="checkbox-label">
                    {formData.active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-md btn-ghost" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-md btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : driver ? 'Update Driver' : 'Create Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverFormModal;
