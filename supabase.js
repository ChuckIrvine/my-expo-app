import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdsmdousuvciyldsexvl.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkc21kb3VzdXZjaXlsZHNleHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMDY4NDAsImV4cCI6MjA1OTc4Mjg0MH0.RJYgWhSaTKVP6zVwR_ctEuLh5_M9n7jV2WFeNkY3C5k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});