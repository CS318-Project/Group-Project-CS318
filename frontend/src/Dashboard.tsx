import React from 'react';
import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  return (
    <div className="main-container">
      <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Personal Finance Tracker</h2>
        <button onClick={handleProfile} className="profile-button" style={{ marginTop: '1rem' }}>
          Profile
        </button>
        <button onClick={handleLogout} className="logout-button" style={{ marginTop: '1rem' }}>
          Logout
        </button>
      </header>
      
      <div className="dashboard-grid">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <p className="amount">$0.00</p>
        </div>
        <div className="summary-card">
          <h3>This Month</h3>
          <p className="amount">$0.00</p>
        </div>
        <div className="summary-card">
          <h3>Categories</h3>
          <p>0 active</p>
        </div>
      </div>
      
      <section className="transactions-section">
        <h3>Your Transactions</h3>
        <div className="transactions-list">
          <p style={{ textAlign: 'center', color: '#666' }}>No transactions yet. Add your first expense!</p>
        </div>
      </section>
    </div>
  );
}

export default Main;
