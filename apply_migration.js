// Script to apply the migration to fix user_id columns
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20240721_fix_user_id_columns.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Apply the migration
    console.log('Applying migration to fix user_id columns...');
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });

    if (error) {
      throw error;
    }

    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();
