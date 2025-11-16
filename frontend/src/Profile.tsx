import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/v1/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="main-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <p>Error: {error}</p>
        <button onClick={handleBack} className="back-button">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>User Profile</h2>
        <button onClick={handleBack} className="back-button" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </button>
      </header>
      
      <div className="profile-content">
        <div className="summary-card">
          <h3>Profile Information</h3>
          <p><strong>Name:</strong> {user.firstname} {user.lastname}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member Since:</strong> {new Date(user.id ? Date.now() - user.id * 1000 : Date.now()).toLocaleDateString()}</p> {/* Placeholder for created date */}
        </div>
        <div className="summary-card">
          <h3>Settings</h3>
          <p>Notification preferences</p>
          <p>Privacy settings</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;