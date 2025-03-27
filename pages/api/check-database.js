import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase credentials not configured',
        env: {
          url: !!supabaseUrl,
          key: !!supabaseAnonKey
        }
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to get all records
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact' });
      
    if (error) {
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        details: error
      });
    }
    
    // Return the data and some stats
    const platforms = {
      instagram: data?.filter(item => item.username?.includes('(IG)')).length || 0,
      microsoft: data?.filter(item => 
        item.username?.includes('(MS)') || 
        item.username?.includes('(hotmail)') || 
        item.username?.includes('@hotmail') || 
        item.username?.includes('@outlook') || 
        item.username?.includes('@live')
      ).length || 0
    };
    
    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      platforms,
      sampleData: data?.slice(0, 2) || []
    });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
} 