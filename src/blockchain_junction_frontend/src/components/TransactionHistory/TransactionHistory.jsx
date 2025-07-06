import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TransactionHistory.scss';

const TransactionHistory = () => {
  const { principal } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This would fetch transaction history from backend
    // For now, it's a placeholder
    setTransactions([]);
  }, [principal]);

  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      
      {loading ? (
        <div className="loading">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="no-transactions">
          No transactions found. Your completed swaps and transfers will appear here.
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={index} className="transaction-item">
              {/* Transaction details would go here */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;