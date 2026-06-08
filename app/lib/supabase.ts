import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://inpvwrwggnemyeyprxpx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlucHZ3cndnZ25lbXlleXByeHB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Nzc1NzcsImV4cCI6MjA5NjE1MzU3N30.0i0GD4sITjxC2ZRpg5V-zLNT9fliTmMiYSDOdYThqxA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
