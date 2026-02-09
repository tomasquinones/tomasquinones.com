import { useState, useEffect } from 'react';
import api from '../services/api';
import UserManagement from '../components/admin/UserManagement';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
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
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="stats-grid">
          <div className="stat-card content-card">
            <h3>Total Users</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
          </div>
          <div className="stat-card content-card">
            <h3>Total Albums</h3>
            <p className="stat-value">{stats?.totalAlbums || 0}</p>
          </div>
          <div className="stat-card content-card">
            <h3>Total Photos</h3>
            <p className="stat-value">{stats?.totalPhotos || 0}</p>
          </div>
          <div className="stat-card content-card">
            <h3>Storage Used</h3>
            <p className="stat-value">{formatBytes(stats?.storageUsed || 0)}</p>
          </div>
        </div>
      )}

      {activeTab === 'users' && <UserManagement />}
    </div>
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default AdminDashboard;
