// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blniijrggklktcbbaeqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbmlpanJnZ2tsa3RjYmJhZXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDU1OTcsImV4cCI6MjA2MDUyMTU5N30.tfGs9OBncYOCIz7TGS_eq65BDurAA4kJJraA27KK5EM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);