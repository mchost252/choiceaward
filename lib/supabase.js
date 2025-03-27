import { createClient } from '@supabase/supabase-js';

// Use direct credentials since environment variables aren't working
const supabaseUrl = 'https://ampggjmzkducjsavfoyc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcGdnam16a2R1Y2pzYXZmb3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNDU1MzYsImV4cCI6MjA1ODYyMTUzNn0.sX12OV_8XpzVTM21wx613YhskLOLWwtjU9qKPOKY-tc';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase, supabaseUrl, supabaseAnonKey }; 