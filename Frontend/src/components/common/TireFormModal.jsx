import { useState, useEffect } from 'react';
import * as truckService from '../../services/truckService';
import * as trailerService from '../../services/trailerService';
import './TireFormModal.css';

const TIRE_POSITIONS = {
  FRONT_LEFT: 'FRONT_LEFT',
  FRONT_RIGHT: 'FRONT_RIGHT',
  REAR_LEFT: 'REAR_LEFT',
  REAR_RIGHT: 'REAR_RIGHT',
  SPARE: 'SPARE',
};

const TireFormModal = ({ isOpen, onClose, onSubmit, tire, loading }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const getInitialFormData = () => {
    if (tire) {
      return {
        reference: tire.reference || '',
        vehicle: tire.vehicle?._id || tire.vehicle || '',
        vehicleType: tire.vehicleType || 'Truck',
        position: tire.position || 'FRONT_LEFT',
        installationDate: tire.installationDate ? tire.installationDate.split('T')[0] : '',
        installationKm: tire.installationKm || 0,
        currentKm: tire.currentKm || 0,
        brand: tire.brand || '',
        model: tire.model || '',
        dimension: tire.dimension || '',
        pressure: tire.pressure || '',
        purchasePrice: tire.purchasePrice || '',
      };
    } else {
      return {
        reference: '',
        vehicle: '',
        vehicleType: 'Truck',
        position: 'FRONT_LEFT',
        installationDate: '',
        installationKm: 0,
        currentKm: 0,
        brand: '',
        model: '',
        dimension: '',
        pressure: '',
        purchasePrice: '',
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  // Fetch vehicles when modal opens
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!isOpen) return;
      
      setLoadingVehicles(true);
      try {
        const [trucksRes, trailersRes] = await Promise.all([
          truckService.getAllTrucks({ limit: 100 }),
          trailerService.getAllTrailers({ limit: 100 }),
        ]);

        const allVehicles = [
          ...(trucksRes.data?.trucks || []).map(t => ({ ...t, type: 'Truck' })),
          ...(trailersRes.data?.trailers || []).map(t => ({ ...t, type: 'Trailer' })),
        ];

        setVehicles(allVehicles);
      } catch (err) {
        console.error('Failed to load vehicles:', err);
      } finally {
        setLoadingVehicles(false);
      }
    };

    fetchVehicles();
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tire?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-set vehicle type when vehicle is selected
    if (name === 'vehicle') {
      const selectedVehicle = vehicles.find(v => v._id === value);
      setFormData(prev => ({
        ...prev,
        vehicle: value,
        vehicleType: selectedVehicle?.type || 'Truck',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.reference.trim()) {
      newErrors.reference = 'Tire reference is required';
    }

    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    } else if (formData.brand.length < 2) {
      newErrors.brand = 'Brand must be at least 2 characters';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.dimension.trim()) {
      newErrors.dimension = 'Dimension is required';
    } else if (!/^[0-9]+\/[0-9]+R[0-9]+(\.[0-9]+)?$/.test(formData.dimension)) {
      newErrors.dimension = 'Invalid format (e.g., 315/80R22.5)';
    }

    if (!formData.installationDate) {
      newErrors.installationDate = 'Installation date is required';
    }

    if (formData.installationKm < 0) {
      newErrors.installationKm = 'Installation km cannot be negative';
    }

    if (formData.currentKm < formData.installationKm) {
      newErrors.currentKm = 'Current km cannot be less than installation km';
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Purchase price is required';
    } else if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative';
    }

    if (formData.pressure && (formData.pressure < 0 || formData.pressure > 200)) {
      newErrors.pressure = 'Pressure must be between 0 and 200 PSI';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = {
        ...formData,
        reference: formData.reference.toUpperCase(),
        installationKm: parseInt(formData.installationKm) || 0,
        currentKm: parseInt(formData.currentKm) || formData.installationKm,
        purchasePrice: parseFloat(formData.purchasePrice),
        pressure: formData.pressure ? parseFloat(formData.pressure) : undefined,
      };

      // Remove empty optional fields
      if (!submitData.pressure) delete submitData.pressure;

      onSubmit(submitData);
    }
  };

  // Handle escape key
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
      <div className="modal-content tire-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>{tire ? 'Edit Tire' : 'Add New Tire'}</h2>

        <form onSubmit={handleSubmit} className="tire-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="reference">Tire Reference *</label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                className={errors.reference ? 'error' : ''}
                disabled={loading}
                placeholder="TIRE-001"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.reference && <span className="error-message">{errors.reference}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="vehicle">Vehicle *</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className={errors.vehicle ? 'error' : ''}
                disabled={loading || loadingVehicles}
              >
                <option value="">Select vehicle...</option>
                <optgroup label="Trucks">
                  {vehicles.filter(v => v.type === 'Truck').map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Trailers">
                  {vehicles.filter(v => v.type === 'Trailer').map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.vehicle && <span className="error-message">{errors.vehicle}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position *</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                disabled={loading}
              >
                {Object.values(TIRE_POSITIONS).map(pos => (
                  <option key={pos} value={pos}>{pos.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="installationDate">Installation Date *</label>
              <input
                type="date"
                id="installationDate"
                name="installationDate"
                value={formData.installationDate}
                onChange={handleChange}
                className={errors.installationDate ? 'error' : ''}
                disabled={loading}
              />
              {errors.installationDate && <span className="error-message">{errors.installationDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="installationKm">Installation KM *</label>
              <input
                type="number"
                id="installationKm"
                name="installationKm"
                value={formData.installationKm}
                onChange={handleChange}
                className={errors.installationKm ? 'error' : ''}
                disabled={loading}
                min="0"
              />
              {errors.installationKm && <span className="error-message">{errors.installationKm}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="currentKm">Current KM</label>
              <input
                type="number"
                id="currentKm"
                name="currentKm"
                value={formData.currentKm}
                onChange={handleChange}
                className={errors.currentKm ? 'error' : ''}
                disabled={loading}
                min="0"
                placeholder="Leave empty to use vehicle mileage"
              />
              {errors.currentKm && <span className="error-message">{errors.currentKm}</span>}
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
                placeholder="Michelin"
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
                placeholder="XZE"
              />
              {errors.model && <span className="error-message">{errors.model}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dimension">Dimension *</label>
              <input
                type="text"
                id="dimension"
                name="dimension"
                value={formData.dimension}
                onChange={handleChange}
                className={errors.dimension ? 'error' : ''}
                disabled={loading}
                placeholder="315/80R22.5"
              />
              {errors.dimension && <span className="error-message">{errors.dimension}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="pressure">Pressure (PSI)</label>
              <input
                type="number"
                id="pressure"
                name="pressure"
                value={formData.pressure}
                onChange={handleChange}
                className={errors.pressure ? 'error' : ''}
                disabled={loading}
                min="0"
                max="200"
                step="0.1"
                placeholder="110"
              />
              {errors.pressure && <span className="error-message">{errors.pressure}</span>}
            </div>
          </div>

          <div className="form-row">
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
                placeholder="450.00"
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
              disabled={loading || loadingVehicles}
            >
              {loading ? 'Saving...' : tire ? 'Update Tire' : 'Create Tire'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TireFormModal;
