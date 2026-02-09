import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="content-card text-center" style={{ padding: 'var(--spacing-xl)' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary mt-2">
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;
