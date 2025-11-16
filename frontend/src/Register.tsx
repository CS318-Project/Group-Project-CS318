import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from './api';

function Register() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authAPI.signup(email, password, name);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="form-section">
        <img src="/header.png" alt="Logo" className="logo" />
        <h2>Register</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input type="text" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Enter your full name" className="input-field" required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Enter your email" className="input-field" required />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <div className="input-container">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="Enter your password" className="input-field" required />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>
          <div className="form-group">
            <label>Confirm Password:</label>
            <div className="input-container">
              <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="input-field" required />
              <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>
          <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <button onClick={() => navigate('/')} className="back-button">Back</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
      <div className="image-section">
        <img src="/placeholder.jpg" alt="Register Illustration" />
      </div>
    </div>
  );
}

export default Register;