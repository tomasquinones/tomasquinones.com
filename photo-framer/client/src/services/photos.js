import api from './api';

export const albumService = {
  async getAlbums() {
    const response = await api.get('/albums');
    return response.data.albums;
  },

  async getAlbum(slug) {
    const response = await api.get(`/albums/${slug}`);
    return response.data.album;
  },

  async createAlbum(data) {
    const response = await api.post('/albums', data);
    return response.data.album;
  },

  async updateAlbum(id, data) {
    const response = await api.put(`/albums/${id}`, data);
    return response.data.album;
  },

  async deleteAlbum(id) {
    await api.delete(`/albums/${id}`);
  },

  async updateAlbumSettings(id, settings) {
    const response = await api.put(`/albums/${id}/settings`, settings);
    return response.data.album;
  },
};

export const photoService = {
  async uploadPhotos(albumId, files, onProgress) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file);
    });

    const response = await api.post(`/albums/${albumId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        }
      },
    });
    return response.data.photos;
  },

  async getPhoto(id) {
    const response = await api.get(`/photos/${id}`);
    return response.data.photo;
  },

  async updatePhoto(id, data) {
    const response = await api.put(`/photos/${id}`, data);
    return response.data.photo;
  },

  async deletePhoto(id) {
    await api.delete(`/photos/${id}`);
  },

  async getFullResToken(id) {
    const response = await api.get(`/photos/${id}/full`);
    return response.data.token;
  },
};
