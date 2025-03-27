import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [activeTable, setActiveTable] = useState('users');

  // List all available tables in the database
  const listTables = async () => {
    try {
      console.log('Listing available tables...');
      const { data, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
        
      if (error) throw error;
      
      const tableNames = data.map(t => t.tablename);
      console.log('Available tables:', tableNames);
      setTables(tableNames);
      
      // If 'users' doesn't exist but we found other tables, use the first one
      if (tableNames.length > 0 && !tableNames.includes('users')) {
        setActiveTable(tableNames[0]);
      }
    } catch (err) {
      console.error('Error listing tables:', err);
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // First try to get a list of tables
        await listTables();
        
        console.log(`Testing Supabase connection to table: ${activeTable}`);
        
        // Direct SQL query to check for all tables 
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('list_all_tables');
          
        if (!sqlError) {
          console.log('All tables via SQL:', sqlData);
        }
        
        // Check if we can connect to Supabase with the specified table
        const { data, error } = await supabase
          .from(activeTable)
          .select('*')
          .limit(10);
          
        if (error) throw error;
        
        console.log(`Data received from ${activeTable}:`, data);
        setData(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [activeTable]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Connection Information</h3>
        <div><strong>URL:</strong> {supabase.supabaseUrl}</div>
        <div><strong>Current Table:</strong> {activeTable}</div>
        
        <h3>Available Tables</h3>
        {tables.length === 0 ? (
          <p>No tables found or unable to list tables.</p>
        ) : (
          <div>
            {tables.map(table => (
              <button 
                key={table} 
                onClick={() => setActiveTable(table)}
                style={{
                  margin: '5px',
                  padding: '5px 10px',
                  backgroundColor: activeTable === table ? '#4caf50' : '#f1f1f1',
                  color: activeTable === table ? 'white' : 'black',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {table}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <h2>Error</h2>
          <p>{error}</p>
          
          <button 
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchData();
            }}
            style={{
              padding: '10px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div>
          <h2>Connection Successful</h2>
          <p>Found {data?.length || 0} records in table '{activeTable}'</p>
          
          <h3>Sample Data:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <h3>Manual Query</h3>
        <p>Try checking other tables:</p>
        <button
          onClick={async () => {
            try {
              const { data: todoData, error: todoError } = await supabase
                .from('todos')
                .select('*')
                .limit(5);
                
              if (todoError) throw todoError;
              alert(`Found ${todoData?.length || 0} todo items`);
              console.log('Todo data:', todoData);
            } catch (err) {
              alert(`Error: ${err.message}`);
            }
          }}
          style={{
            padding: '10px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Check 'todos' Table
        </button>
        
        <button
          onClick={async () => {
            try {
              // Create Stored Function for listing tables if it doesn't exist
              await supabase.rpc('create_list_tables_function').catch(() => {});
              
              // Try to run the direct SQL query
              const response = await fetch('/api/direct-query', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
                }),
              });
              
              const result = await response.json();
              console.log('Direct SQL result:', result);
              alert(`Found tables: ${JSON.stringify(result.data || [])}`);
            } catch (err) {
              alert(`Error: ${err.message}`);
            }
          }}
          style={{
            padding: '10px',
            backgroundColor: '#673ab7',
            color: 'white',
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          List All Tables (SQL)
        </button>
      </div>
    </div>
  );
} 