// ============================================================
//  Campus Lost & Found Portal — config.js
//  Course: FYBSc IT - Introduction to Programming
//
//  HOW TO CONFIGURE SUPABASE:
//  1. Go to https://supabase.com and open your project dashboard.
//  2. Go to Project Settings -> API.
//  3. Copy your "Project URL" and paste it below in SUPABASE_URL.
//  4. Copy your "anon / public" API key and paste it in SUPABASE_ANON_KEY.
//  5. Save this file and refresh your browser!
//
//  IMPORTANT SECURITY NOTE:
//  Only paste your public 'anon' key here.
//  NEVER paste your 'service_role' key or database password!
// ============================================================

const SUPABASE_CONFIG = {
    // Replace with your actual Supabase Project URL (e.g., https://xyzcompany.supabase.co)
    SUPABASE_URL: "YOUR_SUPABASE_PROJECT_URL",

    // Replace with your actual Supabase Public Anon Key (starts with eyJhbGci...)
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY"
};

// Check if valid credentials are provided
function isSupabaseConfigured() {
    return (
        SUPABASE_CONFIG.SUPABASE_URL &&
        SUPABASE_CONFIG.SUPABASE_ANON_KEY &&
        SUPABASE_CONFIG.SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL" &&
        SUPABASE_CONFIG.SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY" &&
        SUPABASE_CONFIG.SUPABASE_URL.startsWith("https://")
    );
}

// Initialize the global Supabase client if configured
let dbClient = null;

if (typeof window.supabase !== "undefined" && isSupabaseConfigured()) {
    try {
        dbClient = window.supabase.createClient(
            SUPABASE_CONFIG.SUPABASE_URL,
            SUPABASE_CONFIG.SUPABASE_ANON_KEY
        );
        console.log("✓ Supabase Client initialized successfully.");
    } catch (err) {
        console.error("Failed to initialize Supabase client:", err);
    }
} else {
    console.warn("⚠️ Supabase credentials not set in config.js. Using demo fallback mode.");
}
