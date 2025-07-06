import React, { useState } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './CreateSwapForm.scss';

const CreateSwapForm = () => {
  const { backendActor } = useBackend();
  const [fromAssetSymbol, setFromAssetSymbol] = useState('ICP');
  const [fromAssetAmount, setFromAssetAmount] = useState('');
  const [toAssetSymbol, setToAssetSymbol] = useState('BTC');
  const [toChain, setToChain] = useState('Bitcoin');
  const [swapDuration, setSwapDuration] = useState('3600');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const chainMapping = {
    'ICP': { ICP: null },
    'Bitcoin': { Bitcoin: null },
    'Ethereum': { Ethereum: null }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromAssetAmount || isNaN(fromAssetAmount) || Number(fromAssetAmount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const durationNanos = BigInt(Number(swapDuration) * 1e9);
      const result = await backendActor.create_swap_request(
        fromAssetSymbol,
        BigInt(Number(fromAssetAmount) * 1e8),
        toAssetSymbol,
        chainMapping[toChain],
        durationNanos
      );

      if (result.success) {
        setMessage(`${result.message} (Swap ID: ${result.swap_id})`);
        setFromAssetAmount('');
      } else {
        setMessage(`Failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Swap creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-swap-form">
      <form onSubmit={handleSubmit}>
        <div className="swap-pair">
          <div className="form-group">
            <label htmlFor="from-asset">From Asset</label>
            <select
              id="from-asset"
              value={fromAssetSymbol}
              onChange={(e) => setFromAssetSymbol(e.target.value)}
            >
              <option value="ICP">ICP</option>
              <option value="BTC">Bitcoin</option>
              <option value="ETH">Ethereum</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="from-amount">Amount</label>
            <input
              type="number"
              id="from-amount"
              value={fromAssetAmount}
              onChange={(e) => setFromAssetAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.00000001"
              min="0"
            />
          </div>
        </div>

        <div className="swap-arrow">↓</div>

        <div className="swap-pair">
          <div className="form-group">
            <label htmlFor="to-asset">To Asset</label>
            <select
              id="to-asset"
              value={toAssetSymbol}
              onChange={(e) => setToAssetSymbol(e.target.value)}
            >
              <option value="BTC">Bitcoin</option>
              <option value="ICP">ICP</option>
              <option value="ETH">Ethereum</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="to-chain">Target Chain</label>
            <select
              id="to-chain"
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
            >
              <option value="Bitcoin">Bitcoin</option>
              <option value="ICP">ICP</option>
              <option value="Ethereum">Ethereum</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Swap Duration (seconds)</label>
          <select
            id="duration"
            value={swapDuration}
            onChange={(e) => setSwapDuration(e.target.value)}
          >
            <option value="1800">30 minutes</option>
            <option value="3600">1 hour</option>
            <option value="7200">2 hours</option>
            <option value="21600">6 hours</option>
            <option value="86400">24 hours</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Swap Request'}
        </button>

        {message && (
          <div className={`message ${message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateSwapForm;