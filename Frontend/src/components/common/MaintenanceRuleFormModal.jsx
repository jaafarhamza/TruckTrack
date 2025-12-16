import { useState, useEffect } from 'react';
import { MAINTENANCE_TYPES } from '../../services/maintenanceRuleService';
import './MaintenanceRuleFormModal.css';

const MaintenanceRuleFormModal = ({ isOpen, onClose, onSubmit, rule, loading }) => {
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    kmInterval: '',
    monthInterval: '',
    estimatedCost: '',
    active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (rule) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        type: rule.type || '',
        description: rule.description || '',
        kmInterval: rule.kmInterval || '',
        monthInterval: rule.monthInterval || '',
        estimatedCost: rule.estimatedCost || '',
        active: rule.active !== undefined ? rule.active : true,
      });
    } else {
      setFormData({
        type: '',
        description: '',
        kmInterval: '',
        monthInterval: '',
        estimatedCost: '',
        active: true,
      });
    }
    setErrors({});
  }, [rule, isOpen]);

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
    if (!formData.type) newErrors.type = 'Maintenance type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length > 500) newErrors.description = 'Description cannot exceed 500 characters';
    if (formData.kmInterval && (isNaN(formData.kmInterval) || formData.kmInterval < 0)) {
      newErrors.kmInterval = 'Km interval must be a positive number';
    }
    if (formData.monthInterval && (isNaN(formData.monthInterval) || formData.monthInterval < 1 || formData.monthInterval > 60)) {
      newErrors.monthInterval = 'Month interval must be between 1 and 60';
    }
    if (formData.estimatedCost && (isNaN(formData.estimatedCost) || formData.estimatedCost < 0)) {
      newErrors.estimatedCost = 'Estimated cost must be a positive number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const submitData = {
        type: formData.type,
        description: formData.description.trim(),
        active: formData.active,
      };
      if (formData.kmInterval) submitData.kmInterval = Number(formData.kmInterval);
      if (formData.monthInterval) submitData.monthInterval = Number(formData.monthInterval);
      if (formData.estimatedCost) submitData.estimatedCost = Number(formData.estimatedCost);
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content rule-form-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="modal-header">
          <h2>{rule ? 'Edit Maintenance Rule' : 'Add Maintenance Rule'}</h2>
          <p>{rule ? 'Update the maintenance rule details' : 'Configure a new maintenance schedule rule'}</p>
        </div>

        <form onSubmit={handleSubmit} className="rule-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Maintenance Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select type...</option>
                {MAINTENANCE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="estimatedCost">Estimated Cost (€)</label>
              <input
                type="number"
                id="estimatedCost"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                placeholder="e.g., 150"
                min="0"
                step="0.01"
                className={errors.estimatedCost ? 'error' : ''}
                disabled={loading}
              />
              {errors.estimatedCost && <span className="error-text">{errors.estimatedCost}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the maintenance rule..."
              rows="3"
              maxLength="500"
              className={errors.description ? 'error' : ''}
              disabled={loading}
            />
            <span className="char-count">{formData.description.length}/500</span>
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-section">
            <h3>Schedule Intervals</h3>
            <p className="section-hint">Set when this maintenance should be performed</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kmInterval">Kilometer Interval</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="kmInterval"
                    name="kmInterval"
                    value={formData.kmInterval}
                    onChange={handleChange}
                    placeholder="e.g., 15000"
                    min="0"
                    className={errors.kmInterval ? 'error' : ''}
                    disabled={loading}
                  />
                  <span className="input-suffix">km</span>
                </div>
                {errors.kmInterval && <span className="error-text">{errors.kmInterval}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="monthInterval">Month Interval</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="monthInterval"
                    name="monthInterval"
                    value={formData.monthInterval}
                    onChange={handleChange}
                    placeholder="e.g., 6"
                    min="1"
                    max="60"
                    className={errors.monthInterval ? 'error' : ''}
                    disabled={loading}
                  />
                  <span className="input-suffix">months</span>
                </div>
                {errors.monthInterval && <span className="error-text">{errors.monthInterval}</span>}
              </div>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                disabled={loading}
              />
              <span className="checkbox-custom"></span>
              <span>Active Rule</span>
            </label>
            <p className="checkbox-hint">Active rules will be used for maintenance scheduling</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-md btn-ghost" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-md btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  {rule ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                rule ? 'Update Rule' : 'Create Rule'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRuleFormModal;
