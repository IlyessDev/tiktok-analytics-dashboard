// On importe l'URL et les headers depuis config.js
import { SUPABASE_URL, SUPABASE_HEADERS } from "./config.js";


// READ — récupère toutes les vidéos triées par date
export function fetchVideos() {
  return fetch(SUPABASE_URL + '/videos?select=*&order=Date.asc', {
    headers: SUPABASE_HEADERS
  })
  .then(r => r.json())
}

// CREATE — ajoute une nouvelle vidéo
export function insertVideo(video) {
  return fetch(SUPABASE_URL +'/videos', {
    method: 'POST',
    headers: {
      ...SUPABASE_HEADERS,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(video)
  })
  .then(r => r.json())
  .then(data => data[0])
}


// UPDATE — modifie une vidéo par son id
export function updateVideo(id, updates) {
  return fetch(SUPABASE_URL +'/videos?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      ...SUPABASE_HEADERS,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  })
  .then(r => r.json())
  .then(data => data[0])
}


// DELETE — supprime une vidéo par son id
export function deleteVideo(id) {
  return fetch(SUPABASE_URL +'/videos?id=eq.' + id, {
    method: 'DELETE',
    headers: SUPABASE_HEADERS
  })
  .then(r => r.ok)
}
