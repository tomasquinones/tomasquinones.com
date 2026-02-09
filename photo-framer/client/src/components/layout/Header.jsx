import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          Photo-Framer
        </Link>

        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/albums">Albums</Link>
          {isAdmin && <Link to="/admin">Admin</Link>}
        </nav>

        <div className="header-auth">
          {isAuthenticated ? (
            <>
              <span className="user-info">
                {user.username} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
