import React, { useState, useEffect } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';
import BalanceDisplay from './BalanceDisplay';
import './WalletConnection.scss';

const WalletSection = () => {
  const { backendActor } = useBackend();
  const [balances, setBalances] = useState({});
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    fetchBalances();
  }, [backendActor]);

  const fetchBalances = async () => {
    try {
      const result = await backendActor.get_all_balances();
      setBalances(result.balances);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    }
  };

  const refreshBalances = () => {
    fetchBalances();
  };

  return (
    <div className="wallet-section">
      <h3>Wallet</h3>
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'balance' ? 'active' : ''}`}
          onClick={() => setActiveTab('balance')}
        >
          Balance
        </button>
        <button
          className={`tab ${activeTab === 'deposit' ? 'active' : ''}`}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'balance' && (
          <BalanceDisplay balances={balances} onRefresh={refreshBalances} />
        )}
        {activeTab === 'deposit' && (
          <DepositForm onSuccess={refreshBalances} />
        )}
        {activeTab === 'withdraw' && (
          <WithdrawForm onSuccess={refreshBalances} />
        )}
      </div>
    </div>
  );
};

export default WalletSection;