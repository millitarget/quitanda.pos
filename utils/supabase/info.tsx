/* Prefer env-based configuration, fallback to baked defaults */

const envProjectId = (import.meta as any)?.env?.VITE_SUPABASE_PROJECT_ID;
const envAnonKey = (import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY;

export const projectId = envProjectId || "pehpksjleysaaqrbdmll";
export const publicAnonKey = envAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlaHBrc2psZXlzYWFxcmJkbWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxODMyNjYsImV4cCI6MjA3MDc1OTI2Nn0.wFvKiebiTMtXG4Ixpm4VJ3taHBuWpy3nLBOdxl3JGrg";