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
    .order('date', { ascending: true });

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
  const { data, error } = await supabase
    .from('videos')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Erreur updateVideo:', error.message);
    return null;
  }
  return data[0];
}

/**
 * Supprime une vidéo par son id
 */
export async function deleteVideo(id) {
  const { error } = await supabase
    .from('videos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erreur deleteVideo:', error.message);
    return false;
  }
  return true;
}
