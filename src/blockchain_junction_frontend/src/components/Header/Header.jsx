import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.scss';

const Header = () => {
  const { isAuthenticated, principal, login, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="app-title">Blockchain Junction</h1>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="principal">
                {principal?.toText().slice(0, 8)}...
              </span>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn btn-primary">
              Login with Internet Identity
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;