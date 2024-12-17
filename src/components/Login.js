import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState({ username: '', password: '' }); // For field-level validation
  const navigate = useNavigate(); // React Router's navigation hook

  // Static credentials
  const STATIC_USERNAME = 'admin';
  const STATIC_PASSWORD = '1234';

  const validateFields = () => {
    const errors = {};
    if (!username) errors.username = 'Username is required';
    if (!password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission

    // Validate required fields
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldError(errors);
      setError(''); // Clear any previous general errors
      return;
    } else {
      setFieldError({}); // Clear field-level errors
    }

    // Validate static credentials
    if (username === STATIC_USERNAME && password === STATIC_PASSWORD) {
      setError('');
      navigate('/'); // Redirect to Home page
    } else {
      setError('Invalid username or password'); // Display error for wrong credentials
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="card p-4 w-25">
        <h2 className="text-center mb-4">Login</h2>
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="mb-3">
            <label className="form-label">Username (admin)</label>
            <input
              type="text"
              className={`form-control ${fieldError.username ? 'is-invalid' : ''}`}
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Update username state
            />
            {fieldError.username && <div className="invalid-feedback">{fieldError.username}</div>}
          </div>

          {/* Password Field */}
          <div className="mb-3">
            <label className="form-label">Password (1234)</label>
            <input
              type="password"
              className={`form-control ${fieldError.password ? 'is-invalid' : ''}`}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Update password state
            />
            {fieldError.password && <div className="invalid-feedback">{fieldError.password}</div>}
          </div>

          {/* General Error Message */}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
