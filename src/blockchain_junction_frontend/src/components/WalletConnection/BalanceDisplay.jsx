import React, { useEffect, useState } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './BalanceDisplay.scss';

const BalanceDisplay = ({ balances, onRefresh }) => {
  const { backendActor } = useBackend();
  const [loading, setLoading] = useState(false);
  const [btcAddress, setBtcAddress] = useState('');

  useEffect(() => {
    fetchBtcAddress();
  }, []);

  const fetchBtcAddress = async () => {
    try {
      const address = await backendActor.get_btc_address();
      setBtcAddress(address);
    } catch (error) {
      console.error('Failed to fetch BTC address:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  const formatBalance = (amount) => {
    return (Number(amount) / 1e8).toFixed(8);
  };

  return (
    <div className="balance-display">
      <div className="balance-header">
        <h4>Your Balances</h4>
        <button 
          onClick={handleRefresh} 
          className="btn btn-secondary refresh-btn"
          disabled={loading}
        >
          {loading ? '⟳' : '↻'} Refresh
        </button>
      </div>

      <div className="balance-list">
        {Object.entries(balances || {}).length === 0 ? (
          <div className="no-balances">
            No balances found. Make a deposit to get started.
          </div>
        ) : (
          Object.entries(balances).map(([symbol, amount]) => (
            <div key={symbol} className="balance-item">
              <div className="asset-info">
                <span className="asset-symbol">{symbol}</span>
                <span className="asset-name">
                  {symbol === 'ICP' ? 'Internet Computer' : 
                   symbol === 'BTC' ? 'Bitcoin' : 
                   symbol === 'ETH' ? 'Ethereum' : symbol}
                </span>
              </div>
              <div className="balance-amount">
                {formatBalance(amount)} {symbol}
              </div>
            </div>
          ))
        )}
      </div>

      {btcAddress && (
        <div className="btc-address-section">
          <h5>Your Bitcoin Deposit Address</h5>
          <div className="address-display">
            <code>{btcAddress}</code>
            <button 
              onClick={() => navigator.clipboard.writeText(btcAddress)}
              className="btn btn-secondary copy-btn"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;