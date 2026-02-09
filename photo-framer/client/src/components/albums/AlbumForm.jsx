import { useState } from 'react';
import { albumService } from '../../services/photos';
import './AlbumForm.css';

function AlbumForm({ album, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: album?.name || '',
    description: album?.description || '',
    visibility: album?.visibility || 'private',
    compression_enabled: album?.compression_enabled ?? true,
    thumbnail_quality: album?.thumbnail_quality || 80,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (album) {
        result = await albumService.updateAlbum(album.id, formData);
      } else {
        result = await albumService.createAlbum(formData);
      }
      onSuccess(result);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save album');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="album-form">
      <h3>{album ? 'Edit Album' : 'Create New Album'}</h3>

      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="name">Album Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="visibility">Visibility</label>
        <select
          id="visibility"
          name="visibility"
          value={formData.visibility}
          onChange={handleChange}
          disabled={loading}
        >
          <option value="private">Private (only you)</option>
          <option value="unlisted">Unlisted (anyone with link)</option>
          <option value="public">Public (visible to all)</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group form-checkbox">
          <input
            type="checkbox"
            id="compression_enabled"
            name="compression_enabled"
            checked={formData.compression_enabled}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="compression_enabled">Enable thumbnail compression</label>
        </div>

        {formData.compression_enabled && (
          <div className="form-group">
            <label htmlFor="thumbnail_quality">
              Thumbnail Quality: {formData.thumbnail_quality}%
            </label>
            <input
              type="range"
              id="thumbnail_quality"
              name="thumbnail_quality"
              min="60"
              max="95"
              value={formData.thumbnail_quality}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : album ? 'Update Album' : 'Create Album'}
        </button>
      </div>
    </form>
  );
}

export default AlbumForm;
