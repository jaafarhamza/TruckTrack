// Validation rules matching backend
export const validationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    messages: {
      required: "Username is required",
      minLength: "Username must be at least 3 characters",
      maxLength: "Username cannot exceed 50 characters",
      pattern: "Username can only contain letters, numbers, and underscores",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "Email is required",
      pattern: "Please provide a valid email address",
    },
  },
  password: {
    required: true,
    minLength: 6,
    messages: {
      required: "Password is required",
      minLength: "Password must be at least 6 characters",
    },
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    messages: {
      required: "First name is required",
      minLength: "First name must be at least 2 characters",
      maxLength: "First name cannot exceed 50 characters",
    },
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    messages: {
      required: "Last name is required",
      minLength: "Last name must be at least 2 characters",
      maxLength: "Last name cannot exceed 50 characters",
    },
  },
  phone: {
    required: false,
    pattern: /^[\d\s\-+()]+$/,
    messages: {
      pattern: "Please provide a valid phone number",
    },
  },
  license: {
    required: false, // Conditionally required for drivers
    messages: {
      required: "License is required for drivers",
    },
  },
};

// Validate a single field
export const validateField = (name, value, rules = validationRules[name]) => {
  if (!rules) return null;

  const trimmedValue = typeof value === "string" ? value.trim() : value;

  // Required check
  if (rules.required && !trimmedValue) {
    return rules.messages.required;
  }

  // Skip other validations if field is empty and not required
  if (!trimmedValue && !rules.required) {
    return null;
  }

  // Min length check
  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return rules.messages.minLength;
  }

  // Max length check
  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return rules.messages.maxLength;
  }

  // Pattern check
  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return rules.messages.pattern;
  }

  return null;
};

// Validate registration form
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Validate username
  const usernameError = validateField("username", formData.username);
  if (usernameError) errors.username = usernameError;

  // Validate email
  const emailError = validateField("email", formData.email);
  if (emailError) errors.email = emailError;

  // Validate password
  const passwordError = validateField("password", formData.password);
  if (passwordError) errors.password = passwordError;

  // Validate confirm password
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Validate firstName
  const firstNameError = validateField("firstName", formData.firstName);
  if (firstNameError) errors.firstName = firstNameError;

  // Validate lastName
  const lastNameError = validateField("lastName", formData.lastName);
  if (lastNameError) errors.lastName = lastNameError;

  // Validate phone
  if (formData.phone) {
    const phoneError = validateField("phone", formData.phone);
    if (phoneError) errors.phone = phoneError;
  }

  // Validate license (required for drivers)
  if (!formData.license || !formData.license.trim()) {
    errors.license = "License is required";
  }

  return errors;
};

// Validate login form
export const validateLoginForm = (formData) => {
  const errors = {};

  // Validate email
  const emailError = validateField("email", formData.email);
  if (emailError) errors.email = emailError;

  // Validate password
  if (!formData.password) {
    errors.password = "Password is required";
  }

  return errors;
};

// Handle backend validation errors
export const handleBackendErrors = (error) => {
  if (error.response?.data?.errors) {
    // Backend validation errors 
    const backendErrors = {};
    error.response.data.errors.forEach((err) => {
      if (err.path) {
        backendErrors[err.path] = err.msg;
      }
    });
    return backendErrors;
  }
  return null;
};
