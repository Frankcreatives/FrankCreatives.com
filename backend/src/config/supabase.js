const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key in environment variables.');
  process.exit(1);
}

// Using Service Key for backend administrative privileges where necessary
// Be careful with this client.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = supabase;
