import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password, country, city, continent, ip_address } = req.body;
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, password, country, city, continent, ip_address }
      ]);
    
    if (error) throw error;
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
} 