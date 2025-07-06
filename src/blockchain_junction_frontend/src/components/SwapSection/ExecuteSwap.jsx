import React, { useState } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './ExecuteSwap.scss';

const ExecuteSwap = () => {
  const { backendActor } = useBackend();
  const [swapId1, setSwapId1] = useState('');
  const [swapId2, setSwapId2] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!swapId1 || !swapId2) {
      setMessage('Please enter both swap IDs');
      return;
    }

    if (swapId1 === swapId2) {
      setMessage('Swap IDs must be different');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await backendActor.execute_swap(
        BigInt(swapId1),
        BigInt(swapId2)
      );

      if (result.success) {
        setMessage(result.message);
        setSwapId1('');
        setSwapId2('');
      } else {
        setMessage(`Failed: ${result.message}`);
      }
    } catch (error) {
      setMessage(`Swap execution failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="execute-swap">
      <div className="info-box">
        <h4>Execute Swap</h4>
        <p>
          To execute a swap, you need two compatible swap requests. 
          Enter the IDs of two swaps that can be matched.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="swap-ids">
          <div className="form-group">
            <label htmlFor="swap-id-1">First Swap ID</label>
            <input
              type="number"
              id="swap-id-1"
              value={swapId1}
              onChange={(e) => setSwapId1(e.target.value)}
              placeholder="Enter first swap ID"
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="swap-id-2">Second Swap ID</label>
            <input
              type="number"
              id="swap-id-2"
              value={swapId2}
              onChange={(e) => setSwapId2(e.target.value)}
              placeholder="Enter second swap ID"
              min="1"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Executing...' : 'Execute Swap'}
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

export default ExecuteSwap;