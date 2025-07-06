import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WalletSection from '../WalletConnection/WalletConnection';
import SwapSection from '../SwapSection/SwapSection';
import TransactionHistory from '../TransactionHistory/TransactionHistory';
import './Dashboard.scss';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="dashboard-placeholder">
        <h2>Welcome to Blockchain Junction</h2>
        <p>Please login to access your cross-chain swap dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="wallet-section">
          <WalletSection />
        </div>
        <div className="swap-section">
          <SwapSection />
        </div>
        <div className="transaction-section">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;