/**
 * api.js
 * Toutes les fonctions qui communiquent avec Supabase
 * uniquement les appels API
 */

import { supabase } from './config.js';

/**
 * Récupère toutes les vidéos triées par date
 */
export async function fetchVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('Date', { ascending: true });

  if (error) {
    console.error('Erreur fetchVideos:', error.message);
    return [];
  }
  return data;
}

/**
 * Ajoute une nouvelle vidéo
 */
export async function insertVideo(video) {
  const { data, error } = await supabase
    .from('videos')
    .insert([video])
    .select();

  if (error) {
    console.error('Erreur insertVideo:', error.message);
    return null;
  }
  return data[0];
}

/**
 * Met à jour une vidéo existante par son id
 */
export async function updateVideo(id, updates) { 
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?id=eq.'+ id, { 
    method: 'PATCH', 
    headers: { 
      'Content-Type': 'application/json', 
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq', 
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq' }, 
    body: JSON.stringify(updates) 
  }) 
    .then(r => r.json()) 
    .then(data => console.log(data))}

/**
 * Supprime une vidéo par son id
 */
export async function deleteVideo(id) { 
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?id=eq.'+ id, { 
    method: 'DELETE', 
    headers: { 
      'Content-Type': 'application/json', 
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq', 
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq' },
    }) 
    .then( response => response.json()) 
    .then(data => console.log(data))}
