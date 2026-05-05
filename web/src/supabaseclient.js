import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xgqjwjoxinsvjpouuihm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhncWp3am94aW5zdmpwb3V1aWhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MjI2MjYsImV4cCI6MjA4ODM5ODYyNn0.zto-8H9x68KrKGQPQM3yWOk872NmIlNoCBadJJmUoQ8';

export const supabase = createClient(supabaseUrl, supabaseKey);