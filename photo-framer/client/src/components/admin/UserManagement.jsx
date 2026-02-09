import { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'viewer',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const response = await api.post('/users', formData);
      setUsers([...users, response.data.user]);
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', role: 'viewer' });
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert('Failed to update role');
      console.error(err);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: false } : u))
      );
    } catch (err) {
      alert('Failed to deactivate user');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '200px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="flex-between mb-3">
        <h2>User Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {error && <div className="toast toast-error">{error}</div>}

      {showForm && (
        <div className="content-card mb-3">
          <h3>Create New User</h3>
          {formError && <div className="form-error">{formError}</div>}
          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={formLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={formLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={12}
                disabled={formLoading}
              />
              <small>Minimum 12 characters</small>
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={formLoading}
              >
                <option value="viewer">Viewer</option>
                <option value="contributor">Contributor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={formLoading}>
              {formLoading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={!user.is_active ? 'inactive' : ''}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={!user.is_active}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="contributor">Contributor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  {user.is_active && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeactivate(user.id)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
