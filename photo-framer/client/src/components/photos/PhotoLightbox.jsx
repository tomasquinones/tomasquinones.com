import { useState, useEffect, useCallback } from 'react';
import { photoService } from '../../services/photos';
import { useAuth } from '../../context/AuthContext';
import './PhotoLightbox.css';

const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

function PhotoLightbox({ photos, currentIndex, onClose, onNavigate }) {
  const [fullResUrl, setFullResUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showExif, setShowExif] = useState(false);

  const { isAuthenticated } = useAuth();
  const photo = photos[currentIndex];

  useEffect(() => {
    setFullResUrl(null);
    setLoading(false);

    // Auto-load full resolution for authenticated users
    if (isAuthenticated && photo) {
      setLoading(true);
      photoService.getFullResToken(photo.id)
        .then(token => {
          setFullResUrl(`${baseUrl}/api/photos/full/${token}/${photo.filename}`);
        })
        .catch(err => {
          console.error('Failed to load full-res:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentIndex, isAuthenticated, photo]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < photos.length - 1) {
            onNavigate(currentIndex + 1);
          }
          break;
        default:
          break;
      }
    },
    [currentIndex, photos.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const exifData = (() => {
    if (!photo.exif_data) return null;
    if (typeof photo.exif_data === 'object') return photo.exif_data;
    try {
      return JSON.parse(photo.exif_data);
    } catch {
      return null;
    }
  })();

  return (
    <div className="lightbox">
      {/* Navigation arrows in viewport margins */}
      {currentIndex > 0 && (
        <button
          className="nav-btn nav-prev"
          onClick={() => onNavigate(currentIndex - 1)}
        >
          &larr;
        </button>
      )}
      {currentIndex < photos.length - 1 && (
        <button
          className="nav-btn nav-next"
          onClick={() => onNavigate(currentIndex + 1)}
        >
          &rarr;
        </button>
      )}

      <div className="lightbox-content">
        <button className="lightbox-close" onClick={onClose}>
          &times;
        </button>

        <div
          className="lightbox-image-container"
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
        >
          {loading ? (
            <div className="lightbox-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
              <img
                src={fullResUrl || `${baseUrl}/api/photos/thumb/${photo.filename}`}
                alt={photo.alt_text || photo.title || 'Photo'}
                className={`lightbox-image ${fullResUrl ? 'full-res' : ''}`}
                draggable="false"
              />
              <div className="lightbox-overlay"></div>
            </>
          )}
        </div>

        <div className="lightbox-info">
          <div className="lightbox-meta">
            {photo.title && <h3>{photo.title}</h3>}
            {photo.caption && <p>{photo.caption}</p>}
            <span className="license-badge">{photo.license || 'All Rights Reserved'}</span>
          </div>

          <div className="lightbox-actions">
            {exifData && (
              <button
                className="btn btn-secondary"
                onClick={() => setShowExif(!showExif)}
              >
                {showExif ? 'Hide EXIF' : 'Show EXIF'}
              </button>
            )}
          </div>

          {showExif && exifData && (
            <div className="exif-panel">
              <h4>EXIF Data</h4>
              <dl className="exif-data">
                {exifData.camera?.make && (
                  <>
                    <dt>Camera</dt>
                    <dd>{exifData.camera.make} {exifData.camera.model}</dd>
                  </>
                )}
                {exifData.exif?.dateTime && (
                  <>
                    <dt>Date Taken</dt>
                    <dd>{new Date(exifData.exif.dateTime).toLocaleDateString()}</dd>
                  </>
                )}
                {exifData.exif?.fNumber && (
                  <>
                    <dt>Aperture</dt>
                    <dd>f/{exifData.exif.fNumber}</dd>
                  </>
                )}
                {exifData.exif?.exposureTime && (
                  <>
                    <dt>Shutter</dt>
                    <dd>{formatShutter(exifData.exif.exposureTime)}</dd>
                  </>
                )}
                {exifData.exif?.iso && (
                  <>
                    <dt>ISO</dt>
                    <dd>{exifData.exif.iso}</dd>
                  </>
                )}
                {exifData.exif?.focalLength && (
                  <>
                    <dt>Focal Length</dt>
                    <dd>{exifData.exif.focalLength}mm</dd>
                  </>
                )}
                {exifData.image?.width && exifData.image?.height && (
                  <>
                    <dt>Dimensions</dt>
                    <dd>{exifData.image.width} x {exifData.image.height}</dd>
                  </>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="lightbox-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  );
}

function formatShutter(seconds) {
  if (seconds >= 1) return `${seconds}s`;
  return `1/${Math.round(1 / seconds)}`;
}

export default PhotoLightbox;
