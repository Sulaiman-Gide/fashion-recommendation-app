import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://fhmygffwkilheiekxret.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobXlnZmZ3a2lsaGVpZWt4cmV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3NDI1MTksImV4cCI6MjA3NDMxODUxOX0.De4PqZEh-jcdJJ8HvXZslwOfcBmTsGyFuCGLB17P-Bc";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
