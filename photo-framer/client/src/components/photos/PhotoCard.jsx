import { useState } from 'react';
import { photoService } from '../../services/photos';
import './PhotoCard.css';

function PhotoCard({ photo, onClick, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeleting(true);
    try {
      await photoService.deletePhoto(photo.id);
      onDelete();
    } catch (err) {
      console.error('Failed to delete photo:', err);
      alert('Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="photo-card"
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
    >
      <div className="photo-image-wrapper">
        <img
          src={`/api/photos/thumb/${photo.filename}`}
          alt={photo.alt_text || photo.title || 'Photo'}
          loading="lazy"
          draggable="false"
        />
        <div className="photo-overlay"></div>
      </div>

      {photo.title && (
        <div className="photo-info">
          <p className="photo-title">{photo.title}</p>
        </div>
      )}

      {onDelete && (
        <button
          className="photo-delete-btn"
          onClick={handleDelete}
          disabled={deleting}
          title="Delete photo"
        >
          {deleting ? '...' : 'X'}
        </button>
      )}
    </div>
  );
}

export default PhotoCard;
