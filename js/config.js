// URL base de donnée
export const SUPABASE_URL = 'https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1';

// clé public bdd
export const API_KEY = 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq';

//récuperer token
export function getHeaders() {
  const token = localStorage.getItem('token') || API_KEY;
  return {
    'apikey': API_KEY,
    'Authorization': 'Bearer ' + token
  };
}
