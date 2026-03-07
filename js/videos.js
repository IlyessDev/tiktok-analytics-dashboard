import { fmt, viralClass, badgeCasting, badgeLieu, toast } from './utils.js';
import { insertVideo, updateVideo, deleteVideo } from './api.js';

// id de la vidéo en cours d'édition
let editingId = null;

// ── AFFICHAGE DE LA LISTE ──
export function renderVideos(videos) {
  const casting = document.getElementById('filter-casting').value;
  const lieu    = document.getElementById('filter-lieu').value;
  const sort    = document.getElementById('filter-sort').value;

  // Filtrage
  let filtered = videos.filter(v =>
    (!casting || v.Casting === casting) &&
    (!lieu    || v.Lieu    === lieu)
  );

  // Tri
  if (sort === 'vues')       filtered.sort((a,b) => b.Vues  - a.Vues);
  else if (sort === 'likes') filtered.sort((a,b) => b.Likes - a.Likes);
  else                       filtered.sort((a,b) => new Date(b.Date) - new Date(a.Date));

  const tbody = document.getElementById('videos-tbody');
  const empty = document.getElementById('videos-empty');

  if (!filtered.length) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  tbody.innerHTML = filtered.map(v => {
    const note = v.Notes
      ? `<br><span style="color:var(--muted);font-size:.75rem">${v
