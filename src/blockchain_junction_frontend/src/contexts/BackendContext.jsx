import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { blockchain_junction_backend } from 'declarations/blockchain_junction_backend';
import { Actor } from '@dfinity/agent';

const BackendContext = createContext();

export const useBackend = () => {
  const context = useContext(BackendContext);
  if (!context) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};

export const BackendProvider = ({ children }) => {
  const { isAuthenticated, authClient } = useAuth();
  const [backendActor, setBackendActor] = useState(blockchain_junction_backend);

  useEffect(() => {
    if (isAuthenticated && authClient) {
      // Create authenticated actor
      const identity = authClient.getIdentity();
      const authenticatedActor = Actor.createActor(
        blockchain_junction_backend._service,
        {
          agent: { identity },
          canisterId: process.env.CANISTER_ID_BLOCKCHAIN_JUNCTION_BACKEND,
        }
      );
      setBackendActor(authenticatedActor);
    } else {
      setBackendActor(blockchain_junction_backend);
    }
  }, [authClient, isAuthenticated]);

  const value = {
    backendActor
  };

  return (
    <BackendContext.Provider value={value}>
      {children}
    </BackendContext.Provider>
  );
};