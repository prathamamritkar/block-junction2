import React, { useState } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './WithdrawForm.scss';

const WithdrawForm = ({ onSuccess }) => {
  const { backendActor } = useBackend();
  const [assetSymbol, setAssetSymbol] = useState('ICP');
  const [amount, setAmount] = useState('');
  const [targetChain, setTargetChain] = useState('ICP');
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const chainMapping = {
    'ICP': { ICP: null },
    'Bitcoin': { Bitcoin: null },
    'Ethereum': { Ethereum: null }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    if (!targetAddress.trim()) {
      setMessage('Please enter a target address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await backendActor.withdraw_asset(
        assetSymbol,
        BigInt(Number(amount) * 1e8),
        chainMapping[targetChain],
        targetAddress
      );
      setMessage(result);
      setAmount('');
      setTargetAddress('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setMessage(`Withdrawal failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-form">
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

        <div className="form-group">
          <label htmlFor="target-chain">Target Chain</label>
          <select
            id="target-chain"
            value={targetChain}
            onChange={(e) => setTargetChain(e.target.value)}
          >
            <option value="ICP">ICP</option>
            <option value="Bitcoin">Bitcoin</option>
            <option value="Ethereum">Ethereum</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="target-address">Target Address</label>
          <input
            type="text"
            id="target-address"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            placeholder="Enter target address"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw'}
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

export default WithdrawForm;