export function fetchVideos() {
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?select=*&order=Date.asc', {
    headers: {
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq'
    }
  })
  .then(r => r.json())
}

export function insertVideo(video) {
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(video)
  })
  .then(r => r.json())
  .then(data => data[0])
}

export function updateVideo(id, updates) {
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  })
  .then(r => r.json())
  .then(data => data[0])
}

export function deleteVideo(id) {
  return fetch('https://rrqhgcebyyiagfmuvwbq.supabase.co/rest/v1/videos?id=eq.' + id, {
    method: 'DELETE',
    headers: {
      'apikey': 'sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq',
      'Authorization': 'Bearer sb_publishable_SVg5J0A-rQMRIMSGO8brqg_lOehnsCq'
    }
  })
  .then(r => r.ok)
}
