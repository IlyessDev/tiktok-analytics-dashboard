/**
 * config.js
 * Connexion à Supabase — point d'entrée unique pour la configuration API
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rrqhgcebyyiagfmuvwbq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
