import { useState, useEffect } from 'react';
import { albumService } from '../services/photos';
import { useAuth } from '../context/AuthContext';
import AlbumCard from '../components/albums/AlbumCard';
import AlbumForm from '../components/albums/AlbumForm';
import './AlbumsPage.css';

function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { isContributor } = useAuth();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const data = await albumService.getAlbums();
      setAlbums(data);
    } catch (err) {
      setError('Failed to load albums');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumCreated = (newAlbum) => {
    setAlbums([newAlbum, ...albums]);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="albums-page">
      <div className="page-header flex-between">
        <h1>Photo Albums</h1>
        {isContributor && (
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Create Album'}
          </button>
        )}
      </div>

      {error && <div className="toast toast-error">{error}</div>}

      {showForm && (
        <div className="content-card mb-3">
          <AlbumForm onSuccess={handleAlbumCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {albums.length === 0 ? (
        <div className="content-card text-center">
          <p>No albums available.</p>
          {isContributor && (
            <p>Click "Create Album" to add your first album.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumsPage;
