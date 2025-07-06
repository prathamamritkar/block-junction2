import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { BackendProvider } from './contexts/BackendContext';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import './App.scss';

function App() {
  return (
    <AuthProvider>
      <BackendProvider>
        <div className="app">
          <Header />
          <main className="main-content">
            <Dashboard />
          </main>
        </div>
      </BackendProvider>
    </AuthProvider>
  );
}

export default App;