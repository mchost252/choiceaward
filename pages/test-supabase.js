import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Testing Supabase connection...');
        
        // Check if we can connect to Supabase
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(5);
          
        if (error) throw error;
        
        console.log('Data received:', data);
        setData(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Connection Test</h1>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div>
          <h2>Connection Successful</h2>
          <p>Found {data?.length || 0} records</p>
          
          <h3>Sample Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
} 