import { useAuth } from '../contexts/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>djask Manager</h1>
          <p>Interactive Polling System - Admin Panel</p>
        </div>
        <div className="header-user">
          <span className="user-info">
            Logged in as <strong>{user?.username}</strong>
          </span>
          <button onClick={logout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
