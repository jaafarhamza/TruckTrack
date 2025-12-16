import { useState, useEffect } from 'react';
import * as driverService from '../../services/driverService';
import './TripFormModal.css';

const TripFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  trip, 
  loading,
  trucks = [],
  trailers = []
}) => {
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const getInitialFormData = () => {
    if (trip) {
      return {
        driver: trip.driver?._id || '',
        truck: trip.truck?._id || '',
        trailer: trip.trailer?._id || '',
        originCity: trip.origin?.city || '',
        originCountry: trip.origin?.country || '',
        originStreet: trip.origin?.street || '',
        originPostalCode: trip.origin?.postalCode || '',
        destinationCity: trip.destination?.city || '',
        destinationCountry: trip.destination?.country || '',
        destinationStreet: trip.destination?.street || '',
        destinationPostalCode: trip.destination?.postalCode || '',
        departureDate: trip.departureDate ? trip.departureDate.split('T')[0] : '',
        departureTime: trip.departureDate ? trip.departureDate.split('T')[1]?.slice(0, 5) : '08:00',
        arrivalDate: trip.arrivalDate ? trip.arrivalDate.split('T')[0] : '',
        arrivalTime: trip.arrivalDate ? trip.arrivalDate.split('T')[1]?.slice(0, 5) : '18:00',
        cargo: trip.cargo || '',
        weight: trip.weight || '',
        remarks: trip.remarks || '',
      };
    } else {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      return {
        driver: '',
        truck: '',
        trailer: '',
        originCity: '',
        originCountry: '',
        originStreet: '',
        originPostalCode: '',
        destinationCity: '',
        destinationCountry: '',
        destinationStreet: '',
        destinationPostalCode: '',
        departureDate: today,
        departureTime: '08:00',
        arrivalDate: tomorrow,
        arrivalTime: '18:00',
        cargo: '',
        weight: '',
        remarks: '',
      };
    }
  };

  const [formData, setFormData] = useState(getInitialFormData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
      fetchDrivers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, trip?._id]);

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await driverService.getActiveDrivers();
      if (response.success) {
        setDrivers(response.data.drivers);
      }
    } catch (err) {
      console.error('Failed to load drivers:', err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.driver) newErrors.driver = 'Driver is required';
    if (!formData.truck) newErrors.truck = 'Truck is required';
    if (!formData.originCity) newErrors.originCity = 'Origin city is required';
    if (!formData.originCountry) newErrors.originCountry = 'Origin country is required';
    if (!formData.destinationCity) newErrors.destinationCity = 'Destination city is required';
    if (!formData.destinationCountry) newErrors.destinationCountry = 'Destination country is required';
    if (!formData.departureDate) newErrors.departureDate = 'Departure date is required';
    if (!formData.arrivalDate) newErrors.arrivalDate = 'Arrival date is required';

    // Validate dates
    const departure = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const arrival = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`);
    if (arrival <= departure) {
      newErrors.arrivalDate = 'Arrival must be after departure';
    }

    if (formData.weight && formData.weight < 0) {
      newErrors.weight = 'Weight cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      const submitData = {
        driver: formData.driver,
        truck: formData.truck,
        trailer: formData.trailer || undefined,
        origin: {
          city: formData.originCity,
          country: formData.originCountry,
          street: formData.originStreet || undefined,
          postalCode: formData.originPostalCode || undefined,
        },
        destination: {
          city: formData.destinationCity,
          country: formData.destinationCountry,
          street: formData.destinationStreet || undefined,
          postalCode: formData.destinationPostalCode || undefined,
        },
        departureDate: `${formData.departureDate}T${formData.departureTime}:00.000Z`,
        arrivalDate: `${formData.arrivalDate}T${formData.arrivalTime}:00.000Z`,
        cargo: formData.cargo || undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        remarks: formData.remarks || undefined,
      };

      onSubmit(submitData);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !loading) onClose();
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

  const availableTrucks = trucks.filter(t => t.status === 'AVAILABLE' || t._id === trip?.truck?._id);
  const availableTrailers = trailers.filter(t => t.status === 'AVAILABLE' || t._id === trip?.trailer?._id);

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div className="modal-content trip-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h2>{trip ? 'Edit Trip' : 'Create New Trip'}</h2>

        <form onSubmit={handleSubmit} className="trip-form">
          {/* Assignment Section */}
          <div className="form-section">
            <h3>Assignment</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="driver">Driver *</label>
                <select
                  id="driver"
                  name="driver"
                  value={formData.driver}
                  onChange={handleChange}
                  className={errors.driver ? 'error' : ''}
                  disabled={loading || loadingDrivers}
                >
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d._id} value={d._id}>
                      {d.firstName} {d.lastName}
                    </option>
                  ))}
                </select>
                {errors.driver && <span className="error-message">{errors.driver}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="truck">Truck *</label>
                <select
                  id="truck"
                  name="truck"
                  value={formData.truck}
                  onChange={handleChange}
                  className={errors.truck ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select Truck</option>
                  {availableTrucks.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.plateNumber} - {t.brand} {t.model}
                    </option>
                  ))}
                </select>
                {errors.truck && <span className="error-message">{errors.truck}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="trailer">Trailer</label>
                <select
                  id="trailer"
                  name="trailer"
                  value={formData.trailer}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">No Trailer</option>
                  {availableTrailers.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.plateNumber} - {t.type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Origin Section */}
          <div className="form-section">
            <h3>Origin</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="originCity">City *</label>
                <input
                  type="text"
                  id="originCity"
                  name="originCity"
                  value={formData.originCity}
                  onChange={handleChange}
                  className={errors.originCity ? 'error' : ''}
                  disabled={loading}
                  placeholder="Paris"
                />
                {errors.originCity && <span className="error-message">{errors.originCity}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="originCountry">Country *</label>
                <input
                  type="text"
                  id="originCountry"
                  name="originCountry"
                  value={formData.originCountry}
                  onChange={handleChange}
                  className={errors.originCountry ? 'error' : ''}
                  disabled={loading}
                  placeholder="France"
                />
                {errors.originCountry && <span className="error-message">{errors.originCountry}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="originStreet">Street</label>
                <input
                  type="text"
                  id="originStreet"
                  name="originStreet"
                  value={formData.originStreet}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="form-group">
                <label htmlFor="originPostalCode">Postal Code</label>
                <input
                  type="text"
                  id="originPostalCode"
                  name="originPostalCode"
                  value={formData.originPostalCode}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="75001"
                />
              </div>
            </div>
          </div>

          {/* Destination Section */}
          <div className="form-section">
            <h3>Destination</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="destinationCity">City *</label>
                <input
                  type="text"
                  id="destinationCity"
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleChange}
                  className={errors.destinationCity ? 'error' : ''}
                  disabled={loading}
                  placeholder="Lyon"
                />
                {errors.destinationCity && <span className="error-message">{errors.destinationCity}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="destinationCountry">Country *</label>
                <input
                  type="text"
                  id="destinationCountry"
                  name="destinationCountry"
                  value={formData.destinationCountry}
                  onChange={handleChange}
                  className={errors.destinationCountry ? 'error' : ''}
                  disabled={loading}
                  placeholder="France"
                />
                {errors.destinationCountry && <span className="error-message">{errors.destinationCountry}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="destinationStreet">Street</label>
                <input
                  type="text"
                  id="destinationStreet"
                  name="destinationStreet"
                  value={formData.destinationStreet}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="456 Delivery Ave"
                />
              </div>
              <div className="form-group">
                <label htmlFor="destinationPostalCode">Postal Code</label>
                <input
                  type="text"
                  id="destinationPostalCode"
                  name="destinationPostalCode"
                  value={formData.destinationPostalCode}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="69001"
                />
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="form-section">
            <h3>Schedule</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="departureDate">Departure Date *</label>
                <input
                  type="date"
                  id="departureDate"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  className={errors.departureDate ? 'error' : ''}
                  disabled={loading}
                />
                {errors.departureDate && <span className="error-message">{errors.departureDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="departureTime">Departure Time</label>
                <input
                  type="time"
                  id="departureTime"
                  name="departureTime"
                  value={formData.departureTime}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="arrivalDate">Arrival Date *</label>
                <input
                  type="date"
                  id="arrivalDate"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  className={errors.arrivalDate ? 'error' : ''}
                  disabled={loading}
                />
                {errors.arrivalDate && <span className="error-message">{errors.arrivalDate}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="arrivalTime">Arrival Time</label>
                <input
                  type="time"
                  id="arrivalTime"
                  name="arrivalTime"
                  value={formData.arrivalTime}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Cargo Section */}
          <div className="form-section">
            <h3>Cargo Details</h3>
            <div className="form-row">
              <div className="form-group flex-2">
                <label htmlFor="cargo">Cargo Description</label>
                <input
                  type="text"
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Electronics, furniture, etc."
                />
              </div>
              <div className="form-group">
                <label htmlFor="weight">Weight (kg)</label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className={errors.weight ? 'error' : ''}
                  disabled={loading}
                  placeholder="1000"
                  min="0"
                />
                {errors.weight && <span className="error-message">{errors.weight}</span>}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="remarks">Remarks</label>
              <textarea
                id="remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                disabled={loading}
                placeholder="Any special instructions or notes..."
                rows="3"
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
              disabled={loading}
            >
              {loading ? 'Saving...' : trip ? 'Update Trip' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripFormModal;
