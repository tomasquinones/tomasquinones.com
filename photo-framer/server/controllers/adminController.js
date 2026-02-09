import { queryOne } from '../config/database.js';

export async function getStats(req, res, next) {
  try {
    const userCount = await queryOne('SELECT COUNT(*) as count FROM users');
    const albumCount = await queryOne('SELECT COUNT(*) as count FROM albums');
    const photoCount = await queryOne('SELECT COUNT(*) as count FROM photos');
    const storageUsed = await queryOne('SELECT COALESCE(SUM(file_size), 0) as total FROM photos');

    res.json({
      totalUsers: userCount.count,
      totalAlbums: albumCount.count,
      totalPhotos: photoCount.count,
      storageUsed: storageUsed.total
    });
  } catch (error) {
    next(error);
  }
}
