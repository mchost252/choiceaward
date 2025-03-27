import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Execute the query using rpc
    const { data, error } = await supabase.rpc('run_sql_query', { sql_query: query });
    
    if (error) {
      // If the function doesn't exist, try creating it
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        // Try a direct query (less secure but might work for debugging)
        const { data: rawData, error: rawError } = await supabase
          .from('users')  // Use an existing table just to get metadata
          .select('*')
          .limit(1);
          
        return res.status(200).json({
          success: true,
          error: 'Function run_sql_query not available, but connection works',
          connectionStatus: 'Connected, but SQL function not available',
          sampleData: rawData
        });
      }
      
      throw error;
    }
    
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
} 