const supabaseUrl = "https://dfnxqqfcwxjhaupynzyp.supabase.co";
const supabaseAnonKey = "sb_publishable_S0BM8EJIpYv5NzEE3cNJgA_Kf58PQqS";

// @ts-ignore
const supabaseLib = window.supabase;

export const supabase = (supabaseLib && supabaseUrl && supabaseAnonKey)
  ? supabaseLib.createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn("⚠️ Supabase no se pudo inicializar.");
}