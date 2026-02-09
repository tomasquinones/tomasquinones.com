import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { albumService } from '../services/photos';
import { useAuth } from '../context/AuthContext';
import PhotoGrid from '../components/photos/PhotoGrid';
import PhotoUploader from '../components/photos/PhotoUploader';
import PhotoLightbox from '../components/photos/PhotoLightbox';
import './AlbumDetail.css';

function AlbumDetail() {
  const { slug } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  const { user, isContributor } = useAuth();

  useEffect(() => {
    fetchAlbum();
  }, [slug]);

  const fetchAlbum = async () => {
    try {
      const data = await albumService.getAlbum(slug);
      setAlbum(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Album not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this album');
      } else {
        setError('Failed to load album');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosUploaded = (newPhotos) => {
    setAlbum({
      ...album,
      photos: [...album.photos, ...newPhotos],
    });
    setShowUploader(false);
  };

  const handlePhotoDeleted = (photoId) => {
    setAlbum({
      ...album,
      photos: album.photos.filter((p) => p.id !== photoId),
    });
  };

  const canUpload = isContributor && (
    user?.id === album?.owner_id ||
    user?.role === 'admin'
  );

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="album-error content-card text-center">
        <h2>{error}</h2>
        <Link to="/albums" className="btn btn-primary mt-2">
          Back to Albums
        </Link>
      </div>
    );
  }

  return (
    <div className="album-detail">
      <div className="album-header content-card">
        <div className="flex-between">
          <div>
            <Link to="/albums" className="back-link">&larr; Back to Albums</Link>
            <h1>{album.name}</h1>
            {album.description && <p className="album-description">{album.description}</p>}
          </div>
          <div className="album-meta">
            <span className="license-badge">{album.license || 'All Rights Reserved'}</span>
            <span className="photo-count">{album.photos?.length || 0} photos</span>
            {album.visibility !== 'public' && (
              <span className="visibility-badge">{album.visibility}</span>
            )}
          </div>
        </div>

        {canUpload && (
          <div className="album-actions mt-2">
            <button
              className="btn btn-primary"
              onClick={() => setShowUploader(!showUploader)}
            >
              {showUploader ? 'Cancel' : 'Upload Photos'}
            </button>
          </div>
        )}
      </div>

      {showUploader && (
        <div className="content-card mb-3">
          <PhotoUploader
            albumId={album.id}
            onSuccess={handlePhotosUploaded}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      )}

      {album.photos?.length === 0 ? (
        <div className="content-card text-center">
          <p>No photos in this album yet.</p>
          {canUpload && <p>Click "Upload Photos" to add some.</p>}
        </div>
      ) : (
        <PhotoGrid
          photos={album.photos}
          onPhotoClick={(index) => setSelectedPhotoIndex(index)}
          onPhotoDeleted={handlePhotoDeleted}
          canDelete={canUpload}
        />
      )}

      {selectedPhotoIndex !== null && (
        <PhotoLightbox
          photos={album.photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onNavigate={(index) => setSelectedPhotoIndex(index)}
        />
      )}
    </div>
  );
}

export default AlbumDetail;
