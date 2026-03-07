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
      ? `<br><span style="color:var(--muted);font-size:.75rem">${v.Notes.substring(0,50)}${v.Notes.length>50?'…':''}</span>`
  : '';
    return `<tr>
      <td><strong>${v.Titre}</strong>${note}</td>
      <td>${badgeCasting(v.Casting)}</td>
      <td>${badgeLieu(v.Lieu)}</td>
      <td style="font-family:'DM Mono',monospace;font-size:.82rem">${v.Duree}s</td>
      <td class="${viralClass(v.Vues)}">${fmt(v.Vues)}</td>
      <td>${fmt(v.Likes)}</td>
      <td>${fmt(v.Partages)}</td>
      <td>
        <div class="action-btns">
          <button class="edit-btn" data-id="${v.id}">✏️</button>
          <button class="del-btn"  data-id="${v.id}">✕</button>
        </div>
      </td>
    </tr>`;
  }).join('');

  // Bouton supprimer
  tbody.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      deleteVideo(id)
        .then(ok => {
          if (ok) {
            toast('🗑 Vidéo supprimée');
            window.reloadVideos();
          } else {
            toast('⚠ Erreur lors de la suppression');
          }
        })
    });
  });

  // Bouton éditer
  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = parseInt(this.getAttribute('data-id'));
      const v = videos.find(v => v.id === id);
      if (v) openEdit(v);
    });
  });
}

// ── AJOUT ──
export function addVideo(onSuccess) {
  const titre = document.getElementById('f-titre').value.trim();
  const duree = parseInt(document.getElementById('f-duree').value);
  if (!titre)           return toast('⚠ Entrez un titre !');
  if (!duree || duree <= 0) return toast('⚠ Entrez une durée !');

  const video = {
    Titre:    titre,
    Casting:  document.getElementById('f-casting').value,
    Lieu:     document.getElementById('f-lieu').value,
    Duree:    duree,
    Date:     document.getElementById('f-date').value || new Date().toISOString().split('T')[0],
    Vues:     parseInt(document.getElementById('f-vues').value)     || 0,
    Likes:    parseInt(document.getElementById('f-likes').value)    || 0,
    Partages: parseInt(document.getElementById('f-partages').value) || 0,
    Notes:    document.getElementById('f-notes').value.trim()
  };

  insertVideo(video)
    .then(result => {
      if (result) {
        ['f-titre','f-duree','f-vues','f-likes','f-partages','f-notes'].forEach(id => {
          document.getElementById(id).value = '';
        });
        toast('✓ Vidéo ajoutée !');
        onSuccess();
      } else {
        toast('⚠ Erreur lors de l\'ajout');
      }
    })
}

// ── ÉDITION ──
function openEdit(v) {
  editingId = v.id;
  document.getElementById('e-titre').value    = v.Titre;
  document.getElementById('e-casting').value  = v.Casting;
  document.getElementById('e-lieu').value     = v.Lieu;
  document.getElementById('e-duree').value    = v.Duree;
  document.getElementById('e-date').value     = v.Date;
  document.getElementById('e-vues').value     = v.Vues;
  document.getElementById('e-likes').value    = v.Likes;
  document.getElementById('e-partages').value = v.Partages;
  document.getElementById('e-notes').value    = v.Notes || '';
  document.getElementById('edit-modal').classList.add('open');
}

export function saveEdit(onSuccess) {
  console.log('editingId:', editingId);
  const titre = document.getElementById('e-titre').value.trim();
  if (!titre) return toast('⚠ Titre obligatoire !');

  const updates = {
    Titre:    titre,
    Casting:  document.getElementById('e-casting').value,
    Lieu:     document.getElementById('e-lieu').value,
    Duree:    parseInt(document.getElementById('e-duree').value),
    Date:     document.getElementById('e-date').value,
    Vues:     parseInt(document.getElementById('e-vues').value)     || 0,
    Likes:    parseInt(document.getElementById('e-likes').value)    || 0,
    Partages: parseInt(document.getElementById('e-partages').value) || 0,
    Notes:    document.getElementById('e-notes').value.trim()
  };

  updateVideo(editingId, updates)
    .then(result => {
      console.log('result', result);
      if (result !== undefined) {
        closeModal();
        toast('✓ Vidéo modifiée !');
        onSuccess();
      } else {
        toast('⚠ Erreur lors de la modification');
      }
    })
}

export function closeModal() {
  document.getElementById('edit-modal').classList.remove('open');
  editingId = null;
}
