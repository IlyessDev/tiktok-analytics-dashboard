// On importe l'URL et les headers depuis config.js
import { SUPABASE_URL, getHeaders } from "./config.js";

// LOGIN - récuperer le token
export function login(email, password) {
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/auth/v1/token?grant_type=password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq'
    },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  } else {
    localStorage.removeItem('token'); // nettoie si erreur
  }
    return data
  })
}


// READ — récupère toutes les vidéos triées par date
export function fetchVideos() {
  return fetch(SUPABASE_URL + '/videos?select=*&order=Date.asc', {
    headers: getHeaders()
  })
  .then(r => r.json())
}

// Stats par casting
export function fetchStatsCasting() {
  return fetch(SUPABASE_URL + '/vues_stats_casting?select=*', {
    headers: getHeaders()
  }).then(r => r.json())
}

// Stats par lieu
export function fetchStatsLieu() {
  return fetch(SUPABASE_URL + '/vue_stats_lieu?select=*', {
    headers: getHeaders()
  }).then(r => r.json())
}

// Top vidéos
export function fetchTopVideos() {
  return fetch(SUPABASE_URL + '/vue_top_videos?select=*&order=rang.asc', {
    headers: getHeaders()
  }).then(r => r.json())
}

// Momentum
export function fetchMomentum() {
  return fetch(SUPABASE_URL + '/vue_momentum?select=*', {
    headers: getHeaders()
  }).then(r => r.json())
}

// CREATE - ajoute une nouvelle vidéo
export function insertVideo(video) {
  return fetch(SUPABASE_URL +'/videos', {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(video)
  })
  .then(r => r.json())
  .then(data => data[0])
}


// UPDATE - modifie une vidéo par son id
export function updateVideo(id, updates) {
  return fetch(SUPABASE_URL + '/videos?id=eq.' + id, {
    method: 'PATCH',
    headers: {
       ...getHeaders(),
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  })
  .then(r => r.ok)
}


// DELETE - supprime une vidéo par son id
export function deleteVideo(id) {
  return fetch(SUPABASE_URL +'/videos?id=eq.' + id, {
    method: 'DELETE',
    headers: getHeaders()
  })
  .then(r => r.ok)
}
