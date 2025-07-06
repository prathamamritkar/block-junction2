import React, { useState } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './DepositForm.scss';

const DepositForm = ({ onSuccess }) => {
  const { backendActor } = useBackend();
  const [assetSymbol, setAssetSymbol] = useState('ICP');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await backendActor.deposit_asset(assetSymbol, BigInt(Number(amount) * 1e8));
      setMessage(result);
      setAmount('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage(`Deposit failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="deposit-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="asset-symbol">Asset</label>
          <select
            id="asset-symbol"
            value={assetSymbol}
            onChange={(e) => setAssetSymbol(e.target.value)}
          >
            <option value="ICP">ICP</option>
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            step="0.00000001"
            min="0"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Deposit'}
        </button>

        {message && (
          <div className={`message ${message.includes('failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default DepositForm;