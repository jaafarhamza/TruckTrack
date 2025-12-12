import { useState, useEffect } from 'react';
import './TruckFormModal.css';

const VEHICLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  ON_TRIP: 'ON_TRIP',
  UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
  OUT_OF_SERVICE: 'OUT_OF_SERVICE',
};

const TruckFormModal = ({ isOpen, onClose, onSubmit, truck, loading }) => {
  // Helper function to get initial form data
  const getInitialFormData = () => {
    if (truck) {
      // populate form with truck data
      return {
        plateNumber: truck.plateNumber || '',
        brand: truck.brand || '',
        model: truck.model || '',
        year: truck.year || new Date().getFullYear(),
        mileage: truck.mileage || 0,
        status: truck.status || 'AVAILABLE',
        loadCapacity: truck.loadCapacity || '',
        averageConsumption: truck.averageConsumption || '',
        purchaseDate: truck.purchaseDate ? truck.purchaseDate.split('T')[0] : '',
        purchasePrice: truck.purchasePrice || '',
        color: truck.color || '',
        serialNumber: truck.serialNumber || '',
      };
    } else {
      // default values
      return {
        plateNumber: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        mileage: 0,
        status: 'AVAILABLE',
        loadCapacity: '',
        averageConsumption: '',
        purchaseDate: '',
        purchasePrice: '',
        color: '',
        serialNumber: '',
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Reset form
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, truck?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = 'Plate number is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    } else if (formData.brand.length < 2) {
      newErrors.brand = 'Brand must be at least 2 characters';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    } else if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
    }

    if (!formData.loadCapacity) {
      newErrors.loadCapacity = 'Load capacity is required';
    } else if (formData.loadCapacity < 0) {
      newErrors.loadCapacity = 'Load capacity cannot be negative';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative';
    }

    if (formData.mileage < 0) {
      newErrors.mileage = 'Mileage cannot be negative';
    }

    if (formData.averageConsumption && formData.averageConsumption < 0) {
      newErrors.averageConsumption = 'Average consumption cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage) || 0,
        loadCapacity: parseFloat(formData.loadCapacity),
        purchasePrice: parseFloat(formData.purchasePrice),
        averageConsumption: formData.averageConsumption ? parseFloat(formData.averageConsumption) : undefined,
      };

      // Remove empty optional fields
      if (!submitData.color) delete submitData.color;
      if (!submitData.serialNumber) delete submitData.serialNumber;
      if (!submitData.averageConsumption) delete submitData.averageConsumption;

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
      <div className="modal-content truck-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>{truck ? 'Edit Truck' : 'Add New Truck'}</h2>

        <form onSubmit={handleSubmit} className="truck-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plateNumber">Plate Number *</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                className={errors.plateNumber ? 'error' : ''}
                disabled={loading}
                placeholder="ABC-1234"
              />
              {errors.plateNumber && <span className="error-message">{errors.plateNumber}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="serialNumber">Serial Number</label>
              <input
                type="text"
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                disabled={loading}
                placeholder="VIN or chassis number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className={errors.brand ? 'error' : ''}
                disabled={loading}
                placeholder="Volvo"
              />
              {errors.brand && <span className="error-message">{errors.brand}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={errors.model ? 'error' : ''}
                disabled={loading}
                placeholder="FH16"
              />
              {errors.model && <span className="error-message">{errors.model}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className={errors.year ? 'error' : ''}
                disabled={loading}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && <span className="error-message">{errors.year}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                disabled={loading}
                placeholder="White"
                maxLength="30"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="mileage">Mileage (km)</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className={errors.mileage ? 'error' : ''}
                disabled={loading}
                min="0"
              />
              {errors.mileage && <span className="error-message">{errors.mileage}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                {Object.values(VEHICLE_STATUS).map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="loadCapacity">Load Capacity (kg) *</label>
              <input
                type="number"
                id="loadCapacity"
                name="loadCapacity"
                value={formData.loadCapacity}
                onChange={handleChange}
                className={errors.loadCapacity ? 'error' : ''}
                disabled={loading}
                min="0"
                step="0.01"
              />
              {errors.loadCapacity && <span className="error-message">{errors.loadCapacity}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="averageConsumption">Avg. Consumption (L/100km)</label>
              <input
                type="number"
                id="averageConsumption"
                name="averageConsumption"
                value={formData.averageConsumption}
                onChange={handleChange}
                className={errors.averageConsumption ? 'error' : ''}
                disabled={loading}
                min="0"
                step="0.1"
              />
              {errors.averageConsumption && <span className="error-message">{errors.averageConsumption}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="purchaseDate">Purchase Date *</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className={errors.purchaseDate ? 'error' : ''}
                disabled={loading}
              />
              {errors.purchaseDate && <span className="error-message">{errors.purchaseDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price ($) *</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={errors.purchasePrice ? 'error' : ''}
                disabled={loading}
                min="0"
                step="0.01"
              />
              {errors.purchasePrice && <span className="error-message">{errors.purchasePrice}</span>}
            </div>
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
              {loading ? 'Saving...' : truck ? 'Update Truck' : 'Create Truck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TruckFormModal;
