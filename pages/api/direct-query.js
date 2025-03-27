import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to fetch data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('login_time', { ascending: false });
    
    if (error) {
      return res.status(500).json({ 
        error: error.message,
        hint: 'This might be a permissions issue. Check RLS policies in Supabase.',
        supabase_info: {
          url: supabaseUrl ? 'Set (partially hidden)' : 'Missing',
          key: supabaseAnonKey ? 'Set (hidden for security)' : 'Missing'
        }
      });
    }
    
    return res.status(200).json({ 
      count: data.length,
      success: true,
      data: data.slice(0, 5),  // Only return first 5 items for security
      message: 'Data retrieved successfully'
    });
    
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
} 