import { useState, useEffect } from 'react';
import * as truckService from '../../services/truckService';
import * as trailerService from '../../services/trailerService';
import './FuelFormModal.css';

const FUEL_TYPES = {
  DIESEL: 'DIESEL',
  GASOLINE: 'GASOLINE',
  ELECTRIC: 'ELECTRIC',
  HYBRID: 'HYBRID',
};

const FuelFormModal = ({ isOpen, onClose, onSubmit, fuel, loading }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  const getInitialFormData = () => {
    if (fuel) {
      return {
        vehicle: fuel.vehicle?._id || fuel.vehicle || '',
        vehicleModel: fuel.vehicleModel || 'Truck',
        trip: fuel.trip?._id || fuel.trip || '',
        date: fuel.date ? fuel.date.split('T')[0] : '',
        volume: fuel.volume || '',
        unitCost: fuel.unitCost || '',
        totalCost: fuel.totalCost || '',
        currentKm: fuel.currentKm || '',
        station: fuel.station || '',
        city: fuel.city || '',
        invoice: fuel.invoice || '',
        fuelType: fuel.fuelType || 'DIESEL',
      };
    } else {
      const today = new Date().toISOString().split('T')[0];
      return {
        vehicle: '',
        vehicleModel: 'Truck',
        trip: '',
        date: today,
        volume: '',
        unitCost: '',
        totalCost: '',
        currentKm: '',
        station: '',
        city: '',
        invoice: '',
        fuelType: 'DIESEL',
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

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

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, fuel?._id]);

  // Auto-calculate total cost
  useEffect(() => {
    if (formData.volume && formData.unitCost) {
      const calculated = (parseFloat(formData.volume) * parseFloat(formData.unitCost)).toFixed(2);
      setFormData(prev => ({ ...prev, totalCost: calculated }));
    }
  }, [formData.volume, formData.unitCost]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'vehicle') {
      const selectedVehicle = vehicles.find(v => v._id === value);
      setFormData(prev => ({
        ...prev,
        vehicle: value,
        vehicleModel: selectedVehicle?.type || 'Truck',
        currentKm: selectedVehicle?.mileage || '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.vehicle) {
      newErrors.vehicle = 'Vehicle is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.volume) {
      newErrors.volume = 'Volume is required';
    } else if (formData.volume < 1 || formData.volume > 2000) {
      newErrors.volume = 'Volume must be between 1 and 2000 liters';
    }

    if (!formData.unitCost) {
      newErrors.unitCost = 'Unit cost is required';
    } else if (formData.unitCost < 0.1 || formData.unitCost > 10) {
      newErrors.unitCost = 'Unit cost must be between 0.1 and 10';
    }

    if (!formData.currentKm) {
      newErrors.currentKm = 'Current km is required';
    } else if (formData.currentKm < 0) {
      newErrors.currentKm = 'Current km cannot be negative';
    }

    if (!formData.station.trim()) {
      newErrors.station = 'Station is required';
    } else if (formData.station.length < 2 || formData.station.length > 100) {
      newErrors.station = 'Station must be between 2 and 100 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.length < 2 || formData.city.length > 100) {
      newErrors.city = 'City must be between 2 and 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = {
        ...formData,
        volume: parseFloat(formData.volume),
        unitCost: parseFloat(formData.unitCost),
        totalCost: parseFloat(formData.totalCost),
        currentKm: parseInt(formData.currentKm),
      };

      if (!submitData.trip) delete submitData.trip;
      if (!submitData.invoice) delete submitData.invoice;

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
      <div className="modal-content fuel-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>{fuel ? 'Edit Fuel Record' : 'Add Fuel Record'}</h2>

        <form onSubmit={handleSubmit} className="fuel-form">
          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                disabled={loading}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <span className="error-message">{errors.date}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="volume">Volume (Liters) *</label>
              <input
                type="number"
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                className={errors.volume ? 'error' : ''}
                disabled={loading}
                min="1"
                max="2000"
                step="0.1"
                placeholder="150"
              />
              {errors.volume && <span className="error-message">{errors.volume}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="unitCost">Unit Cost ($/L) *</label>
              <input
                type="number"
                id="unitCost"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleChange}
                className={errors.unitCost ? 'error' : ''}
                disabled={loading}
                min="0.1"
                max="10"
                step="0.01"
                placeholder="1.45"
              />
              {errors.unitCost && <span className="error-message">{errors.unitCost}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="totalCost">Total Cost ($)</label>
              <input
                type="number"
                id="totalCost"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleChange}
                disabled={true}
                step="0.01"
                placeholder="Auto-calculated"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="currentKm">Current KM *</label>
              <input
                type="number"
                id="currentKm"
                name="currentKm"
                value={formData.currentKm}
                onChange={handleChange}
                className={errors.currentKm ? 'error' : ''}
                disabled={loading}
                min="0"
                placeholder="125000"
              />
              {errors.currentKm && <span className="error-message">{errors.currentKm}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fuelType">Fuel Type *</label>
              <select
                id="fuelType"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                disabled={loading}
              >
                {Object.values(FUEL_TYPES).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="station">Station *</label>
              <input
                type="text"
                id="station"
                name="station"
                value={formData.station}
                onChange={handleChange}
                className={errors.station ? 'error' : ''}
                disabled={loading}
                placeholder="Shell Station"
              />
              {errors.station && <span className="error-message">{errors.station}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={errors.city ? 'error' : ''}
                disabled={loading}
                placeholder="Paris"
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoice">Invoice Number</label>
              <input
                type="text"
                id="invoice"
                name="invoice"
                value={formData.invoice}
                onChange={handleChange}
                disabled={loading}
                maxLength="50"
                placeholder="INV-12345"
              />
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
              {loading ? 'Saving...' : fuel ? 'Update Record' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuelFormModal;
