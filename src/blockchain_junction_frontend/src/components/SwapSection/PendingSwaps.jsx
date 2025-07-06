import React, { useState, useEffect } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import './PendingSwaps.scss';

const PendingSwaps = () => {
  const { backendActor } = useBackend();
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingSwaps();
  }, [backendActor]);

  const fetchPendingSwaps = async () => {
    setLoading(true);
    try {
      const swaps = await backendActor.get_pending_swaps();
      setPendingSwaps(swaps);
    } catch (error) {
      console.error('Failed to fetch pending swaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return (Number(amount) / 1e8).toFixed(8);
  };

  const formatDeadline = (deadline) => {
    const date = new Date(Number(deadline) / 1e6);
    return date.toLocaleString();
  };

  const isExpired = (deadline) => {
    return Date.now() > Number(deadline) / 1e6;
  };

  if (loading) {
    return <div className="loading">Loading pending swaps...</div>;
  }

  return (
    <div className="pending-swaps">
      <div className="swaps-header">
        <h4>Pending Swap Requests</h4>
        <button onClick={fetchPendingSwaps} className="btn btn-secondary">
          Refresh
        </button>
      </div>

      {pendingSwaps.length === 0 ? (
        <div className="no-swaps">
          No pending swaps found. Create a swap request to get started.
        </div>
      ) : (
        <div className="swaps-list">
          {pendingSwaps.map((swap) => (
            <div 
              key={swap.id} 
              className={`swap-item ${isExpired(swap.deadline) ? 'expired' : ''}`}
            >
              <div className="swap-header">
                <span className="swap-id">#{Number(swap.id)}</span>
                <span className={`status ${isExpired(swap.deadline) ? 'expired' : 'active'}`}>
                  {isExpired(swap.deadline) ? 'Expired' : 'Active'}
                </span>
              </div>

              <div className="swap-details">
                <div className="swap-pair">
                  <div className="from-asset">
                    <span className="label">From:</span>
                    <span className="asset">
                      {formatAmount(swap.from_asset.amount)} {swap.from_asset.symbol}
                    </span>
                  </div>
                  <div className="arrow">→</div>
                  <div className="to-asset">
                    <span className="label">To:</span>
                    <span className="asset">{swap.to_asset_symbol}</span>
                  </div>
                </div>

                <div className="swap-meta">
                  <div className="user">
                    User: {swap.user.toText().slice(0, 8)}...
                  </div>
                  <div className="deadline">
                    Expires: {formatDeadline(swap.deadline)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingSwaps;