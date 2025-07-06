import React, { useState, useEffect } from 'react';
import { useBackend } from '../../contexts/BackendContext';
import CreateSwapForm from './CreateSwapForm';
import PendingSwaps from './PendingSwaps';
import './SwapSection.scss';

const SwapSection = () => {
  const { backendActor } = useBackend();
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="swap-section">
      <h3>Cross-Chain Swap</h3>
      <div className="tab-navigation">
        <button
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Swap
        </button>
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Swaps
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'create' && <CreateSwapForm />}
        {activeTab === 'pending' && <PendingSwaps />}
      </div>
    </div>
  );
};

export default SwapSection;