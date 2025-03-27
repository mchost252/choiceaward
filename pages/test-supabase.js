import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Head from 'next/head';

export default function TestSupabase() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [directApiData, setDirectApiData] = useState(null);
  const [configStatus, setConfigStatus] = useState({});
  
  useEffect(() => {
    async function fetchData() {
      try {
        // 1. Check if Supabase environment variables are set
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setConfigStatus({
          supabaseUrl: supabaseUrl ? 'Set ✓' : 'Missing ✗',
          supabaseAnonKey: supabaseAnonKey ? 'Set ✓' : 'Missing ✗',
        });
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase configuration is incomplete');
        }
        
        // 2. Try to fetch data directly using the client
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('users')
          .select('*')
          .order('login_time', { ascending: false });
          
        if (supabaseError) throw new Error(`Supabase client error: ${supabaseError.message}`);
        setData(supabaseData);
        
        // 3. Try to fetch data via our API endpoint
        const apiRes = await fetch('/api/direct-query');
        const apiData = await apiRes.json();
        setDirectApiData(apiData);
        
      } catch (err) {
        console.error('Error in test-supabase:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>Supabase Connection Test</title>
      </Head>
      
      <h1>Supabase Connection Test</h1>
      <p>This page helps diagnose issues with Supabase connections and data fetching.</p>
      
      <div style={{ marginTop: '2rem', background: '#f8f9fa', padding: '1rem', borderRadius: '5px' }}>
        <h2>Configuration Status</h2>
        <pre>{JSON.stringify(configStatus, null, 2)}</pre>
      </div>
      
      {loading && <p style={{ marginTop: '2rem' }}>Loading data...</p>}
      
      {error && (
        <div style={{ marginTop: '2rem', background: '#fee', padding: '1rem', borderRadius: '5px', border: '1px solid #f88' }}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && (
        <>
          <div style={{ marginTop: '2rem', background: '#f1f8e9', padding: '1rem', borderRadius: '5px', border: '1px solid #c5e1a5' }}>
            <h2>Supabase Client Data</h2>
            <p>{data?.length || 0} records found</p>
            {data?.length > 0 && (
              <details>
                <summary>View Sample Data</summary>
                <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
                  {JSON.stringify(data.slice(0, 3), null, 2)}
                </pre>
              </details>
            )}
          </div>
          
          <div style={{ marginTop: '2rem', background: '#e3f2fd', padding: '1rem', borderRadius: '5px', border: '1px solid #90caf9' }}>
            <h2>API Endpoint Data</h2>
            <pre style={{ maxHeight: '300px', overflow: 'auto' }}>
              {JSON.stringify(directApiData, null, 2)}
            </pre>
          </div>
          
          <div style={{ marginTop: '2rem', background: '#fff3e0', padding: '1rem', borderRadius: '5px', border: '1px solid #ffe0b2' }}>
            <h2>Troubleshooting Steps</h2>
            <ol style={{ lineHeight: '1.6' }}>
              <li>If no data appears above, check your Supabase row-level security (RLS) policies</li>
              <li>Make sure the 'users' table has appropriate permissions for the anon role</li>
              <li>Verify your database has data in the users table</li>
              <li>Check Vercel environment variables are properly set</li>
            </ol>
            
            <div style={{ marginTop: '1rem' }}>
              <h3>RLS Policy Example</h3>
              <pre style={{ background: '#f5f5f5', padding: '0.5rem', borderRadius: '3px' }}>
                CREATE POLICY "Public read access" ON "public"."users"
                FOR SELECT USING (true);
              </pre>
            </div>
          </div>
        </>
      )}
      
      <div style={{ marginTop: '2rem', borderTop: '1px solid #ddd', paddingTop: '1rem' }}>
        <p>Return to <a href="/admin" style={{ color: '#3f51b5' }}>Admin Dashboard</a></p>
      </div>
    </div>
  );
} 