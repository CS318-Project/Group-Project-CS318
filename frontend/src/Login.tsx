import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from './api';

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await authAPI.signin(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Logging in...</p>
        </div>
      )}
      <div className="login-container">
        <div className="form-section">
        <img src="/header.png" alt="Logo" className="logo" />
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <button onClick={() => navigate('/')} className="back-button">Back</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
      <div className="image-section">
        <img src="/placeholder2.jpg" alt="Finance Tracker Illustration" />
      </div>
    </div>
    </>
  );
}

export default Login;