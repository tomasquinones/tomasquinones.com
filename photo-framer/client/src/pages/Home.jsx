import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { albumService } from '../services/photos';
import AlbumCard from '../components/albums/AlbumCard';
import './Home.css';

function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicAlbums();
  }, []);

  const fetchPublicAlbums = async () => {
    try {
      const data = await albumService.getAlbums();
      // Filter to show only public albums on home page
      const publicAlbums = data.filter((album) => album.visibility === 'public');
      setAlbums(publicAlbums);
    } catch (err) {
      setError('Failed to load albums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="home-hero content-card">
        <h1>Photo-Framer</h1>
        <p>
          Welcome to my personal photo gallery. Browse through my photography collections
          featuring travel, art, and everyday moments.
        </p>
        <p className="license-notice">
          <span className="license-badge">All Rights Reserved</span>
          <br />
          All photos on this site are copyrighted. Please do not use without permission.
        </p>
      </div>

      {error && <div className="toast toast-error">{error}</div>}

      <section className="albums-section">
        <div className="section-header flex-between">
          <h2>Photo Albums</h2>
          <Link to="/albums" className="btn btn-primary">
            View All Albums
          </Link>
        </div>

        {albums.length === 0 ? (
          <div className="content-card text-center">
            <p>No public albums available yet.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {albums.slice(0, 6).map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
