import { useState, useEffect } from "react";
import "./TrailerFormModal.css";

const VEHICLE_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_TRIP: "ON_TRIP",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  OUT_OF_SERVICE: "OUT_OF_SERVICE",
};

const TRAILER_TYPES = {
  FLATBED: "FLATBED",
  REFRIGERATED: "REFRIGERATED",
  TANKER: "TANKER",
  CONTAINER: "CONTAINER",
  LOWBOY: "LOWBOY",
  DRY_VAN: "DRY_VAN",
};

const TrailerFormModal = ({ isOpen, onClose, onSubmit, trailer, loading }) => {
  const getInitialFormData = () => {
    if (trailer) {
      return {
        plateNumber: trailer.plateNumber || "",
        type: trailer.type || "FLATBED",
        brand: trailer.brand || "",
        model: trailer.model || "",
        year: trailer.year || new Date().getFullYear(),
        status: trailer.status || "AVAILABLE",
        loadCapacity: trailer.loadCapacity || "",
        length: trailer.length || "",
        width: trailer.width || "",
        height: trailer.height || "",
        purchaseDate: trailer.purchaseDate
          ? trailer.purchaseDate.split("T")[0]
          : "",
        purchasePrice: trailer.purchasePrice || "",
        color: trailer.color || "",
        serialNumber: trailer.serialNumber || "",
        axles: trailer.axles || 2,
        tareWeight: trailer.tareWeight || "",
      };
    } else {
      return {
        plateNumber: "",
        type: "FLATBED",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        status: "AVAILABLE",
        loadCapacity: "",
        length: "",
        width: "",
        height: "",
        purchaseDate: "",
        purchasePrice: "",
        color: "",
        serialNumber: "",
        axles: 2,
        tareWeight: "",
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
  }, [isOpen, trailer?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = "Plate number is required";
    }

    if (!formData.type) {
      newErrors.type = "Trailer type is required";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    } else if (formData.brand.length < 2) {
      newErrors.brand = "Brand must be at least 2 characters";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Model is required";
    }

    if (!formData.year) {
      newErrors.year = "Year is required";
    } else if (
      formData.year < 1900 ||
      formData.year > new Date().getFullYear() + 1
    ) {
      newErrors.year = `Year must be between 1900 and ${
        new Date().getFullYear() + 1
      }`;
    }

    if (!formData.loadCapacity) {
      newErrors.loadCapacity = "Load capacity is required";
    } else if (formData.loadCapacity < 0) {
      newErrors.loadCapacity = "Load capacity cannot be negative";
    }

    if (!formData.length) {
      newErrors.length = "Length is required";
    } else if (formData.length <= 0) {
      newErrors.length = "Length must be positive";
    }

    if (!formData.width) {
      newErrors.width = "Width is required";
    } else if (formData.width <= 0) {
      newErrors.width = "Width must be positive";
    }

    if (!formData.height) {
      newErrors.height = "Height is required";
    } else if (formData.height <= 0) {
      newErrors.height = "Height must be positive";
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = "Purchase date is required";
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (formData.purchasePrice < 0) {
      newErrors.purchasePrice = "Purchase price cannot be negative";
    }

    if (formData.axles < 1 || formData.axles > 5) {
      newErrors.axles = "Axles must be between 1 and 5";
    }

    if (formData.tareWeight && formData.tareWeight < 0) {
      newErrors.tareWeight = "Tare weight cannot be negative";
    }

    if (
      formData.tareWeight &&
      formData.loadCapacity &&
      parseFloat(formData.tareWeight) >= parseFloat(formData.loadCapacity)
    ) {
      newErrors.tareWeight =
        "Tare weight cannot be greater than or equal to load capacity";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      const submitData = {
        ...formData,
        year: parseInt(formData.year),
        loadCapacity: parseFloat(formData.loadCapacity),
        length: parseFloat(formData.length),
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
        purchasePrice: parseFloat(formData.purchasePrice),
        axles: parseInt(formData.axles),
        tareWeight: formData.tareWeight
          ? parseFloat(formData.tareWeight)
          : undefined,
      };

      if (!submitData.color) delete submitData.color;
      if (!submitData.serialNumber) delete submitData.serialNumber;
      if (!submitData.tareWeight) delete submitData.tareWeight;

      onSubmit(submitData);
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, loading]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={!loading ? onClose : undefined}>
      <div
        className="modal-content trailer-form-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <h2>{trailer ? "Edit Trailer" : "Add New Trailer"}</h2>

        <form onSubmit={handleSubmit} className="trailer-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plateNumber">Plate Number *</label>
              <input
                type="text"
                id="plateNumber"
                name="plateNumber"
                value={formData.plateNumber}
                onChange={handleChange}
                className={errors.plateNumber ? "error" : ""}
                disabled={loading}
                placeholder="TRL-1234"
              />
              {errors.plateNumber && (
                <span className="error-message">{errors.plateNumber}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type">Trailer Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={errors.type ? "error" : ""}
                disabled={loading}
              >
                {Object.keys(TRAILER_TYPES).map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>
              {errors.type && (
                <span className="error-message">{errors.type}</span>
              )}
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
                className={errors.brand ? "error" : ""}
                disabled={loading}
                placeholder="Great Dane"
              />
              {errors.brand && (
                <span className="error-message">{errors.brand}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={errors.model ? "error" : ""}
                disabled={loading}
                placeholder="Freedom LT"
              />
              {errors.model && (
                <span className="error-message">{errors.model}</span>
              )}
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
                className={errors.year ? "error" : ""}
                disabled={loading}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
              {errors.year && (
                <span className="error-message">{errors.year}</span>
              )}
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
                {Object.keys(VEHICLE_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
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
                className={errors.loadCapacity ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="25000"
              />
              {errors.loadCapacity && (
                <span className="error-message">{errors.loadCapacity}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tareWeight">Tare Weight (kg)</label>
              <input
                type="number"
                id="tareWeight"
                name="tareWeight"
                value={formData.tareWeight}
                onChange={handleChange}
                className={errors.tareWeight ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="5000"
              />
              {errors.tareWeight && (
                <span className="error-message">{errors.tareWeight}</span>
              )}
            </div>
          </div>

          <div className="form-section-title">Dimensions (meters)</div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="length">Length *</label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                className={errors.length ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="16.15"
              />
              {errors.length && (
                <span className="error-message">{errors.length}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="width">Width *</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                className={errors.width ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="2.6"
              />
              {errors.width && (
                <span className="error-message">{errors.width}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="height">Height *</label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className={errors.height ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="2.7"
              />
              {errors.height && (
                <span className="error-message">{errors.height}</span>
              )}
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
                className={errors.purchaseDate ? "error" : ""}
                disabled={loading}
              />
              {errors.purchaseDate && (
                <span className="error-message">{errors.purchaseDate}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="purchasePrice">Purchase Price ($) *</label>
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                className={errors.purchasePrice ? "error" : ""}
                disabled={loading}
                min="0"
                step="0.01"
                placeholder="45000"
              />
              {errors.purchasePrice && (
                <span className="error-message">{errors.purchasePrice}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="axles">Number of Axles *</label>
              <input
                type="number"
                id="axles"
                name="axles"
                value={formData.axles}
                onChange={handleChange}
                className={errors.axles ? "error" : ""}
                disabled={loading}
                min="1"
                max="5"
              />
              {errors.axles && (
                <span className="error-message">{errors.axles}</span>
              )}
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
              />
            </div>
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
              placeholder="GD123456789"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-md btn-ghost"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-md btn-primary"
            >
              {loading
                ? "Saving..."
                : trailer
                ? "Update Trailer"
                : "Add Trailer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrailerFormModal;
